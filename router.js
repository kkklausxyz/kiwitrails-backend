const Router = require("@koa/router");
const router = new Router();
// router.prefix("/agentapi");
// Chat conversation
const chat = require("@/controller/chat");
// File upload middleware
const uploadFile = require("@/config/uploadfile");
// Tool query
const calltool = require("@/controller/calltool");
// Chat interface
router.post("/chatMessage", chat.chatMessage);

// Weather query
router.get("/queryWeather", calltool.queryWeather);

module.exports = router;
