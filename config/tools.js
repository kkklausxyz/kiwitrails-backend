// Tools and function design
const tools = [
  // Weather query, function name: getWeather
  {
    type: "function",
    function: {
      name: "getWeather",
      description:
        "When users ask about weather, you should trigger this tool call to help users query weather for a specific city. You cannot use your own weather data as it is inaccurate. You need the user to provide a city name, which is required. If not provided, the function call cannot be triggered. You need to prompt the user: 'For example, you can ask me like this! What's the weather like in Kunming City!' However, users might provide district/county names, in which case you need to determine which city the district belongs to. For example, if a user provides 'Yulong Snow Mountain', it belongs to Lijiang, so you only need the city name Lijiang. But if you cannot determine with 100% certainty which city the district belongs to, do not randomly provide a city name. You need to tell the user to provide an accurate city name.",
      parameters: {
        type: "object",
        properties: {
          city: {
            // Departure location
            type: "string",
            description: "City name, such as Kunming City, Dali City",
          },
        },
        required: ["city"],
      },
    },
  },
];
module.exports = tools;
