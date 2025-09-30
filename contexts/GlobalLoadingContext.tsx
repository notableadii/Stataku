"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface GlobalLoadingContextType {
  isInitialLoading: boolean;
  setInitialLoading: (loading: boolean) => void;
  isAppReady: boolean;
  setAppReady: (ready: boolean) => void;
}

const GlobalLoadingContext = createContext<
  GlobalLoadingContextType | undefined
>(undefined);

export function GlobalLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  // Simulate initial app loading time with more realistic timing
  useEffect(() => {
    // Reset loading state on mount (handles page refreshes)
    setIsInitialLoading(true);
    setIsAppReady(false);

    // Simulate various loading tasks
    const loadTasks = async () => {
      // Simulate database initialization
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Simulate authentication check
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Simulate theme loading
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Simulate component hydration
      await new Promise((resolve) => setTimeout(resolve, 200));

      setIsInitialLoading(false);
      setIsAppReady(true);
    };

    loadTasks();
  }, []);

  const setInitialLoading = (loading: boolean) => {
    setIsInitialLoading(loading);
  };

  const setAppReady = (ready: boolean) => {
    setIsAppReady(ready);
  };

  return (
    <GlobalLoadingContext.Provider
      value={{
        isInitialLoading,
        setInitialLoading,
        isAppReady,
        setAppReady,
      }}
    >
      {children}
    </GlobalLoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  const context = useContext(GlobalLoadingContext);
  if (context === undefined) {
    throw new Error(
      "useGlobalLoading must be used within a GlobalLoadingProvider",
    );
  }
  return context;
}
