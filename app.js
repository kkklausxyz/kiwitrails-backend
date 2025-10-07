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
app.use(json());
app.use(bodyParser());
app.use(cors());
app.use(responseHandler);
app.use(errorHandler);
app.use(static(path.join(__dirname)));
app.use(router.routes()).use(router.allowedMethods());
app.listen(3000);
console.log("Port 3000 has started!");
