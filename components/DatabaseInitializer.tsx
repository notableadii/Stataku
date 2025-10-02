"use client";

import { useEffect, useRef } from "react";

import { initializeDatabase } from "@/lib/turso";

export function DatabaseInitializer() {
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize database once and on client side
    if (typeof window !== "undefined" && !initialized.current) {
      initialized.current = true;

      // Add a small delay to prevent issues during hot reload
      const timer = setTimeout(() => {
        initializeDatabase().catch((error) => {
          console.error("Failed to initialize database:", error);
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  return null; // This component doesn't render anything
}
