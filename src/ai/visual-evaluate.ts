import { directChat } from "./direct-client";
import { captureCanvasForAI, getCanvasStateSummary } from "./capture";
import { parseChatResponse, extractJSON } from "./shared/response-parser";
import { AI_TIMEOUTS } from "./shared/timeout";
import {
  isVisionAvailable,
  markVisionUnavailable,
  isVisionRelatedError,
} from "./vision-mode";

// ============ 类型定义 ============

export interface VisualEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  shouldIterate: boolean;
  iterationFocus?: string;
}

// ============ 视觉评估系统提示 ============

const VISUAL_EVAL_SYSTEM_PROMPT = `你是一个专业的设计评审专家。你将看到一张设计作品的截图和画布状态数据。

## 评估维度（每个 1-10 分）

1. **配色** — 颜色搭配是否和谐，对比度是否合适，是否有视觉冲击力
2. **排版** — 文字大小层级是否清晰，字重、对齐是否恰当
3. **构图** — 元素布局是否平衡，留白是否合理，视觉重心是否明确
4. **细节** — 装饰元素、阴影、圆角等细节处理是否精致
5. **整体** — 综合美学感受，是否符合设计目标

## 输出格式

严格按以下 JSON 格式输出，不要写任何 JSON 之外的内容：

{
  "score": 综合分数(1-10整数),
  "strengths": ["优点1", "优点2", ...],
  "weaknesses": ["不足1", "不足2", ...],
  "suggestions": ["具体改进建议1", "具体改进建议2", ...],
  "shouldIterate": true/false,
  "iterationFocus": "如果 shouldIterate 为 true，填写优化重点"
}

## 评分标准

- 8-10: 优秀，可直接使用
- 6-7: 良好，可交付，给轻微建议但不要自动迭代
- 4-5: 一般，建议用户确认后再迭代
- 1-3: 较差，需要重新设计

## 建议要求

- 必须是可执行的具体操作（如"标题字号从 200 改为 300"）
- 不要给笼统的建议（如"优化配色"——应该具体到"将背景色从 #xxx 改为 #yyy"）
- 每次最多 4 条建议，按优先级排序`;

// ============ 评估函数 ============

export async function evaluateCanvasVisual(): Promise<VisualEvaluation | null> {
  console.log("[VisualEval] 开始视觉评估...");

  const buildUserContent = (imageBase64: string | null) => {
    const stateSummary = getCanvasStateSummary();
    const textPart = {
      type: "text",
      text: `请评估这个设计作品。

## 画布状态
${stateSummary}

## 额外要求
- 如果画布为空（元素数量为 0），评分 1 分，建议"创建一个设计"
- 重点检查是否有纯黑(#000000)或纯白(#ffffff)作为主色，如果有必须指出
- 检查文字是否太小（< 60px）或太大（> 500px），异常时指出
- 检查元素是否贴边（margin < 5%）${imageBase64 ? "" : "\n- 当前视觉模型不可用，请仅根据画布状态数据评估"}`,
    };
    return imageBase64
      ? [
          textPart,
          { type: "image_url", image_url: { url: imageBase64, detail: "high" } },
        ]
      : [textPart];
  };

  const doEvaluate = async (imageBase64: string | null) => {
    const response = await directChat({
      messages: [
        { role: "system", content: VISUAL_EVAL_SYSTEM_PROMPT },
        { role: "user", content: buildUserContent(imageBase64) },
      ],
      temperature: 0.3,
      timeoutMs: AI_TIMEOUTS.batchEvaluate,
    });

    const parsed = parseChatResponse(response);
    if (!parsed) {
      console.warn("[VisualEval] 无法解析响应");
      return null;
    }

    const evaluation = extractJSON(parsed.content);
    if (!evaluation) {
      console.warn("[VisualEval] 无法解析评估 JSON", {
        content: parsed.content.slice(0, 200),
      });
      return null;
    }

    const result: VisualEvaluation = {
      score: clampScore(evaluation.score),
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
      suggestions: evaluation.suggestions || [],
      shouldIterate:
        Boolean(evaluation.shouldIterate) && clampScore(evaluation.score) < 6,
      iterationFocus: evaluation.iterationFocus,
    };

    console.log("[VisualEval] 评估完成:", result);
    return result;
  };

  try {
    if (!isVisionAvailable()) {
      return await doEvaluate(null);
    }

    let imageBase64: string | null = null;
    try {
      imageBase64 = await captureCanvasForAI();
    } catch (captureErr: any) {
      markVisionUnavailable(captureErr?.message);
    }

    return await doEvaluate(imageBase64);
  } catch (error: any) {
    console.error("[VisualEval] 评估失败:", error);
    // 视觉失败 → 降级为纯文本评估
    if (isVisionRelatedError(error) || isVisionAvailable()) {
      markVisionUnavailable(error?.message);
      try {
        return await doEvaluate(null);
      } catch (fallbackErr) {
        console.error("[VisualEval] 文本评估也失败:", fallbackErr);
        return null;
      }
    }
    return null;
  }
}

// ============ 辅助 ============

function clampScore(score: any): number {
  const n = Number(score);
  return isNaN(n) ? 5 : Math.max(1, Math.min(10, Math.round(n)));
}
