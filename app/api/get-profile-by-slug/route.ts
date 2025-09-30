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
    // Parse request body with better error handling
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          success: false,
        },
        { status: 400 }
      );
    }

    const { slug } = body;

    // Validate input
    if (!slug) {
      return NextResponse.json(
        {
          error: "Slug is required",
          success: false,
        },
        { status: 400 }
      );
    }

    if (typeof slug !== "string") {
      return NextResponse.json(
        {
          error: "Slug must be a string",
          success: false,
        },
        { status: 400 }
      );
    }

    const normalizedSlug = slug.toLowerCase().trim();

    // Check if database is configured
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      console.warn(
        "Database not configured, using mock response for profile lookup"
      );

      // Mock response for testing
      return NextResponse.json({
        success: true,
        data: {
          id: "mock-user-id",
          username: normalizedSlug,
          slug: normalizedSlug,
          display_name: null,
          bio: null,
          avatar_url: null,
          banner_url: null,
          created_at: new Date().toISOString(),
        },
        mock: true,
      });
    }

    // Query profile by slug with optimized index
    const turso = getTursoClient();
    const result = await turso.execute({
      sql: `
        SELECT id, username, slug, display_name, bio, avatar_url, banner_url, created_at 
        FROM profiles 
        WHERE slug = ? 
        LIMIT 1
      `,
      args: [normalizedSlug],
    });

    // Check if profile was found
    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Profile not found",
        },
        { status: 404 }
      );
    }

    // Return profile data
    const profile = result.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        id: profile.id as string,
        username: profile.username as string,
        slug: profile.slug as string,
        display_name: profile.display_name as string | null,
        bio: profile.bio as string | null,
        avatar_url: profile.avatar_url as string | null,
        banner_url: profile.banner_url as string | null,
        created_at: profile.created_at as string,
      },
    });
  } catch (error: any) {
    console.error("Error getting profile by slug:", error);

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
