import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";

// Initialize Turso client on server side
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Get user profile from profiles table
    // First try with new schema, fallback to old schema if columns don't exist
    let result;
    try {
      result = await turso.execute({
        sql: "SELECT id, username, slug, display_name, bio, avatar_url, created_at FROM profiles WHERE id = ?",
        args: [userId],
      });
    } catch (error) {
      // Fallback to old schema if new columns don't exist
      console.log("New schema columns not found, using old schema");
      result = await turso.execute({
        sql: "SELECT id, username, created_at FROM profiles WHERE id = ?",
        args: [userId],
      });
    }

    if (result.rows.length === 0) {
      return NextResponse.json({
        data: null,
        error: null,
      });
    }

    const row = result.rows[0];
    const profile = {
      id: row.id as string,
      username: row.username as string,
      slug: (row as any).slug || row.username, // Fallback to username if slug doesn't exist
      display_name: (row as any).display_name || null,
      bio: (row as any).bio || null,
      avatar_url: (row as any).avatar_url || null,
      created_at: row.created_at as string,
    };

    return NextResponse.json({
      data: profile,
      error: null,
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
