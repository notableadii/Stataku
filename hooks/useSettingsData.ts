import { useState, useEffect, useCallback, useRef } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface SettingsData {
  profile: any;
  identities: any[];
  hasPasswordAuth: boolean;
}

interface UseSettingsDataReturn {
  settingsData: SettingsData | null;
  loading: boolean;
  error: string | null;
  refreshSettingsData: () => Promise<void>;
  fromCache: boolean;
}

// Global cache for settings data
const settingsCache = new Map<
  string,
  { data: SettingsData; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useSettingsData(): UseSettingsDataReturn {
  const { user } = useAuth();
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const lastFetchRef = useRef<number>(0);

  const fetchSettingsData = useCallback(
    async (forceRefresh = false) => {
      if (!user) {
        setSettingsData(null);
        setLoading(false);

        return;
      }

      const now = Date.now();
      const cacheKey = user.id;

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = settingsCache.get(cacheKey);

        if (cached && now - cached.timestamp < CACHE_DURATION) {
          console.log("Using cached settings data for user:", user.id);
          setSettingsData(cached.data);
          setLoading(false);
          setError(null);
          setFromCache(true);

          return;
        }
      }

      // Debounce: only fetch if it's been more than 2 seconds since last fetch
      if (now - lastFetchRef.current < 2000) {
        console.log(
          "Settings data fetch debounced - too soon since last fetch",
        );

        return;
      }

      lastFetchRef.current = now;
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching settings data for user:", user.id);

        // Get the current session token for authentication
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          throw new Error("No active session");
        }

        // Fetch profile data from API and identities from client-side Supabase
        const [profileResponse, identitiesResponse] = await Promise.all([
          fetch("/api/get-settings-data", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId: user.id }),
          }),
          supabase.auth.getUserIdentities(),
        ]);

        const profileResult = await profileResponse.json();

        if (!profileResponse.ok) {
          throw new Error(
            profileResult.error || "Failed to fetch settings data",
          );
        }

        if (identitiesResponse.error) {
          console.error("Error fetching identities:", identitiesResponse.error);
          // Continue with empty identities if this fails
        }

        // Combine profile data with identities
        const combinedData = {
          profile: profileResult.data.profile,
          identities: identitiesResponse.data?.identities || [],
          hasPasswordAuth:
            identitiesResponse.data?.identities?.some(
              (identity: any) => identity.provider === "email",
            ) || false,
        };

        // Cache the result
        settingsCache.set(cacheKey, {
          data: combinedData,
          timestamp: now,
        });

        setSettingsData(combinedData);
        setFromCache(profileResult.fromCache);
      } catch (err) {
        console.error("Error fetching settings data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch settings data",
        );
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const refreshSettingsData = useCallback(async () => {
    await fetchSettingsData(true);
  }, [fetchSettingsData]);

  // Load settings data on mount and when user changes
  useEffect(() => {
    fetchSettingsData();
  }, [fetchSettingsData]);

  // Clear cache when user changes
  useEffect(() => {
    if (!user) {
      settingsCache.clear();
      setSettingsData(null);
    }
  }, [user]);

  return {
    settingsData,
    loading,
    error,
    refreshSettingsData,
    fromCache,
  };
}
