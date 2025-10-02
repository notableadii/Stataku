import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";

import { withSecurity, sanitizeInput, isValidUsername } from "@/lib/security";

// Initialize Turso client lazily
function getTursoClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error(
      "Turso database configuration is missing. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.",
    );
  }

  return createClient({
    url,
    authToken,
  });
}

export const POST = withSecurity(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const sanitizedBody = sanitizeInput(body);
    const { userId, username } = sanitizedBody;

    if (!userId || !username) {
      return NextResponse.json(
        { error: "User ID and username are required" },
        { status: 400 },
      );
    }

    // Security check: Ensure user can only create their own profile
    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You can only create your own profile" },
        { status: 403 },
      );
    }

    // Validate username format
    if (!isValidUsername(username)) {
      return NextResponse.json(
        {
          error:
            "Invalid username format. Username must be 3-30 characters and contain only letters, numbers, dots, hyphens, and underscores.",
        },
        { status: 400 },
      );
    }

    // Create user profile
    const turso = getTursoClient();
    const result = await turso.execute({
      sql: "INSERT INTO user_profiles (user_id, username) VALUES (?, ?)",
      args: [userId, username.toLowerCase()],
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error creating user profile:", error);

    // Handle unique constraint violation
    if (error.message?.includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
});
