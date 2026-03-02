import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// INTENTIONALLY VULNERABLE CODE FOR COMPARISON
// This version demonstrates common security flaws

// Weak session verification (predictable format)
function verifySession(request: NextRequest): { user_id: string } | null {
  try {
    // const cookieValue = request.headers.get("cookie");
    // if (!cookieValue || !cookieValue.includes("session=")) {
    //   return null;
    // }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);

    // VULNERABILITY 1: Weak session parsing - no signature verification
    const sessionToken = token
      .split(";")
      .find((c) => c.trim().startsWith("session="))
      ?.substring(8);

    if (!sessionToken) {
      return null;
    }

    // VULNERABILITY 2: Session token reverse engineering (predictable format)
    // Extracts user_id from predictable format: session_USER_ID_TIMESTAMP
    const parts = sessionToken.split("_");
    if (parts.length >= 3 && parts[0] === "session") {
      return { user_id: parts[1] };
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Get tasks (no user isolation - IDOR vulnerability)
export async function GET(request: NextRequest) {
  try {
    const user = verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id"); // VULNERABILITY 3: Client-controlled user_id

    // VULNERABILITY 4: IDOR - No verification that user_id matches authenticated user
    const tasks = await prisma.task.findMany({
      where: {
        user_id: userId || user.user_id, // Can request any user's tasks
        deleted_at: null,
      },
    });

    return NextResponse.json({ success: true, tasks }, { status: 200 });
  } catch (error: any) {
    // VULNERABILITY 5: Error messages expose database details
    return NextResponse.json(
      { error: `Error: ${error.message}` },
      { status: 500 },
    );
  }
}

// Create task (no input validation)
export async function POST(request: NextRequest) {
  try {
    const user = verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // VULNERABILITY 6: No input validation or sanitization
    const { title, description, priority, due_date, user_id } = body;

    // VULNERABILITY 7: Allows setting arbitrary user_id
    const taskUserId = user_id || user.user_id;

    // VULNERABILITY 8: No field validation or length limits
    const task = await prisma.task.create({
      data: {
        user_id: taskUserId,
        title: title, // No validation
        description: description, // Can be HTML/script injection
        priority: priority || "MEDIUM",
        due_date: due_date ? new Date(due_date) : null,
        status: "PENDING",
      },
    });

    // VULNERABILITY 9: Returns sensitive fields
    return NextResponse.json(
      {
        success: true,
        task,
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: `Error: ${error.message}` },
      { status: 500 },
    );
  }
}

// Update task (allows updating any task)
export async function PUT(request: NextRequest) {
  try {
    const user = verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("id");

    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    const body = await request.json();

    // VULNERABILITY 10: No verification that task belongs to user (IDOR)
    // Can update any task in the system
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        due_date: body.due_date ? new Date(body.due_date) : undefined,
      },
    });

    return NextResponse.json(
      { success: true, task: updatedTask },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: `Error: ${error.message}` },
      { status: 500 },
    );
  }
}

// Delete task (no ownership verification)
export async function DELETE(request: NextRequest) {
  try {
    const user = verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("id");

    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    // VULNERABILITY 11: No verification that task belongs to user (IDOR)
    // Can delete any task in the system
    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json(
      { success: true, message: "Task deleted" },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: `Error: ${error.message}` },
      { status: 500 },
    );
  }
}
