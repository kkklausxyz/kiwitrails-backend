// Message validation middleware to prevent abuse
const rateLimiter = require("./ratelimiter");

class MessageValidator {
  constructor() {
    this.config = rateLimiter.getConfig();
  }

  // Validate chat message request
  validateChatMessage(chatMessage) {
    // Check if message array exists
    if (!Array.isArray(chatMessage)) {
      throw {
        msg: "chatMessage must be an array",
        code: 400,
        validate: null,
      };
    }

    // Check maximum number of messages in history
    if (chatMessage.length > this.config.maxMessagesInHistory) {
      throw {
        msg: `Too many messages in history. Maximum ${this.config.maxMessagesInHistory} messages allowed.`,
        code: 400,
        validate: null,
      };
    }

    // Validate each message
    for (let i = 0; i < chatMessage.length; i++) {
      const message = chatMessage[i];

      // Check message structure
      if (!message.role || !message.content) {
        throw {
          msg: `Invalid message structure at index ${i}. Must have 'role' and 'content' fields.`,
          code: 400,
          validate: null,
        };
      }

      // Check role validity
      const validRoles = ["system", "user", "assistant"];
      if (!validRoles.includes(message.role)) {
        throw {
          msg: `Invalid role at index ${i}. Must be one of: ${validRoles.join(
            ", "
          )}`,
          code: 400,
          validate: null,
        };
      }

      // Check content type
      if (typeof message.content !== "string") {
        throw {
          msg: `Invalid content type at index ${i}. Must be a string.`,
          code: 400,
          validate: null,
        };
      }

      // Check content length
      if (message.content.length > this.config.maxMessageLength) {
        throw {
          msg: `Message at index ${i} is too long. Maximum ${this.config.maxMessageLength} characters allowed.`,
          code: 400,
          validate: null,
        };
      }

      // Check for suspicious patterns (e.g., repeated characters)
      if (this.isSuspiciousContent(message.content)) {
        throw {
          msg: `Suspicious content detected at index ${i}.`,
          code: 400,
          validate: null,
        };
      }
    }

    return true;
  }

  // Detect suspicious content patterns
  isSuspiciousContent(content) {
    // Check for excessively repeated characters (e.g., "aaaaaaa...")
    const repeatedCharsPattern = /(.)\1{50,}/;
    if (repeatedCharsPattern.test(content)) {
      return true;
    }

    // Check for excessively repeated words
    const words = content.split(/\s+/);
    const wordCounts = {};
    for (const word of words) {
      if (word.length > 0) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
        // If any word is repeated more than 50 times, flag as suspicious
        if (wordCounts[word] > 50) {
          return true;
        }
      }
    }

    return false;
  }

  // Calculate approximate token count (rough estimation: 1 token ≈ 4 characters)
  estimateTokens(chatMessage) {
    let totalChars = 0;
    for (const message of chatMessage) {
      totalChars += message.content.length;
    }
    return Math.ceil(totalChars / 4);
  }

  // Middleware function
  middleware() {
    return async (ctx, next) => {
      // Only validate for chat endpoints
      if (ctx.request.body && ctx.request.body.chatMessage) {
        const { chatMessage } = ctx.request.body;

        try {
          this.validateChatMessage(chatMessage);

          // Log estimated tokens for monitoring
          const estimatedTokens = this.estimateTokens(chatMessage);
          console.log(
            `[${new Date().toISOString()}] Chat request from ${
              ctx.ip
            } - Estimated tokens: ${estimatedTokens}`
          );

          // Warn if token count is very high
          if (estimatedTokens > 10000) {
            console.warn(
              `⚠️  High token count detected: ${estimatedTokens} tokens from IP ${ctx.ip}`
            );
          }
        } catch (error) {
          throw error;
        }
      }

      await next();
    };
  }
}

module.exports = new MessageValidator();
