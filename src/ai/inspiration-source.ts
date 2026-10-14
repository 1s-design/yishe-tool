import { apiInstance } from "@/api/apiInstance";

/**
 * 设计灵感数据源
 *
 * 「灵感 → 自动生产」流水线的入口：批量引擎从这里取待生产灵感，
 * 产出后再把状态回写到 design_inspiration，保证幂等（不会重复生产）。
 */

export interface DesignInspirationItem {
  id: string;
  title: string;
  content: string;
  category: string | null;
  keywords: string[] | null;
  images: string[] | null;
  promptHints: string | null;
  avoidNotes: string | null;
  status: string;
  producedCount: number;
}

function unwrap(res: any) {
  return res?.data?.data ?? res?.data ?? res;
}

/**
 * 拉取灵感。传 ids 时按 id 精确取；否则按状态分页取（默认 pending）。
 */
export async function fetchInspirations(
  options: {
    ids?: string[];
    status?: string;
    limit?: number;
  } = {},
): Promise<DesignInspirationItem[]> {
  const { ids, status = "pending", limit = 20 } = options;

  if (ids?.length) {
    const items = await Promise.all(
      ids.map((id) =>
        apiInstance
          .get(`/api/design-inspiration/${encodeURIComponent(id)}`)
          .then((res: any) => unwrap(res))
          .catch((error: any) => {
            console.warn(`[Inspiration] 取灵感失败 ${id}:`, error?.message);
            return null;
          }),
      ),
    );
    return items.filter(Boolean) as DesignInspirationItem[];
  }

  const res = await apiInstance.post("/api/design-inspiration/page", {
    currentPage: 1,
    pageSize: Math.max(1, Math.min(100, limit)),
    status,
  });
  const data = unwrap(res);
  return (data?.list || []) as DesignInspirationItem[];
}

/**
 * 回写灵感生产状态。失败只告警，不影响生产主流程。
 */
export async function reportInspirationProduced(
  id: string,
  payload: {
    status?: string;
    productUrl?: string;
    producedDelta?: number;
    error?: string;
  } = {},
): Promise<void> {
  if (!id) return;
  try {
    await apiInstance.post("/api/design-inspiration/report-produced", {
      id,
      ...payload,
    });
  } catch (error: any) {
    console.warn(`[Inspiration] 回写状态失败 ${id}:`, error?.message);
  }
}

/** 把灵感压成给 LLM 的紧凑结构，避免把长文全塞进 prompt */
export function toInspirationDigest(
  item: DesignInspirationItem,
  index: number,
) {
  return {
    index,
    id: item.id,
    title: item.title,
    content: item.content,
    category: item.category || "",
    keywords: item.keywords || [],
    promptHints: item.promptHints || "",
    avoidNotes: item.avoidNotes || "",
    referenceImages: item.images || [],
  };
}
