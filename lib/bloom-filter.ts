/**
 * Bloom Filter implementation for efficient username availability checking
 * This helps reduce unnecessary API calls by providing probabilistic membership testing
 */

export class BloomFilter {
  private bitArray: boolean[];
  private size: number;
  private hashFunctions: number;

  constructor(size: number = 1000, hashFunctions: number = 3) {
    this.size = size;
    this.hashFunctions = hashFunctions;
    this.bitArray = new Array(size).fill(false);
  }

  /**
   * Add an element to the Bloom filter
   */
  add(item: string): void {
    const hashes = this.getHashes(item);
    hashes.forEach((hash) => {
      this.bitArray[hash] = true;
    });
  }

  /**
   * Check if an element might be in the set
   * Returns false if definitely not in set, true if might be in set
   */
  mightContain(item: string): boolean {
    const hashes = this.getHashes(item);
    return hashes.every((hash) => this.bitArray[hash]);
  }

  /**
   * Generate multiple hash values for an item
   */
  private getHashes(item: string): number[] {
    const hashes: number[] = [];
    const str = item.toLowerCase();

    for (let i = 0; i < this.hashFunctions; i++) {
      hashes.push(this.hash(str, i));
    }

    return hashes;
  }

  /**
   * Simple hash function with different seeds for multiple hash functions
   */
  private hash(str: string, seed: number): number {
    let hash = 0;
    const seedMultiplier = seed * 31 + 1;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash * seedMultiplier + char) % this.size;
    }

    return Math.abs(hash);
  }

  /**
   * Get the current fill ratio of the Bloom filter
   */
  getFillRatio(): number {
    const filledBits = this.bitArray.filter((bit) => bit).length;
    return filledBits / this.size;
  }

  /**
   * Clear the Bloom filter
   */
  clear(): void {
    this.bitArray.fill(false);
  }
}

/**
 * Username cache with Bloom filter integration
 * Provides client-side caching and probabilistic checking to minimize API calls
 */
export class UsernameCache {
  private cache = new Map<
    string,
    { value: boolean; timestamp: number; ttl: number }
  >();
  private bloomFilter = new BloomFilter(1000, 3);
  private maxCacheSize = 1000;
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  /**
   * Check if we should query the API for this username
   * Returns true if we should query, false if we can skip
   */
  shouldQuery(username: string): boolean {
    const key = username.toLowerCase();

    // Check if we have a valid cached result
    const cached = this.cache.get(key);
    if (cached) {
      const now = Date.now();
      if (now - cached.timestamp < cached.ttl) {
        // Cache is still valid
        return false;
      } else {
        // Cache expired, remove it
        this.cache.delete(key);
      }
    }

    // If bloom filter says it might exist, we should query
    // If bloom filter says it definitely doesn't exist, we can skip
    return this.bloomFilter.mightContain(key);
  }

  /**
   * Cache a username availability result
   */
  cacheResult(username: string, available: boolean, ttl?: number): void {
    const key = username.toLowerCase();
    const now = Date.now();
    const cacheTTL = ttl || this.defaultTTL;

    // Add to cache with timestamp and TTL
    this.cache.set(key, {
      value: available,
      timestamp: now,
      ttl: cacheTTL,
    });
    console.log(
      `Cached username: ${key} = ${available}, cache size: ${this.cache.size}, TTL: ${cacheTTL}ms`,
    );

    // If username is taken, add to bloom filter
    if (!available) {
      this.bloomFilter.add(key);
      console.log(`Added ${key} to bloom filter`);
    }

    // Clean up expired entries and if cache gets too large
    this.cleanupCache();
  }

  /**
   * Get cached result for a username
   */
  getCachedResult(username: string): boolean | null {
    const key = username.toLowerCase();
    const cached = this.cache.get(key);

    if (cached) {
      const now = Date.now();
      if (now - cached.timestamp < cached.ttl) {
        // Cache is still valid
        return cached.value;
      } else {
        // Cache expired, remove it
        this.cache.delete(key);
      }
    }

    return null;
  }

  /**
   * Clean up expired cache entries and manage cache size
   */
  private cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    // Find expired entries
    this.cache.forEach((cached, key) => {
      if (now - cached.timestamp >= cached.ttl) {
        expiredKeys.push(key);
      }
    });

    // Remove expired entries
    expiredKeys.forEach((key) => this.cache.delete(key));

    // If still too large, remove oldest entries
    if (this.cache.size > this.maxCacheSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toRemove = entries.slice(0, this.cache.size - this.maxCacheSize);
      toRemove.forEach(([key]) => this.cache.delete(key));

      console.log(
        `Cache cleanup: removed ${expiredKeys.length + toRemove.length} entries, cache size: ${this.cache.size}`,
      );
    }
  }

  /**
   * Invalidate cache for a specific username
   */
  invalidateUsername(username: string): void {
    const key = username.toLowerCase();
    this.cache.delete(key);
    console.log(`Invalidated cache for username: ${key}`);
  }

  /**
   * Clear the cache and bloom filter
   */
  clear(): void {
    this.cache.clear();
    this.bloomFilter.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      bloomFilterFillRatio: this.bloomFilter.getFillRatio(),
    };
  }
}
