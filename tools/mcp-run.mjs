// 通过 MCP（ai-assistant tools/execute）驱动设计工具测试
// 用法: node tools/mcp-run.mjs <toolName> '<jsonInput>'
import { readFileSync } from "fs";

const TOKEN = readFileSync(
  "/Users/jackie/workspace/1s/tools/.test-token",
  "utf-8",
).trim();
const API = "http://127.0.0.1:1520/api/ai-assistant/tools/execute";

async function mcp(tool, input) {
  const timeoutMs = Number(input?.timeoutMs) > 0 ? Number(input.timeoutMs) + 30_000 : 60_000;
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
}

const tool = process.argv[2];
const input = JSON.parse(process.argv[3] || "{}");
const out = await mcp(tool, input);
console.log(JSON.stringify(out, null, 2).slice(0, 1500));
