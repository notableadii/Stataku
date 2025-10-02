import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";

import { withSecurity } from "@/lib/security";
import {
  generateUsernameFromUID,
  generateSlugFromUID,
  generateDisplayNameFromEmail,
} from "@/lib/username-generator";

function getTursoClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error(
      "Turso database configuration is missing. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.",
    );
  }

  return createClient({
    url,
    authToken,
  });
}

/**
 * Force create profile for the authenticated user
 * This endpoint will create a profile even if one already exists (for debugging)
 */
export const POST = withSecurity(async (request: NextRequest, { user }) => {
  try {
    console.log("Force creating profile for user:", user.id);

    const turso = getTursoClient();

    // Check if profile already exists
    const existingProfile = await turso.execute({
      sql: "SELECT * FROM profiles WHERE id = ?",
      args: [user.id],
    });

    if (existingProfile.rows.length > 0) {
      console.log("Profile already exists:", existingProfile.rows[0]);
      return NextResponse.json({
        success: true,
        message: "Profile already exists",
        data: {
          profileExists: true,
          profile: existingProfile.rows[0],
        },
      });
    }

    // Generate username and slug from Supabase UID
    const username = generateUsernameFromUID(user.id);
    const slug = generateSlugFromUID(user.id);

    // Generate display name from email if available
    const displayName = user.email
      ? generateDisplayNameFromEmail(user.email)
      : null;

    console.log("Creating profile with data:", {
      id: user.id,
      username,
      slug,
      displayName,
      email: user.email,
    });

    // Create the profile with auto-generated data
    const result = await turso.execute({
      sql: `INSERT INTO profiles (
        id, 
        username, 
        slug, 
        display_name, 
        bio, 
        avatar_url, 
        banner_url, 
        created_at,
        last_edit,
        email_sent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, NULL, 'No')`,
      args: [
        user.id,
        username,
        slug,
        displayName,
        null, // bio
        null, // avatar_url
        null, // banner_url
      ],
    });

    console.log("Profile creation result:", result);

    // Verify the profile was created
    const verifyProfile = await turso.execute({
      sql: "SELECT * FROM profiles WHERE id = ?",
      args: [user.id],
    });

    if (verifyProfile.rows.length > 0) {
      console.log("Profile verified successfully:", verifyProfile.rows[0]);

      // Send welcome email for new users (one-time only)
      try {
        console.log("📧 Attempting to send welcome email...");
        const emailResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/send-profile-completion-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${request.headers.get("authorization")}`,
            },
          },
        );

        const emailResult = await emailResponse.json();

        if (emailResponse.ok && emailResult.success) {
          console.log("✅ Welcome email sent successfully:", emailResult);
        } else {
          console.error("❌ Welcome email failed:", emailResult);
          console.log(
            "💡 To fix email issues, check your SMTP configuration in .env.local",
          );
        }
      } catch (emailError) {
        console.error("❌ Failed to send welcome email:", emailError);
        console.log(
          "💡 To fix email issues, check your SMTP configuration in .env.local",
        );
        // Don't fail the profile creation if email fails
      }

      return NextResponse.json({
        success: true,
        message: "Profile created successfully",
        data: {
          profileExists: false,
          username,
          slug,
          displayName,
          profile: verifyProfile.rows[0],
        },
      });
    } else {
      throw new Error("Profile creation verification failed");
    }
  } catch (error: any) {
    console.error("Error force-creating profile:", error);

    // Handle unique constraint violation
    if (error.message?.includes("UNIQUE constraint failed")) {
      return NextResponse.json({
        success: true,
        message: "Profile already exists (created concurrently)",
        data: { profileExists: true },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create profile",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    );
  }
});

/**
 * GET endpoint to show user info and profile status
 */
export const GET = withSecurity(async (request: NextRequest, { user }) => {
  try {
    const turso = getTursoClient();

    // Check current profile
    const existingProfile = await turso.execute({
      sql: "SELECT * FROM profiles WHERE id = ?",
      args: [user.id],
    });

    // Generate what the username would be
    const username = generateUsernameFromUID(user.id);
    const slug = generateSlugFromUID(user.id);
    const displayName = user.email
      ? generateDisplayNameFromEmail(user.email)
      : null;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      profile: {
        exists: existingProfile.rows.length > 0,
        current:
          existingProfile.rows.length > 0 ? existingProfile.rows[0] : null,
      },
      generated: {
        username,
        slug,
        displayName,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get profile info",
        details: error.message,
      },
      { status: 500 },
    );
  }
});
