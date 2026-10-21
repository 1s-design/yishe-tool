import { createDesignOperationContext, executeOperation } from "@/operations";
import { resourceService } from "@/ai/services/resource";
import { resolveAIToolName } from "./tools";
import { timelineStart, timelineEnd } from "../agent-timeline";

const RESOURCE_TOOL_NAMES = new Set([
  "resource.searchFont",
  "resource.searchSticker",
  "resource.searchSentence",
  "resource.searchTextDocument",
  "resource.searchCustomSticker",
]);

export function isResourceToolName(toolName: string): boolean {
  return RESOURCE_TOOL_NAMES.has(resolveAIToolName(toolName));
}

export async function executeAITool(
  toolName: string,
  args: Record<string, any>,
  ctx = createDesignOperationContext(),
) {
  const resolvedName = resolveAIToolName(toolName);
  // 时间线埋点：工具调用耗时
  const tlId = timelineStart("tool", resolvedName, summarizeArgs(args));
  try {
    const result = RESOURCE_TOOL_NAMES.has(resolvedName)
      ? await resourceService.executeTool(resolvedName, args)
      : await executeOperation(resolvedName, args, ctx);
    const ok = (result as any)?.success !== false;
    timelineEnd(
      tlId,
      ok ? "done" : "error",
      String((result as any)?.message || "").slice(0, 160),
    );
    return result;
  } catch (error: any) {
    timelineEnd(tlId, "error", String(error?.message || error).slice(0, 160));
    throw error;
  }
}

function summarizeArgs(args: Record<string, any>): string {
  try {
    const keys = Object.keys(args || {});
    if (!keys.length) return "";
    const s = JSON.stringify(args);
    return s.length > 120 ? `${s.slice(0, 120)}…` : s;
  } catch {
    return "";
  }
}
