const Router = require("@koa/router");
const router = new Router();
// router.prefix("/agentapi");
// 对话
const chat = require("@/controller/chat");
// 文件上传中间件
const uploadFile = require("@/config/uploadfile");
// 工具查询
const calltool = require("@/controller/calltool");
// 对话接口
router.post("/chatMessage", chat.chatMessage);

// 查询天气
router.get("/queryWeather", calltool.queryWeather);

module.exports = router;
