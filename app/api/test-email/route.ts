import { NextRequest, NextResponse } from "next/server";
import { withSecurity } from "@/lib/security";
import { testSMTPConnection, sendTestEmail } from "@/lib/email-service";

/**
 * Test SMTP configuration and send a test email
 */
export const POST = withSecurity(async (request: NextRequest, { user }) => {
  try {
    console.log("Testing email functionality for user:", user.email);

    // Test 1: Check SMTP connection
    console.log("🔍 Testing SMTP connection...");
    const connectionTest = await testSMTPConnection();

    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: "SMTP connection failed",
        details: connectionTest.error,
        smtpConfigured: false,
      });
    }

    console.log("✅ SMTP connection successful");

    // Test 2: Send test email
    console.log("📧 Sending test email...");
    const emailTest = await sendTestEmail(user.email);

    if (!emailTest.success) {
      return NextResponse.json({
        success: false,
        error: "Test email failed",
        details: emailTest.error,
        smtpConfigured: true,
        emailSent: false,
      });
    }

    console.log("✅ Test email sent successfully");

    return NextResponse.json({
      success: true,
      message: "Email test completed successfully",
      data: {
        smtpConfigured: true,
        emailSent: true,
        userEmail: user.email,
      },
    });
  } catch (error: any) {
    console.error("Email test error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Email test failed",
        details: error.message,
        smtpConfigured: false,
      },
      { status: 500 }
    );
  }
});

/**
 * GET endpoint to check SMTP configuration status
 */
export const GET = withSecurity(async (request: NextRequest, { user }) => {
  try {
    // Check if SMTP environment variables are set
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const fromEmail = process.env.FROM_EMAIL;
    const fromName = process.env.FROM_NAME;

    const smtpConfigured = !!(
      smtpHost &&
      smtpUser &&
      smtpPassword &&
      fromEmail &&
      fromName
    );

    return NextResponse.json({
      success: true,
      smtpConfigured,
      configuration: {
        smtpHost: smtpHost ? "✅ Set" : "❌ Missing",
        smtpUser: smtpUser ? "✅ Set" : "❌ Missing",
        smtpPassword: smtpPassword ? "✅ Set" : "❌ Missing",
        fromEmail: fromEmail ? "✅ Set" : "❌ Missing",
        fromName: fromName ? "✅ Set" : "❌ Missing",
      },
      userEmail: user.email,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check SMTP configuration",
        details: error.message,
      },
      { status: 500 }
    );
  }
});
