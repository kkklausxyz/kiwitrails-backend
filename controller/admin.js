const rateLimiter = require("@/config/ratelimiter");
const usageMonitor = require("@/config/usagemonitor");

class AdminController {
  // Get current usage statistics
  async getStats(ctx) {
    const stats = usageMonitor.getStats();
    ctx.send(stats);
  }

  // Get rate limiter configuration
  async getConfig(ctx) {
    const config = rateLimiter.getConfig();
    ctx.send(config);
  }

  // Update rate limiter configuration
  async updateConfig(ctx) {
    const { windowMs, maxRequests, blockDuration } = ctx.request.body;

    const newConfig = {};
    if (windowMs !== undefined) newConfig.windowMs = windowMs;
    if (maxRequests !== undefined) newConfig.maxRequests = maxRequests;
    if (blockDuration !== undefined) newConfig.blockDuration = blockDuration;

    rateLimiter.updateConfig(newConfig);
    ctx.send({
      message: "Configuration updated successfully",
      config: rateLimiter.getConfig(),
    });
  }

  // Manually block an IP address
  async blockIP(ctx) {
    const { ip, durationMs } = ctx.request.body;

    if (!ip) {
      throw { msg: "IP address is required", code: 400, validate: null };
    }

    rateLimiter.manualBlockIP(ip, durationMs);
    ctx.send({ message: `IP ${ip} has been blocked`, ip });
  }

  // Unblock an IP address
  async unblockIP(ctx) {
    const { ip } = ctx.request.body;

    if (!ip) {
      throw { msg: "IP address is required", code: 400, validate: null };
    }

    rateLimiter.unblockIP(ip);
    ctx.send({ message: `IP ${ip} has been unblocked`, ip });
  }

  // Get list of blocked IPs (for monitoring)
  async getBlockedIPs(ctx) {
    const blockedIPs = [];
    const now = Date.now();

    for (const [ip, blockedUntil] of rateLimiter.blockedIPs.entries()) {
      const remainingMs = blockedUntil - now;
      if (remainingMs > 0) {
        blockedIPs.push({
          ip: this.maskIP(ip),
          blockedUntil: new Date(blockedUntil).toISOString(),
          remainingMinutes: Math.ceil(remainingMs / 1000 / 60),
        });
      }
    }

    ctx.send({ count: blockedIPs.length, blockedIPs });
  }

  // Mask IP for privacy
  maskIP(ip) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.x.x`;
    }
    return ip.split(":")[0] + ":xxxx";
  }
}

module.exports = new AdminController();
