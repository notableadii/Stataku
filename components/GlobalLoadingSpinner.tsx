"use client";

import React, { useState, useEffect } from "react";
import { Spinner } from "@heroui/spinner";
import { useTheme } from "next-themes";

interface GlobalLoadingSpinnerProps {
  isVisible: boolean;
}

export function GlobalLoadingSpinner({ isVisible }: GlobalLoadingSpinnerProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      // Add a small delay before hiding to allow for fade-out animation
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Don't render until mounted to prevent hydration mismatches
  if (!mounted || !shouldRender) return null;

  // Determine colors based on theme with robust fallbacks
  const currentTheme = resolvedTheme || theme || "light";

  // Additional fallback: check if we're in a dark mode context
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const isDark =
    currentTheme === "dark" || (currentTheme === "system" && prefersDark);
  const backgroundColor = isDark ? "bg-black" : "bg-white";
  const textColor = isDark ? "text-white" : "text-black";
  const _spinnerColor = isDark ? "white" : "black";

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${backgroundColor} transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="text-center">
        {/* Stataku text above spinner - no animation */}
        <h1 className={`text-5xl font-bold ${textColor} mb-12 tracking-wider`}>
          Stataku
        </h1>

        {/* Theme-aware spinner with proper HeroUI props */}
        <div className="relative">
          <Spinner
            color="default"
            size="lg"
            style={{
              color: isDark ? "white" : "black",
            }}
          />
        </div>
      </div>
    </div>
  );
}
