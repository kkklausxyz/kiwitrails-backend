// Unified API response data format
const responseHandler = async (ctx, next) => {
  ctx.send = (
    data = null,
    code = 200,
    msg = "SUCCESS",
    error = null,
    serviceCode = 200
  ) => {
    ctx.body = {
      data, // Data returned to frontend
      msg, // Message
      error, // Error description
      serviceCode, // Business error code
    };
    ctx.status = code;
  };
  await next();
};
module.exports = responseHandler;
