const Router = require("@koa/router");
const router = new Router();
// router.prefix("/agentapi");
// Chat conversation
const chat = require("@/controller/chat");
// File upload middleware
const uploadFile = require("@/config/uploadfile");
// Tool query
const calltool = require("@/controller/calltool");
// Admin controller
const admin = require("@/controller/admin");

// Chat interface
router.post("/chatMessage", chat.chatMessage);

// Weather query
router.get("/queryWeather", calltool.queryWeather);

// Admin endpoints (consider adding authentication in production)
router.get("/admin/stats", admin.getStats);
router.get("/admin/config", admin.getConfig);
router.post("/admin/config", admin.updateConfig);
router.post("/admin/block-ip", admin.blockIP);
router.post("/admin/unblock-ip", admin.unblockIP);
router.get("/admin/blocked-ips", admin.getBlockedIPs);

module.exports = router;
