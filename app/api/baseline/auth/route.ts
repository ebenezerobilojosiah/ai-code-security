import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { BaselineAuthSchema } from "@/lib/validation";

// INTENTIONALLY VULNERABLE CODE FOR COMPARISON
// This version demonstrates common security flaws

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password } = body;

    // VULNERABILITY 1: No input validation
    if (!action || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // VULNERABILITY 2: No email format validation
    const userEmail = email;

    if (action === "register") {
      try {
        // VULNERABILITY 3: No timing attack protection
        const existingUser = await prisma.user.findUnique({
          where: { email: userEmail },
        });

        if (existingUser) {
          return NextResponse.json({ error: "User exists" }, { status: 409 });
        }

        // VULNERABILITY 4: Weak hashing - using MD5 (cryptographically broken)
        const passwordHash = crypto
          .createHash("md5")
          .update(password)
          .digest("hex");

        const user = await prisma.user.create({
          data: {
            email: userEmail,
            password_hash: passwordHash,
          },
        });

        // VULNERABILITY 5: Storing password hash in response
        return NextResponse.json(
          {
            success: true,
            user: {
              id: user.id,
              email: user.email,
              password_hash: passwordHash,
            },
          },
          { status: 201 },
        );
      } catch (error) {
        return NextResponse.json(
          { error: "Registration failed" },
          { status: 500 },
        );
      }
    } else if (action === "login") {
      try {
        const user = await prisma.user.findUnique({
          where: { email: userEmail },
        });

        // VULNERABILITY 6: User enumeration (different error for user not found)
        if (!user) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 },
          );
        }

        // VULNERABILITY 7: Plain text password comparison with MD5
        const passwordHash = crypto
          .createHash("md5")
          .update(password)
          .digest("hex");
        if (user.password_hash !== passwordHash) {
          return NextResponse.json(
            { error: "Invalid password" },
            { status: 401 },
          );
        }

        // VULNERABILITY 8: Weak session token (predictable and reversible)
        const sessionToken = `session_${user.id}_${Date.now()}`;

        // VULNERABILITY 9: Storing session in non-HttpOnly cookie
        const response = NextResponse.json(
          {
            success: true,
            user: { id: user.id, email: user.email },
          },
          { status: 200 },
        );

        response.cookies.set("session", sessionToken, {
          httpOnly: false, // VULNERABLE: Can be accessed by JavaScript
          secure: false, // VULNERABLE: Sent over HTTP
          sameSite: "lax", // VULNERABLE: Allows some cross-site requests
          maxAge: 7 * 24 * 60 * 60, // VULNERABLE: Too long expiration
          path: "/",
        });

        return response;
      } catch (error) {
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
      }
    } else {
      // VULNERABILITY 10: Generic error message that doesn't reveal system info
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    // VULNERABILITY 11: Error messages expose internal details
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 },
    );
  }
}
