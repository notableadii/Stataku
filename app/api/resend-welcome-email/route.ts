import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";

import { withSecurity } from "@/lib/security";
import { sendWelcomeEmail } from "@/lib/email-service";

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
 * Resend welcome email to users who didn't receive it
 * This endpoint can be used to manually trigger welcome emails
 */
export const POST = withSecurity(async (request: NextRequest, { user }) => {
  try {
    const turso = getTursoClient();

    // Check current profile status
    const profileResult = await turso.execute({
      sql: "SELECT id, username, display_name, email_sent, last_edit FROM profiles WHERE id = ?",
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

    // Send welcome email (force resend)
    console.log(`📧 Resending welcome email to ${user.email}`);

    const emailResult = await sendWelcomeEmail(
      user.email,
      profile.username as string,
      (profile as any).display_name || undefined,
    );

    if (emailResult.success) {
      // Update email_sent status in database
      await turso.execute({
        sql: "UPDATE profiles SET email_sent = 'Yes' WHERE id = ?",
        args: [user.id],
      });

      console.log(`✅ Welcome email resent to user ${user.id} (${user.email})`);

      return NextResponse.json({
        success: true,
        message: "Welcome email resent successfully",
        data: {
          emailSent: true,
          email: user.email,
          username: profile.username,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || "Failed to resend email",
          retryable: emailResult.retryable || false,
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Error resending welcome email:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to resend welcome email",
        details: error.message,
      },
      { status: 500 },
    );
  }
});
