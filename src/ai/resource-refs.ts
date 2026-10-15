/**
 * 创作资源引用模型（UI 与 MCP 共用）
 *
 * 目的：用户/AI 指定一组资源（灵感/字体/图片/贴纸/文案/文档/技巧/提示词），
 * 编译成两份产物给设计 agent：
 *   1. promptContext  —— 思路上下文：告诉 agent「怎么想」（主题/氛围/约束/可用文案）
 *   2. htmlBindings   —— 绑定资源：告诉 agent「用什么」（字体/图片/贴纸真正进设计）
 * 另外 referenceImage 可作为视觉参考喂给视觉模型（神似路线）。
 *
 * 一份引用集合 = UI 托盘 state = MCP resources 参数，两条路产出完全一致。
 */

import { apiInstance } from "@/api/apiInstance";

export type ResourceType =
  | "inspiration"
  | "font"
  | "image"
  | "sticker"
  | "sentence"
  | "document"
  | "tip"
  | "prompt";

export interface DesignResourceRef {
  type: ResourceType;
  id: string;
  /** 展示名（chip 上显示），缺省时按 id 截断 */
  label?: string;
  /** 类型相关数据；提供后可免去按 id 取数 */
  payload?: Record<string, any>;
  /** 是否把该图作为视觉参考（仅 image/sticker 生效） */
  asReference?: boolean;
}

export interface BuiltResourceContext {
  /** 思路上下文（进 prompt） */
  promptContext: string;
  /** 绑定资源（进 htmlBindings） */
  htmlBindings: Record<string, any>;
  /** 检索方向（进 brief 的 resourceHints） */
  resourceHints: string[];
  /** 视觉参考图（第一个被标记为 asReference 的图） */
  referenceImage?: string;
  /** 失效/缺失资源告警（不阻塞生产） */
  warnings: string[];
}

const TYPE_LABELS: Record<ResourceType, string> = {
  inspiration: "设计灵感",
  font: "字体",
  image: "图片",
  sticker: "自定义贴纸",
  sentence: "文案",
  document: "文档",
  tip: "设计技巧",
  prompt: "设计提示词",
};

function unwrap(res: any) {
  return res?.data?.data ?? res?.data ?? res;
}

function truncate(text: string, max = 120) {
  const s = String(text || "");
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

/** 生成稳定且合法的绑定 key（{{image.key}} / {{font.key}} 里用） */
function toBindingKey(type: ResourceType, id: string, used: Set<string>): string {
  const base = `${type}_${String(id || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || "res"}`;
  let key = base;
  let n = 1;
  while (used.has(key)) {
    n += 1;
    key = `${base}_${n}`;
  }
  used.add(key);
  return key;
}

/** 按类型取资源内容：优先用 payload，其次按 id 取数；取不到则告警跳过 */
async function resolveResource(
  ref: DesignResourceRef,
  warnings: string[],
): Promise<Record<string, any> | null> {
  const type = ref.type;
  const id = String(ref.id || "");

  if (ref.payload && Object.keys(ref.payload).length) {
    return { id, ...ref.payload };
  }
  if (!id) {
    warnings.push(`${TYPE_LABELS[type] || type}：缺少 id 且无 payload，已跳过`);
    return null;
  }

  try {
    switch (type) {
      case "inspiration": {
        const res = await apiInstance.get(`/api/design-inspiration/${encodeURIComponent(id)}`);
        return unwrap(res) || null;
      }
      case "sticker":
      case "image": {
        const res = await apiInstance.get(`/api/custom-sticker/${encodeURIComponent(id)}`);
        return unwrap(res) || null;
      }
      default:
        warnings.push(
          `${TYPE_LABELS[type] || type}「${ref.label || id}」未提供 payload，且该类型暂不支持按 id 取数，已跳过`,
        );
        return null;
    }
  } catch (error: any) {
    warnings.push(`${TYPE_LABELS[type] || type}「${ref.label || id}」取数失败：${error?.message || error}`);
    return null;
  }
}

/**
 * 把资源引用编译成「思路上下文 + 绑定资源」
 */
export async function buildResourceContext(
  refs: DesignResourceRef[] = [],
): Promise<BuiltResourceContext> {
  const promptContext: string[] = [];
  const htmlBindings: Record<string, any> = { font: {}, image: {} };
  const resourceHints: string[] = [];
  const warnings: string[] = [];
  const usedKeys = new Set<string>();
  let referenceImage: string | undefined;

  for (const ref of refs) {
    const typeLabel = TYPE_LABELS[ref.type] || ref.type;
    const data = await resolveResource(ref, warnings);
    if (!data) continue;

    const label = ref.label || data.name || data.title || ref.id;

    switch (ref.type) {
      case "inspiration": {
        const parts = [
          `【设计灵感】${label}`,
          data.content ? `  灵感内容：${truncate(data.content, 200)}` : "",
          data.promptHints ? `  提示词片段：${truncate(data.promptHints, 200)}` : "",
          data.avoidNotes ? `  避让事项：${truncate(data.avoidNotes, 160)}` : "",
          data.keywords?.length ? `  关键词：${data.keywords.join("、")}` : "",
        ].filter(Boolean);
        promptContext.push(parts.join("\n"));
        if (data.keywords?.length) resourceHints.push(...data.keywords.slice(0, 3));
        break;
      }

      case "sentence": {
        const body = data.content || data.text || data.description || label;
        promptContext.push(
          `【可用文案·必须用上】请把下面这段文案用在画面里（可作主文案、副文案或小幅装饰文字）：\n${truncate(body, 200)}`,
        );
        break;
      }

      case "tip":
      case "prompt":
      case "document": {
        const title = data.title || data.name || label;
        const body = data.content || data.text || data.description || "";
        promptContext.push(
          `【${typeLabel}·参考】${title}${body ? `\n  ${truncate(body, 300)}` : ""}`,
        );
        break;
      }

      case "font": {
        const key = toBindingKey("font", ref.id, usedKeys);
        const url = data.url || data.src || "";
        if (!url) {
          warnings.push(`字体「${label}」缺少 url，已跳过`);
          continue;
        }
        htmlBindings.font[key] = {
          id: ref.id,
          name: data.name || label,
          url,
        };
        promptContext.push(
          `【字体·必须使用】${data.name || label}：必须在 HTML 中用 font-family:{{font.${key}.family}} 用作标题或正文的字体。`,
        );
        resourceHints.push(data.name || label);
        break;
      }

      case "image":
      case "sticker": {
        const key = toBindingKey("image", ref.id, usedKeys);
        const url = data.url || data.previewUrl || "";
        if (!url) {
          warnings.push(`${typeLabel}「${label}」缺少 url，已跳过`);
          continue;
        }
        htmlBindings.image[key] = {
          id: ref.id,
          name: data.name || label,
          url,
        };
        promptContext.push(
          `【${typeLabel}·必须使用】${data.name || label}：必须在 HTML 中用 {{image.${key}.url}} 引用它（可作背景图、插画、文字填充图案或装饰元素）。`,
        );
        resourceHints.push(data.name || label);
        if (ref.asReference && !referenceImage) referenceImage = url;
        break;
      }
    }
  }

  // 资源冲突时的优先级：主题与配色以灵感为准，提示词/技巧只作约束与形态参考
  const header = promptContext.length
    ? [
        "【资源使用总则】以下资源必须全部用上；若资源之间冲突，按此优先级取舍：",
        "1) 设计灵感 → 决定主题、配色、氛围与主文案（最高优先）",
        "2) 设计技巧 / 设计提示词 / 文档 → 只作设计约束、形态与产品形态参考，不覆盖灵感的主题与配色",
        "3) 文案 → 作为可直接使用的文字内容",
        "4) 字体 / 图片 / 自定义贴纸 → 必须实际使用（字体进 font-family，图片进 {{image.xxx.url}}）",
      ].join("\n")
    : "";

  return {
    promptContext: [header, promptContext.join("\n")].filter(Boolean).join("\n"),
    htmlBindings,
    resourceHints,
    referenceImage,
    warnings,
  };
}

/** 资源引用摘要（给 chip / 日志用） */
export function describeResourceRef(ref: DesignResourceRef): string {
  return `${TYPE_LABELS[ref.type] || ref.type}·${ref.label || ref.id}`;
}
