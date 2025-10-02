// Database operations now use API routes for security
import { supabase } from "@/lib/supabase";

// Database types - updated to match profiles table schema
export interface UserProfile {
  id: string;
  username: string;
  slug: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  created_at: string;
  last_edit: string | null;
  email_sent: string;
}

// Username functions
export const checkUsernameAvailability = async (
  username: string
): Promise<boolean> => {
  try {
    const response = await fetch("/api/check-username", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      console.error("Failed to check username availability");

      return false;
    }

    const data = await response.json();

    return data.available;
  } catch (error) {
    console.error("Error checking username availability:", error);

    return false; // Default to not available on error
  }
};

// Create username with atomic insert and conflict handling
export const createUsername = async (userId: string, username: string) => {
  try {
    const response = await fetch("/api/create-username", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, username }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to create username",
        conflict: data.conflict || false,
      };
    }

    return {
      success: true,
      username: data.username,
      message: data.message,
    };
  } catch (error) {
    console.error("Error creating username:", error);

    return {
      success: false,
      error: "Failed to create username",
      conflict: false,
    };
  }
};

// Legacy function for backward compatibility
export const createUserProfile = async (userId: string, username: string) => {
  const result = await createUsername(userId, username);

  return {
    data: result.success ? { username: result.username } : null,
    error: result.success ? null : new Error(result.error),
  };
};

export const getUserProfile = async (userId: string) => {
  try {
    // Get the current session token for authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
      return {
        data: null,
        error: new Error("Session error: " + sessionError.message),
      };
    }

    const token = session?.access_token;

    if (!token || !session) {
      console.warn("No active session or token found");
      return {
        data: null,
        error: new Error("No active session"),
      };
    }

    // Check if the session is expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.warn("Session expired, attempting to refresh");

      // Try to refresh the session
      const { data: refreshData, error: refreshError } =
        await supabase.auth.refreshSession();

      if (refreshError || !refreshData.session) {
        console.error("Failed to refresh session:", refreshError);
        return {
          data: null,
          error: new Error("Session expired and refresh failed"),
        };
      }

      // Use the refreshed token
      const refreshedToken = refreshData.session.access_token;

      const response = await fetch("/api/get-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshedToken}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API request failed:", response.status, data);
        return {
          data: null,
          error: new Error(data.error || "Failed to get profile"),
        };
      }

      return { data: data.data, error: data.error };
    }

    const response = await fetch("/api/get-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("API request failed:", response.status, data);
      return {
        data: null,
        error: new Error(data.error || "Failed to get profile"),
      };
    }

    // Log cache status for debugging
    if (data.fromCache) {
      // Profile data served from cache
    } else {
      // Profile data fetched from database
    }

    return { data: data.data, error: data.error };
  } catch (error) {
    console.error("Error getting user profile:", error);

    return { data: null, error: error as Error };
  }
};

export const getUserProfileNoCache = async (userId: string) => {
  try {
    // Get the current session token for authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
      return {
        data: null,
        error: new Error("Session error: " + sessionError.message),
      };
    }

    const token = session?.access_token;

    if (!token || !session) {
      console.warn("No active session or token found");
      return {
        data: null,
        error: new Error("No active session"),
      };
    }

    // Check if the session is expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.warn("Session expired, attempting to refresh");

      // Try to refresh the session
      const { data: refreshData, error: refreshError } =
        await supabase.auth.refreshSession();

      if (refreshError || !refreshData.session) {
        console.error("Failed to refresh session:", refreshError);
        return {
          data: null,
          error: new Error("Session expired and refresh failed"),
        };
      }

      // Use the refreshed token
      const refreshedToken = refreshData.session.access_token;

      const response = await fetch("/api/get-profile-no-cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshedToken}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API request failed:", response.status, data);
        return {
          data: null,
          error: new Error(data.error || "Failed to get profile"),
        };
      }

      return { data: data.data, error: data.error };
    }

    const response = await fetch("/api/get-profile-no-cache", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("API request failed:", response.status, data);
      return {
        data: null,
        error: new Error(data.error || "Failed to get profile"),
      };
    }

    // Profile data fetched from database (no cache)

    return { data: data.data, error: data.error };
  } catch (error) {
    console.error("Error getting user profile (no cache):", error);

    return { data: null, error: error as Error };
  }
};

export const getUserProfileBySlug = async (slug: string) => {
  try {
    const response = await fetch("/api/get-profile-by-slug", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: new Error(data.error || "Failed to get profile"),
      };
    }

    // Log cache status for debugging
    if (data.fromCache) {
      // Profile data served from cache for slug
    } else {
      // Profile data fetched from database for slug
    }

    return { data: data.data, error: data.error };
  } catch (error) {
    console.error("Error getting user profile by slug:", error);

    return { data: null, error: error as Error };
  }
};

export const getUserProfileBySlugNoCache = async (slug: string) => {
  try {
    const response = await fetch("/api/get-profile-by-slug-no-cache", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: new Error(data.error || "Failed to get profile"),
      };
    }

    console.log(
      "🔄 Profile data fetched from database (no cache) for slug:",
      slug
    );

    return { data: data.data, error: data.error };
  } catch (error) {
    console.error("Error getting user profile by slug (no cache):", error);

    return { data: null, error: error as Error };
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
) => {
  try {
    // Get the current session token for authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      return {
        data: null,
        error: new Error("No active session"),
      };
    }

    const response = await fetch("/api/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        username: updates.username,
        display_name: updates.display_name,
        bio: updates.bio,
        avatar_url: updates.avatar_url,
        banner_url: updates.banner_url,
        last_edit: updates.last_edit,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: new Error(data.error || "Failed to update profile"),
      };
    }

    return { data: data.data, error: null };
  } catch (error) {
    console.error("Error updating user profile:", error);

    return { data: null, error: error as Error };
  }
};

// Initialize database schema
export const initializeDatabase = async () => {
  try {
    const response = await fetch("/api/init-db", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to initialize database:", data.error);

      return;
    }

    console.log(data.message);
  } catch (error) {
    console.error("Error initializing database schema:", error);
  }
};
