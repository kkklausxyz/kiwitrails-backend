const logger = require("@/loggerMiddleware");
// Error handling middleware
const errorHandler = async (ctx, next) => {
  try {
    await next();
    // logger.info(`Output log: ${ctx.method} ${ctx.url}`);
  } catch (errorData) {
    // logger.error(errorData);
    console.log("Error caught");
    console.log(errorData);
    // Handle parameter validation errors
    if (errorData.validate === null) {
      const { code, msg, error } = errorData;
      const errorVal = error || null;
      ctx.send(null, code, msg, errorVal);
    } else if (errorData.message === "Unexpected end of form") {
      ctx.send(null, 422, "Please upload an image", null);
    } else {
      console.log(errorData);
      const error =
        errorData.message || "Unexpected error, please check server logs";
      const status = errorData.status || errorData.statusCode || 500;
      ctx.send(null, status, "Server error", error);
    }
  }
};
module.exports = errorHandler;
