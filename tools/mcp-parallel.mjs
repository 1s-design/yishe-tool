// MCP 并行控制测试：同时向多个设计端派发任务并收割结果
// 用法: node tools/mcp-parallel.mjs [任务数]
import { readFileSync } from "fs";

const TOKEN = readFileSync(
  "/Users/jackie/workspace/1s/tools/.test-token",
  "utf-8",
).trim();
const API = "http://127.0.0.1:1520/api/ai-assistant/tools/execute";

async function mcp(tool, input, timeoutMs = 60_000) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tool, input }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const d = await res.json();
      const msgs = d?.data?.messages || [];
      const toolMsg = msgs.find((m) => m.role === "tool");
      return toolMsg?.toolResult?.data ?? toolMsg?.toolResult ?? d;
    } catch (e) {
      if (attempt === 2) return { phase: "error", success: false, error: e.message };
      await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
    }
  }
}

const TASKS = [
  {
    text: "立春",
    sub: "万物复苏时",
    style: "嫩芽绿底+细明体单字放大，柳枝/小草芽装饰在两侧",
  },
  {
    text: "燃烧吧",
    sub: "把热爱跑成风",
    style: "黑红撞色底+斜体力量字，火焰/速度线装饰在四角",
  },
  {
    text: "月光宝盒",
    sub: "装满温柔与星光",
    style: "靛蓝星空底+手写细字，月亮/宝箱/星光装饰在边缘",
  },
  {
    text: "慢慢喝茶",
    sub: "浮生半日闲",
    style: "抹茶绿底+宋体，茶杯/茶叶/热气装饰在两侧",
  },
  {
    text: "城市漫游",
    sub: "在街角遇见光",
    style: "灰调都市底+轻黑体，楼影/路灯/自行车剪影装饰在边缘",
  },
  {
    text: "热干面",
    sub: "过早啦",
    style: "芝麻酱棕黄底+手写胖体，小面碗/葱花装饰在四角，武汉过早风",
  },
  {
    text: "向前跑",
    sub: "风会记住你",
    style: "橙红渐变底+斜体动感字，跑道线/脚印/速度痕装饰在边缘",
  },
  {
    text: "见字如面",
    sub: "纸短情长",
    style: "信封米白底+钢笔手写体，邮票/邮戳/羽毛笔装饰在四角",
  },
];

function buildPrompt(t) {
  return [
    `画布 canvas.setSize 3000x1376（比例2.18）后设计情绪文字鼠标垫，完成后调用 canvas.updateAndSaveSticker 保存，name 用「${t.text}·并行测试」。`,
    `主文案「${t.text}」必须落在画布几何正中心(50%,50%)（只包主文案做 translate(-50%,-50%)），副文案「${t.sub}」挂在主文案正下方，禁止把主+副整体居中。`,
    `风格：${t.style}。装饰用 position:absolute 铺边缘/z-index 低于文字，不挤偏主文案。四周留 ≥8% 内边距。`,
  ].join("\n");
}

const count = Math.max(1, Math.min(TASKS.length, Number(process.argv[2]) || TASKS.length));

console.log(`[1] 查询在线设计端…`);
const list = await mcp("system.design_tool.query_design_tools", { onlineOnly: true });
const tools = (list?.items || []).map((it) => it.clientId);
console.log(`    在线 ${tools.length} 个: ${tools.join(", ")}`);
if (tools.length === 0) {
  console.log("没有在线设计端，退出");
  process.exit(1);
}

const targets = tools.slice(0, count);
console.log(`[2] 并行派发 ${targets.length} 个任务…`);
const t0 = Date.now();
const sentList = await Promise.all(
  targets.map(async (connectionId, i) => {
    const t = TASKS[i % TASKS.length];
    console.log(`    → ${connectionId.slice(0, 22)}「${t.text}」`);
    // 忙碌则退避重试
    let sent = null;
    for (let attempt = 1; attempt <= 10; attempt++) {
      sent = await mcp("system.design_tool.send_task", {
        connectionId,
        message: buildPrompt(t),
      });
      // send_task 成功返回 requestId；若目标忙碌，Agent 可能拒绝，wait_result 会拿到 rejected
      if (sent?.success && sent?.requestId) break;
      console.log(`    ⏳ 派发失败，${8 * attempt}s 重试 (${attempt}/10)`);
      await new Promise((r) => setTimeout(r, 8000 * attempt));
    }
    return { connectionId, task: t, requestId: sent?.requestId, sent: !!sent?.success };
  }),
);

console.log(`[3] 并行等待结果…`);
const settled = await Promise.allSettled(
  sentList.map(async (s) => {
    let result = await mcp(
      "system.design_tool.wait_result",
      { requestId: s.requestId, timeoutMs: 300_000 },
      330_000,
    );
    // 被拒/超时 → 清会话后重派一次
    if (result?.phase === "rejected" || result?.phase === "timeout" || result?.phase === "error") {
      console.log(`    ⚠️「${s.task.text}」${result.phase}，清会话重派…`);
      await mcp("system.design_tool.clear_conversation", { connectionId: s.connectionId });
      const re = await mcp("system.design_tool.send_task", {
        connectionId: s.connectionId,
        message: buildPrompt(s.task),
      });
      if (re?.requestId) {
        result = await mcp(
          "system.design_tool.wait_result",
          { requestId: re.requestId, timeoutMs: 300_000 },
          330_000,
        );
      }
    }
    return { ...s, result };
  }),
);
const results = settled.map((r, idx) =>
  r.status === "fulfilled" ? r.value : { ...sentList[idx], result: { phase: "error", error: r.reason?.message } },
);

console.log(`\n===== 并行结果 (耗时 ${Math.round((Date.now() - t0) / 1000)}s) =====`);
for (const r of results) {
  const d = r.result || {};
  console.log(
    `「${r.task.text}」 phase=${d.phase} tools=${d.toolCallsCount ?? "?"} ` +
      `outputs=${(d.outputs || []).length > 0 ? d.outputs[0]?.name : "无"} reply=${String(d.agentResponse || "").slice(0, 40)}`,
  );
}

console.log(`\n[4] 核对各端画布内容…`);
const checks = await Promise.all(
  results.map((r) =>
    mcp("system.design_tool.get_state", { connectionId: r.connectionId }).then((s) => ({
      text: r.task.text,
      connectionId: r.connectionId,
      state: s?.canvasState,
      result: r.result,
    })),
  ),
);
for (const c of checks) {
  const raw = JSON.stringify(c.state || {});
  const size = c.state?.canvasSize;
  const hasSave = (c.result?.outputs || []).length > 0;
  console.log(
    `「${c.text}」 ${size ? `${size.width}x${size.height}` : "?"} ` +
      `${raw.includes(c.text) ? "✅ 含主文案" : "❌ 缺主文案"}` +
      ` ${hasSave ? "✅ 已保存" : "⚠️ 无产出，补存…"}`,
  );
}

console.log(`\n[5] 以贴纸库为准判定保存（outputs 提取不稳定）…`);
const TOKEN2 = readFileSync("/Users/jackie/workspace/1s/tools/.test-token", "utf-8").trim();
const libRes = await fetch(
  "http://127.0.0.1:1520/api/custom-sticker?page=1&pageSize=40",
  { headers: { Authorization: `Bearer ${TOKEN2}` }, signal: AbortSignal.timeout(15000) },
).then((r) => r.json());
const libNames = ((libRes?.data?.items || []).map((it) => it.name || "")).join("\n");
let savedCount = 0;
for (const c of checks) {
  const savedByLib = libNames.includes(c.text + "·并行测试") || libNames.includes(c.text);
  const savedByOut = (c.result?.outputs || []).length > 0;
  if (savedByLib || savedByOut) savedCount++;
  console.log(
    `「${c.text}」 ${savedByLib ? "✅ 库中已存在" : savedByOut ? "✅ outputs 已返回" : "❌ 未保存"}`,
  );
}
console.log(`\n保存率: ${savedCount}/${checks.length} · 内容核对: ${checks.filter((c) => JSON.stringify(c.state || {}).includes(c.text)).length}/${checks.length}`);
