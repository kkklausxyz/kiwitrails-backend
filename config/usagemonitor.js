const fs = require("fs");
const path = require("path");

// Usage monitoring and logging system
class UsageMonitor {
  constructor() {
    this.logDir = path.join(__dirname, "..", "logs");
    this.usageLogFile = path.join(this.logDir, "usage.log");
    this.suspiciousLogFile = path.join(this.logDir, "suspicious.log");

    // Ensure logs directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // Daily usage statistics
    this.dailyStats = {
      date: this.getTodayDate(),
      totalRequests: 0,
      totalTokensEstimated: 0,
      uniqueIPs: new Set(),
      blockedRequests: 0,
    };

    // Reset daily stats at midnight
    this.scheduleReset();
  }

  getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  scheduleReset() {
    const now = new Date();
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0
    );
    const msUntilMidnight = tomorrow - now;

    setTimeout(() => {
      this.resetDailyStats();
      // Schedule next reset (every 24 hours)
      setInterval(() => this.resetDailyStats(), 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  }

  resetDailyStats() {
    // Log final stats for the day
    this.logDailySummary();

    // Reset stats
    this.dailyStats = {
      date: this.getTodayDate(),
      totalRequests: 0,
      totalTokensEstimated: 0,
      uniqueIPs: new Set(),
      blockedRequests: 0,
    };
  }

  logDailySummary() {
    const summary = {
      date: this.dailyStats.date,
      totalRequests: this.dailyStats.totalRequests,
      totalTokensEstimated: this.dailyStats.totalTokensEstimated,
      uniqueIPCount: this.dailyStats.uniqueIPs.size,
      blockedRequests: this.dailyStats.blockedRequests,
    };

    const logEntry = `[DAILY SUMMARY] ${JSON.stringify(summary)}\n`;
    this.appendToFile(this.usageLogFile, logEntry);

    console.log("📊 Daily Usage Summary:", summary);
  }

  logRequest(ip, estimatedTokens, endpoint) {
    const today = this.getTodayDate();

    // Reset if date changed
    if (today !== this.dailyStats.date) {
      this.resetDailyStats();
    }

    // Update stats
    this.dailyStats.totalRequests++;
    this.dailyStats.totalTokensEstimated += estimatedTokens;
    this.dailyStats.uniqueIPs.add(ip);

    const logEntry = {
      timestamp: new Date().toISOString(),
      ip: this.maskIP(ip),
      endpoint,
      estimatedTokens,
    };

    this.appendToFile(
      this.usageLogFile,
      `[REQUEST] ${JSON.stringify(logEntry)}\n`
    );
  }

  logSuspicious(ip, reason, details = {}) {
    this.dailyStats.blockedRequests++;

    const logEntry = {
      timestamp: new Date().toISOString(),
      ip: this.maskIP(ip),
      reason,
      details,
    };

    this.appendToFile(
      this.suspiciousLogFile,
      `[SUSPICIOUS] ${JSON.stringify(logEntry)}\n`
    );

    console.warn(`⚠️  Suspicious activity from ${this.maskIP(ip)}: ${reason}`);
  }

  appendToFile(filePath, content) {
    try {
      fs.appendFileSync(filePath, content, "utf8");
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }

  // Mask IP for privacy (e.g., 192.168.1.1 -> 192.168.x.x)
  maskIP(ip) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.x.x`;
    }
    // For IPv6 or other formats, just show first part
    return ip.split(":")[0] + ":xxxx";
  }

  // Get current statistics
  getStats() {
    return {
      ...this.dailyStats,
      uniqueIPCount: this.dailyStats.uniqueIPs.size,
      uniqueIPs: undefined, // Don't expose the Set
    };
  }

  // Middleware function
  middleware() {
    return async (ctx, next) => {
      const startTime = Date.now();
      const ip =
        ctx.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        ctx.headers["x-real-ip"] ||
        ctx.ip ||
        ctx.request.ip;

      try {
        await next();

        // Log successful requests
        if (ctx.request.body?.chatMessage) {
          const estimatedTokens = this.estimateTokens(
            ctx.request.body.chatMessage
          );
          this.logRequest(ip, estimatedTokens, ctx.path);
        }
      } catch (error) {
        // Log blocked/failed requests
        if (error.code === 429) {
          this.logSuspicious(ip, "Rate limit exceeded", {
            endpoint: ctx.path,
          });
        } else if (error.code === 400 && error.msg?.includes("Too many")) {
          this.logSuspicious(ip, "Message validation failed", {
            endpoint: ctx.path,
            error: error.msg,
          });
        }

        throw error;
      } finally {
        const duration = Date.now() - startTime;
        if (duration > 30000) {
          // Log if request took more than 30 seconds
          console.warn(
            `⚠️  Slow request detected: ${duration}ms from ${this.maskIP(ip)}`
          );
        }
      }
    };
  }

  estimateTokens(chatMessage) {
    let totalChars = 0;
    for (const message of chatMessage) {
      if (message.content) {
        totalChars += message.content.length;
      }
    }
    return Math.ceil(totalChars / 4);
  }
}

module.exports = new UsageMonitor();
