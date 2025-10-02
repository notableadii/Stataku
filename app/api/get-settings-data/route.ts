import { NextRequest, NextResponse } from "next/server";

import { withSecurity, sanitizeInput } from "@/lib/security";
import { getProfile } from "@/lib/database-service";

export const POST = withSecurity(async (request: NextRequest, { user }) => {
  try {
    // Check if request has a body
    const contentType = request.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 },
      );
    }

    // Get the request body
    let body;

    try {
      const text = await request.text();

      if (!text || text.trim() === "") {
        return NextResponse.json(
          { error: "Request body is empty" },
          { status: 400 },
        );
      }
      body = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);

      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const sanitizedBody = sanitizeInput(body);
    const { userId } = sanitizedBody;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Security check: Ensure user can only access their own settings data
    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You can only access your own settings data" },
        { status: 403 },
      );
    }

    // Get profile data (uses existing caching)
    const profileResult = await getProfile(userId);

    // Check for errors
    if (profileResult.error) {
      return NextResponse.json({ error: profileResult.error }, { status: 500 });
    }

    // Return profile data only - identities will be fetched client-side
    return NextResponse.json({
      data: {
        profile: profileResult.data,
        identities: [], // Will be populated client-side
        hasPasswordAuth: false, // Will be determined client-side
      },
      error: null,
      fromCache: profileResult.fromCache,
    });
  } catch (error) {
    console.error("Error getting settings data:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
});
