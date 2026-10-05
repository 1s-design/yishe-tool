import { getOperationTools } from "@/operations";

export const INTERACTION_TOOL_NAMES = [
  "ask_choice",
  "request_feedback",
] as const;

export const OPERATION_TOOL_PREFIX = "op__";
const TOOL_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
const toolNameMap = new Map<string, string>();
const sanitizedToolNameMap = new Map<string, string>();

function createSafeToolName(name: string, prefix: string): string {
  const normalized = String(name || "").trim();
  const readable = normalized.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48);
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  return `${prefix}${readable}_${hash.toString(36)}`;
}

function createReadableToolName(name: string, prefix: string): string {
  return `${prefix}${String(name || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 48)}`;
}

function rememberToolName(
  safeName: string,
  originalName: string,
  prefix: string,
) {
  const normalized = String(originalName || "").trim();
  toolNameMap.set(safeName, normalized);
  sanitizedToolNameMap.set(
    createReadableToolName(normalized, prefix),
    normalized,
  );
}

export function normalizeOperationToolName(name: string): string {
  const normalized = String(name || "").trim();
  const safeName = createSafeToolName(normalized, OPERATION_TOOL_PREFIX);
  rememberToolName(safeName, normalized, OPERATION_TOOL_PREFIX);
  return safeName;
}

function normalizeAnyToolName(name: string): string {
  const normalized = String(name || "").trim();
  if (TOOL_NAME_PATTERN.test(normalized)) {
    toolNameMap.set(normalized, normalized);
    return normalized;
  }

  const safeName = createSafeToolName(normalized, "tool__");
  rememberToolName(safeName, normalized, "tool__");
  return safeName;
}

export function resolveAIToolName(name: string): string {
  const normalized = String(name || "").trim();
  return (
    toolNameMap.get(normalized) ||
    sanitizedToolNameMap.get(normalized) ||
    normalized
  );
}

const askChoiceDef = {
  type: "function" as const,
  function: {
    name: "ask_choice",
    description:
      "向用户提问，让用户做选择。当有多种设计方向、需要用户决策时使用。",
    parameters: {
      type: "object" as const,
      properties: {
        question: { type: "string" as const, description: "要问用户的问题" },
        options: {
          type: "array" as const,
          items: { type: "string" as const },
          description: "选项列表（可选）",
        },
      },
      required: ["question"],
    },
  },
};

const requestFeedbackDef = {
  type: "function" as const,
  function: {
    name: "request_feedback",
    description:
      "展示当前效果并请求用户反馈。仅在用户要求的设计、检查、保存或导出步骤都已完成后使用，不能代替尚未执行的交付步骤。",
    parameters: {
      type: "object" as const,
      properties: {
        question: { type: "string" as const, description: "想问用户什么" },
      },
      required: ["question"],
    },
  },
};

export const INTERACTION_TOOL_DEFS = [askChoiceDef, requestFeedbackDef];

export function buildAITools(options?: {
  includeResources?: boolean;
  resourceTools?: any[];
  includeInteractions?: boolean;
  excludeOperations?: string[];
  compactPresetShortcuts?: boolean;
}): any[] {
  const excluded = new Set(options?.excludeOperations || []);
  const operationTools = getOperationTools().filter(
    (t) =>
      !excluded.has(t.name) &&
      (!options?.compactPresetShortcuts || t.name.includes(".")),
  );
  const opTools = operationTools.map((t) => ({
    type: "function" as const,
    function: {
      name: normalizeOperationToolName(t.name),
      // 压缩描述：截断到 80 字符
      description: String(t.description || '').slice(0, 80),
      parameters: compressSchema(t.input_schema),
    },
  }));

  const tools = [...opTools];

  if (options?.includeResources && options?.resourceTools) {
    tools.push(
      ...options.resourceTools.map((tool) => ({
        ...tool,
        function: {
          ...tool.function,
          name: normalizeAnyToolName(tool.function?.name),
          description: String(tool.function?.description || '').slice(0, 80),
        },
      })),
    );
  }

  if (options?.includeInteractions !== false) {
    tools.push(...INTERACTION_TOOL_DEFS);
  }

  return tools;
}

/**
 * 压缩 JSON Schema：截断过长的描述字段，减少 token 消耗
 */
function compressSchema(schema: any): any {
  if (!schema || typeof schema !== 'object') return schema;
  if (Array.isArray(schema)) return schema.map(compressSchema);
  
  const result: any = {};
  for (const [key, value] of Object.entries(schema)) {
    if (key === 'description' && typeof value === 'string') {
      result[key] = value.slice(0, 60);
    } else if (key === 'placeholder' || key === 'label') {
      // 跳过纯 UI 字段
      continue;
    } else {
      result[key] = compressSchema(value);
    }
  }
  return result;
}
