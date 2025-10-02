"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { addToast } from "@heroui/toast";

import { supabase } from "@/lib/supabase";
import {
  getUserProfile,
  getUserProfileNoCache,
  UserProfile,
} from "@/lib/turso";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  forceRefreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const lastProfileFetchRef = useRef<number>(0);
  const previousUserRef = useRef<User | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const initialUser = session?.user ?? null;

      setSession(session);
      setUser(initialUser);
      previousUserRef.current = initialUser;

      if (session?.user) {
        await loadUserProfile(session.user.id);
      }

      setLoading(false);
      // Mark that initial load is complete
      isInitialLoadRef.current = false;
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      const newUser = session?.user ?? null;
      const previousUser = previousUserRef.current;

      setSession(session);
      setUser(newUser);

      // Show toast notifications for login/logout only for actual auth changes, not initial load
      if (!isInitialLoadRef.current) {
        if (event === "SIGNED_IN" && newUser && !previousUser) {
          addToast({
            title: "Success",
            description: "Logged in successfully!",
            severity: "success",
            timeout: 3000,
          });
        } else if (event === "SIGNED_OUT" && previousUser && !newUser) {
          addToast({
            title: "Success",
            description: "Logged out successfully!",
            severity: "success",
            timeout: 3000,
          });
        }
      }

      // Update previous user reference
      previousUserRef.current = newUser;

      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = useCallback(
    async (userId: string) => {
      const now = Date.now();

      // Debounce: only fetch if it's been more than 2 seconds since last fetch
      if (now - lastProfileFetchRef.current < 2000) {
        // Profile fetch debounced - too soon since last fetch

        return;
      }

      // Fetching user profile
      try {
        lastProfileFetchRef.current = now;
        const { data, error } = await getUserProfile(userId);

        if (error) {
          console.error("Error loading user profile:", error);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        setProfile(null);
      }
    },
    [] // No dependencies needed now
  );

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  }, [user, loadUserProfile]);

  const forceRefreshProfile = useCallback(async () => {
    if (user) {
      try {
        lastProfileFetchRef.current = 0; // Reset the debounce timer
        const { data, error } = await getUserProfileNoCache(user.id);

        if (error) {
          console.error("Error loading user profile:", error);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        setProfile(null);
      }
    }
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signOut,
    refreshProfile,
    forceRefreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
