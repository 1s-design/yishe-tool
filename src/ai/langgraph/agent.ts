import { reactive, ref, computed } from "vue";
import { aiChat } from "@/ai/api";
import { directChat } from "@/ai/direct-client";
import { DESIGN_TOOL_FEATURE_CODES } from "@/ai/feature-codes";
import {
  executeOperation,
  createDesignOperationContext,
} from "@/operations";
import {
  buildAITools,
  INTERACTION_TOOL_NAMES,
  resolveAIToolName,
} from "@/ai/shared/tools";
import { canvasStickerOptions } from "@/components/design/layout/canvas";
import type {
  AgentMessage,
  AgentState,
  AgentInteraction,
  AgentConfig,
  AgentEvent,
} from "./types";

// 是否使用前端直接调用（默认 true）
const USE_DIRECT_CALL = true;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getCanvasSummary() {
  const children = canvasStickerOptions.value.children;
  const mainCanvas = children[0];
  return {
    width: mainCanvas?.width || 500,
    height: mainCanvas?.height || 500,
    elementCount: children.length - 1,
    elements: children.slice(1).map((c: any) => ({
      id: c.id,
      type: c.type,
      content: c.content || c.text || "",
    })),
  };
}

function buildSystemPrompt(): string {
  const canvasState = getCanvasSummary();

  return `你是一个专业的设计协作助手，运行在一个设计工具内部。你可以帮用户创建和修改贴纸设计。

## 当前画布状态
${JSON.stringify(canvasState, null, 2)}

## 你的工作方式

1. **先观察**：了解当前画布有什么元素
2. **再决策**：根据用户需求决定做什么
3. **分步执行**：一次只调用一个工具
4. **及时反馈**：告诉用户你做了什么
5. **主动询问**：有疑问时用 ask_choice 问用户

## 交互工具

当需要用户做选择时，使用 ask_choice 工具：
- 问颜色选择
- 问布局偏好
- 问风格方向

当需要用户反馈时，使用 request_feedback 工具：
- 展示当前效果，询问是否满意

## 专业设计原则（必须遵守）

### 配色方案
**永远不要使用纯黑 #000000 或纯白 #ffffff 作为主色调！** 使用精心搭配的配色方案：

**经典配色组合：**
- 莫兰迪色系：#B8A9C9, #F7CAC9, #92A8D1, #F5E6CC
- 马卡龙色系：#FFB3BA, #BAFFC9, #BAE1FF, #FFFFBA
- 高级灰：#2C3E50, #34495E, #7F8C8D, #95A5A6
- 暖色调：#E74C3C, #E67E22, #F1C40F, #E91E63
- 冷色调：#3498DB, #2ECC71, #1ABC9C, #9B59B6

**背景与文字对比规则：**
- 深色背景（#1a1a2e, #16213e）配浅色文字（#ffffff, #f5f5f5）
- 浅色背景（#f8f9fa, #e9ecef）配深色文字（#212529, #343a40）

### 字号与层级
**字号规范：**
- 主标题：280-400px（醒目、大气）
- 副标题：160-220px
- 正文/说明：100-140px
- 小字/注释：60-80px

**层级关系：**
- 背景层：zIndex = 0
- 装饰元素：zIndex = 1-5
- 主文字：zIndex = 10-20
- 副文字：zIndex = 15-25

### 构图法则
**三分法构图：**
- 将画布分为 3x3 网格
- 主要元素放在交叉点（约 33% 或 66% 位置）
- 不要总是居中，适当偏移更有设计感

**留白原则：**
- 元素之间保持足够间距（至少 20px）
- 边缘留白：元素不要贴边，至少留 5% 边距

## 可用工具

### 画布操作
- canvas.getState - 获取画布状态
- canvas.setSize - 设置画布尺寸
- canvas.setSizeByPreset - 使用预设尺寸
- canvas.smartSize - 智能尺寸（根据产品描述）
- canvas.addChild - 添加元素（支持 30+ 种类型）
- canvas.removeChild - 删除元素
- canvas.setBackgroundColor - 设置背景色
- canvas.clear - 清空画布
- canvas.exportPng - 导出 PNG
- canvas.analyze - AI 视觉分析

### 元素样式
- element.setStyle - 设置位置、大小、旋转、透明度、层级
- element.setBackgroundColor - 设置元素背景色
- element.setBorder - 设置边框
- element.removeBorder - 移除边框
- element.setBorderRadius - 设置圆角
- element.setBorderRadiusEach - 分别设置四个角圆角
- element.setShadow - 设置阴影
- element.removeShadow - 移除阴影

### 文字操作
- element.setTextContent - 设置文字内容
- element.setTextColor - 设置文字颜色
- element.setTextFontSize - 设置字号
- element.setTextFontWeight - 设置字重（normal/bold/100-900）
- element.setTextAlign - 设置对齐（left/center/right/justify）
- element.setLineHeight - 设置行高
- element.setLetterSpacing - 设置字间距

### 图层管理
- element.bringToFront - 移到最前
- element.sendToBack - 移到最后
- element.bringForward - 上移一层
- element.sendBackward - 下移一层

### 元素操作
- element.duplicate - 复制元素
- element.flipHorizontal - 水平翻转
- element.flipVertical - 垂直翻转
- element.setLocked - 锁定/解锁元素
- element.setVisible - 显示/隐藏元素

### AI 工具
- canvas.analyze - AI 视觉分析设计效果
- canvas.createAndAnalyze - 创建设计并自动分析迭代
- canvas.quickTest - 快速测试设计

## 设计执行流程

1. **设置画布尺寸** — 优先用 canvas.smartSize 或 canvas.setSizeByPreset
2. **添加完整 HTML 作品** — 背景、装饰、主要文字、副文字都放在同一个 HTML 元素中
3. **完成即停** — 完整作品添加成功后不要继续重写，除非用户明确要求继续优化
4. **用户要求保存时** — 使用 canvas.updateAndSaveSticker 或 canvas.exportPng

## 视觉分析

当用户问"现在图是什么"、"分析一下设计"、"看看效果"时，使用 canvas.analyze 工具。
这个工具会截取当前画布并用 AI 视觉分析设计内容。

## 自测试与迭代

只有用户明确要求测试或多轮迭代优化时，才使用以下工具：

1. **canvas.quickTest** - 快速创建测试设计并截图，用于验证工具链是否正常
2. **canvas.createAndAnalyze** - 创建设计并自动分析效果，支持多轮迭代
   - description: 设计描述
   - style: 设计风格（auto/minimal/cartoon/vintage/trendy/elegant）
   - iterations: 迭代次数（1-5）

### 自测试流程

当用户要求"测试一下"、"迭代优化"时：
1. 使用 canvas.createAndAnalyze 创建并分析设计
2. 查看分析结果中的评分和建议
3. 根据建议询问用户是否继续优化
4. 不要自动多次重写设计

### 迭代优化策略

- 评分 7 分以上视为可交付，停止
- 评分低于 6 分时，只提出建议，等用户确认后再改
- 不要因轻微问题反复重写整体设计
`;
}

const interactionTools = [...INTERACTION_TOOL_NAMES];

// 全局响应式状态
const agentState = reactive<AgentState>({
  status: "idle",
  messages: [],
  pendingInteraction: null,
  error: null,
});

let waitForUserInputPromise: { resolve: (value: string) => void } | null = null;
const eventListeners: ((event: AgentEvent) => void)[] = [];

function emit(event: AgentEvent) {
  eventListeners.forEach((listener) => listener(event));
}

function addMessage(msg: Partial<AgentMessage>): AgentMessage {
  const message: AgentMessage = {
    id: generateId(),
    timestamp: Date.now(),
    ...msg,
  } as AgentMessage;
  agentState.messages.push(message);
  console.log("[Agent] Message added:", message);
  emit({ type: "message", data: message });
  return message;
}

async function runAgentLoop() {
  const maxIterations = 10;
  const ctx = createDesignOperationContext();

  const allTools = buildAITools();

  const messagesForLLM: any[] = [
    { role: "system", content: buildSystemPrompt() },
    ...agentState.messages
      .filter((m) => m.role !== "tool")
      .map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.tool_calls ? { tool_calls: m.tool_calls } : {}),
      })),
  ];

  for (let i = 0; i < maxIterations; i++) {
    console.log(`[Agent] Iteration ${i + 1}`);

    let response: any;

    if (USE_DIRECT_CALL) {
      // 前端直接调用大模型
      response = await directChat({
        messages: messagesForLLM,
        tools: allTools,
      });
    } else {
      // 通过服务端调用
      response = await aiChat({
        featureCode: DESIGN_TOOL_FEATURE_CODES.chat,
        messages: messagesForLLM,
        tools: allTools,
      });
    }

    console.log("[Agent] Raw response:", response);

    // 兼容多种返回格式
    let message: any = null;
    const res = response as any;

    // 格式1: { choices: [{ message: {...} }] }
    if (res?.choices?.[0]?.message) {
      message = res.choices[0].message;
    }
    // 格式2: { data: { choices: [{ message: {...} }] } }
    else if (res?.data?.choices?.[0]?.message) {
      message = res.data.choices[0].message;
    }
    // 格式3: { data: "string" } (纯文本)
    else if (typeof res?.data === "string") {
      message = { content: res.data };
    }
    // 格式4: response 本身就是 message
    else if (res?.content || res?.tool_calls) {
      message = res;
    }

    console.log("[Agent] Parsed message:", message);

    if (!message) {
      console.error("[Agent] No message in response, format:", response);
      break;
    }

    const content = message.content || "";
    const toolCalls = message.tool_calls || [];

    console.log("[Agent] Response:", { content, toolCalls });

    if (content || toolCalls.length > 0) {
      addMessage({
        role: "assistant",
        content,
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
      });
    }

    if (toolCalls.length === 0) {
      console.log("[Agent] No tool calls, ending loop");
      break;
    }

    agentState.status = "executing";

    for (const call of toolCalls) {
      const args =
        typeof call.function.arguments === "string"
          ? JSON.parse(call.function.arguments)
          : call.function.arguments;

      const toolName = resolveAIToolName(call.function.name);
      console.log("[Agent] Executing tool:", toolName, args);

      if (interactionTools.includes(call.function.name)) {
        agentState.status = "waiting_user";
        agentState.pendingInteraction = {
          type: call.function.name as any,
          question: args.question,
          options: args.options,
        };
        emit({
          type: "interaction",
          data: agentState.pendingInteraction,
        });

        const userResponse = await waitForUserInput();
        console.log("[Agent] User response:", userResponse);

        messagesForLLM.push(
          { role: "assistant" as const, content, tool_calls: toolCalls },
          { role: "user" as const, content: userResponse },
        );

        agentState.status = "thinking";
        agentState.pendingInteraction = null;

        continue;
      }

      const result = await executeOperation(toolName, args, ctx);
      console.log("[Agent] Tool result:", result);

      addMessage({
        role: "tool",
        tool_call_id: call.id,
        tool_name: toolName,
        content: JSON.stringify(result),
      });

      messagesForLLM.push(
        { role: "assistant" as const, content, tool_calls: toolCalls },
        {
          role: "user" as const,
          content: `[工具结果] ${toolName}: ${JSON.stringify(result)}`,
        },
      );
    }

    agentState.status = "thinking";
  }
}

function waitForUserInput(): Promise<string> {
  return new Promise((resolve) => {
    waitForUserInputPromise = { resolve };
  });
}

// 导出
export const designAgent = {
  state: agentState,

  isProcessing: computed(
    () => agentState.status === "thinking" || agentState.status === "executing",
  ),

  isWaitingForUser: computed(() => agentState.status === "waiting_user"),

  onEvent(listener: (event: AgentEvent) => void) {
    eventListeners.push(listener);
    return () => {
      const index = eventListeners.indexOf(listener);
      if (index > -1) eventListeners.splice(index, 1);
    };
  },

  async chat(userMessage: string): Promise<void> {
    if (agentState.status !== "idle") {
      console.warn("Agent is busy");
      return;
    }

    addMessage({ role: "user", content: userMessage });
    agentState.status = "thinking";
    agentState.error = null;

    try {
      await runAgentLoop();
    } catch (error: any) {
      console.error("Agent error:", error);
      agentState.error = error.message || "未知错误";
      addMessage({
        role: "assistant",
        content: `抱歉，出了点问题：${error.message}`,
      });
    } finally {
      agentState.status = "idle";
      emit({ type: "done", data: null });
    }
  },

  submitUserResponse(response: string) {
    if (waitForUserInputPromise) {
      waitForUserInputPromise.resolve(response);
      waitForUserInputPromise = null;
    }
  },

  clearMessages() {
    agentState.messages.length = 0;
    agentState.error = null;
    agentState.pendingInteraction = null;
    agentState.status = "idle";
  },
};
