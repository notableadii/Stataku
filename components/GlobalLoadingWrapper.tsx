"use client";

import React, { useState, useEffect } from "react";

import { GlobalLoadingSpinner } from "./GlobalLoadingSpinner";

import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";

interface GlobalLoadingWrapperProps {
  children: React.ReactNode;
}

export function GlobalLoadingWrapper({ children }: GlobalLoadingWrapperProps) {
  const { isInitialLoading } = useGlobalLoading();
  const [_showContent, setShowContent] = useState(!isInitialLoading);

  useEffect(() => {
    if (!isInitialLoading) {
      // Show content immediately when loading is done
      setShowContent(true);
    } else {
      setShowContent(false);
    }
  }, [isInitialLoading]);

  return (
    <>
      <GlobalLoadingSpinner isVisible={isInitialLoading} />
      {!isInitialLoading && <div className="opacity-100">{children}</div>}
    </>
  );
}
