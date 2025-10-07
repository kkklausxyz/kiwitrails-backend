const { appCode, queryWeatherUrl } = require("@/config/default").deepseek;
const Validate = require("@/validate/index");
const axios = require("axios").default;
class CallToolController {
  async queryWeather(ctx) {
    const { city } = ctx.query;
    console.log(city);
    await Validate.nullCheck(city, "请传入城市地区", "city");
    try {
      const res = await axios.get(queryWeatherUrl, {
        params: { area: city },
        headers: { Authorization: `APPCODE ${appCode}` },
      });
      ctx.send(res.data.showapi_res_body.dayList);
    } catch (error) {
      ctx.send(error.response.data);
      if (error.response.status === 450 && error.response.data) {
        ctx.send(
          [],
          200,
          "没有查询到该城市的天气哦，你可以重新尝试哦！",
          null,
          201
        );
      } else {
        throw { msg: "查询出现异常错误了", code: 400, validate: null };
      }
    }
  }
}
module.exports = new CallToolController();
