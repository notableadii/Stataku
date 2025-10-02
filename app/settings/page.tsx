"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logPageVisit, PAGE_MESSAGES } from "@/lib/console-logger";

export default function SettingsPage() {
  const router = useRouter();

  // Log page visit with beautiful console message
  useEffect(() => {
    logPageVisit("Settings", PAGE_MESSAGES.Settings);
  }, []);

  useEffect(() => {
    // Redirect to profile settings as the default
    router.replace("/settings/profile");
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-default-500">Redirecting to settings...</p>
      </div>
    </div>
  );
}
