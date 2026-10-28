/**
 * 内部 Agent 全功能综合测试套件
 * 
 * 覆盖全流程：
 * 1. 灵感联动测试 (Inspiration Retrieval & Adaptation)
 * 2. 外部资源调用 (Font Search & Resource Binding)
 * 3. 尺寸控制与满幅排版 (Canvas Size & Full-Bleed Artwork)
 * 4. 增量修改与设计迭代 (Iterative Design Modification)
 * 5. 质量审查、交付与导出 (Canvas Analysis & Delivery)
 */

import { io } from "socket.io-client";
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiYWNjb3VudCI6ImphY2tpZSIsInRlcm1pbmFsVHlwZSI6ImFkbWluIiwidG9rZW5JZCI6IjhiOWM0MDlmLWUyYWMtNDU3Mi1iMTA4LTEyZTE3MTQ3NjIxZCIsImlhdCI6MTc5MTEzMDY1MCwiZXhwIjoyMTA2NzA2NjUwfQ.Ebae-frV7NN98CT48hYHTLkn8ct7Efpc_5KAL9zLop8";
const RAW_TOKEN = TOKEN.replace("Bearer ", "");
const SERVER_URL = "http://localhost:1520";

const TEST_CASES = [
  {
    category: "1. 灵感检索与自主创作",
    name: "从灵感库中搜寻灵感并制作满幅贴纸",
    prompt: "请从设计灵感库中搜索关于'知行合一'或'大器晚成'的灵感，参考其主题，设计一张满幅（无透明外边框）的国潮书法贴纸，要求包含大气书法主文字、朱砂印章、深色背景，并保存到自定义贴纸。",
    expectTool: ["canvas.addHtml", "canvas.updateAndSaveSticker"]
  },
  {
    category: "2. 字体资源与图层构建",
    name: "搜索真实书法字体并完成定制排版",
    prompt: "请搜索一款书法字体，用它设计一张主题为'紫气东来'的吉祥贴纸，皇家紫金配色，要求满幅填充（无透明外边框），包含顶部祥云、中央大字、底部金句，并保存到自定义贴纸。",
    expectTool: ["resource.searchFont", "canvas.addHtml", "canvas.updateAndSaveSticker"]
  },
  {
    category: "3. 尺寸控制与长幅复合设计",
    name: "设置 900x400 长幅桌垫并进行复杂构图",
    prompt: "请先把画布尺寸设置为 900x400，然后制作一张'牛气冲天'的经典红盘桌垫设计，要求满幅纯红皮纹背景、顶部上升趋势箭头、中央特大榜书大字、两翼有印章装饰，并保存到自定义贴纸。",
    expectTool: ["canvas.setSize", "canvas.addHtml", "canvas.updateAndSaveSticker"]
  },
  {
    category: "4. 增量修改与二次迭代",
    name: "在现有设计上微调颜色与装饰，完成迭代",
    prompt: "请不要清空当前画布，在现有桌垫设计的基础上，将主文字添加更强烈的金色立体投影，并在底部增加一行小字'只做对的交易 · 胜负交给概率'，然后再次保存。",
    resetConversation: false,
    expectTool: ["canvas.addHtml", "canvas.updateAndSaveSticker"]
  },
  {
    category: "5. 画布视觉分析与质量检验",
    name: "触发 AI 视觉分析检查当前设计成果",
    prompt: "请对当前画布进行视觉分析和设计评估，描述画面中的色彩搭配、排版重心与视觉效果，指出是否有文字溢出问题，不要修改画布，不要调用保存。",
    resetConversation: false,
    expectTool: ["canvas.analyze"]
  }
];

async function findDesignToolId() {
  const data = await fetch(`${SERVER_URL}/api/websocket/connections`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RAW_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  }).then(r => r.json());

  const conns = data?.data || [];
  const tool = conns.find(
    (c) =>
      String(c.id).startsWith("designtool-") ||
      c.query?.clientSource === "设计端" ||
      c.query?.clientSource === "设计工具"
  );
  return tool?.id || null;
}

function sendCommand(connectionId, type, payload) {
  return fetch(`${SERVER_URL}/api/websocket/remote-command`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RAW_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      connectionId,
      command: {
        type,
        payload: {
          executionMode: "automatic",
          resetConversation: true,
          ...payload,
        },
        requestId: `internal-agent-test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      },
    }),
  }).then((r) => r.json());
}

async function runInternalAgentTests() {
  console.log("================================================================");
  console.log("🤖 启动【1s 内部 Agent】全功能端到端综合测试");
  console.log("================================================================\n");

  const toolId = await findDesignToolId();
  if (!toolId) {
    console.error("❌ 未找到在线的 1s 设计工具客户端");
    process.exit(1);
  }
  console.log(`🎯 目标 1s 设计端实例: ${toolId}\n`);

  // 连接 WebSocket
  const socket = io(SERVER_URL.replace(/^http/, "ws") + "/ws", {
    transports: ["websocket"],
    auth: { token: RAW_TOKEN },
    query: { clientSource: "管理后台", clientId: `internal-test-${Date.now()}` },
  });

  await new Promise((resolve) => socket.on("connect", resolve));
  console.log("✅ 管理后台 WebSocket 监控已就绪\n");

  const results = [];

  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i];
    console.log(`----------------------------------------------------------------`);
    console.log(`📋 [测试用例 ${i + 1}/${TEST_CASES.length}] 【${tc.category}】`);
    console.log(`📌 名称: ${tc.name}`);
    console.log(`💬 指令输入: ${tc.prompt}`);
    console.log(`----------------------------------------------------------------`);

    const startTime = Date.now();

    // 监听内部 Agent 的执行结果
    const resultPromise = new Promise((resolve) => {
      const handler = (data) => {
        if (data?.phase === "completed" || data?.phase === "rejected" || data?.phase === "cancelled") {
          socket.off("remote-result", handler);
          resolve(data);
        }
      };
      socket.on("remote-result", handler);
      // 5 分钟超时
      setTimeout(() => {
        socket.off("remote-result", handler);
        resolve({ phase: "timeout", error: "测试超时 (300s)" });
      }, 300000);
    });

    // 发送指令给内部 Agent 执行
    const sendResult = await sendCommand(toolId, "chat", {
      message: tc.prompt,
      resetConversation: tc.resetConversation ?? true,
    });

    if (!sendResult?.data?.success) {
      console.log(`❌ 指令派发失败:`, sendResult);
      results.push({ ...tc, success: false, error: "指令派发失败" });
      continue;
    }

    console.log(`⚡ 内部 Agent 已接收任务，正在浏览器前台自主思考与调用工具...`);

    const completed = await resultPromise;
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

    const isSuccess = completed?.phase === "completed" && completed?.success === true;
    const toolCount = completed?.toolCallsCount || 0;
    const outputs = completed?.outputs || [];
    const agentReply = completed?.agentResponse || completed?.message || "";

    console.log(`\n🏁 执行结论: ${isSuccess ? "✅ 成功 (PASSED)" : "❌ 未完全达成"}`);
    console.log(`⏱️ 耗时: ${elapsedSec}s | 🔧 内部工具调用: ${toolCount} 次`);
    if (outputs.length) {
      console.log(`📦 产出结果:`);
      outputs.forEach(o => console.log(`   ↳ [${o.type}] ${o.name || "未命名"} (URL: ${o.url || '已在画布呈现'})`));
    }
    if (agentReply) {
      console.log(`🤖 内部 Agent 回复:\n   ${agentReply.replace(/\n/g, "\n   ")}\n`);
    }

    results.push({
      caseName: tc.name,
      category: tc.category,
      success: isSuccess,
      elapsedSec,
      toolCount,
      outputsCount: outputs.length,
      replySnippet: agentReply.slice(0, 150)
    });

    if (i < TEST_CASES.length - 1) {
      console.log(`⏳ 冷却 4 秒进入下一项内部功能测试...\n`);
      await new Promise(r => setTimeout(r, 4000));
    }
  }

  socket.disconnect();

  console.log("\n================================================================");
  console.log("📊 【1s 内部 Agent】全套功能测试总结");
  console.log("================================================================");
  results.forEach((r, idx) => {
    console.log(`${r.success ? "✅" : "❌"} [${idx + 1}] ${r.category} - ${r.caseName} (${r.elapsedSec}s, ${r.toolCount}次工具调用)`);
  });
  const passedCount = results.filter(r => r.success).length;
  console.log(`\n🎯 测试结果汇总: ${passedCount}/${results.length} 项通过 (${((passedCount / results.length) * 100).toFixed(0)}%)`);
  console.log("================================================================\n");
}

runInternalAgentTests().catch(console.error);
