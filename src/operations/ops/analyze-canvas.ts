import { registerOperation } from "../registry";
import { captureCanvasForAI, getCanvasStateSummary } from "@/ai/capture";
import { directChat } from "@/ai/direct-client";

registerOperation({
  id: "canvas.analyze",
  name: "分析画布",
  description:
    "截取当前画布图片，用 AI 视觉分析设计内容。可以分析构图、配色、元素布局、可读性等。用户问'现在图是什么'、'分析一下设计'时使用。",
  group: "AI",
  params: [
    {
      name: "question",
      label: "分析问题",
      type: "string",
      default: "请描述这个设计的内容、构图、配色",
      placeholder: "你想让 AI 分析什么？",
      description: "用户想让 AI 分析的问题",
    },
  ],
  async execute(params, ctx) {
    const question = params.question || "请描述这个设计的内容、构图、配色";

    try {
      // 1. 截取画布
      const imageBase64 = await captureCanvasForAI();

      // 2. 获取文字描述作为补充
      const stateSummary = getCanvasStateSummary();

      // 3. 调用 Vision API
      const response = await directChat({
        messages: [
          {
            role: "system",
            content: `你是一个设计分析助手。用户会给你一张设计图和相关问题，请给出专业、具体的分析。

画布状态信息：
${stateSummary}

分析要点：
- 描述看到的内容（文字、图形、颜色等）
- 分析构图和布局
- 评价配色方案
- **重点检查是否有文字或元素超出画布边界被裁剪**
- 指出可读性问题（如有）
- 给出改进建议（特别是溢出问题）`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: question },
              {
                type: "image_url",
                image_url: { url: imageBase64 },
              },
            ],
          },
        ],
        temperature: 0.5,
      });

      // 4. 解析响应
      let analysisText = "";
      const res = response as any;

      if (res?.choices?.[0]?.message?.content) {
        analysisText = res.choices[0].message.content;
      } else if (res?.data?.choices?.[0]?.message?.content) {
        analysisText = res.data.choices[0].message.content;
      } else if (typeof res?.data === "string") {
        analysisText = res.data;
      } else if (typeof res?.content === "string") {
        analysisText = res.content;
      } else {
        analysisText = JSON.stringify(response);
      }

      return {
        success: true,
        message: analysisText,
        data: {
          analysis: analysisText,
          question,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: `分析失败: ${error?.message || String(error)}`,
      };
    }
  },
});
