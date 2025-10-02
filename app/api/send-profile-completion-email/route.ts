import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";

import { withSecurity } from "@/lib/security";
import { sendWelcomeEmail } from "@/lib/email-service";

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

/**
 * Send welcome email to new users
 * This endpoint sends a one-time welcome email with profile setup instructions
 */
export const POST = withSecurity(async (request: NextRequest, { user }) => {
  try {
    const turso = getTursoClient();

    // Check current profile status
    const profileResult = await turso.execute({
      sql: "SELECT id, username, email_sent, last_edit FROM profiles WHERE id = ?",
      args: [user.id],
    });

    if (profileResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Profile not found",
        },
        { status: 404 }
      );
    }

    const profile = profileResult.rows[0];

    // Check if welcome email should be sent (one-time only)
    const shouldSendEmail = profile.email_sent === "No";

    if (!shouldSendEmail) {
      return NextResponse.json({
        success: true,
        message: "Welcome email already sent",
        data: {
          emailSent: false,
          reason: "Welcome email already sent to this user",
        },
      });
    }

    // Send welcome email using SMTP
    const emailResult = await sendWelcomeEmail(
      user.email,
      profile.username as string,
      (profile as any).display_name || undefined
    );

    if (emailResult.success) {
      // Update email_sent status in database
      await turso.execute({
        sql: "UPDATE profiles SET email_sent = 'Yes' WHERE id = ?",
        args: [user.id],
      });

      console.log(`Welcome email sent to user ${user.id} (${user.email})`);

      return NextResponse.json({
        success: true,
        message: "Welcome email sent successfully",
        data: {
          emailSent: true,
          email: user.email,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || "Failed to send email",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error sending welcome email:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send welcome email",
      },
      { status: 500 }
    );
  }
});
