import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { AuthSchema } from "@/lib/validation";

const JWT_SECRET =
  process.env.JWT_SECRET || "dev-secret-key-change-in-production";
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;
  let auditAction = "auth_attempt";
  let auditSuccess = false;

  try {
    const body = await request.json();

    // Zod validation
    const validatedData = AuthSchema.parse(body);
    const { action, email, password } = validatedData;

    // Check account lockout
    const recentAttempts = await prisma.loginAttempt.count({
      where: {
        email,
        success: false,
        created_at: {
          gte: new Date(Date.now() - LOCKOUT_DURATION),
        },
      },
    });

    if (recentAttempts >= MAX_LOGIN_ATTEMPTS) {
      await logAudit(
        undefined,
        "auth_failed_lockout",
        "user",
        false,
        "Account locked due to too many attempts",
        request,
      );
      return NextResponse.json(
        { error: "Account locked. Try again later." },
        { status: 429 },
      );
    }

    if (action === "register") {
      return await handleRegister(email, password, request);
    } else if (action === "login") {
      return await handleLogin(email, password, request);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map(
        (e) => `${e.path.join(".")}: ${e.message}`,
      );
      return NextResponse.json(
        { error: "Validation failed", details: fieldErrors },
        { status: 400 },
      );
    }

    console.error("[HARDENED] Auth error:", error);
    await logAudit(
      userId,
      "auth_error",
      "system",
      false,
      String(error),
      request,
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function handleRegister(
  email: string,
  password: string,
  request: NextRequest,
): Promise<NextResponse> {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      await logAudit(
        undefined,
        "register_failed_exists",
        "user",
        false,
        "User already exists",
        request,
      );
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
      },
      select: {
        id: true,
        email: true,
        created_at: true,
      },
    });

    // Create JWT token
    const sessionToken = jwt.sign(
      { user_id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    // Log audit
    await logAudit(
      user.id,
      "register_success",
      "user",
      true,
      undefined,
      request,
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
        token: sessionToken,
      },
      { status: 201 },
    );

    // Set secure HttpOnly cookie
    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[HARDENED] Register error:", error);
    await logAudit(
      undefined,
      "register_error",
      "system",
      false,
      String(error),
      request,
    );
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

async function handleLogin(
  email: string,
  password: string,
  request: NextRequest,
): Promise<NextResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password_hash: true,
      },
    });

    if (!user) {
      await logAudit(
        undefined,
        "login_failed_user_not_found",
        "user",
        false,
        "User not found",
        request,
      );
      // Record failed login attempt
      await prisma.loginAttempt.create({
        data: {
          email,
          success: false,
          ip_address:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown",
          user_agent: request.headers.get("user-agent") || undefined,
        },
      });
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      await logAudit(
        user.id,
        "login_failed_invalid_password",
        "user",
        false,
        "Invalid password",
        request,
      );
      // Record failed login attempt
      await prisma.loginAttempt.create({
        data: {
          user_id: user.id,
          email,
          success: false,
          ip_address:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown",
          user_agent: request.headers.get("user-agent") || undefined,
        },
      });
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Create JWT token
    const sessionToken = jwt.sign(
      { user_id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    // Record successful login
    await prisma.loginAttempt.create({
      data: {
        user_id: user.id,
        email,
        success: true,
        ip_address:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        user_agent: request.headers.get("user-agent") || undefined,
      },
    });

    // Log audit
    await logAudit(user.id, "login_success", "user", true, undefined, request);

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
        },
        token: sessionToken,
      },
      { status: 200 },
    );

    // Set secure HttpOnly cookie
    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[HARDENED] Login error:", error);
    await logAudit(
      undefined,
      "login_error",
      "system",
      false,
      String(error),
      request,
    );
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

async function logAudit(
  userId: string | undefined,
  action: string,
  resource: string,
  success: boolean,
  errorMessage: string | undefined,
  request: NextRequest,
) {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: userId,
        action,
        resource,
        success,
        error_message: errorMessage,
        ip_address:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        user_agent: request.headers.get("user-agent") || undefined,
      },
    });
  } catch (error) {
    console.error("[AUDIT LOG ERROR]:", error);
  }
}
