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
          "Settings data fetch debounced - too soon since last fetch"
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
            profileResult.error || "Failed to fetch settings data"
          );
        }

        if (identitiesResponse.error) {
          console.error("Error fetching identities:", identitiesResponse.error);
          // Continue with empty identities if this fails
        }

        // Get user data to check for password authentication
        const { data: userData } = await supabase.auth.getUser();

        // Debug logging to understand the user object structure
        console.log("=== DEBUGGING USER OBJECT ===");
        console.log(
          "Full user object:",
          JSON.stringify(userData?.user, null, 2)
        );
        console.log(
          "Identities:",
          JSON.stringify(identitiesResponse.data?.identities, null, 2)
        );
        console.log(
          "User app_metadata:",
          JSON.stringify(userData?.user?.app_metadata, null, 2)
        );
        console.log(
          "User user_metadata:",
          JSON.stringify(userData?.user?.user_metadata, null, 2)
        );

        const hasEmailIdentity = identitiesResponse.data?.identities?.some(
          (identity: any) => identity.provider === "email"
        );
        const hasEmailInProviders =
          userData?.user?.app_metadata?.providers?.includes("email");

        // Alternative approach: Check if user has confirmed_at (indicates they can authenticate)
        // and has an email address (OAuth users with passwords should have both)
        const hasConfirmedEmail = userData?.user?.email_confirmed_at !== null;
        const hasEmail = !!userData?.user?.email;

        // Check if user has multiple authentication methods available
        const providerCount =
          userData?.user?.app_metadata?.providers?.length || 0;
        const identityCount = identitiesResponse.data?.identities?.length || 0;

        console.log("hasEmailIdentity:", hasEmailIdentity);
        console.log("hasEmailInProviders:", hasEmailInProviders);
        console.log("hasConfirmedEmail:", hasConfirmedEmail);
        console.log("hasEmail:", hasEmail);
        console.log("providerCount:", providerCount);
        console.log("identityCount:", identityCount);
        console.log("User email:", userData?.user?.email);
        console.log(
          "User email_confirmed_at:",
          userData?.user?.email_confirmed_at
        );
        console.log("=== END DEBUG ===");

        // Determine if user has password authentication capability
        let hasPasswordAuth = false;

        // Method 1: Check for email identity (traditional signup)
        if (hasEmailIdentity) {
          hasPasswordAuth = true;
          console.log("Password auth detected via email identity");
        }

        // Method 2: Check app_metadata.providers for "email" (OAuth user who added password)
        else if (hasEmailInProviders) {
          hasPasswordAuth = true;
          console.log("Password auth detected via app_metadata.providers");
        }

        // Method 3: Check if user has multiple authentication methods
        else if (providerCount > 1 && hasEmail && hasConfirmedEmail) {
          hasPasswordAuth = true;
          console.log("Password auth detected via multiple providers");
        }

        // Method 4: Check if user has both OAuth identity AND confirmed email
        // (This might indicate they added password to OAuth account)
        else if (
          identityCount >= 1 &&
          hasEmail &&
          hasConfirmedEmail &&
          identitiesResponse.data?.identities?.some(
            (id: any) =>
              id.provider !== "email" &&
              (id.provider === "google" || id.provider === "discord")
          )
        ) {
          hasPasswordAuth = true;
          console.log(
            "Password auth detected via OAuth + confirmed email combination"
          );
        }

        console.log("Final hasPasswordAuth decision:", hasPasswordAuth);

        // Combine profile data with identities
        const combinedData = {
          profile: profileResult.data.profile,
          identities: identitiesResponse.data?.identities || [],
          hasPasswordAuth,
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
          err instanceof Error ? err.message : "Failed to fetch settings data"
        );
      } finally {
        setLoading(false);
      }
    },
    [user]
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
