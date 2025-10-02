import { NextRequest, NextResponse } from "next/server";

import { withSecurity } from "@/lib/security";
import { testSMTPConnection } from "@/lib/email-service";

export const POST = withSecurity(async (request: NextRequest, { user }) => {
  try {
    // Test SMTP connection
    const result = await testSMTPConnection();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "SMTP connection test successful",
        details: result.details,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "SMTP connection test failed",
          details: result.details,
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Error testing SMTP:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to test SMTP connection",
        details: error.message,
      },
      { status: 500 },
    );
  }
});
