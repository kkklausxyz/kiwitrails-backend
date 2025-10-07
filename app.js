require("dotenv").config();
const Koa = require("koa");
const app = new Koa();
const json = require("koa-json"); //将http响应的数据转换为json格式
const bodyParser = require("koa-bodyparser"); //解析http请求的消息体
const cors = require("@koa/cors");
// 提供静态文件服务的中间件
const static = require("koa-static");
const path = require("path");
const { addAliases } = require("module-alias");
addAliases({
  "@": __dirname,
});
// 接口
const router = require("@/router");
// 统一接口响应数据格式:中间件
const responseHandler = require("@/config/result");
// 捕获错误中间件
const errorHandler = require("@/config/errorhandler");
app.use(json());
app.use(bodyParser());
app.use(cors());
app.use(responseHandler);
app.use(errorHandler);
app.use(static(path.join(__dirname)));
app.use(router.routes()).use(router.allowedMethods());
app.listen(3000);
console.log("3000端口已启动！!");
