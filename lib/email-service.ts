/**
 * Email Service for Stataku
 * Handles SMTP email sending with beautiful templates
 * Enhanced with retry logic, rate limiting, and security features
 */

import nodemailer from "nodemailer";
import {
  generateWelcomeEmailTemplate,
  generateWelcomeEmailText,
} from "./email-templates";

// Rate limiting and retry configuration
const EMAIL_RATE_LIMIT = new Map<
  string,
  { count: number; resetTime: number }
>();
const MAX_EMAILS_PER_HOUR = 10;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// SMTP Configuration interface
interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    email: string;
    name: string;
  };
}

/**
 * Check if email sending is rate limited for a user
 */
function isRateLimited(email: string): boolean {
  const now = Date.now();
  const userLimit = EMAIL_RATE_LIMIT.get(email);

  if (!userLimit) {
    EMAIL_RATE_LIMIT.set(email, { count: 1, resetTime: now + 3600000 }); // 1 hour
    return false;
  }

  if (now > userLimit.resetTime) {
    // Reset the counter
    EMAIL_RATE_LIMIT.set(email, { count: 1, resetTime: now + 3600000 });
    return false;
  }

  if (userLimit.count >= MAX_EMAILS_PER_HOUR) {
    return true;
  }

  userLimit.count++;
  return false;
}

/**
 * Sleep function for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = RETRY_ATTEMPTS,
  delay: number = RETRY_DELAY
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        throw error;
      }

      // Exponential backoff
      const backoffDelay = delay * Math.pow(2, attempt - 1);
      console.log(
        `🔄 Retry attempt ${attempt}/${maxAttempts} after ${backoffDelay}ms delay`
      );
      await sleep(backoffDelay);
    }
  }

  throw lastError;
}

/**
 * Get SMTP configuration from environment variables
 */
function getSMTPConfig(): SMTPConfig {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const fromEmail = process.env.FROM_EMAIL;
  const fromName = process.env.FROM_NAME;

  if (!host || !user || !password || !fromEmail || !fromName) {
    throw new Error(
      "SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, FROM_EMAIL, and FROM_NAME environment variables."
    );
  }

  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass: password,
    },
    from: {
      email: fromEmail,
      name: fromName,
    },
  };
}

/**
 * Create nodemailer transporter with SMTP configuration
 * Enhanced with better security and error handling
 */
function createTransporter() {
  const config = getSMTPConfig();

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    // Enhanced security options
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production", // Only reject in production
      ciphers: "SSLv3", // Use secure ciphers
    },
    // Timeout configurations
    connectionTimeout: 15000, // 15 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 15000, // 15 seconds
    // Pool configuration for better performance
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    // Rate limiting
    rateLimit: 14, // 14 emails per second max
    // Debug mode for development
    debug: process.env.NODE_ENV === "development",
    logger: process.env.NODE_ENV === "development",
  });
}

/**
 * Send a test welcome email (bypasses rate limiting)
 * This function is specifically for testing purposes
 */
export async function sendTestWelcomeEmail(
  toEmail: string,
  username: string,
  displayName?: string
): Promise<{ success: boolean; error?: string; retryable?: boolean }> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      return {
        success: false,
        error: "Invalid email format",
        retryable: false,
      };
    }

    // Skip rate limiting check for test emails
    console.log(`🧪 Test mode: Skipping rate limiting for ${toEmail}`);

    const config = getSMTPConfig();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const profileUrl = `${siteUrl}/settings/profile`;

    // Generate email content
    const htmlContent = generateWelcomeEmailTemplate(
      username,
      displayName,
      profileUrl
    );
    const textContent = generateWelcomeEmailText(
      username,
      displayName,
      profileUrl
    );

    // Email options with enhanced security
    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to: toEmail,
      subject: "🧪 [TEST] Welcome to Stataku - Complete Your Profile",
      html: htmlContent,
      text: textContent,
      // Enhanced email headers
      headers: {
        "X-Mailer": "Stataku Email Service v2.0 (Test Mode)",
        "X-Priority": "3",
        "X-Message-ID": `test-welcome-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        "List-Unsubscribe": `<${siteUrl}/unsubscribe>`,
      },
      // Security headers
      envelope: {
        from: config.from.email,
        to: [toEmail],
      },
    };

    // Send email with retry logic
    console.log(`📤 Sending TEST welcome email to ${toEmail}...`);
    const result = await withRetry(async () => {
      const transporter = createTransporter();

      // Test connection with retry
      await withRetry(() => transporter.verify(), 2, 2000);
      console.log("✅ SMTP connection verified");

      return await transporter.sendMail(mailOptions);
    });

    console.log("✅ Test welcome email sent successfully:", {
      messageId: result.messageId,
      to: toEmail,
      accepted: result.accepted,
      rejected: result.rejected,
    });

    return { success: true };
  } catch (error: any) {
    console.error("❌ Error sending test welcome email:", error);

    // Determine if error is retryable
    const retryableErrors = [
      "ECONNECTION",
      "ETIMEDOUT",
      "ENOTFOUND",
      "ECONNRESET",
      "EPIPE",
    ];

    const isRetryable = retryableErrors.some(
      (code) => error.code === code || error.message?.includes(code)
    );

    return {
      success: false,
      error: error.message || "Failed to send test welcome email",
      retryable: isRetryable,
    };
  }
}

/**
 * Send welcome/profile completion email to new users
 * Enhanced with rate limiting, retry logic, and better error handling
 */
export async function sendWelcomeEmail(
  toEmail: string,
  username: string,
  displayName?: string
): Promise<{ success: boolean; error?: string; retryable?: boolean }> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      return {
        success: false,
        error: "Invalid email format",
        retryable: false,
      };
    }

    // Check rate limiting
    if (isRateLimited(toEmail)) {
      return {
        success: false,
        error: "Rate limit exceeded. Please try again later.",
        retryable: true,
      };
    }

    console.log(`📧 Preparing to send welcome email to ${toEmail}`);

    const config = getSMTPConfig();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const profileUrl = `${siteUrl}/settings/profile`;

    // Generate email content
    const htmlContent = generateWelcomeEmailTemplate(
      username,
      displayName,
      profileUrl
    );
    const textContent = generateWelcomeEmailText(
      username,
      displayName,
      profileUrl
    );

    // Email options with enhanced security
    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to: toEmail,
      subject: "🎌 Welcome to Stataku - Complete Your Profile",
      html: htmlContent,
      text: textContent,
      // Enhanced email headers
      headers: {
        "X-Mailer": "Stataku Email Service v2.0",
        "X-Priority": "3",
        "X-Message-ID": `welcome-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        "List-Unsubscribe": `<${siteUrl}/unsubscribe>`,
      },
      // Security headers
      envelope: {
        from: config.from.email,
        to: [toEmail],
      },
    };

    // Send email with retry logic
    console.log(`📤 Sending welcome email to ${toEmail}...`);
    const result = await withRetry(async () => {
      const transporter = createTransporter();

      // Test connection with retry
      await withRetry(() => transporter.verify(), 2, 2000);
      console.log("✅ SMTP connection verified");

      return await transporter.sendMail(mailOptions);
    });

    console.log("✅ Welcome email sent successfully:", {
      messageId: result.messageId,
      to: toEmail,
      username: username,
      accepted: result.accepted,
      rejected: result.rejected,
    });

    return { success: true };
  } catch (error: any) {
    console.error("❌ Error sending welcome email:", error);

    // Determine if error is retryable
    const retryableErrors = [
      "ECONNECTION",
      "ETIMEDOUT",
      "ENOTFOUND",
      "ECONNRESET",
      "EPIPE",
    ];

    const isRetryable = retryableErrors.some(
      (code) => error.code === code || error.message?.includes(code)
    );

    // Provide helpful error messages
    let errorMessage = "Failed to send email";

    if (error.code === "EAUTH") {
      errorMessage =
        "SMTP authentication failed. Check your email credentials.";
    } else if (error.code === "ECONNECTION") {
      errorMessage =
        "Failed to connect to SMTP server. Check your SMTP settings.";
    } else if (error.code === "ETIMEDOUT") {
      errorMessage =
        "SMTP connection timed out. Check your network and SMTP settings.";
    } else if (error.code === "ENOTFOUND") {
      errorMessage =
        "SMTP server not found. Check your SMTP host configuration.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      retryable: isRetryable,
    };
  }
}

/**
 * Test SMTP connection and configuration
 * Enhanced with retry logic and better error reporting
 */
export async function testSMTPConnection(): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> {
  try {
    console.log("🔍 Testing SMTP connection...");

    const config = getSMTPConfig();
    console.log("📋 SMTP Configuration:", {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.auth.user,
      fromEmail: config.from.email,
      fromName: config.from.name,
    });

    const transporter = createTransporter();

    // Test connection with retry
    await withRetry(() => transporter.verify(), 3, 2000);

    console.log("✅ SMTP connection test successful");
    return {
      success: true,
      details: {
        host: config.host,
        port: config.port,
        secure: config.secure,
      },
    };
  } catch (error: any) {
    console.error("❌ SMTP connection test failed:", error);

    let errorMessage = "SMTP connection test failed";

    if (error.code === "EAUTH") {
      errorMessage =
        "SMTP authentication failed. Check your email credentials.";
    } else if (error.code === "ECONNECTION") {
      errorMessage =
        "Failed to connect to SMTP server. Check your SMTP settings.";
    } else if (error.code === "ETIMEDOUT") {
      errorMessage =
        "SMTP connection timed out. Check your network and SMTP settings.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      details: {
        code: error.code,
        message: error.message,
        stack: error.stack,
      },
    };
  }
}

/**
 * Send a custom email with custom subject and message
 * Enhanced with retry logic and better error handling
 */
export async function sendCustomEmail(
  toEmail: string,
  subject: string,
  message: string
): Promise<{
  success: boolean;
  error?: string;
  retryable?: boolean;
  messageId?: string;
}> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      return {
        success: false,
        error: "Invalid email format",
        retryable: false,
      };
    }

    // Check rate limiting
    if (isRateLimited(toEmail)) {
      return {
        success: false,
        error: "Rate limit exceeded. Please try again later.",
        retryable: true,
      };
    }

    const config = getSMTPConfig();

    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to: toEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #000000; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="color: #6366f1;">📧 Custom Email from Stataku</h2>
          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
            <p style="white-space: pre-wrap; line-height: 1.6;">${message.replace(/\n/g, "<br>")}</p>
          </div>
          <hr style="border: 1px solid #333333; margin: 20px 0;">
          <small style="color: #888888;">Sent from Stataku Email Service v2.0</small>
        </div>
      `,
      text: `Custom Email from Stataku\n\n${message}\n\nSent from Stataku Email Service v2.0`,
      headers: {
        "X-Mailer": "Stataku Email Service v2.0",
        "X-Message-ID": `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
    };

    // Send email with retry logic
    const result = await withRetry(async () => {
      const transporter = createTransporter();

      // Test connection with retry
      await withRetry(() => transporter.verify(), 2, 2000);

      return await transporter.sendMail(mailOptions);
    });

    console.log("✅ Custom email sent successfully:", {
      messageId: result.messageId,
      to: toEmail,
      subject: subject,
      accepted: result.accepted,
      rejected: result.rejected,
    });

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error: any) {
    console.error("❌ Error sending custom email:", error);

    // Determine if error is retryable
    const retryableErrors = [
      "ECONNECTION",
      "ETIMEDOUT",
      "ENOTFOUND",
      "ECONNRESET",
      "EPIPE",
    ];

    const isRetryable = retryableErrors.some(
      (code) => error.code === code || error.message?.includes(code)
    );

    return {
      success: false,
      error: error.message || "Failed to send custom email",
      retryable: isRetryable,
    };
  }
}

/**
 * Send a test email to verify email functionality
 * Enhanced with retry logic and better error handling
 */
export async function sendTestEmail(
  toEmail: string
): Promise<{ success: boolean; error?: string; retryable?: boolean }> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      return {
        success: false,
        error: "Invalid email format",
        retryable: false,
      };
    }

    // Check rate limiting
    if (isRateLimited(toEmail)) {
      return {
        success: false,
        error: "Rate limit exceeded. Please try again later.",
        retryable: true,
      };
    }

    const config = getSMTPConfig();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to: toEmail,
      subject: "🧪 Stataku Email Test",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #000000; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="color: #6366f1;">📧 Email Test Successful!</h2>
          <p>This is a test email from Stataku.</p>
          <p>If you received this email, your SMTP configuration is working correctly.</p>
          <hr style="border: 1px solid #333333; margin: 20px 0;">
          <small style="color: #888888;">Sent from Stataku Email Service v2.0</small>
        </div>
      `,
      text: "Email Test Successful! This is a test email from Stataku. If you received this email, your SMTP configuration is working correctly.",
      headers: {
        "X-Mailer": "Stataku Email Service v2.0",
        "X-Message-ID": `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
    };

    // Send email with retry logic
    const result = await withRetry(async () => {
      const transporter = createTransporter();

      // Test connection with retry
      await withRetry(() => transporter.verify(), 2, 2000);

      return await transporter.sendMail(mailOptions);
    });

    console.log("✅ Test email sent successfully:", {
      messageId: result.messageId,
      to: toEmail,
      accepted: result.accepted,
      rejected: result.rejected,
    });

    return { success: true };
  } catch (error: any) {
    console.error("❌ Error sending test email:", error);

    // Determine if error is retryable
    const retryableErrors = [
      "ECONNECTION",
      "ETIMEDOUT",
      "ENOTFOUND",
      "ECONNRESET",
      "EPIPE",
    ];

    const isRetryable = retryableErrors.some(
      (code) => error.code === code || error.message?.includes(code)
    );

    return {
      success: false,
      error: error.message || "Failed to send test email",
      retryable: isRetryable,
    };
  }
}
