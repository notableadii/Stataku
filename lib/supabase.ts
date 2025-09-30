import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Auth helper functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/create-username`,
    },
  });
  return { data, error };
};

export const signInWithDiscord = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${window.location.origin}/create-username`,
    },
  });
  return { data, error };
};

// Username functions
export const checkUsernameAvailability = async (
  username: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("username")
    .eq("username", username.toLowerCase())
    .single();

  if (error && error.code === "PGRST116") {
    // No rows found, username is available
    return true;
  }

  if (error) {
    console.error("Error checking username:", error);
    return false;
  }

  // Username exists, not available
  return false;
};

export const createUserProfile = async (userId: string, username: string) => {
  const { data, error } = await supabase
    .from("user_profiles")
    .insert({
      user_id: userId,
      username: username.toLowerCase(),
    })
    .select()
    .single();

  return { data, error };
};

export const getUserProfile = async (userId: string) => {
  // Use the API route instead of direct Supabase query since we're using Turso for profiles
  try {
    const response = await fetch("/api/get-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: { message: result.error || "Failed to fetch profile" },
      };
    }

    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: { message: "Network error" } };
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
) => {
  // Use the API route instead of direct Supabase query since we're using Turso for profiles
  try {
    const response = await fetch("/api/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        display_name: updates.display_name,
        bio: updates.bio,
        avatar_url: updates.avatar_url,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: { message: result.error || "Failed to update profile" },
      };
    }

    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: { message: "Network error" } };
  }
};
