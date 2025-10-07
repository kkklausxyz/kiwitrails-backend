// Security configuration
// You can adjust these values based on your needs

module.exports = {
  // Rate limiting settings
  rateLimit: {
    windowMs: 60 * 1000, // Time window in milliseconds (default: 1 minute)
    maxRequests: 10, // Maximum requests per IP within the window (default: 10)
    blockDuration: 15 * 60 * 1000, // Block duration in milliseconds (default: 15 minutes)
  },

  // Message validation settings
  message: {
    maxMessageLength: 5000, // Maximum characters per single message (default: 5000)
    maxMessagesInHistory: 20, // Maximum messages in conversation history (default: 20)
    maxTotalTokensEstimate: 10000, // Warning threshold for estimated tokens (default: 10000)
  },

  // Suspicious content detection
  suspicious: {
    maxRepeatedChars: 50, // Maximum consecutive repeated characters (default: 50)
    maxWordRepetitions: 50, // Maximum times a word can be repeated (default: 50)
  },

  // Logging settings
  logging: {
    enableUsageLog: true, // Log all requests (default: true)
    enableSuspiciousLog: true, // Log suspicious activities (default: true)
    maskIPAddress: true, // Mask IP addresses in logs for privacy (default: true)
    logSlowRequests: true, // Log requests taking longer than slowRequestThreshold (default: true)
    slowRequestThreshold: 30000, // Threshold for slow requests in milliseconds (default: 30 seconds)
  },

  // Environment-specific settings
  // You can override settings based on NODE_ENV
  development: {
    rateLimit: {
      maxRequests: 100, // More lenient in development
    },
  },

  production: {
    rateLimit: {
      maxRequests: 5, // Stricter in production
      windowMs: 60 * 1000,
      blockDuration: 30 * 60 * 1000, // 30 minutes block
    },
    message: {
      maxMessageLength: 3000,
      maxMessagesInHistory: 15,
    },
  },
};

// Helper function to get environment-specific config
function getConfig() {
  const baseConfig = module.exports;
  const env = process.env.NODE_ENV || "development";

  // Merge base config with environment-specific config
  if (baseConfig[env]) {
    return {
      rateLimit: { ...baseConfig.rateLimit, ...baseConfig[env].rateLimit },
      message: { ...baseConfig.message, ...baseConfig[env].message },
      suspicious: { ...baseConfig.suspicious, ...baseConfig[env].suspicious },
      logging: { ...baseConfig.logging, ...baseConfig[env].logging },
    };
  }

  return {
    rateLimit: baseConfig.rateLimit,
    message: baseConfig.message,
    suspicious: baseConfig.suspicious,
    logging: baseConfig.logging,
  };
}

module.exports.getConfig = getConfig;
