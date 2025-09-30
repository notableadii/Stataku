// Database operations now use API routes for security

// Database types - updated to match profiles table schema
export interface UserProfile {
  id: string;
  username: string;
  slug: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
}

// Username functions
export const checkUsernameAvailability = async (
  username: string,
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
    const response = await fetch("/api/get-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: new Error(data.error || "Failed to get profile"),
      };
    }

    return { data: data.data, error: data.error };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { data: null, error: error as Error };
  }
};

export const updateUserProfile = async (
  _userId: string,
  _updates: Partial<UserProfile>,
) => {
  // TODO: Implement update profile API route if needed
  console.warn("updateUserProfile not implemented yet");
  return { data: null, error: new Error("Not implemented") };
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
