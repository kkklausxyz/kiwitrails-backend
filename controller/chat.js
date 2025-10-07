const OpenAI = require("openai");
const { apiKey, systemContent } = require("@/config/default").deepseek;
const Validate = require("@/validate/index");
const tools = require("@/config/tools");
const openai = new OpenAI({
  apiKey,
  baseURL: "https://api.deepseek.com",
});

class ChatController {
  //对话，流式输出
  async chatMessage(ctx) {
    const { chatMessage } = ctx.request.body;
    console.log(chatMessage);
    // 校验
    await Validate.isarrayCheck(
      chatMessage,
      "chatMessage字段不能为空",
      "chatMessage"
    );
    // 确保消息数组不为空且包含完整的对话历史
    if (chatMessage.length === 0) {
      throw { msg: "消息数组不能为空", code: 400, validate: null };
    }
    let messages = [
      {
        role: "system",
        content: systemContent,
      },
      ...chatMessage,
    ];
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat", //模型列表
      messages,
      stream: true,
    });
    ctx.status = 200;
    for await (const chunk of completion) {
      const delta = chunk.choices[0].delta;
      console.log(delta);
      // 处理思考过程
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
      // 处理总结内容
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
  // 图片上传
  async uploadFile(ctx) {
    console.log(ctx.file);
    console.log(ctx.host);
    if (ctx.file === undefined) {
      throw { msg: "请上传正确的图片", code: 422, validate: null };
    }
    // 客户端
    ctx.send(`http://${ctx.host}/${ctx.file.destination}${ctx.file.filename}`);
  }
}
module.exports = new ChatController();
