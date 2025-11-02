// Rate Limiter for Katana API (100 requests/minute)

export class RateLimiter {
  private requests: number[];
  private maxRequests: number;
  private perMilliseconds: number;

  constructor(maxRequests: number = 100, perMinutes: number = 1) {
    this.maxRequests = maxRequests;
    this.perMilliseconds = perMinutes * 60 * 1000;
    this.requests = [];
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();

    // Remove old requests outside time window
    this.requests = this.requests.filter(
      (time) => now - time < this.perMilliseconds
    );

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.perMilliseconds - (now - oldestRequest) + 100; // Add 100ms buffer
      
      console.log(`⏳ Rate limit reached. Waiting ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      
      return this.waitIfNeeded(); // Recursive check
    }

    this.requests.push(now);
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(
      (time) => now - time < this.perMilliseconds
    );
    return this.maxRequests - this.requests.length;
  }

  reset(): void {
    this.requests = [];
  }
}

// Singleton instance
export const katanaRateLimiter = new RateLimiter(100, 1);

