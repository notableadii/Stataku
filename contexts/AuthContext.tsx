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
import { getUserProfile, UserProfile } from "@/lib/turso";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  profileError: string | null;
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
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const lastProfileFetchRef = useRef<number>(0);
  const previousUserRef = useRef<User | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);
  const profileLoadingRef = useRef<boolean>(false);

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
    async (userId: string, forceLoad = false) => {
      const now = Date.now();

      // Prevent concurrent profile loading
      if (profileLoadingRef.current && !forceLoad) {
        return;
      }

      // Debounce: only fetch if it's been more than 1 second since last fetch (reduced from 2 seconds)
      if (!forceLoad && now - lastProfileFetchRef.current < 1000) {
        return;
      }

      profileLoadingRef.current = true;
      setProfileLoading(true);
      setProfileError(null);

      try {
        lastProfileFetchRef.current = now;
        const { data, error } = await getUserProfile(userId);

        if (error) {
          console.error("Error loading user profile:", error);

          // Check if it's an authentication error
          if (
            error.message.includes("No active session") ||
            error.message.includes("Session expired") ||
            error.message.includes("Authentication required")
          ) {
            // Try to refresh the session silently
            try {
              const { data: refreshData, error: refreshError } =
                await supabase.auth.refreshSession();

              if (!refreshError && refreshData.session) {
                // Session refreshed successfully, retry profile loading
                const { data: retryData, error: retryError } =
                  await getUserProfile(userId);

                if (!retryError && retryData) {
                  setProfile(retryData);
                  setProfileError(null);
                } else {
                  // If retry failed, this might be a legitimate "no profile exists" case
                  setProfile(null);
                  setProfileError(retryError?.message || "Profile not found");
                }
              } else {
                setProfile(null);
                setProfileError("Authentication failed");
              }
            } catch (refreshError) {
              console.error("Failed to refresh session:", refreshError);
              setProfile(null);
              setProfileError("Session refresh failed");
            }
          } else {
            // Non-authentication error - could be "profile not found" which is valid for new users
            // Try to auto-create profile if it doesn't exist
            if (
              error.message.includes("not found") ||
              error.message.includes("No profile found")
            ) {
              try {
                console.log(
                  "Profile not found, attempting to auto-create profile"
                );

                // Get current session token for API authentication
                const {
                  data: { session },
                } = await supabase.auth.getSession();
                const token = session?.access_token;

                if (!token) {
                  console.error(
                    "No session token available for profile creation"
                  );
                  setProfile(null);
                  setProfileError("Authentication token not available");
                  return;
                }

                const response = await fetch("/api/auto-create-profile", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                });

                if (response.ok) {
                  const result = await response.json();
                  console.log("Auto-create profile API response:", result);
                  if (result.success && !result.data.profileExists) {
                    // Profile was created, try to load it again
                    console.log(
                      "Profile auto-created successfully, reloading..."
                    );
                    const { data: newProfileData, error: newProfileError } =
                      await getUserProfile(userId);
                    if (!newProfileError && newProfileData) {
                      setProfile(newProfileData);
                      setProfileError(null);

                      // Send welcome email for new users (one-time only) with retry logic
                      const sendWelcomeEmailWithRetry = async (
                        retryCount = 0
                      ) => {
                        try {
                          console.log(
                            `📧 Attempting to send welcome email (attempt ${retryCount + 1})...`
                          );
                          const emailResponse = await fetch(
                            "/api/send-profile-completion-email",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );

                          const emailResult = await emailResponse.json();

                          if (emailResponse.ok && emailResult.success) {
                            console.log(
                              "✅ Welcome email sent successfully:",
                              emailResult
                            );
                            return true;
                          } else {
                            console.error(
                              "❌ Welcome email failed:",
                              emailResult
                            );

                            // Retry if it's a retryable error and we haven't exceeded max retries
                            if (emailResult.retryable && retryCount < 2) {
                              console.log(
                                `🔄 Retrying welcome email in 3 seconds... (attempt ${retryCount + 2})`
                              );
                              await new Promise((resolve) =>
                                setTimeout(resolve, 3000)
                              );
                              return await sendWelcomeEmailWithRetry(
                                retryCount + 1
                              );
                            } else {
                              console.log(
                                "💡 To fix email issues, check your SMTP configuration in .env.local"
                              );
                              console.log(
                                "💡 You can also manually resend the welcome email from the dashboard"
                              );
                              return false;
                            }
                          }
                        } catch (emailError) {
                          console.error(
                            "❌ Failed to send welcome email:",
                            emailError
                          );

                          // Retry on network errors
                          if (retryCount < 2) {
                            console.log(
                              `🔄 Retrying welcome email in 3 seconds... (attempt ${retryCount + 2})`
                            );
                            await new Promise((resolve) =>
                              setTimeout(resolve, 3000)
                            );
                            return await sendWelcomeEmailWithRetry(
                              retryCount + 1
                            );
                          } else {
                            console.log(
                              "💡 To fix email issues, check your SMTP configuration in .env.local"
                            );
                            console.log(
                              "💡 You can also manually resend the welcome email from the dashboard"
                            );
                            return false;
                          }
                        }
                      };

                      await sendWelcomeEmailWithRetry();

                      return;
                    }
                  }
                } else {
                  const errorData = await response.json().catch(() => ({}));
                  console.error("Auto-create profile API failed:", {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData,
                  });
                  setProfile(null);
                  setProfileError(
                    `Profile creation failed: ${response.status} ${response.statusText}`
                  );
                }
              } catch (autoCreateError) {
                console.error(
                  "Failed to auto-create profile:",
                  autoCreateError
                );
                setProfile(null);
                setProfileError("Profile creation failed");
              }
            }

            setProfile(null);
            setProfileError(error.message);
          }
        } else if (data) {
          setProfile(data);
          setProfileError(null);
        } else {
          // No error but also no data - this means profile doesn't exist
          console.log(
            "No profile found for user, attempting to auto-create profile"
          );

          try {
            // Get current session token for API authentication
            const {
              data: { session },
            } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
              console.error("No session token available for profile creation");
              setProfile(null);
              setProfileError("Authentication token not available");
              return;
            }

            const response = await fetch("/api/auto-create-profile", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const result = await response.json();
              console.log("Auto-create profile API response:", result);
              if (result.success && !result.data.profileExists) {
                // Profile was created, try to load it again
                console.log("Profile auto-created successfully, reloading...");
                const { data: newProfileData, error: newProfileError } =
                  await getUserProfile(userId);
                if (!newProfileError && newProfileData) {
                  setProfile(newProfileData);
                  setProfileError(null);

                  // Send welcome email for new users (one-time only) with retry logic
                  const sendWelcomeEmailWithRetry = async (retryCount = 0) => {
                    try {
                      console.log(
                        `📧 Attempting to send welcome email (attempt ${retryCount + 1})...`
                      );
                      const emailResponse = await fetch(
                        "/api/send-profile-completion-email",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );

                      const emailResult = await emailResponse.json();

                      if (emailResponse.ok && emailResult.success) {
                        console.log(
                          "✅ Welcome email sent successfully:",
                          emailResult
                        );
                        return true;
                      } else {
                        console.error("❌ Welcome email failed:", emailResult);

                        // Retry if it's a retryable error and we haven't exceeded max retries
                        if (emailResult.retryable && retryCount < 2) {
                          console.log(
                            `🔄 Retrying welcome email in 3 seconds... (attempt ${retryCount + 2})`
                          );
                          await new Promise((resolve) =>
                            setTimeout(resolve, 3000)
                          );
                          return await sendWelcomeEmailWithRetry(
                            retryCount + 1
                          );
                        } else {
                          console.log(
                            "💡 To fix email issues, check your SMTP configuration in .env.local"
                          );
                          console.log(
                            "💡 You can also manually resend the welcome email from the dashboard"
                          );
                          return false;
                        }
                      }
                    } catch (emailError) {
                      console.error(
                        "❌ Failed to send welcome email:",
                        emailError
                      );

                      // Retry on network errors
                      if (retryCount < 2) {
                        console.log(
                          `🔄 Retrying welcome email in 3 seconds... (attempt ${retryCount + 2})`
                        );
                        await new Promise((resolve) =>
                          setTimeout(resolve, 3000)
                        );
                        return await sendWelcomeEmailWithRetry(retryCount + 1);
                      } else {
                        console.log(
                          "💡 To fix email issues, check your SMTP configuration in .env.local"
                        );
                        console.log(
                          "💡 You can also manually resend the welcome email from the dashboard"
                        );
                        return false;
                      }
                    }
                  };

                  await sendWelcomeEmailWithRetry();

                  return;
                }
              }
            } else {
              const errorData = await response.json().catch(() => ({}));
              console.error("Auto-create profile API failed:", {
                status: response.status,
                statusText: response.statusText,
                error: errorData,
              });
              setProfile(null);
              setProfileError(
                `Profile creation failed: ${response.status} ${response.statusText}`
              );
            }
          } catch (autoCreateError) {
            console.error("Failed to auto-create profile:", autoCreateError);
            setProfile(null);
            setProfileError("Profile creation failed");
          }
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        setProfile(null);
        setProfileError("Network error");
      } finally {
        profileLoadingRef.current = false;
        setProfileLoading(false);
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
      await loadUserProfile(user.id, true); // Force load bypasses debounce
    }
  }, [user, loadUserProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setProfileLoading(false);
    setProfileError(null);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    profileLoading,
    profileError,
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
