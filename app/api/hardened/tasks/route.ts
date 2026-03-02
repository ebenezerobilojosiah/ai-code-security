import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskStatusSchema,
} from "@/lib/validation";

const JWT_SECRET =
  process.env.JWT_SECRET || "dev-secret-key-change-in-production";

// Verify JWT token and extract user
function verifyToken(
  request: NextRequest,
): { user_id: string; email: string } | null {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as {
      user_id: string;
      email: string;
    };
    return decoded;
  } catch (error) {
    return null;
  }
}

// Get all tasks for authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const sortBy = searchParams.get("sort") || "created_at";

    // Build filter conditions
    const where: any = {
      user_id: user.user_id,
      deleted_at: null,
    };

    if (
      status &&
      ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(
        status.toUpperCase(),
      )
    ) {
      where.status = status.toUpperCase();
    }

    if (
      priority &&
      ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(priority.toUpperCase())
    ) {
      where.priority = priority.toUpperCase();
    }

    // Build sort order
    const orderBy: any = {};
    if (sortBy === "priority") {
      orderBy.priority = "desc";
    } else if (sortBy === "due_date") {
      orderBy.due_date = "asc";
    } else {
      orderBy.created_at = "desc";
    }

    // Fetch tasks from database
    const tasks = await prisma.task.findMany({
      where,
      orderBy,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        due_date: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json(
      { success: true, tasks, count: tasks.length },
      { status: 200 },
    );
  } catch (error) {
    console.error("[HARDENED] Tasks GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Create new task
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate with Zod
    const validatedData = CreateTaskSchema.parse(body);
    const { title, description, priority, due_date } = validatedData;

    // Create task in database
    const task = await prisma.task.create({
      data: {
        user_id: user.user_id,
        title,
        description: description || null,
        priority: (priority || "MEDIUM").toUpperCase(),
        due_date: due_date ? new Date(due_date) : null,
        status: "PENDING",
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        due_date: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Log audit
    await logAudit(
      user.user_id,
      "task_created",
      "task",
      true,
      undefined,
      request,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        task,
      },
      { status: 201 },
    );
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

    console.error("[HARDENED] Tasks POST error:", error);
    await logAudit(
      undefined,
      "task_create_error",
      "system",
      false,
      String(error),
      request,
    );

    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}

// Update task
export async function PUT(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("id");

    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    // Verify task belongs to user (prevent IDOR)
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        user_id: user.user_id,
        deleted_at: null,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await request.json();

    // Validate with Zod
    const validatedData = UpdateTaskSchema.parse(body);

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...validatedData,
        priority: validatedData.priority?.toUpperCase(),
        due_date: validatedData.due_date
          ? new Date(validatedData.due_date)
          : undefined,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        due_date: true,
        created_at: true,
        updated_at: true,
      },
    });

    await logAudit(
      user.user_id,
      "task_updated",
      "task",
      true,
      undefined,
      request,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Task updated successfully",
        task: updatedTask,
      },
      { status: 200 },
    );
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

    console.error("[HARDENED] Tasks PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}

// Delete task (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("id");

    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    // Verify task belongs to user (prevent IDOR)
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        user_id: user.user_id,
        deleted_at: null,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Soft delete task
    await prisma.task.update({
      where: { id: taskId },
      data: {
        deleted_at: new Date(),
      },
    });

    await logAudit(
      user.user_id,
      "task_deleted",
      "task",
      true,
      undefined,
      request,
    );

    return NextResponse.json(
      { success: true, message: "Task deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[HARDENED] Tasks DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
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
