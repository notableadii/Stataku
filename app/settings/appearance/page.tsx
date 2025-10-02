"use client";

// import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTheme } from "next-themes";

import { useAuth } from "@/contexts/AuthContext";
import SettingsNav from "@/components/SettingsNav";
import { ThemeSwitch } from "@/components/theme-switch";
import { SunFilledIcon, MoonFilledIcon } from "@/components/icons";

export default function AppearanceSettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="h-10 w-48 bg-default-200 rounded-lg animate-pulse" />
              <div className="h-4 w-96 mt-2 bg-default-200 rounded animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-default-200 rounded-lg animate-pulse" />
              <div className="h-32 bg-default-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <SettingsNav />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="mb-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Appearance Settings
              </h1>
              <p className="text-default-500 mt-1">
                Customize your visual experience
              </p>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="space-y-6">
            {/* Dark Mode Setting */}
            <div>
              <div className="bg-content1 border border-divider rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Theme</h3>
                    <p className="text-default-500 mt-1">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <ThemeSwitch />
                </div>
              </div>
            </div>

            {/* Theme Preview */}
            <div>
              <div className="bg-content1 border border-divider rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Theme Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Light Theme Preview */}
                  <div
                    className={`p-4 rounded-lg border-2 transition-all bg-white ${
                      theme === "light"
                        ? "border-primary bg-primary/5"
                        : "border-divider"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <SunFilledIcon className="w-4 h-4 text-warning-500" />
                      <span className="font-medium text-black">
                        Light Theme
                      </span>
                      {theme === "light" && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>

                  {/* Dark Theme Preview */}
                  <div
                    className={`p-4 rounded-lg border-2 transition-all bg-black ${
                      theme === "dark"
                        ? "border-primary bg-primary/5"
                        : "border-divider"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <MoonFilledIcon className="w-4 h-4 text-primary" />
                      <span className="font-medium text-white">Dark Theme</span>
                      {theme === "dark" && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-600 rounded w-3/4" />
                      <div className="h-3 bg-gray-600 rounded w-1/2" />
                      <div className="h-3 bg-gray-600 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
