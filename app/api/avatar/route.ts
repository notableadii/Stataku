import { readFile } from "fs/promises";
import { join } from "path";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Read the universal avatar image
    const avatarPath = join(
      process.cwd(),
      "public",
      "avatars",
      "universal-avatar.jpg",
    );
    const avatarBuffer = await readFile(avatarPath);

    // Set security headers to prevent download and viewing in new tab
    const headers = new Headers({
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY", // Prevent embedding in frames
      "Content-Disposition": "inline", // Display inline, not as attachment
      "X-Download-Options": "noopen", // Prevent download in IE
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      // Custom headers to prevent right-click and context menu
      "X-Permitted-Cross-Domain-Policies": "none",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-origin",
    });

    return new NextResponse(avatarBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error serving avatar:", error);

    return new NextResponse("Avatar not found", { status: 404 });
  }
}
