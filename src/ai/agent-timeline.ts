/**
 * Agent 行为与耗时时间线（纯内存级，不落库）
 * 精确记录思考推理、素材搜索、HTML生成、画布渲染、入库保存各步骤行为与耗时。
 */
import { ref, computed, type Ref } from "vue";

export type TimelineEventType =
  | "llm" // LLM 接口请求（直连/代理）
  | "tool" // 工具调用（executeAITool / 操作执行）
  | "thinking" // agent 思考 / 规划步骤
  | "pipeline" // 批量流水线节点
  | "system"; // 系统事件

export type StepCategory =
  | "thinking" // 🧠 思考推理
  | "search" // 🔍 素材搜索
  | "generate" // 🎨 HTML生成
  | "render" // 🖼️ 画布渲染
  | "save" // 💾 入库保存
  | "llm" // 🤖 接口请求
  | "system"; // ⚙️ 系统事件

export type TimelineEventStatus = "running" | "done" | "error";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  category: StepCategory;
  label: string;
  detail: string;
  status: TimelineEventStatus;
  startedAt: number;
  endedAt: number | null;
  durationMs: number | null;
  /** 同一任务/轮次的关联 id */
  runId: string;
}

const MAX_EVENTS = 600;

const events: Ref<TimelineEvent[]> = ref([]);
const stack = new Map<string, TimelineEvent>();
let seq = 0;
let currentRunId = "";

function nextId() {
  seq += 1;
  return `t${Date.now()}_${seq}`;
}

export function classifyStep(type: TimelineEventType, label: string): StepCategory {
  if (type === "thinking") return "thinking";
  if (type === "llm") return "llm";
  if (type === "system") return "system";

  const lower = (label || "").toLowerCase();
  if (
    lower.includes("search") ||
    lower.includes("font") ||
    lower.includes("sentence") ||
    lower.includes("discover") ||
    lower.includes("collect") ||
    lower.includes("listresource")
  ) {
    return "search";
  }

  if (
    lower.includes("addhtml") ||
    lower.includes("addchild:html") ||
    lower.includes("generate") ||
    lower.includes("html")
  ) {
    return "generate";
  }

  if (
    lower.includes("setsize") ||
    lower.includes("smartsize") ||
    lower.includes("clear") ||
    lower.includes("basefontsize") ||
    lower.includes("render") ||
    lower.includes("dom") ||
    lower.includes("getstate")
  ) {
    return "render";
  }

  if (
    lower.includes("save") ||
    lower.includes("updateandsave") ||
    lower.includes("export") ||
    lower.includes("creategroup") ||
    lower.includes("import")
  ) {
    return "save";
  }

  return "render";
}

function push(event: TimelineEvent) {
  events.value = [...events.value, event].slice(-MAX_EVENTS);
}

/** 开始一段行为（思考/请求/工具），返回事件 id */
export function timelineStart(
  type: TimelineEventType,
  label: string,
  detail = "",
  runId?: string,
): string {
  const id = nextId();
  const category = classifyStep(type, label);
  const event: TimelineEvent = {
    id,
    type,
    category,
    label,
    detail,
    status: "running",
    startedAt: Date.now(),
    endedAt: null,
    durationMs: null,
    runId: runId || currentRunId || "-",
  };
  stack.set(id, event);
  push(event);
  return id;
}

/** 结束一段行为并写入耗时 */
export function timelineEnd(
  id: string,
  status: TimelineEventStatus = "done",
  detail?: string,
): void {
  const event = stack.get(id);
  if (!event) return;
  stack.delete(id);
  event.status = status;
  event.endedAt = Date.now();
  event.durationMs = Math.max(0, event.endedAt - event.startedAt);
  if (detail !== undefined) event.detail = detail;
  events.value = [...events.value];
}

/** 单点事件（瞬间动作） */
export function timelineMark(
  type: TimelineEventType,
  label: string,
  detail = "",
  categoryOverride?: StepCategory,
): void {
  const id = nextId();
  const category = categoryOverride || classifyStep(type, label);
  push({
    id,
    type,
    category,
    label,
    detail,
    status: "done",
    startedAt: Date.now(),
    endedAt: Date.now(),
    durationMs: 0,
    runId: currentRunId || "-",
  });
}

/** 设定当前 run（一轮对话/一个批量任务），用于事件分组 */
export function timelineSetRun(runId: string) {
  currentRunId = runId || "";
}

export function timelineGetRun() {
  return currentRunId;
}

/** 快照（用于远程查看 / UI 渲染） */
export function timelineSnapshot(limit = 200): TimelineEvent[] {
  return events.value.slice(-limit);
}

export function timelineClear() {
  events.value = [];
  stack.clear();
}

/** 获取特定工具最近一次的执行耗时（毫秒） */
export function timelineGetLastDuration(toolOrLabel: string): number | null {
  const matched = events.value
    .slice()
    .reverse()
    .find((e) => e.label === toolOrLabel || e.label.endsWith(toolOrLabel));
  return matched ? matched.durationMs : null;
}

/** 5 大步骤阶段统计 */
export function timelineStepSummary() {
  const summary: Record<StepCategory, { count: number; totalMs: number }> = {
    thinking: { count: 0, totalMs: 0 },
    search: { count: 0, totalMs: 0 },
    generate: { count: 0, totalMs: 0 },
    render: { count: 0, totalMs: 0 },
    save: { count: 0, totalMs: 0 },
    llm: { count: 0, totalMs: 0 },
    system: { count: 0, totalMs: 0 },
  };

  for (const e of events.value) {
    const cat = e.category || "system";
    if (summary[cat]) {
      summary[cat].count += 1;
      summary[cat].totalMs += e.durationMs || 0;
    }
  }

  return summary;
}

/** 基础摘要统计 */
export function timelineSummary() {
  const acc: Record<string, { count: number; totalMs: number; maxMs: number }> = {};
  for (const e of events.value) {
    const key = e.type;
    if (!acc[key]) acc[key] = { count: 0, totalMs: 0, maxMs: 0 };
    acc[key].count += 1;
    acc[key].totalMs += e.durationMs || 0;
    acc[key].maxMs = Math.max(acc[key].maxMs, e.durationMs || 0);
  }
  return acc;
}

export const timelineEvents = computed(() => events.value);
