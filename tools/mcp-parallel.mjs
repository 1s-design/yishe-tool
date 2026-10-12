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
    text: "Stay hungry. Stay foolish.",
    sub: "求知若饥，虚心若愚 — 乔布斯",
    style: "情绪：求知、不羁。黑白极简排版，大号英文+小号中文注脚，细线框装饰边缘",
  },
  {
    text: "念念不忘，必有回响",
    sub: "— 李叔同",
    style: "情绪：信念、回响。宣纸米底+行楷，涟漪/回音波纹装饰四角",
  },
  {
    text: "凡是过往，皆为序章",
    sub: "— 莎士比亚",
    style: "情绪：重启、旷达。淡青底+细衬线中英混排，翻页/浪花纹装饰边缘",
  },
  {
    text: "The best time is now",
    sub: "种一棵树最好的时间是现在",
    style: "情绪：行动、当下。暖阳橙底+手写英文，小树苗/沙漏装饰四角",
  },
  {
    text: "且将新火试新茶",
    sub: "诗酒趁年华 — 苏轼",
    style: "情绪：洒脱、风雅。茶绿底+宋楷，茶烟/酒壶/远山装饰边缘",
  },
  {
    text: "Be the change",
    sub: "欲变世界，先变其身 — 甘地",
    style: "情绪：力量、觉醒。深蓝底+金色细字，破茧/小翅膀装饰四角",
  },
  {
    text: "山高自有客行路",
    sub: "水深自有渡船人",
    style: "情绪：无畏、笃定。山水灰蓝底+楷体，山径/小船/飞鸟装饰边缘",
  },
  {
    text: "What doesn't kill me makes me stronger",
    sub: "杀不死我的，必使我更强大 — 尼采",
    style: "情绪：韧性、不屈。黑底白字+裂纹金缮纹，山峰/闪电装饰四角",
  },
  {
    text: "此心安处是吾乡",
    sub: "— 苏轼",
    style: "情绪：安定、归处。暖杏底+行楷，小屋/炊烟/月牙装饰边缘",
  },
  {
    text: "Do one thing well",
    sub: "一生做好一件事",
    style: "情绪：专注、匠心。素白底+黑细字，刻刀/墨滴装饰四角，极简禅意",
  },
  {
    text: "行到水穷处",
    sub: "坐看云起时 — 王维",
    style: "情绪：从容、转机。天青底+淡墨，流水/云海装饰边缘",
  },
  {
    text: "把平凡的日子过成诗",
    sub: "— 致每一个认真生活的人",
    style: "情绪：浪漫、日常。奶油底+手写体，小诗集/小花/咖啡杯装饰四角",
  },
];

function buildPrompt(t) {
  return [
    `画布 canvas.setSize 3000x1376（比例2.18，长款鼠标垫印花）后设计一款名言/励志情绪文字鼠标垫，完成后调用 canvas.updateAndSaveSticker 保存，name 用「${t.text.slice(0, 10)}·名言设计」。`,
    `【核心构图·硬性】主文案「${t.text}」必须精确落在画布几何正中心(50%,50%)，水平、垂直都居中；只对主文案容器用 position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)，禁止把「主文案+副文案」整体居中。副文案「${t.sub}」挂在主文案正下方，整体仍保持视觉居中。`,
    `【极简风格·硬性】以简洁为主，只保留核心文案。严禁添加任何多余的装饰性文字：不要小号英文/拼音、不要编号/角标、不要印章落款文字、不要标语口号。除主文案与副文案外，画面上不得出现其他文字。`,
    `【排版】主文案字号远大于副文案，主次分明；四周留出舒适的内边距（约画布宽高的 10-14%），不要挤满。`,
    `【设计要求】${t.style}`,
    `【背景与装饰】用克制的配色与极简背景（纯色或柔和渐变）；装饰最多是极淡的底纹或一两条细线，不要繁复图案。`,
    `严禁出现任何产品功能词（防滑/顺滑/材质/尺寸参数等），只做名言情绪设计。用 canvas.addHtml 的 HTML/CSS 实现，字体通过 htmlBindings 绑定。`,
  ].join("\n");
}

const count = Math.max(1, Math.min(TASKS.length, Number(process.argv[2]) || TASKS.length));
// 轮换起始：每轮换一批主题，避免重复
const offset = Number(process.argv[3]) || (Date.now() / 60000 / 5 | 0) % TASKS.length;

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
    const t = TASKS[(offset + i) % TASKS.length];
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
  const savedByLib = libNames.includes(c.text.slice(0, 10)) || libNames.includes(c.text);
  const savedByOut = (c.result?.outputs || []).length > 0;
  if (savedByLib || savedByOut) savedCount++;
  console.log(
    `「${c.text}」 ${savedByLib ? "✅ 库中已存在" : savedByOut ? "✅ outputs 已返回" : "❌ 未保存"}`,
  );
}
console.log(`\n保存率: ${savedCount}/${checks.length} · 内容核对: ${checks.filter((c) => JSON.stringify(c.state || {}).includes(c.text)).length}/${checks.length}`);
