/**
 * Database Service with Intelligent Caching
 *
 * This service provides cached database operations that:
 * - Always return cached data when available
 * - Only hit the database when cache is empty or invalidated
 * - Automatically invalidate cache when data changes
 */

import { createClient } from "@libsql/client";

import { cacheManager, CACHE_OPERATIONS } from "./cache-manager";

// Initialize Turso client lazily
export function getTursoClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error(
      "Turso database configuration is missing. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables."
    );
  }

  return createClient({
    url,
    authToken,
  });
}

export interface Profile {
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

export interface DatabaseResult<T> {
  data: T | null;
  error: string | null;
  fromCache: boolean;
}

/**
 * Get user profile by ID with caching
 */
export async function getProfile(
  userId: string
): Promise<DatabaseResult<Profile>> {
  try {
    // Check cache first
    const cachedData = cacheManager.get<Profile>(CACHE_OPERATIONS.GET_PROFILE, {
      userId,
    });

    if (cachedData) {
      console.log(`Returning cached profile for userId: ${userId}`);

      return {
        data: cachedData,
        error: null,
        fromCache: true,
      };
    }

    // Cache miss - fetch from database
    console.log(
      `Cache miss - fetching profile from database for userId: ${userId}`
    );
    const turso = getTursoClient();

    let result;

    try {
      result = await turso.execute({
        sql: "SELECT id, username, slug, display_name, bio, avatar_url, banner_url, created_at, last_edit, email_sent FROM profiles WHERE id = ?",
        args: [userId],
      });
    } catch (error) {
      // Fallback to old schema if new columns don't exist
      console.log("New schema columns not found, using old schema");
      result = await turso.execute({
        sql: "SELECT id, username, created_at FROM profiles WHERE id = ?",
        args: [userId],
      });
    }

    if (result.rows.length === 0) {
      // Cache null result as well
      cacheManager.set(CACHE_OPERATIONS.GET_PROFILE, { userId }, null);

      return {
        data: null,
        error: null,
        fromCache: false,
      };
    }

    const row = result.rows[0];
    const profile: Profile = {
      id: row.id as string,
      username: row.username as string,
      slug: (row as any).slug || row.username,
      display_name: (row as any).display_name || null,
      bio: (row as any).bio || null,
      avatar_url: (row as any).avatar_url || null,
      banner_url: (row as any).banner_url || null,
      created_at: row.created_at as string,
      last_edit: (row as any).last_edit || null,
      email_sent: (row as any).email_sent || "No",
    };

    // Cache the result
    cacheManager.set(CACHE_OPERATIONS.GET_PROFILE, { userId }, profile);

    return {
      data: profile,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("Error getting profile:", error);

    return {
      data: null,
      error: error instanceof Error ? error.message : "Database error",
      fromCache: false,
    };
  }
}

/**
 * Get user profile by ID WITHOUT caching (for real-time updates)
 */
export async function getProfileNoCache(
  userId: string
): Promise<DatabaseResult<Profile>> {
  try {
    console.log(
      `Fetching profile from database (no cache) for userId: ${userId}`
    );
    const turso = getTursoClient();

    let result;

    try {
      result = await turso.execute({
        sql: "SELECT id, username, slug, display_name, bio, avatar_url, banner_url, created_at, last_edit, email_sent FROM profiles WHERE id = ?",
        args: [userId],
      });
    } catch (error) {
      // Fallback to old schema if new columns don't exist
      console.log("New schema columns not found, using old schema");
      result = await turso.execute({
        sql: "SELECT id, username, created_at FROM profiles WHERE id = ?",
        args: [userId],
      });
    }

    if (result.rows.length === 0) {
      return {
        data: null,
        error: null,
        fromCache: false,
      };
    }

    const row = result.rows[0];
    const profile: Profile = {
      id: row.id as string,
      username: row.username as string,
      slug: (row as any).slug || row.username,
      display_name: (row as any).display_name || null,
      bio: (row as any).bio || null,
      avatar_url: (row as any).avatar_url || null,
      banner_url: (row as any).banner_url || null,
      created_at: row.created_at as string,
      last_edit: (row as any).last_edit || null,
      email_sent: (row as any).email_sent || "No",
    };

    return {
      data: profile,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("Error getting profile (no cache):", error);

    return {
      data: null,
      error: error instanceof Error ? error.message : "Database error",
      fromCache: false,
    };
  }
}

/**
 * Get user profile by slug with caching
 */
export async function getProfileBySlug(
  slug: string
): Promise<DatabaseResult<Profile>> {
  try {
    const normalizedSlug = slug.toLowerCase().trim();

    // Check cache first
    const cacheKey = `${CACHE_OPERATIONS.GET_PROFILE_BY_SLUG}:{"slug":"${normalizedSlug}"}`;

    console.log(`🔍 Checking cache for key: ${cacheKey}`);
    const cachedData = cacheManager.get<Profile>(
      CACHE_OPERATIONS.GET_PROFILE_BY_SLUG,
      { slug: normalizedSlug }
    );

    if (cachedData) {
      console.log(
        `✅ Cache HIT - Returning cached profile for slug: ${normalizedSlug}`
      );

      return {
        data: cachedData,
        error: null,
        fromCache: true,
      };
    } else {
      console.log(`❌ Cache MISS - No cached data for slug: ${normalizedSlug}`);
    }

    // Cache miss - fetch from database
    console.log(
      `Cache miss - fetching profile from database for slug: ${normalizedSlug}`
    );
    const turso = getTursoClient();

    const result = await turso.execute({
      sql: `
        SELECT id, username, slug, display_name, bio, avatar_url, banner_url, created_at 
        FROM profiles 
        WHERE slug = ? 
        LIMIT 1
      `,
      args: [normalizedSlug],
    });

    if (result.rows.length === 0) {
      // Cache null result as well
      cacheManager.set(
        CACHE_OPERATIONS.GET_PROFILE_BY_SLUG,
        { slug: normalizedSlug },
        null
      );

      return {
        data: null,
        error: "Profile not found",
        fromCache: false,
      };
    }

    const row = result.rows[0];
    const profile: Profile = {
      id: row.id as string,
      username: row.username as string,
      slug: row.slug as string,
      display_name: row.display_name as string | null,
      bio: row.bio as string | null,
      avatar_url: row.avatar_url as string | null,
      banner_url: row.banner_url as string | null,
      created_at: row.created_at as string,
      last_edit: row.last_edit as string | null,
      email_sent: row.email_sent as string,
    };

    // Cache the result
    cacheManager.set(
      CACHE_OPERATIONS.GET_PROFILE_BY_SLUG,
      { slug: normalizedSlug },
      profile
    );

    return {
      data: profile,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("Error getting profile by slug:", error);

    return {
      data: null,
      error: error instanceof Error ? error.message : "Database error",
      fromCache: false,
    };
  }
}

/**
 * Get user profile by slug WITHOUT caching (for real-time updates)
 */
export async function getProfileBySlugNoCache(
  slug: string
): Promise<DatabaseResult<Profile>> {
  try {
    const normalizedSlug = slug.toLowerCase().trim();

    console.log(
      `Fetching profile from database (no cache) for slug: ${normalizedSlug}`
    );
    const turso = getTursoClient();

    const result = await turso.execute({
      sql: `
        SELECT id, username, slug, display_name, bio, avatar_url, banner_url, created_at 
        FROM profiles 
        WHERE slug = ? 
        LIMIT 1
      `,
      args: [normalizedSlug],
    });

    if (result.rows.length === 0) {
      return {
        data: null,
        error: "Profile not found",
        fromCache: false,
      };
    }

    const row = result.rows[0];
    const profile: Profile = {
      id: row.id as string,
      username: row.username as string,
      slug: row.slug as string,
      display_name: row.display_name as string | null,
      bio: row.bio as string | null,
      avatar_url: row.avatar_url as string | null,
      banner_url: row.banner_url as string | null,
      created_at: row.created_at as string,
      last_edit: row.last_edit as string | null,
      email_sent: row.email_sent as string,
    };

    return {
      data: profile,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("Error getting profile by slug (no cache):", error);

    return {
      data: null,
      error: error instanceof Error ? error.message : "Database error",
      fromCache: false,
    };
  }
}

/**
 * Check if username is available with caching
 */
export async function checkUsername(
  username: string
): Promise<DatabaseResult<boolean>> {
  try {
    const normalizedUsername = username.toLowerCase().trim();

    // Check cache first
    const cachedData = cacheManager.get<boolean>(
      CACHE_OPERATIONS.CHECK_USERNAME,
      { username: normalizedUsername }
    );

    if (cachedData !== null) {
      console.log(`Returning cached username check for: ${normalizedUsername}`);

      return {
        data: cachedData,
        error: null,
        fromCache: true,
      };
    }

    // Cache miss - check database
    console.log(
      `Cache miss - checking username availability in database for: ${normalizedUsername}`
    );
    const turso = getTursoClient();

    const result = await turso.execute({
      sql: "SELECT COUNT(*) as count FROM profiles WHERE username = ?",
      args: [normalizedUsername],
    });

    const isAvailable = result.rows[0].count === 0;

    // Cache the result
    cacheManager.set(
      CACHE_OPERATIONS.CHECK_USERNAME,
      { username: normalizedUsername },
      isAvailable
    );

    return {
      data: isAvailable,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("Error checking username:", error);

    return {
      data: null,
      error: error instanceof Error ? error.message : "Database error",
      fromCache: false,
    };
  }
}

/**
 * Update profile and invalidate cache
 */
export async function updateProfile(
  userId: string,
  updates: {
    username?: string | null;
    display_name?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    banner_url?: string | null;
    last_edit?: string | null;
    last_username_update?: string | null;
  }
): Promise<DatabaseResult<Profile>> {
  try {
    const turso = getTursoClient();

    // Build update query
    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.username !== undefined) {
      updateFields.push("username = ?");
      values.push(
        updates.username && updates.username.trim() !== ""
          ? updates.username.trim().toLowerCase()
          : null
      );

      // Also update slug to match username
      updateFields.push("slug = ?");
      values.push(
        updates.username && updates.username.trim() !== ""
          ? updates.username.trim().toLowerCase()
          : null
      );
    }

    if (updates.display_name !== undefined) {
      updateFields.push("display_name = ?");
      values.push(
        updates.display_name && updates.display_name.trim() !== ""
          ? updates.display_name.trim()
          : null
      );
    }

    if (updates.bio !== undefined) {
      updateFields.push("bio = ?");
      values.push(
        updates.bio && updates.bio.trim() !== "" ? updates.bio.trim() : null
      );
    }

    if (updates.avatar_url !== undefined) {
      updateFields.push("avatar_url = ?");
      values.push(
        updates.avatar_url && updates.avatar_url.trim() !== ""
          ? updates.avatar_url.trim()
          : null
      );
    }

    if (updates.banner_url !== undefined) {
      updateFields.push("banner_url = ?");
      values.push(
        updates.banner_url && updates.banner_url.trim() !== ""
          ? updates.banner_url.trim()
          : null
      );
    }

    if (updates.last_edit !== undefined) {
      updateFields.push("last_edit = ?");
      values.push(updates.last_edit);
    }

    if (updates.last_username_update !== undefined) {
      updateFields.push("last_username_update = ?");
      values.push(updates.last_username_update);
    }

    if (updateFields.length === 0) {
      return {
        data: null,
        error: "No fields to update",
        fromCache: false,
      };
    }

    values.push(userId);

    // Update the profile
    await turso.execute({
      sql: `UPDATE profiles SET ${updateFields.join(", ")} WHERE id = ?`,
      args: values,
    });

    // Clear ALL cache entries to ensure fresh data
    console.log("Clearing all cache entries after profile update");
    cacheManager.clear();

    // Fetch updated profile directly from database (no cache)
    const result = await turso.execute({
      sql: "SELECT id, username, slug, display_name, bio, avatar_url, banner_url, created_at, last_edit, email_sent FROM profiles WHERE id = ?",
      args: [userId],
    });

    if (result.rows.length === 0) {
      return {
        data: null,
        error: "Profile not found after update",
        fromCache: false,
      };
    }

    const row = result.rows[0];
    const profile: Profile = {
      id: row.id as string,
      username: row.username as string,
      slug: row.slug as string,
      display_name: row.display_name as string | null,
      bio: row.bio as string | null,
      avatar_url: row.avatar_url as string | null,
      banner_url: row.banner_url as string | null,
      created_at: row.created_at as string,
      last_edit: row.last_edit as string | null,
      email_sent: (row as any).email_sent || "No",
    };

    console.log("Profile updated successfully:", profile);

    // Also specifically invalidate cache for this profile
    console.log("Invalidating cache for updated profile:", {
      id: profile.id,
      username: profile.username,
      slug: profile.slug,
    });
    cacheManager.invalidateByTable("profiles", {
      id: profile.id,
      username: profile.username,
      slug: profile.slug,
    });

    return {
      data: profile,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("Error updating profile:", error);

    return {
      data: null,
      error: error instanceof Error ? error.message : "Database error",
      fromCache: false,
    };
  }
}

/**
 * Create username and invalidate cache
 */
export async function createUsername(
  userId: string,
  username: string
): Promise<DatabaseResult<{ username: string; slug: string }>> {
  try {
    const normalizedUsername = username.toLowerCase().trim();
    const slug = normalizedUsername;

    const turso = getTursoClient();

    // Insert new profile
    await turso.execute({
      sql: `
        INSERT INTO profiles (id, username, slug, created_at) 
        VALUES (?, ?, ?, ?)
        ON CONFLICT(username) DO NOTHING
      `,
      args: [userId, normalizedUsername, slug, new Date().toISOString()],
    });

    // Invalidate cache for this user
    cacheManager.invalidateByTable("profiles", {
      id: userId,
      username: normalizedUsername,
      slug,
    });

    return {
      data: { username: normalizedUsername, slug },
      error: null,
      fromCache: false,
    };
  } catch (error) {
    console.error("Error creating username:", error);

    return {
      data: null,
      error: error instanceof Error ? error.message : "Database error",
      fromCache: false,
    };
  }
}

/**
 * Get all users for search with caching
 */
export async function getAllUsersForSearch(): Promise<
  DatabaseResult<Profile[]>
> {
  try {
    // Check cache first
    const cachedData = cacheManager.get<Profile[]>(
      CACHE_OPERATIONS.SEARCH_USERS,
      {}
    );

    if (cachedData) {
      return {
        data: cachedData,
        error: null,
        fromCache: true,
      };
    }

    // Cache miss - fetch from database
    const turso = getTursoClient();

    const result = await turso.execute({
      sql: `
        SELECT id, username, slug, display_name, avatar_url, created_at
        FROM profiles 
        WHERE username IS NOT NULL 
        ORDER BY created_at DESC
      `,
      args: [],
    });

    const users = result.rows.map((row) => ({
      id: row.id as string,
      username: row.username as string,
      slug: row.slug as string,
      display_name: row.display_name as string | null,
      avatar_url: row.avatar_url as string | null,
      created_at: row.created_at as string,
      bio: null,
      banner_url: null,
      last_edit: null,
      email_sent: "No",
    }));

    // Cache the result for 5 minutes
    cacheManager.set(CACHE_OPERATIONS.SEARCH_USERS, {}, users, 5 * 60 * 1000);

    return {
      data: users,
      error: null,
      fromCache: false,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Database error",
      fromCache: false,
    };
  }
}
