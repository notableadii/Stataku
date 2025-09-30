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
    const { userId, display_name, bio, avatar_url, banner_url } = body;

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate input - allow strings and null values
    if (
      display_name !== undefined &&
      display_name !== null &&
      typeof display_name !== "string"
    ) {
      return NextResponse.json(
        { error: "Display name must be a string or null" },
        { status: 400 }
      );
    }

    if (bio !== undefined && bio !== null && typeof bio !== "string") {
      return NextResponse.json(
        { error: "Bio must be a string or null" },
        { status: 400 }
      );
    }

    if (
      avatar_url !== undefined &&
      avatar_url !== null &&
      typeof avatar_url !== "string"
    ) {
      return NextResponse.json(
        { error: "Avatar URL must be a string or null" },
        { status: 400 }
      );
    }

    if (
      banner_url !== undefined &&
      banner_url !== null &&
      typeof banner_url !== "string"
    ) {
      return NextResponse.json(
        { error: "Banner URL must be a string or null" },
        { status: 400 }
      );
    }

    // Validate bio length (max 500 characters)
    if (bio && typeof bio === "string" && bio.length > 500) {
      return NextResponse.json(
        { error: "Bio must be 500 characters or less" },
        { status: 400 }
      );
    }

    // Validate display_name length (max 50 characters)
    if (
      display_name &&
      typeof display_name === "string" &&
      display_name.length > 50
    ) {
      return NextResponse.json(
        { error: "Display name must be 50 characters or less" },
        { status: 400 }
      );
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];

    if (display_name !== undefined) {
      updates.push("display_name = ?");
      values.push(
        display_name &&
          typeof display_name === "string" &&
          display_name.trim() !== ""
          ? display_name.trim()
          : null
      );
    }

    if (bio !== undefined) {
      updates.push("bio = ?");
      values.push(
        bio && typeof bio === "string" && bio.trim() !== "" ? bio.trim() : null
      );
    }

    if (avatar_url !== undefined) {
      updates.push("avatar_url = ?");
      values.push(
        avatar_url && typeof avatar_url === "string" && avatar_url.trim() !== ""
          ? avatar_url.trim()
          : null
      );
    }

    if (banner_url !== undefined) {
      updates.push("banner_url = ?");
      values.push(
        banner_url && typeof banner_url === "string" && banner_url.trim() !== ""
          ? banner_url.trim()
          : null
      );
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Add user ID to values
    values.push(userId);

    // Update profile
    const turso = getTursoClient();
    await turso.execute({
      sql: `UPDATE profiles SET ${updates.join(", ")} WHERE id = ?`,
      args: values,
    });

    // Fetch updated profile
    const result = await turso.execute({
      sql: "SELECT * FROM profiles WHERE id = ?",
      args: [userId],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const profile = {
      id: result.rows[0].id as string,
      username: result.rows[0].username as string,
      slug: result.rows[0].slug as string,
      display_name: result.rows[0].display_name as string | null,
      bio: result.rows[0].bio as string | null,
      avatar_url: result.rows[0].avatar_url as string | null,
      banner_url: result.rows[0].banner_url as string | null,
      created_at: result.rows[0].created_at as string,
    };

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
