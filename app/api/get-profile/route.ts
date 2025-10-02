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

    // Get the request body with better error handling
    let body;

    try {
      // Check if the request has a body first
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

    // Security check: Ensure user can only access their own profile
    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You can only access your own profile" },
        { status: 403 },
      );
    }

    // Use the cached database service
    const result = await getProfile(userId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      data: result.data,
      error: null,
      fromCache: result.fromCache,
    });
  } catch (error) {
    console.error("Error getting user profile:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
});
