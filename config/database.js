const mongoose = require("mongoose");
mongoose.pluralize(null);
const { Schema, model } = mongoose;
const { host } = require("@/config/default").dbUrl;
mongoose
  .connect(host)
  .then((res) => {
    console.log("数据库连接成功");
  })
  .catch((err) => {
    console.log(err);
    console.log("数据库连接失败");
  });
module.exports = {
  Schema,
  model,
  mongoose,
};
