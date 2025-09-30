import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";

// Initialize Turso client lazily
function getTursoClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error(
      "Turso database configuration is missing. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables."
    );
  }

  return createClient({
    url,
    authToken,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { userId, username } = body;

    // Validate input
    if (!userId || !username) {
      return NextResponse.json(
        {
          error: "User ID and username are required",
          success: false,
        },
        { status: 400 }
      );
    }

    if (typeof username !== "string" || typeof userId !== "string") {
      return NextResponse.json(
        {
          error: "User ID and username must be strings",
          success: false,
        },
        { status: 400 }
      );
    }

    const normalizedUsername = username.toLowerCase().trim();

    // Enforce minimum username length (3+ chars as specified)
    if (normalizedUsername.length < 3) {
      return NextResponse.json(
        {
          error: "Username must be at least 3 characters long",
          success: false,
        },
        { status: 400 }
      );
    }

    // Check if database is configured
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      console.warn(
        "Database not configured, using mock response for username creation"
      );

      // Mock response for testing
      return NextResponse.json({
        success: true,
        username: normalizedUsername,
        message: "Username created successfully (mock)",
        mock: true,
      });
    }

    // Create slug from username (same as username for now, but can be customized later)
    const slug = normalizedUsername;

    // Atomic insert with conflict handling
    // Using ON CONFLICT(username) DO NOTHING to handle race conditions gracefully
    // as specified in requirements
    // First try with new schema, fallback to old schema if columns don't exist
    const turso = getTursoClient();
    let result;
    try {
      result = await turso.execute({
        sql: `
          INSERT INTO profiles(id, username, slug) 
          VALUES(?, ?, ?) 
          ON CONFLICT(username) DO NOTHING 
          RETURNING username, slug
        `,
        args: [userId, normalizedUsername, slug],
      });
    } catch (error) {
      // Fallback to old schema if slug column doesn't exist
      console.log("Slug column not found, using old schema");
      result = await turso.execute({
        sql: `
          INSERT INTO profiles(id, username) 
          VALUES(?, ?) 
          ON CONFLICT(username) DO NOTHING 
          RETURNING username
        `,
        args: [userId, normalizedUsername],
      });
    }

    // Check if the insert was successful
    if (result.rows.length === 0) {
      // No rows returned means username was already taken (conflict)
      return NextResponse.json(
        {
          success: false,
          error: "Username is already taken",
          conflict: true,
        },
        { status: 409 }
      );
    }

    // Success - username was created
    const row = result.rows[0];
    return NextResponse.json({
      success: true,
      username: row.username as string,
      message: "Username created successfully",
    });
  } catch (error: any) {
    console.error("Error creating username:", error);

    // Handle specific database errors
    if (
      error.message?.includes("UNIQUE constraint failed") ||
      error.message?.includes("duplicate key") ||
      error.message?.includes("conflict")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Username is already taken",
          conflict: true,
        },
        { status: 409 }
      );
    }

    // Handle foreign key constraint (user doesn't exist in auth.users)
    if (error.message?.includes("FOREIGN KEY constraint failed")) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Handle database connection errors
    if (
      error.message?.includes("connection") ||
      error.message?.includes("network") ||
      error.message?.includes("timeout")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection error. Please try again.",
        },
        { status: 503 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
