import { io } from "socket.io-client";

const RAW_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiYWNjb3VudCI6ImphY2tpZSIsInRlcm1pbmFsVHlwZSI6ImFkbWluIiwidG9rZW5JZCI6IjhiOWM0MDlmLWUyYWMtNDU3Mi1iMTA4LTEyZTE3MTQ3NjIxZCIsImlhdCI6MTc5MTEzMDY1MCwiZXhwIjoyMTA2NzA2NjUwfQ.Ebae-frV7NN98CT48hYHTLkn8ct7Efpc_5KAL9zLop8";
const SERVER_URL = "http://localhost:1520";
const CONNECTION_ID = "designtool-mvrjhjc5-txsuzt";

const CASES = [
  {
    num: 3,
    category: "3. 尺寸控制与长幅复合设计",
    name: "设置 900x400 长幅桌垫并进行复杂构图",
    prompt: "请先把画布尺寸设置为 900x400，然后制作一张'牛气冲天'的经典红盘桌垫设计，要求满幅纯红皮纹背景、顶部上升趋势箭头、中央特大榜书大字、两翼有印章装饰，并保存到自定义贴纸。",
    reset: true
  },
  {
    num: 4,
    category: "4. 增量修改与二次迭代",
    name: "在现有设计上微调颜色与装饰，完成迭代",
    prompt: "请不要清空当前画布，在现有桌垫设计的基础上，将主文字添加更强烈的金色立体投影，并在底部增加一行小字'只做对的交易 · 胜负交给概率'，然后再次保存到自定义贴纸。",
    reset: false
  },
  {
    num: 5,
    category: "5. 画布视觉分析与质量检验",
    name: "触发 AI 视觉分析检查当前设计成果",
    prompt: "请调用 canvas.analyze 对当前画布进行视觉分析和设计评估，描述画面中的色彩搭配、排版重心与视觉效果，指出是否有文字溢出问题，不要修改画布，不要调用保存。",
    reset: false
  }
];

function sendCommand(type, payload) {
  return fetch(`${SERVER_URL}/api/websocket/remote-command`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RAW_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      connectionId: CONNECTION_ID,
      command: {
        type,
        payload: {
          executionMode: "automatic",
          ...payload,
        },
        requestId: `case-run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      },
    }),
  }).then((r) => r.json());
}

async function run() {
  const socket = io("ws://localhost:1520/ws", {
    transports: ["websocket"],
    auth: { token: RAW_TOKEN },
    query: { clientSource: "管理后台", clientId: "inspect-" + Date.now() },
  });

  await new Promise((resolve) => socket.on("connect", resolve));
  console.log("WebSocket connected. Running Cases 3, 4, 5...\n");

  for (const tc of CASES) {
    console.log(`================================================================`);
    console.log(`📋 [用例 ${tc.num}/5] ${tc.name}`);
    console.log(`💬 指令: ${tc.prompt}`);
    console.log(`================================================================`);

    const startTime = Date.now();
    const resultPromise = new Promise((resolve) => {
      const handler = (data) => {
        if (data?.phase === "completed" || data?.phase === "rejected" || data?.phase === "cancelled") {
          socket.off("remote-result", handler);
          resolve(data);
        }
      };
      socket.on("remote-result", handler);
      setTimeout(() => {
        socket.off("remote-result", handler);
        resolve({ phase: "timeout", error: "超时 (300s)" });
      }, 300000);
    });

    await sendCommand("chat", {
      message: tc.prompt,
      resetConversation: tc.reset,
    });

    console.log(`⚡ 内部 Agent 正在处理中...`);
    const completed = await resultPromise;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`🏁 结果: ${completed?.phase === "completed" ? "✅ 成功" : "❌ 未达成 (" + completed?.phase + ")"}`);
    console.log(`⏱️ 耗时: ${elapsed}s | 🔧 工具调用: ${completed?.toolCallsCount || 0} 次`);
    if (completed?.outputs?.length) {
      console.log(`📦 产出:`);
      completed.outputs.forEach(o => console.log(`   ↳ [${o.type}] ${o.name} (URL: ${o.url})`));
    }
    if (completed?.agentResponse) {
      console.log(`💬 回复: ${completed.agentResponse.slice(0, 150)}...\n`);
    }

    await new Promise(r => setTimeout(r, 3000));
  }

  socket.disconnect();
  console.log("全部执行完成！");
}

run().catch(console.error);
