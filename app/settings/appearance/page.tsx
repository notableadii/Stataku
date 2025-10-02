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
        <div className="container mx-auto px-2 xs:px-4 py-4 xs:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 xs:mb-8">
              <div className="h-8 xs:h-10 w-48 bg-default-200 rounded-lg animate-pulse" />
              <div className="h-4 w-80 xs:w-96 mt-2 bg-default-200 rounded animate-pulse" />
              {/* Mobile-only divider */}
              <div className="w-full h-px bg-divider xs:hidden mt-4" />
            </div>
            <div className="space-y-4 xs:space-y-6">
              <div className="h-20 xs:h-24 bg-default-200 xs:rounded-lg animate-pulse" />
              <div className="h-32 xs:h-40 bg-default-200 xs:rounded-lg animate-pulse" />
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

      <div className="container mx-auto px-2 xs:px-4 py-4 xs:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-4 xs:mb-8">
            <div className="mb-4">
              <h1 className="text-2xl xs:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Appearance Settings
              </h1>
              <p className="text-default-500 mt-1 text-sm xs:text-base">
                Customize your visual experience
              </p>
            </div>
            {/* Mobile-only divider */}
            <div className="w-full h-px bg-divider xs:hidden" />
          </div>

          {/* Appearance Settings */}
          <div className="space-y-4 xs:space-y-6">
            {/* Dark Mode Setting */}
            <div>
              <div className="xs:bg-content1 xs:border xs:border-divider xs:rounded-xl p-3 xs:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg xs:text-xl font-semibold">Theme</h3>
                    <p className="text-default-500 mt-1 text-sm xs:text-base">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <div className="flex-shrink-0 mt-0.5">
                    <ThemeSwitch />
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Preview */}
            <div>
              <div className="xs:bg-content1 xs:border xs:border-divider xs:rounded-xl p-3 xs:p-6">
                <h3 className="text-base xs:text-lg font-semibold mb-3 xs:mb-4">
                  Theme Preview
                </h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                  {/* Light Theme Preview */}
                  <div
                    className={`p-3 xs:p-4 rounded-lg border-2 transition-all bg-white ${
                      theme === "light"
                        ? "border-primary bg-primary/5"
                        : "border-divider"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2 xs:mb-3">
                      <SunFilledIcon className="w-4 h-4 text-warning-500 flex-shrink-0" />
                      <span className="font-medium text-black text-sm xs:text-base">
                        Light Theme
                      </span>
                      {theme === "light" && (
                        <span className="text-xs bg-primary text-primary-foreground px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full ml-auto">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5 xs:space-y-2">
                      <div className="h-2 xs:h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2 xs:h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-2 xs:h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>

                  {/* Dark Theme Preview */}
                  <div
                    className={`p-3 xs:p-4 rounded-lg border-2 transition-all bg-black ${
                      theme === "dark"
                        ? "border-primary bg-primary/5"
                        : "border-divider"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2 xs:mb-3">
                      <MoonFilledIcon className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-medium text-white text-sm xs:text-base">
                        Dark Theme
                      </span>
                      {theme === "dark" && (
                        <span className="text-xs bg-primary text-primary-foreground px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full ml-auto">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5 xs:space-y-2">
                      <div className="h-2 xs:h-3 bg-gray-600 rounded w-3/4" />
                      <div className="h-2 xs:h-3 bg-gray-600 rounded w-1/2" />
                      <div className="h-2 xs:h-3 bg-gray-600 rounded w-2/3" />
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
