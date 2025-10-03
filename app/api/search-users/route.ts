import { NextRequest, NextResponse } from "next/server";
import { getAllUsersForSearch } from "@/lib/database-service";

// Rate limiting for search endpoint
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Clean up expired rate limit entries
setInterval(
  () => {
    const now = Date.now();
    const keysToDelete: string[] = [];

    rateLimitMap.forEach((limit, ip) => {
      if (now > limit.resetTime) {
        keysToDelete.push(ip);
      }
    });

    keysToDelete.forEach((ip) => {
      rateLimitMap.delete(ip);
    });
  },
  5 * 60 * 1000
); // Clean every 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // Get users using the database service function
    const result = await getAllUsersForSearch();

    if (result.error) {
      throw new Error(result.error);
    }

    return NextResponse.json({
      success: true,
      data: result.data || [],
      fromCache: result.fromCache,
    });
  } catch (error) {
    console.error("Error fetching users for search:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
