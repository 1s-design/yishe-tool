/**
 * Agent 自动化测试脚本 — 通过 design-server WebSocket 远程操控设计工具
 * 
 * 用法:
 *   node tools/agent-auto-test.mjs
 *   node tools/agent-auto-test.mjs --prompt "画一张猫咪贴纸"
 *   node tools/agent-auto-test.mjs --suite smoke
 */

import { io } from "socket.io-client";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = readFileSync(join(__dirname, ".test-token"), "utf-8").trim();
const SERVER_URL = "http://localhost:1520";
const DESIGN_TOOL_ID = process.env.DESIGN_TOOL_ID || "";

// ── 测试用例集 ──
const TEST_SUITES = {
  smoke: [
    {
      name: "Agent 基础响应",
      prompt: "请回复一句：Agent 测试通过。不要修改画布，不要调用任何工具。",
      expect: { toolCallsMax: 0 },
    },
  ],
  basic: [
    {
      name: "简单文本设计",
      prompt: "在画布上添加一段文字：你好世界，字号 48px，颜色为蓝色。不要调用保存工具。",
      expect: { toolCallsMin: 1 },
    },
    {
      name: "背景色设置",
      prompt: "把画布背景设为淡黄色 (#FFF9C4)。不要调用保存工具。",
      expect: { toolCallsMin: 1 },
    },
  ],
  design: [
    {
      name: "简单贴纸设计",
      prompt: "设计一张简单的红色爱心贴纸，白色背景。不要调用保存工具。",
      expect: { toolCallsMin: 1 },
    },
    {
      name: "文字贴纸设计",
      prompt: "设计一张写有'加油'两个字的励志贴纸，使用金色渐变文字，深色背景。不要调用保存工具。",
      expect: { toolCallsMin: 1 },
    },
    {
      name: "组合设计",
      prompt: "创建一个产品展示图：左侧放一个圆形头像占位，右侧写产品名称'智能手表'和价格'¥299'。不要调用保存工具。",
      expect: { toolCallsMin: 2 },
    },
    {
      name: "复杂布局设计",
      prompt: "设计一个活动海报：顶部写'2026 新春盛典'，中间放一个大圆形装饰，底部写时间地点。红金配色。不要调用保存工具。",
      expect: { toolCallsMin: 1 },
    },
    {
      name: "图表创建",
      prompt: "创建一个简单的柱状图，展示三款产品的销量对比：A款 120，B款 200，C款 80。不要调用保存工具。",
      expect: { toolCallsMin: 1 },
    },
    {
      name: "修改现有设计",
      prompt: "把画布上的文字改成绿色。不要调用保存工具。",
      expect: { toolCallsMin: 1 },
    },
    {
      name: "多步骤设计",
      prompt: "设计一张生日贺卡：顶部写'生日快乐'，中间画一个蛋糕图标，底部写'祝你天天开心'。粉色温馨风格。不要调用保存工具。",
      expect: { toolCallsMin: 1 },
    },
    {
      name: "尺寸设置+设计",
      prompt: "先把画布设为 800x1200，然后设计一张竖版手机壁纸，主题是星空。不要调用保存工具。",
      expect: { toolCallsMin: 2 },
    },
  ],

  // 资源使用能力测试
  resources: [
    {
      name: "图库素材使用",
      prompt: "从素材库搜索一张猫咪图片，放在画布中央，配上文字'可爱猫咪'。不要调用保存工具。",
      expect: { toolCallsMin: 2 },
    },
    {
      name: "字体资源使用",
      prompt: "搜索一款适合标题的书法字体，用它在画布上写'墨韵'两个字，黑色大字。不要调用保存工具。",
      expect: { toolCallsMin: 2 },
    },
    {
      name: "自定义贴纸相似款",
      prompt: "搜索我的自定义贴纸，找一款参考它的风格，制作一个类似但不同的设计。不要调用保存工具。",
      expect: { toolCallsMin: 2 },
    },
    {
      name: "短文案搜索",
      prompt: "搜索一句适合春天的短文案，写在画布上，配浅绿色背景。不要调用保存工具。",
      expect: { toolCallsMin: 2 },
    },
    {
      name: "贴纸素材搜索",
      prompt: "搜索一张花朵贴纸素材，装饰在画布角落，配上'春暖花开'文字。不要调用保存工具。",
      expect: { toolCallsMin: 2 },
    },
  ],

  // 创作实战测试（含保存）
  create: [
    {
      name: "书法字体春联",
      prompt: "搜索一款书法字体，用它设计一副春联风格的贴纸，上联「春风得意」，下联「万事如意」，红色背景金色文字。保存到自定义贴纸。",
      expect: { toolCallsMin: 2 },
    },
    {
      name: "猫咪图片贴纸",
      prompt: "搜索一张可爱猫咪的图片素材，放在画布上，配上文字「喵星人」，做一个萌系贴纸。保存到自定义贴纸。",
      expect: { toolCallsMin: 2 },
    },
    {
      name: "渐变励志海报",
      prompt: "设计一张渐变色海报，主题「追梦少年」，使用蓝紫色渐变背景，白色大字，底部加一句励志短句。保存到自定义贴纸。",
      expect: { toolCallsMin: 2 },
    },
    {
      name: "产品促销标签",
      prompt: "设计一个促销标签贴纸：圆形红色底，写「限时特惠 5折」，黄色大字，边缘白色描边。保存到自定义贴纸。",
      expect: { toolCallsMin: 2 },
    },
    {
      name: "手写风格贺卡",
      prompt: "搜索一款手写风格字体，设计一张生日贺卡：写「Happy Birthday」，配蛋糕图标，粉色温馨背景。保存到自定义贴纸。",
      expect: { toolCallsMin: 2 },
    },
    {
      name: "头像+文字名片",
      prompt: "设计一张简约名片贴纸：左侧圆形头像占位，右侧写「产品经理 · 张明」，下方写联系方式占位，灰白极简风。保存到自定义贴纸。",
      expect: { toolCallsMin: 2 },
    },
    {
      name: "古风诗词贴纸",
      prompt: "搜索一款古风字体，设计一张诗词贴纸：写「明月几时有」竖排大字，水墨背景，古典韵味。保存到自定义贴纸。",
      expect: { toolCallsMin: 2 },
    },
    {
      name: "波普风贴纸",
      prompt: "设计一张波普艺术风格贴纸：大胆的红黄蓝色块，写「POP!」粗体大字，漫画感描边。保存到自定义贴纸。",
      expect: { toolCallsMin: 2 },
    },
    {
      name: "手绘涂鸦贴纸",
      prompt: "设计一张手绘涂鸦风格贴纸：不规则边框，写「Stay Weird」，搭配星星和闪电涂鸦元素，黑白手绘风。保存到自定义贴纸。",
      expect: { toolCallsMin: 2 },
    },
    {
      name: "美食推荐标签",
      prompt: "设计一张美食推荐标签：暖色调背景，写「好吃到哭」，配一个冰淇淋图标，可爱圆润字体。保存到自定义贴纸。",
      expect: { toolCallsMin: 2 },
    },
    {
      name: "科技感Banner",
      prompt: "设计一张科技感 Banner 贴纸：深蓝渐变背景，霓虹光线效果，写「AI FUTURE」英文大标题，配几何线条装饰。保存到自定义贴纸。",
      expect: { toolCallsMin: 2 },
    },
    {
      name: "水彩花卉贴纸",
      prompt: "搜索一张花卉水彩图片素材，设计一张优雅的花卉贴纸，配上「花开富贵」四个字，浅色背景。保存到自定义贴纸。",
      expect: { toolCallsMin: 2 },
    },
  ],

  // 交付能力测试
  delivery: [
    {
      name: "保存贴纸",
      prompt: "设计一张简单的蓝色圆形贴纸，上面写'OK'，然后保存到自定义贴纸。",
      expect: { toolCallsMin: 2 },
    },
    {
      name: "导出PNG",
      prompt: "在画布上写'测试导出'四个大字，然后导出为 PNG。",
      expect: { toolCallsMin: 2 },
    },
    {
      name: "保存+分析",
      prompt: "设计一张简单的绿色横条标语'绿色环保'，保存后分析一下设计效果。",
      expect: { toolCallsMin: 2 },
    },
  ],
};

// ── 命令行参数 ──
const args = process.argv.slice(2);
function getArg(name, fallback) {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
}
const SUITE = getArg("suite", "smoke");
const SINGLE_PROMPT = getArg("prompt", "");

// ── 工具函数 ──
function findDesignToolId() {
  return fetch(`${SERVER_URL}/api/websocket/connections`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  })
    .then((r) => r.json())
    .then((data) => {
      const conns = data?.data || [];
      const tool = conns.find(
        (c) =>
          String(c.id).startsWith("designtool-") ||
          c.query?.clientSource === "设计端" ||
          c.query?.clientSource === "设计工具"
      );
      return tool?.id || null;
    });
}

function sendCommand(connectionId, type, payload) {
  return fetch(`${SERVER_URL}/api/websocket/remote-command`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      connectionId,
      command: {
        type,
        payload,
        requestId: `mimo-test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      },
    }),
  }).then((r) => r.json());
}

// ── 主测试流程 ──
async function runTests() {
  // 1. 找到设计工具
  const toolId = DESIGN_TOOL_ID || (await findDesignToolId());
  if (!toolId) {
    console.error("❌ 未找到在线的设计工具");
    process.exit(1);
  }
  console.log(`🎯 设计工具: ${toolId}\n`);

  // 2. 建立管理后台 WebSocket 监听
  const socket = io(SERVER_URL.replace(/^http/, "ws") + "/ws", {
    transports: ["websocket"],
    auth: { token: TOKEN },
    query: { clientSource: "管理后台", clientId: `mimo-auto-test-${Date.now()}` },
  });

  await new Promise((resolve) => socket.on("connect", resolve));
  console.log("✅ 管理后台 WebSocket 已连接\n");

  // 3. 准备测试用例
  let cases;
  if (SINGLE_PROMPT) {
    cases = [{ name: "自定义提示词", prompt: SINGLE_PROMPT, expect: {} }];
  } else {
    cases = TEST_SUITES[SUITE] || TEST_SUITES.smoke;
  }

  // 4. 依次执行测试
  const results = [];
  for (let i = 0; i < cases.length; i++) {
    const testCase = cases[i];
    console.log(`━━━ [${i + 1}/${cases.length}] ${testCase.name} ━━━`);
    console.log(`📝 提示词: ${testCase.prompt.slice(0, 80)}...`);

    const startTime = Date.now();
    let completedResult = null;

    // 监听 remote-result
    const resultPromise = new Promise((resolve) => {
      const handler = (data) => {
        if (data?.phase === "completed" || data?.phase === "rejected" || data?.phase === "cancelled") {
          socket.off("remote-result", handler);
          resolve(data);
        }
      };
      socket.on("remote-result", handler);
      // 超时（交付测试需要更长时间）
      const timeoutMs = 300000; // 5 分钟统一超时
      setTimeout(() => {
        socket.off("remote-result", handler);
        resolve({ phase: "timeout", error: `测试超时 (${timeoutMs / 1000}s)` });
      }, timeoutMs);
    });

    // 发送命令
    const sendResult = await sendCommand(toolId, "chat", {
      message: testCase.prompt,
      executionMode: "manual",
    });

    if (!sendResult?.data?.success) {
      console.log(`❌ 发送失败: ${JSON.stringify(sendResult).slice(0, 200)}`);
      results.push({ ...testCase, success: false, error: "发送失败", elapsedMs: 0 });
      continue;
    }

    // 等待结果
    completedResult = await resultPromise;
    const elapsedMs = Date.now() - startTime;

    // 分析结果
    const success = completedResult?.success === true && completedResult?.phase === "completed";
    const toolCalls = completedResult?.toolCallsCount ?? 0;
    const outputs = completedResult?.outputs ?? [];
    const agentResponse = completedResult?.agentResponse || completedResult?.error || "";

    console.log(`  ${success ? "✅" : "❌"} 结果: ${completedResult?.phase || "unknown"}`);
    console.log(`  ⏱️  耗时: ${(elapsedMs / 1000).toFixed(1)}s`);
    console.log(`  🔧 工具调用: ${toolCalls} 次`);
    if (outputs.length) {
      console.log(`  📦 产出: ${outputs.length} 个`);
      outputs.forEach((o) => console.log(`     - ${o.type}: ${o.name || "unnamed"}`));
    }
    if (agentResponse) {
      console.log(`  💬 回复: ${agentResponse.slice(0, 100)}`);
    }

    // 验证期望
    const issues = [];
    if (testCase.expect?.toolCallsMin !== undefined && toolCalls < testCase.expect.toolCallsMin) {
      issues.push(`工具调用不足: ${toolCalls} < ${testCase.expect.toolCallsMin}`);
    }
    if (testCase.expect?.toolCallsMax !== undefined && toolCalls > testCase.expect.toolCallsMax) {
      issues.push(`工具调用过多: ${toolCalls} > ${testCase.expect.toolCallsMax}`);
    }

    results.push({
      ...testCase,
      success,
      elapsedMs,
      toolCalls,
      outputs: outputs.length,
      agentResponse: agentResponse.slice(0, 200),
      phase: completedResult?.phase,
      issues,
    });

    // 测试间隔，等 Agent 空闲
    if (i < cases.length - 1) {
      console.log(`  ⏳ 等待 Agent 空闲...`);
      await new Promise((r) => setTimeout(r, 5000));
    }
    console.log();
  }

  // 5. 生成报告
  const passed = results.filter((r) => r.success && r.issues.length === 0).length;
  const failed = results.filter((r) => !r.success || r.issues.length > 0).length;

  const report = {
    timestamp: new Date().toISOString(),
    suite: SINGLE_PROMPT ? "custom" : SUITE,
    designToolId: toolId,
    summary: { total: results.length, passed, failed },
    results,
  };

  const reportDir = join(__dirname, "..", "test-reports");
  mkdirSync(reportDir, { recursive: true });
  const reportFile = join(reportDir, `agent-test-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(reportFile, JSON.stringify(report, null, 2));

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📊 测试完成: ${passed} 通过 / ${failed} 失败 / ${results.length} 总计`);
  console.log(`📄 报告: ${reportFile}`);

  socket.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("❌ 测试异常:", err);
  process.exit(1);
});
