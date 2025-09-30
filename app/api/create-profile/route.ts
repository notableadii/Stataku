import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";

// Initialize Turso client on server side
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { userId, username } = await request.json();

    if (!userId || !username) {
      return NextResponse.json(
        { error: "User ID and username are required" },
        { status: 400 },
      );
    }

    // Create user profile
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
}
