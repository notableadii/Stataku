import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";

// Initialize Turso client on server side
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per IP

// Clean up expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitMap.entries());
  for (const [ip, data] of entries) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 300000); // 5 minutes

/**
 * Check if the request is within rate limits
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

/**
 * Get client IP address from request headers
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          available: false,
        },
        { status: 429 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { username } = body;

    // Validate input
    if (!username || typeof username !== "string") {
      return NextResponse.json(
        {
          error: "Username is required and must be a string",
          available: false,
        },
        { status: 400 },
      );
    }

    const normalizedUsername = username.toLowerCase().trim();

    // Enforce minimum username length (3+ chars as specified)
    if (normalizedUsername.length < 3) {
      return NextResponse.json({
        available: false,
        username: normalizedUsername,
        error: "Username must be at least 3 characters long",
      });
    }

    // Block reserved usernames that conflict with existing routes
    const reservedUsernames = [
      // Main pages
      "dashboard",
      "profile",
      "settings",
      "browse",
      "discovery",
      "signin",
      "signup",
      // API routes
      "api",
      "avatar",
      "check-username",
      "create-profile",
      "create-username",
      "get-profile",
      "get-profile-by-slug",
      "init-db",
      // Common reserved words
      "admin",
      "root",
      "www",
      "mail",
      "ftp",
      "blog",
      "news",
      "support",
      "help",
      "about",
      "contact",
      "privacy",
      "terms",
      "legal",
      "security",
      "status",
      // Next.js reserved
      "_next",
      "favicon.ico",
      "robots.txt",
      "sitemap.xml",
      // Common system words
      "system",
      "config",
      "public",
      "private",
      "internal",
      "external",
    ];

    if (reservedUsernames.includes(normalizedUsername)) {
      return NextResponse.json({
        available: false,
        username: normalizedUsername,
        error: "This username is reserved and cannot be used",
      });
    }

    // Check if database is configured
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      console.warn(
        "Database not configured, using mock data for username checking",
      );

      // Mock some usernames as taken for testing
      const mockTakenUsernames = ["admin", "test", "user", "demo", "guest"];
      const isAvailable =
        !mockTakenUsernames.includes(normalizedUsername) &&
        !reservedUsernames.includes(normalizedUsername);

      return NextResponse.json({
        available: isAvailable,
        username: normalizedUsername,
        mock: true, // Indicate this is mock data
      });
    }

    // Check username availability using optimized query
    // Using LIMIT 1 to minimize read cost as specified
    const result = await turso.execute({
      sql: "SELECT 1 FROM profiles WHERE username = ? LIMIT 1",
      args: [normalizedUsername],
    });

    const isAvailable = result.rows.length === 0;

    return NextResponse.json({
      available: isAvailable,
      username: normalizedUsername,
    });
  } catch (error) {
    console.error("Error checking username availability:", error);

    // Fall back to mock data for any error
    try {
      const body = await request.json();
      const { username } = body;
      const normalizedUsername = username.toLowerCase().trim();
      const mockTakenUsernames = ["admin", "test", "user", "demo", "guest"];
      const reservedUsernames = [
        "dashboard",
        "profile",
        "settings",
        "browse",
        "discovery",
        "signin",
        "signup",
        "api",
        "avatar",
        "check-username",
        "create-profile",
        "create-username",
        "get-profile",
        "get-profile-by-slug",
        "init-db",
        "admin",
        "root",
        "www",
        "mail",
        "ftp",
        "blog",
        "news",
        "support",
        "help",
        "about",
        "contact",
        "privacy",
        "terms",
        "legal",
        "security",
        "status",
        "_next",
        "favicon.ico",
        "robots.txt",
        "sitemap.xml",
        "system",
        "config",
        "public",
        "private",
        "internal",
        "external",
      ];
      const isAvailable =
        !mockTakenUsernames.includes(normalizedUsername) &&
        !reservedUsernames.includes(normalizedUsername);

      return NextResponse.json({
        available: isAvailable,
        username: normalizedUsername,
        mock: true,
      });
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Internal server error",
          available: false,
        },
        { status: 500 },
      );
    }
  }
}
