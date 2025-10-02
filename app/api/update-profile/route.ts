import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

import { withSecurity, sanitizeInput, isValidUsername } from "@/lib/security";
import { updateProfile, checkUsername } from "@/lib/database-service";

export const POST = withSecurity(async (request: NextRequest, { user }) => {
  try {
    // Parse and sanitize request body
    const body = await request.json();
    const sanitizedBody = sanitizeInput(body);
    const {
      userId,
      username,
      display_name,
      bio,
      avatar_url,
      banner_url,
      last_edit,
    } = sanitizedBody;

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Security check: Ensure user can only update their own profile
    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You can only update your own profile" },
        { status: 403 }
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

    // Validate username if provided
    if (username !== undefined && username !== null) {
      if (typeof username !== "string") {
        return NextResponse.json(
          { error: "Username must be a string or null" },
          { status: 400 }
        );
      }

      const normalizedUsername = username.toLowerCase().trim();

      // Check username format
      if (!isValidUsername(normalizedUsername)) {
        return NextResponse.json(
          {
            error:
              "Invalid username format. Username must be 3-30 characters and contain only lowercase letters, numbers, underscores, and periods.",
          },
          { status: 400 }
        );
      }

      // Check if username is available (if different from current)
      const currentProfile = await updateProfile(userId, {});
      if (currentProfile.data?.username !== normalizedUsername) {
        const usernameCheck = await checkUsername(normalizedUsername);
        if (usernameCheck.error) {
          return NextResponse.json(
            { error: "Failed to check username availability" },
            { status: 500 }
          );
        }
        if (!usernameCheck.data) {
          return NextResponse.json(
            { error: "Username is already taken" },
            { status: 400 }
          );
        }
      }
    }

    // Use the cached database service (this will automatically invalidate cache)
    const result = await updateProfile(userId, {
      username,
      display_name,
      bio,
      avatar_url,
      banner_url,
      last_edit,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Invalidate Next.js cache for profile-related paths
    try {
      // Invalidate the user's profile page
      if (result.data?.username) {
        revalidatePath(`/user/${result.data.username}`);
      }

      // Invalidate settings pages
      revalidatePath("/settings/profile");
      revalidatePath("/settings/account");

      // Invalidate by tags
      revalidateTag("profile");
      revalidateTag(`profile-${userId}`);

      console.log("✅ Cache invalidated for profile update");
    } catch (cacheError) {
      console.error("❌ Error invalidating cache:", cacheError);
      // Don't fail the request if cache invalidation fails
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error updating profile:", error);

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
});
