"use client";

import { addToast } from "@heroui/toast";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { logPageVisit, PAGE_MESSAGES } from "@/lib/console-logger";

export function HomeClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Log page visit with beautiful console message
  useEffect(() => {
    logPageVisit("Home", PAGE_MESSAGES.Home);
  }, []);

  // Handle URL error parameters
  useEffect(() => {
    const error = searchParams.get("error");

    if (error) {
      switch (error) {
        case "account-already-linked":
          addToast({
            title: "Account Already Linked",
            description:
              "This Google or Discord account is already linked to another account. Please unlink it first before linking to this account.",
            severity: "danger",
            timeout: 8000,
          });
          break;
        case "oauth-invalid-state":
          addToast({
            title: "Authentication Error",
            description: "OAuth flow failed. Please try again.",
            severity: "danger",
            timeout: 5000,
          });
          break;
        case "oauth-cancelled":
          addToast({
            title: "Linking Cancelled",
            description: "Account linking was cancelled.",
            severity: "warning",
            timeout: 5000,
          });
          break;
        case "email-not-confirmed":
          addToast({
            title: "Email Not Confirmed",
            description: "Please confirm your email before linking accounts.",
            severity: "danger",
            timeout: 5000,
          });
          break;
        case "link-failed":
          addToast({
            title: "Linking Failed",
            description: "Failed to link account. Please try again.",
            severity: "danger",
            timeout: 5000,
          });
          break;
        default:
          addToast({
            title: "Error",
            description: "An error occurred during account linking.",
            severity: "danger",
            timeout: 5000,
          });
      }
      // Clean up URL parameters
      const url = new URL(window.location.href);

      url.searchParams.delete("error");
      router.replace(url.pathname);
    }
  }, [searchParams, router]);

  return null;
}
