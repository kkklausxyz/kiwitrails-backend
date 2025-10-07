require("dotenv").config();
const Koa = require("koa");
const app = new Koa();
const json = require("koa-json"); // Convert HTTP response data to JSON format
const bodyParser = require("koa-bodyparser"); // Parse HTTP request message body
const cors = require("@koa/cors");
// Middleware for serving static files
const static = require("koa-static");
const path = require("path");
const { addAliases } = require("module-alias");
addAliases({
  "@": __dirname,
});
// API routes
const router = require("@/router");
// Unified API response data format middleware
const responseHandler = require("@/config/result");
// Error handling middleware
const errorHandler = require("@/config/errorhandler");
// Security middlewares
const rateLimiter = require("@/config/ratelimiter");
const messageValidator = require("@/config/messagevalidator");
const usageMonitor = require("@/config/usagemonitor");

app.use(json());
app.use(bodyParser());
app.use(cors());
app.use(responseHandler);
app.use(errorHandler);
// Apply security middlewares
app.use(usageMonitor.middleware());
app.use(rateLimiter.middleware());
app.use(messageValidator.middleware());
app.use(static(path.join(__dirname)));
app.use(router.routes()).use(router.allowedMethods());
app.listen(3000);
console.log("Port 3000 has started!");
