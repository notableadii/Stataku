import { NextRequest, NextResponse } from "next/server";

import {
  withPublicSecurity,
  sanitizeInput,
  isValidUsername,
} from "@/lib/security";
import { checkUsername } from "@/lib/database-service";

export const POST = withPublicSecurity(async (request: NextRequest) => {
  try {
    // Parse and sanitize request body
    const body = await request.json();
    const sanitizedBody = sanitizeInput(body);
    const { username } = sanitizedBody;

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

    // Validate username format using security utility
    if (!isValidUsername(normalizedUsername)) {
      return NextResponse.json({
        available: false,
        username: normalizedUsername,
        error:
          "Invalid username format. Username must be 3-30 characters and contain only letters, numbers, dots, hyphens, and underscores.",
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

    // Use the cached database service
    const result = await checkUsername(normalizedUsername);

    if (result.error) {
      return NextResponse.json({
        available: false,
        username: normalizedUsername,
        error: result.error,
      });
    }

    return NextResponse.json({
      available: result.data,
      username: normalizedUsername,
      fromCache: result.fromCache,
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
});
