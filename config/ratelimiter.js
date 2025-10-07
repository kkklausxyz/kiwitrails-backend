// Rate limiting middleware to prevent API abuse
class RateLimiter {
  constructor() {
    // Store request counts per IP: { ip: { count: number, resetTime: timestamp } }
    this.requests = new Map();
    // Store blocked IPs: { ip: blockedUntil timestamp }
    this.blockedIPs = new Map();

    // Configuration
    this.config = {
      windowMs: 60 * 1000, // 1 minute window
      maxRequests: 10, // Max 10 requests per minute per IP
      blockDuration: 15 * 60 * 1000, // Block for 15 minutes if exceeded
      maxMessageLength: 5000, // Max characters per message
      maxMessagesInHistory: 20, // Max messages in conversation history
    };

    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  middleware() {
    return async (ctx, next) => {
      const ip = this.getClientIP(ctx);

      // Check if IP is blocked
      if (this.isBlocked(ip)) {
        const blockedUntil = this.blockedIPs.get(ip);
        const remainingTime = Math.ceil(
          (blockedUntil - Date.now()) / 1000 / 60
        );
        throw {
          msg: `Too many requests. Please try again in ${remainingTime} minutes.`,
          code: 429,
          validate: null,
        };
      }

      // Check rate limit
      if (!this.checkRateLimit(ip)) {
        // Block the IP
        this.blockIP(ip);
        throw {
          msg: "Rate limit exceeded. IP has been temporarily blocked.",
          code: 429,
          validate: null,
        };
      }

      await next();
    };
  }

  getClientIP(ctx) {
    // Get real IP from headers (for proxies/load balancers)
    return (
      ctx.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      ctx.headers["x-real-ip"] ||
      ctx.ip ||
      ctx.request.ip
    );
  }

  checkRateLimit(ip) {
    const now = Date.now();
    const record = this.requests.get(ip);

    if (!record || now > record.resetTime) {
      // New window
      this.requests.set(ip, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    if (record.count >= this.config.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  isBlocked(ip) {
    const blockedUntil = this.blockedIPs.get(ip);
    if (!blockedUntil) return false;

    if (Date.now() > blockedUntil) {
      this.blockedIPs.delete(ip);
      return false;
    }

    return true;
  }

  blockIP(ip) {
    const blockedUntil = Date.now() + this.config.blockDuration;
    this.blockedIPs.set(ip, blockedUntil);
    console.log(`IP ${ip} has been blocked until ${new Date(blockedUntil)}`);
  }

  cleanup() {
    const now = Date.now();

    // Clean expired rate limit records
    for (const [ip, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(ip);
      }
    }

    // Clean expired IP blocks
    for (const [ip, blockedUntil] of this.blockedIPs.entries()) {
      if (now > blockedUntil) {
        this.blockedIPs.delete(ip);
      }
    }
  }

  // Method to manually block an IP
  manualBlockIP(ip, durationMs = this.config.blockDuration) {
    const blockedUntil = Date.now() + durationMs;
    this.blockedIPs.set(ip, blockedUntil);
    console.log(`IP ${ip} manually blocked until ${new Date(blockedUntil)}`);
  }

  // Method to unblock an IP
  unblockIP(ip) {
    this.blockedIPs.delete(ip);
    console.log(`IP ${ip} has been unblocked`);
  }

  // Get current configuration
  getConfig() {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log("Rate limiter configuration updated:", this.config);
  }
}

module.exports = new RateLimiter();
