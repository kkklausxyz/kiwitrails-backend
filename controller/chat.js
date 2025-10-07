const OpenAI = require("openai");
const { apiKey, systemContent } = require("@/config/default").deepseek;
const Validate = require("@/validate/index");
const tools = require("@/config/tools");
const openai = new OpenAI({
  apiKey,
  baseURL: "https://api.deepseek.com",
});

class ChatController {
  // Chat conversation with streaming output
  async chatMessage(ctx) {
    const { chatMessage } = ctx.request.body;

    // Validation
    await Validate.isarrayCheck(
      chatMessage,
      "chatMessage field cannot be empty",
      "chatMessage"
    );
    // Ensure message array is not empty and contains complete conversation history
    if (chatMessage.length === 0) {
      throw { msg: "Message array cannot be empty", code: 400, validate: null };
    }
    let messages = [
      {
        role: "system",
        content: systemContent,
      },
      ...chatMessage,
    ];
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat", // Model list
      messages,
      stream: true,
    });
    ctx.status = 200;
    for await (const chunk of completion) {
      const delta = chunk.choices[0].delta;

      // Handle reasoning process
      if (delta.reasoning_content) {
        const resObj = JSON.stringify({
          type: "content",
          functionName: "",
          data: delta.reasoning_content,
          modelType: "deepseek",
          replyType: "reasoning_content",
        });
        const buffer = Buffer.from(resObj);
        ctx.res.write(buffer);
      }
      // Handle summary content
      else if (delta.content) {
        const resObj = JSON.stringify({
          type: "content",
          functionName: "",
          data: delta.content,
          modelType: "deepseek",
          replyType: "content",
        });
        const buffer = Buffer.from(resObj);
        ctx.res.write(buffer);
      }
    }
  }
  // Image upload
  async uploadFile(ctx) {
    console.log(ctx.file);
    console.log(ctx.host);
    if (ctx.file === undefined) {
      throw { msg: "Please upload a valid image", code: 422, validate: null };
    }
    // Client
    ctx.send(`http://${ctx.host}/${ctx.file.destination}${ctx.file.filename}`);
  }
}
module.exports = new ChatController();
