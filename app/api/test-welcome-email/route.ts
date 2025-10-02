import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";

import { withSecurity } from "@/lib/security";
import { sendTestWelcomeEmail } from "@/lib/email-service";

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
 * Test welcome email endpoint - bypasses email_sent checks and rate limiting
 * This endpoint is specifically for testing purposes only
 */
export const POST = withSecurity(async (request: NextRequest, { user }) => {
  try {
    const turso = getTursoClient();

    // Get current profile status
    const profileResult = await turso.execute({
      sql: "SELECT id, username, display_name FROM profiles WHERE id = ?",
      args: [user.id],
    });

    if (profileResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Profile not found",
        },
        { status: 404 },
      );
    }

    const profile = profileResult.rows[0];

    // Send test welcome email using SMTP (bypassing email_sent check and rate limiting)
    const emailResult = await sendTestWelcomeEmail(
      user.email,
      profile.username as string,
      (profile as any).display_name || undefined,
    );

    if (emailResult.success) {
      console.log(`Test welcome email sent to user ${user.id} (${user.email})`);

      return NextResponse.json({
        success: true,
        message: "Test welcome email sent successfully",
        data: {
          emailSent: true,
          email: user.email,
          username: profile.username,
          displayName: profile.display_name,
          testMode: true,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || "Failed to send test email",
          retryable: emailResult.retryable,
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Error sending test welcome email:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send test welcome email",
        details: error.message,
      },
      { status: 500 },
    );
  }
});
