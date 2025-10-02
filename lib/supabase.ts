import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client lazily
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase Environment Variables Debug:", {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? "✅ SET"
        : "❌ NOT SET",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? "✅ SET"
        : "❌ NOT SET",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
        ? "✅ SET (OLD NAME)"
        : "❌ NOT SET",
    });

    throw new Error(
      `Supabase configuration is missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables. 
      
      Current status:
      - NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET"}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "NOT SET"}
      - SUPABASE_ANON_KEY (old): ${process.env.SUPABASE_ANON_KEY ? "SET" : "NOT SET"}
      
      Make sure to use NEXT_PUBLIC_ prefix for client-side environment variables in Next.js.`
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Export a getter that initializes the client when needed
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    const client = getSupabaseClient();

    return client[prop as keyof typeof client];
  },
});

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
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
  });

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

export const signOut = async () => {
  const client = getSupabaseClient();
  const { error } = await client.auth.signOut();

  return { error };
};

export const signInWithGoogle = async () => {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });

  return { data, error };
};

export const signInWithDiscord = async () => {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });

  return { data, error };
};

// Username functions
export const checkUsernameAvailability = async (
  username: string
): Promise<boolean> => {
  const client = getSupabaseClient();
  const { error } = await client
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
    // Validate userId before making the request
    if (!userId || typeof userId !== "string") {
      console.error("Invalid userId provided to getUserProfile:", userId);

      return {
        data: null,
        error: { message: "Invalid user ID" },
      };
    }

    // Making API request to get profile
    const response = await fetch("/api/get-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("API request failed:", result);

      return {
        data: null,
        error: { message: result.error || "Failed to fetch profile" },
      };
    }

    // Cache status logged for debugging

    return { data: result.data, error: null };
  } catch (error) {
    console.error("Network error in getUserProfile:", error);

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
  } catch {
    return { data: null, error: { message: "Network error" } };
  }
};
