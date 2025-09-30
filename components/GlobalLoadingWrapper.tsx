"use client";

import React, { useState, useEffect } from "react";
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";
import { GlobalLoadingSpinner } from "./GlobalLoadingSpinner";

interface GlobalLoadingWrapperProps {
  children: React.ReactNode;
}

export function GlobalLoadingWrapper({ children }: GlobalLoadingWrapperProps) {
  const { isInitialLoading } = useGlobalLoading();
  const [showContent, setShowContent] = useState(!isInitialLoading);

  useEffect(() => {
    if (!isInitialLoading) {
      // Add a small delay before showing content for smooth transition
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isInitialLoading]);

  return (
    <>
      <GlobalLoadingSpinner isVisible={isInitialLoading} />
      <div
        className={`transition-opacity duration-500 ${showContent ? "opacity-100" : "opacity-0"}`}
      >
        {children}
      </div>
    </>
  );
}
