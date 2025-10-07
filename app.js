const Koa = require("koa");
const app = new Koa();
const json = require("koa-json");
const bodyparser = require("koa-bodyparser");
const cors = require("@koa/cors");

app.use(json());
app.use(bodyparser());
app.use(cors());

app.listen(3000);
console.log("Server is running on port 3000");
