/**
 * Real-time username availability checker
 * Performs direct database checks with debouncing
 */

/**
 * Real-time username availability checker
 * Uses 1 second debounce before performing database reads
 */
export class RealTimeUsernameChecker {
  private debounceTimer: NodeJS.Timeout | null = null;
  private pendingChecks = new Set<string>();
  private readonly DEBOUNCE_DELAY = 1000; // 1 second delay before database read

  /**
   * Check username availability with real-time database calls
   */
  async checkUsernameAvailability(
    username: string,
    onResult: (
      username: string,
      available: boolean | null,
      loading: boolean,
    ) => void,
  ): Promise<void> {
    const _normalizedUsername = username.toLowerCase().trim();

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Don't show loading state here - component handles it immediately when typing
    // Set up debounced API call with 2 second delay
    this.debounceTimer = setTimeout(async () => {
      await this.performCheck(username, onResult); // Use original username, not normalized
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * Perform the actual API check
   */
  private async performCheck(
    username: string,
    onResult: (
      username: string,
      available: boolean | null,
      loading: boolean,
    ) => void,
  ): Promise<void> {
    const normalizedUsername = username.toLowerCase().trim();

    // Prevent duplicate requests
    if (this.pendingChecks.has(normalizedUsername)) {
      console.log(`Duplicate request for ${normalizedUsername}, skipping`);

      return;
    }

    this.pendingChecks.add(normalizedUsername);
    console.log(
      `Starting API check for ${username} (normalized: ${normalizedUsername})`,
    );

    // Show loading state when API call actually starts
    onResult(username, null, true);

    try {
      // Direct API call to database with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch("/api/check-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: normalizedUsername }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const available = data.available;

      // Notify callback with result - use original username
      onResult(username, available, false);
    } catch (error) {
      console.error("Error checking username availability:", error);
      onResult(username, null, false); // Show error state
    } finally {
      this.pendingChecks.delete(normalizedUsername);
      console.log(`Completed API check for ${normalizedUsername}`);
    }
  }

  /**
   * Cancel any pending checks
   */
  cancelPendingChecks(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.pendingChecks.clear();
  }
}

// Export singleton instance
export const usernameChecker = new RealTimeUsernameChecker();
