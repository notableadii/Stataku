import { NextRequest, NextResponse } from "next/server";

import { withPublicSecurity, sanitizeInput } from "@/lib/security";
import { getProfileBySlugNoCache } from "@/lib/database-service";

export const POST = withPublicSecurity(async (request: NextRequest) => {
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
        { status: 400 },
      );
    }

    const sanitizedBody = sanitizeInput(body);
    const { slug } = sanitizedBody;

    // Validate input
    if (!slug) {
      return NextResponse.json(
        {
          error: "Slug is required",
          success: false,
        },
        { status: 400 },
      );
    }

    if (typeof slug !== "string") {
      return NextResponse.json(
        {
          error: "Slug must be a string",
          success: false,
        },
        { status: 400 },
      );
    }

    // Use the no-cache database service for real-time updates
    const result = await getProfileBySlugNoCache(slug);

    if (result.error) {
      if (result.error === "Profile not found") {
        return NextResponse.json(
          {
            success: false,
            error: "Profile not found",
          },
          { status: 404 },
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
      data: result.data,
      fromCache: false, // Always false for no-cache endpoint
    });
  } catch (error: any) {
    console.error("Error getting profile by slug (no cache):", error);

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
});
