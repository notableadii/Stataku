import { NextRequest, NextResponse } from "next/server";

import { withPublicSecurity, sanitizeInput } from "@/lib/security";
import { getProfileBySlug } from "@/lib/database-service";

// Support both GET and POST requests
export const GET = withPublicSecurity(async (request: NextRequest) => {
  try {
    // Extract slug from URL parameters for GET requests
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    // Validate input
    if (!slug) {
      return NextResponse.json(
        {
          error: "Slug is required as a query parameter",
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

    // Use the cached database service
    const result = await getProfileBySlug(slug);

    if (result.error) {
      if (result.error === "Profile not found") {
        return NextResponse.json(
          {
            success: false,
            error: "Profile not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      fromCache: result.fromCache,
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
});

export const POST = withPublicSecurity(async (request: NextRequest) => {
  try {
    // Parse request body with better error handling
    let body;
    let slug: string;

    // Check if request has a body
    const contentLength = request.headers.get("content-length");
    const contentType = request.headers.get("content-type");

    if (!contentLength || contentLength === "0") {
      // No body provided, try to get slug from URL parameters as fallback
      const { searchParams } = new URL(request.url);
      const urlSlug = searchParams.get("slug");

      if (urlSlug) {
        slug = urlSlug;
      } else {
        return NextResponse.json(
          {
            error: "Request body is empty and no slug provided in URL",
            success: false,
          },
          { status: 400 }
        );
      }
    } else {
      // Try to parse JSON body
      try {
        body = await request.json();
        const sanitizedBody = sanitizeInput(body);
        slug = sanitizedBody.slug;
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        console.error("Content-Type:", contentType);
        console.error("Content-Length:", contentLength);

        // Try to get slug from URL as fallback
        const { searchParams } = new URL(request.url);
        const urlSlug = searchParams.get("slug");

        if (urlSlug) {
          slug = urlSlug;
          console.log("Using slug from URL parameters as fallback:", slug);
        } else {
          return NextResponse.json(
            {
              error:
                "Invalid JSON in request body and no slug in URL parameters",
              success: false,
            },
            { status: 400 }
          );
        }
      }
    }

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

    // Use the cached database service
    const result = await getProfileBySlug(slug);

    if (result.error) {
      if (result.error === "Profile not found") {
        return NextResponse.json(
          {
            success: false,
            error: "Profile not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      fromCache: result.fromCache,
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
});
