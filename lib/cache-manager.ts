/**
 * Global Cache Manager for Database Operations
 *
 * This module provides a centralized caching system that:
 * - Caches all read operations by default
 * - Invalidates cache when data is modified
 * - Provides real-time data consistency
 * - Minimizes database reads while maintaining data freshness
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  version: number;
}

interface CacheInvalidationRule {
  table: string;
  invalidateKeys: (data: any) => string[];
}

class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private invalidationRules = new Map<string, CacheInvalidationRule[]>();
  private version = 0;

  constructor() {
    // Set up cache cleanup interval
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60000); // Clean every minute
  }

  /**
   * Generate cache key for database operations
   */
  private generateKey(operation: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join("|");

    return `${operation}:${sortedParams}`;
  }

  /**
   * Get data from cache
   */
  get<T>(operation: string, params: Record<string, any>): T | null {
    const key = this.generateKey(operation, params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry is still valid (no expiration for now, only version-based invalidation)
    return entry.data;
  }

  /**
   * Set data in cache
   */
  set<T>(operation: string, params: Record<string, any>, data: T): void {
    const key = this.generateKey(operation, params);

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      version: this.version,
    });
  }

  /**
   * Invalidate cache entries based on table changes
   */
  invalidateByTable(table: string, changedData?: any): void {
    this.version++;
    console.log(
      `🔄 Cache invalidated for table: ${table}, new version: ${this.version}`,
    );

    // If we have specific data, try to invalidate only related entries
    if (changedData) {
      console.log(
        "🎯 Invalidating specific cache entries for data:",
        changedData,
      );
      const rules = this.invalidationRules.get(table) || [];

      for (const rule of rules) {
        const keysToInvalidate = rule.invalidateKeys(changedData);

        console.log("🔑 Keys to invalidate:", keysToInvalidate);
        for (const key of keysToInvalidate) {
          const existed = this.cache.has(key);

          this.cache.delete(key);
          console.log(`${existed ? "✅" : "❌"} Deleted cache key: ${key}`);
        }
      }
    } else {
      // If no specific data, invalidate all entries for this table
      const keysToDelete: string[] = [];

      this.cache.forEach((entry, key) => {
        // Check for table-specific operations
        if (
          key.includes(`getProfile`) ||
          key.includes(`getProfileBySlug`) ||
          key.includes(`checkUsername`)
        ) {
          keysToDelete.push(key);
        }
      });
      console.log("🗑️ Deleting all profile-related cache keys:", keysToDelete);
      for (const key of keysToDelete) {
        this.cache.delete(key);
        console.log(`✅ Deleted cache key: ${key}`);
      }
    }
  }

  /**
   * Register invalidation rules for a table
   */
  registerInvalidationRule(table: string, rule: CacheInvalidationRule): void {
    if (!this.invalidationRules.has(table)) {
      this.invalidationRules.set(table, []);
    }
    this.invalidationRules.get(table)!.push(rule);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    console.log(
      "🗑️ Clearing all cache entries. Cache size before:",
      this.cache.size,
    );
    this.cache.clear();
    this.version++;
    console.log("✅ All cache entries cleared. New version:", this.version);
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; version: number } {
    return {
      size: this.cache.size,
      version: this.version,
    };
  }

  /**
   * Clean up expired entries (currently unused but ready for future use)
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > maxAge) {
        keysToDelete.push(key);
      }
    });

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    if (keysToDelete.length > 0) {
      console.log(`Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }
}

// Global cache instance
export const cacheManager = new CacheManager();

// Register invalidation rules for different tables
cacheManager.registerInvalidationRule("profiles", {
  table: "profiles",
  invalidateKeys: (data: any) => {
    const keys: string[] = [];

    // Invalidate by user ID
    if (data.id) {
      keys.push(`getProfile:{"userId":"${data.id}"}`);
    }

    // Invalidate by username/slug (normalize slug to match cache key generation)
    if (data.username) {
      const normalizedUsername = data.username.toLowerCase().trim();

      keys.push(`getProfileBySlug:{"slug":"${normalizedUsername}"}`);
    }

    if (data.slug) {
      const normalizedSlug = data.slug.toLowerCase().trim();

      keys.push(`getProfileBySlug:{"slug":"${normalizedSlug}"}`);
    }

    // Also invalidate username checks
    if (data.username) {
      keys.push(`checkUsername:{"username":"${data.username}"}`);
    }

    return keys;
  },
});

// Cache operation types
export const CACHE_OPERATIONS = {
  GET_PROFILE: "getProfile",
  GET_PROFILE_BY_SLUG: "getProfileBySlug",
  CHECK_USERNAME: "checkUsername",
} as const;

export type CacheOperation =
  (typeof CACHE_OPERATIONS)[keyof typeof CACHE_OPERATIONS];
