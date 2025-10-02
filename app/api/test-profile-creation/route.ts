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
 * Test endpoint to debug profile creation issues
 */
export const POST = withSecurity(async (request: NextRequest, { user }) => {
  try {
    console.log("Testing profile creation for user:", user.id);

    const turso = getTursoClient();

    // Test database connection
    console.log("Testing database connection...");
    const testQuery = await turso.execute("SELECT 1 as test");
    console.log("Database connection test result:", testQuery);

    // Check if profiles table exists
    console.log("Checking if profiles table exists...");
    const tableCheck = await turso.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='profiles'
    `);
    console.log("Profiles table check:", tableCheck);

    // Check current user profile
    console.log("Checking existing profile for user:", user.id);
    const existingProfile = await turso.execute({
      sql: "SELECT * FROM profiles WHERE id = ?",
      args: [user.id],
    });
    console.log("Existing profile:", existingProfile);

    // Generate username components
    const username = generateUsernameFromUID(user.id);
    const slug = generateSlugFromUID(user.id);
    const displayName = user.email
      ? generateDisplayNameFromEmail(user.email)
      : null;

    console.log("Generated username components:", {
      username,
      slug,
      displayName,
      userEmail: user.email,
    });

    return NextResponse.json({
      success: true,
      message: "Profile creation test completed",
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
        database: {
          connected: true,
          profilesTableExists: tableCheck.rows.length > 0,
          existingProfile:
            existingProfile.rows.length > 0 ? existingProfile.rows[0] : null,
        },
        generated: {
          username,
          slug,
          displayName,
        },
      },
    });
  } catch (error: any) {
    console.error("Profile creation test error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Profile creation test failed",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    );
  }
});

/**
 * GET endpoint to check if the API is accessible
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Test endpoint is accessible",
    timestamp: new Date().toISOString(),
  });
}
