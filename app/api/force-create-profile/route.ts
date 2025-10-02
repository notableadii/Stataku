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
      "Turso database configuration is missing. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables."
    );
  }

  return createClient({
    url,
    authToken,
  });
}

export const POST = withSecurity(async (request: NextRequest, { user }) => {
  try {
    const turso = getTursoClient();

    console.log(`Force creating profile for user ${user.id}`);

    // Check if profile already exists
    const existingProfile = await turso.execute({
      sql: "SELECT id FROM profiles WHERE id = ?",
      args: [user.id],
    });

    if (existingProfile.rows.length > 0) {
      console.log(`Profile already exists for user ${user.id}`);
      return NextResponse.json({
        success: true,
        message: "Profile already exists",
        data: { profileExists: true },
      });
    }

    // Generate username and slug from Supabase UID
    const username = generateUsernameFromUID(user.id);
    const slug = generateSlugFromUID(user.id);

    // Generate display name from email if available
    const displayName = user.email
      ? generateDisplayNameFromEmail(user.email)
      : null;

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

    console.log(
      `Force-created profile for user ${user.id} with username ${username}`
    );

    // Verify the profile was created
    const verifyResult = await turso.execute({
      sql: "SELECT id, username, slug FROM profiles WHERE id = ?",
      args: [user.id],
    });

    if (verifyResult.rows.length === 0) {
      throw new Error("Profile creation verification failed");
    }

    // Try to send welcome email
    try {
      const emailResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/send-profile-completion-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${request.headers.get("authorization")}`,
          },
        }
      );

      const emailResult = await emailResponse.json();

      if (emailResult.success) {
        console.log(`Welcome email sent to user ${user.id}`);
      } else {
        console.log(
          `Failed to send welcome email to user ${user.id}:`,
          emailResult.error
        );
        console.log(
          "💡 To fix email issues, check your SMTP configuration in .env.local"
        );
      }
    } catch (emailError) {
      console.log(
        `Error sending welcome email to user ${user.id}:`,
        emailError
      );
      console.log(
        "💡 To fix email issues, check your SMTP configuration in .env.local"
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile created successfully",
      data: {
        profileExists: false,
        username,
        slug,
        displayName,
        profileVerified: true,
      },
    });
  } catch (error: any) {
    console.error("Error force-creating profile:", error);

    // Handle unique constraint violation (race condition)
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
        error: "Failed to create profile automatically",
        details: error.message,
      },
      { status: 500 }
    );
  }
});
