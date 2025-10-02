import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const provider = searchParams.get("provider") || "unknown";

  console.log("OAuth callback received:", {
    code: !!code,
    error,
    errorDescription,
    provider,
  });

  // Handle OAuth errors (user cancelled, etc.)
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    let errorMessage = "link-failed";

    if (error === "access_denied") {
      errorMessage = "oauth-cancelled";
    } else if (error === "invalid_request") {
      errorMessage = "oauth-invalid-state";
    }

    return NextResponse.redirect(
      new URL(`/settings?error=${errorMessage}`, request.url),
    );
  }

  // Handle successful OAuth callback
  if (code) {
    try {
      console.log("Exchanging code for session...");
      // Exchange the code for a session
      const { data, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError);

        // Check for specific Supabase errors
        let errorMessage = "link-failed";

        if (
          exchangeError.message.includes("already linked to another user") ||
          exchangeError.message.includes("identity_is_linked_to_another_user")
        ) {
          errorMessage = "account-already-linked";
          console.log("Detected account already linked error");
        } else if (
          exchangeError.message.includes(
            "Invalid state returned from OAuth flow",
          )
        ) {
          errorMessage = "oauth-invalid-state";
          console.log("Detected OAuth invalid state error");
        } else if (exchangeError.message.includes("Email not confirmed")) {
          errorMessage = "email-not-confirmed";
          console.log("Detected email not confirmed error");
        }

        console.log("Redirecting to settings with error:", errorMessage);

        return NextResponse.redirect(
          new URL(`/settings?error=${errorMessage}`, request.url),
        );
      }

      // Success! Check if the identity was actually linked
      if (data?.user) {
        // Get the user's identities to verify the link was successful
        const { data: identities, error: identitiesError } =
          await supabase.auth.getUserIdentities();

        if (identitiesError) {
          console.error(
            "Error fetching identities after linking:",
            identitiesError,
          );

          return NextResponse.redirect(
            new URL("/settings?error=link-failed", request.url),
          );
        }

        // Check if the provider is now linked
        const isLinked = identities?.identities?.some(
          (identity: any) => identity.provider === provider,
        );

        if (isLinked) {
          return NextResponse.redirect(
            new URL("/settings?success=account-linked", request.url),
          );
        } else {
          return NextResponse.redirect(
            new URL("/settings?error=link-failed", request.url),
          );
        }
      } else {
        return NextResponse.redirect(
          new URL("/settings?error=link-failed", request.url),
        );
      }
    } catch (error) {
      console.error("Unexpected error in OAuth callback:", error);

      return NextResponse.redirect(
        new URL("/settings?error=link-failed", request.url),
      );
    }
  }

  // No code or error provided
  return NextResponse.redirect(
    new URL("/settings?error=oauth-invalid-state", request.url),
  );
}
