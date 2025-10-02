import { NextRequest, NextResponse } from "next/server";

import { createUsername } from "@/lib/database-service";

// This file now uses the cached database service

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
        { status: 400 },
      );
    }

    if (typeof username !== "string" || typeof userId !== "string") {
      return NextResponse.json(
        {
          error: "User ID and username must be strings",
          success: false,
        },
        { status: 400 },
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
        { status: 400 },
      );
    }

    // Validate username characters (only letters, digits, underscores, and periods)
    const validPattern = /^[a-z0-9_.]+$/;

    if (!validPattern.test(normalizedUsername)) {
      return NextResponse.json(
        {
          error:
            "Username can only contain letters, digits, underscores, and periods",
          success: false,
        },
        { status: 400 },
      );
    }

    // Check if database is configured
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      console.warn(
        "Database not configured, using mock response for username creation",
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

    // Use the cached database service (this will automatically invalidate cache)
    const result = await createUsername(userId, normalizedUsername);

    if (result.error) {
      if (
        result.error.includes("already taken") ||
        result.error.includes("conflict")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Username is already taken",
            conflict: true,
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      username: result.data?.username,
      slug: result.data?.slug,
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
        { status: 409 },
      );
    }

    // Handle foreign key constraint (user doesn't exist in auth.users)
    if (error.message?.includes("FOREIGN KEY constraint failed")) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
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
        { status: 503 },
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
      { status: 500 },
    );
  }
}
