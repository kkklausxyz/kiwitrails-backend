const { appCode, queryWeatherUrl } = require("@/config/default").deepseek;
const Validate = require("@/validate/index");
const axios = require("axios").default;
class CallToolController {
  async queryWeather(ctx) {
    const { city } = ctx.query;
    console.log(city);
    await Validate.nullCheck(city, "Please provide city/region", "city");
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
          "Weather data for this city was not found, please try again!",
          null,
          201
        );
      } else {
        throw {
          msg: "An error occurred during query",
          code: 400,
          validate: null,
        };
      }
    }
  }
}
module.exports = new CallToolController();
