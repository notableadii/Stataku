import { NextRequest, NextResponse } from "next/server";

import { withSecurity } from "@/lib/security";
import { sendCustomEmail } from "@/lib/email-service";

export const POST = withSecurity(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    const { email, subject, message } = body;

    if (!email || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, subject, and message are required",
        },
        { status: 400 },
      );
    }

    // Send custom email
    const emailResult = await sendCustomEmail(email, subject, message);

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: "Custom email sent successfully",
        data: {
          email,
          subject,
          messageId: emailResult.messageId,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || "Failed to send custom email",
          retryable: emailResult.retryable || false,
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Error sending custom email:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send custom email",
        details: error.message,
      },
      { status: 500 },
    );
  }
});
