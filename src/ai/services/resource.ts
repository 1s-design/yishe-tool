import { apiInstance } from "@/api/apiInstance";
import { buildImageSearchAttempts } from "./resource-search-strategy";

// ============ 最近搜索结果 URL 记录（供 add-html 校验） ============

const recentImageUrls = new Set<string>();
const RECENT_URL_MAX_AGE = 10 * 60 * 1000; // 10 分钟
const recentImageUrlsTimestamps = new Map<string, number>();

export function addRecentImageUrls(urls: string[]): void {
  const now = Date.now();
  for (const url of urls) {
    recentImageUrls.add(url);
    recentImageUrlsTimestamps.set(url, now);
  }
  // 清理过期
  for (const [url, ts] of recentImageUrlsTimestamps) {
    if (now - ts > RECENT_URL_MAX_AGE) {
      recentImageUrls.delete(url);
      recentImageUrlsTimestamps.delete(url);
    }
  }
}

export function isRecentImageUrl(url: string): boolean {
  return recentImageUrls.has(url);
}

export function getRecentImageUrls(): string[] {
  return Array.from(recentImageUrls);
}

// ============ 搜索缓存 ============

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 分钟过期
const MAX_CACHE_ENTRIES = 150;
const searchCache = new Map<string, CacheEntry<any>>();

function getCacheKey(tool: string, params: Record<string, any>): string {
  const sorted = Object.keys(params)
    .sort()
    .filter((k) => params[k] !== undefined)
    .map((k) => `${k}:${JSON.stringify(params[k])}`)
    .join("|");
  return `${tool}:${sorted}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    searchCache.delete(key);
    return null;
  }
  searchCache.delete(key);
  searchCache.set(key, entry);
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  searchCache.delete(key);
  searchCache.set(key, { data, timestamp: Date.now() });
  while (searchCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = searchCache.keys().next().value;
    if (!oldestKey) break;
    searchCache.delete(oldestKey);
  }
}

// ============ 资源类型定义 ============

export interface FontResource {
  id: string;
  name: string;
  description: string;
  url: string;
  thumbnail: string;
  category: string; // 字体分类，如 "标题字"、"正文字"、"手写体"
  keywords: string; // 搜索关键词
  languages: string[]; // 支持的语言，如 ['zh-CN', 'en']
}

export interface ImageResource {
  id: string;
  name: string;
  description: string;
  url: string;
  thumbnail: string;
  category: string;
  keywords: string;
  width: number;
  height: number;
  isCustom: boolean; // sticker 素材库中的来源标记（不代表 custom_sticker 编辑数据）
  isCutout: boolean; // 是否为抠图（无背景）
  colorPalette: string; // 主色调，逗号分隔的 hex，如 "#ff0000,#00ff00"
}

export interface DesignInspirationResource {
  id: string;
  name: string;
  description: string;
  url: string;
  tags: string[];
  category: string;
}

export interface SentenceResource {
  id: number;
  content: string;
  description: string;
  keywords?: string;
}

export interface TextDocumentResource {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  category: string | null;
  tags: string | null;
}

export interface CustomStickerResource {
  id: string;
  name: string;
  description: string;
  keywords: string;
  url: string;
  width: number;
  height: number;
  aspectRatio: number;
  hasEditableCanvasData: boolean;
  folderId?: string | null;
  createdAt?: string;
}

export interface CustomStickerSearchParams {
  query?: string;
  limit?: number;
  page?: number;
  folderId?: string | null;
}

export interface FontSearchParams {
  query?: string; // 搜索关键词
  limit?: number; // 返回数量
  page?: number; // 页码
  category?: string; // 字体分类过滤，如 "标题字"、"正文字"
  searchMode?: "text" | "vector"; // 搜索模式：text=关键词搜索，vector=向量语义搜索
}

export interface ImageSearchParams {
  query?: string; // 搜索关键词
  limit?: number; // 返回数量
  page?: number; // 页码
  isCustom?: boolean; // 是否为系统自定义（可二次开发）
  isCutout?: boolean; // 是否为抠图（无背景）
  searchMode?: "text" | "vector"; // 搜索模式：text=关键词搜索，vector=向量语义搜索
  aspectRatio?: string; // 宽高比，如 "1:1", "16:9"
  aspectRatioTolerance?: number; // 宽高比容差
  minWidth?: number; // 最小宽度
  maxWidth?: number; // 最大宽度
  minHeight?: number; // 最小高度
  maxHeight?: number; // 最大高度
}

export interface SentenceSearchParams {
  query?: string;
  limit?: number;
  page?: number;
  searchMode?: "text" | "vector"; // 搜索模式：text=关键词搜索，vector=向量语义搜索
}

export interface TextDocumentSearchParams {
  query?: string;
  limit?: number;
  page?: number;
  category?: string;
  searchMode?: "text" | "vector"; // 搜索模式：text=关键词搜索，vector=向量语义搜索
}

export interface ResourceSearchResult {
  items:
    | FontResource[]
    | ImageResource[]
    | SentenceResource[]
    | TextDocumentResource[]
    | CustomStickerResource[];
  total: number;
  query: string;
}

const KNOWN_DESIGN_TERMS = [
  "中秋",
  "月饼",
  "礼盒",
  "圆月",
  "祥云",
  "桂花",
  "国潮",
  "中国风",
  "新中式",
  "春节",
  "新年",
  "咖啡",
  "奶茶",
  "茶饮",
  "饮品",
  "热饮",
  "乌龙",
  "拿铁",
  "茶叶",
  "香氛",
  "香水",
  "香水瓶",
  "雪松",
  "白茶",
  "茶花",
  "枝叶",
  "自然",
  "纸张",
  "纹理",
  "光影",
  "窗格",
  "东方窗格",
  "美食",
  "水果",
  "花卉",
  "玫瑰",
  "猫咪",
  "宠物",
  "圣诞",
  "情人节",
  "七夕",
  "母亲节",
  "教师节",
  "开学",
  "促销",
  "新品",
  "高端",
  "高级",
  "安静",
  "温柔",
  "复古",
  "科技",
  "赛博",
  "极简",
  "可爱",
  "治愈",
  "手写",
  "书法",
  "插画",
  "海报",
  "封面",
  "包装",
  "名片",
  "贴纸",
  "头像",
  "壁纸",
  "banner",
];

const NOISY_QUERY_TERMS = [
  "帮我",
  "做一张",
  "设计",
  "尺寸",
  "主标题",
  "副标题",
  "标题写",
  "文案",
  "画面",
  "希望",
  "整体",
  "适合",
  "可以",
  "不要",
  "需要",
  "作为",
  "使用",
  "发布",
  "首图",
  "朋友圈",
  "小红书",
  "电商",
  "详情页",
  "门店",
  "电子屏",
];

function compactText(value: string, maxLength = 80): string {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/[，。！？、；：,.!?;:()（）【】[\]{}<>《》"']/g, " ")
    .trim()
    .slice(0, maxLength);
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const normalized = compactText(value, 120);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

function extractDesignTerms(request: string): string[] {
  const terms: string[] = [];
  const lower = request.toLowerCase();

  for (const term of KNOWN_DESIGN_TERMS) {
    if (lower.includes(term.toLowerCase())) {
      terms.push(term);
    }
  }

  const quotedTerms = Array.from(request.matchAll(/[“"「『《](.*?)[”"」』》]/g))
    .map((match) => match[1])
    .flatMap((value) => value.split(/[与和&+＋/、，,\s]+/))
    .map((item) => item.trim())
    .filter((item) => item.length >= 2 && item.length <= 12);

  const chunks = request
    .split(/[\s,，。！？、；：:;.!?]+/)
    .map((item) =>
      item
        .replace(/^(主题是|主题|主标题写|副标题写|标题写|写)/, "")
        .replace(/[“”"「」『』《》]/g, "")
        .trim(),
    )
    .filter((item) => item.length >= 2 && item.length <= 12)
    .filter((item) => !/^\d+\s*[x×*]\s*\d+$/i.test(item))
    .filter((item) => !NOISY_QUERY_TERMS.some((term) => item.includes(term)));

  return uniqueStrings([...terms, ...quotedTerms, ...chunks]).slice(0, 12);
}

// ============ API 调用 ============

async function fetchApi(endpoint: string, params: Record<string, any> = {}) {
  const response = await apiInstance.post(endpoint, params);
  return response.data?.data || response.data;
}

// ============ 字体资源服务 ============

export async function searchFontResources(
  params: FontSearchParams,
): Promise<ResourceSearchResult> {
  const cacheKey = getCacheKey("font", params);
  const cached = getFromCache<ResourceSearchResult>(cacheKey);
  if (cached) {
    console.log("[ResourceService] 字体缓存命中:", params.query);
    return cached;
  }

  try {
    const limit = params.limit || 10;
    const primaryQuery = compactText(params.query || "", 60);
    const genericFallbacks = [
      "标题字",
      "艺术",
      "简约",
      "手写",
      "衬线",
      "等线体",
      "高端",
      "复古",
    ];
    const queryCandidates = uniqueStrings([
      primaryQuery,
      ...extractDesignTerms(primaryQuery).filter((term) => term.length <= 8),
      ...genericFallbacks,
    ]);
    const modeCandidates = uniqueStrings([
      params.searchMode || "vector",
      "text",
      "vector",
    ]) as Array<"text" | "vector">;
    const categoryCandidates = params.category
      ? [params.category, undefined]
      : [undefined];

    let searchResult: ResourceSearchResult = {
      items: [],
      total: 0,
      query: primaryQuery,
    };

    for (const category of categoryCandidates) {
      for (const query of queryCandidates) {
        for (const searchMode of modeCandidates) {
          const apiParams: Record<string, any> = {
            searchKeyword: query,
            currentPage: params.page || 1,
            pageSize: limit,
            searchMode,
          };
          if (category) apiParams.category = category;

          const result = await fetchApi("/api/font-template/page", apiParams);
          const items = (result.list || []).map((item: any) => ({
            id: item.id,
            name: item.name || "未命名字体",
            description: item.description || "",
            url: item.url || "",
            thumbnail: item.thumbnail || "",
            category: item.category || "",
            keywords: item.keywords || "",
            languages: item.languages || [],
          }));

          if (items.length > 0) {
            searchResult = {
              items,
              total: result.total || items.length,
              query,
            };
            break;
          }
        }
        if (searchResult.items.length > 0) break;
      }
      if (searchResult.items.length > 0) break;
    }

    if (searchResult.items.length > 0) {
      setCache(cacheKey, searchResult);
    }

    return searchResult;
  } catch (error) {
    console.error("[ResourceService] 搜索字体失败:", error);
    return { items: [], total: 0, query: params.query || "" };
  }
}

// ============ 图片资源服务 ============

export async function searchImageResources(
  params: ImageSearchParams,
): Promise<ResourceSearchResult> {
  const cacheKey = getCacheKey("image", params);
  const cached = getFromCache<ResourceSearchResult>(cacheKey);
  if (cached) {
    console.log("[ResourceService] 图片缓存命中:", params.query);
    return cached;
  }

  try {
    const limit = params.limit || 10;
    // 向量或复杂查询时多查一些，方便在前端做宽高、宽高比过滤
    const needsFiltering = Boolean(
      params.aspectRatio ||
      params.minWidth !== undefined ||
      params.maxWidth !== undefined ||
      params.minHeight !== undefined ||
      params.maxHeight !== undefined,
    );
    const pageSize = needsFiltering ? Math.max(limit * 3, 50) : limit;

    const apiParams: Record<string, any> = {
      searchText: params.query || "",
      currentPage: params.page || 1,
      pageSize: pageSize,
      searchMode: params.searchMode || "vector", // 默认启用混合向量检索
    };

    if (params.isCustom !== undefined) apiParams.isCustom = params.isCustom;
    if (params.isCutout !== undefined) apiParams.isCutout = params.isCutout;

    const result = await fetchApi("/api/sticker/page", apiParams);
    let list = result.list || [];

    // 本地过滤：宽高范围
    if (params.minWidth !== undefined) {
      list = list.filter((item: any) => (item.width || 0) >= params.minWidth!);
    }
    if (params.maxWidth !== undefined) {
      list = list.filter((item: any) => (item.width || 0) <= params.maxWidth!);
    }
    if (params.minHeight !== undefined) {
      list = list.filter(
        (item: any) => (item.height || 0) >= params.minHeight!,
      );
    }
    if (params.maxHeight !== undefined) {
      list = list.filter(
        (item: any) => (item.height || 0) <= params.maxHeight!,
      );
    }

    // 本地过滤：宽高比
    if (params.aspectRatio && params.aspectRatio !== "any") {
      const [rw, rh] = params.aspectRatio.split(":").map(Number);
      const targetRatio = rw / rh;
      const tolerance =
        params.aspectRatioTolerance !== undefined
          ? params.aspectRatioTolerance
          : 0.15;
      list = list.filter((item: any) => {
        if (!item.width || !item.height) return false;
        const itemRatio = item.width / item.height;
        return Math.abs(itemRatio - targetRatio) / targetRatio <= tolerance;
      });
    }

    // 截取到 limit
    list = list.slice(0, limit);

    const searchResult: ResourceSearchResult = {
      items: list.map((item: any) => ({
        id: item.id,
        name: item.name || "未命名图片",
        description: item.description || "",
        url: item.url || "",
        thumbnail: item.thumbnail || item.url || "",
        category: item.category || "",
        keywords: item.keywords || "",
        width: item.width || 0,
        height: item.height || 0,
        isCustom: Boolean(item.isCustom),
        isCutout: Boolean(item.isCutout),
        colorPalette: item.colorPalette || "",
      })),
      total: result.total || list.length,
      query: params.query || "",
    };

    if (searchResult.items.length > 0) {
      setCache(cacheKey, searchResult);
      // 记录最近搜索到的图片 URL，供 add-html 校验
      addRecentImageUrls(
        searchResult.items.map((item) => item.url).filter(Boolean),
      );
    }

    return searchResult;
  } catch (error) {
    console.error("[ResourceService] 搜索图片失败:", error);
    return { items: [], total: 0, query: params.query || "" };
  }
}

// ============ 句子/文案资源服务 ============

export async function searchSentenceResources(
  params: SentenceSearchParams,
): Promise<ResourceSearchResult> {
  const cacheKey = getCacheKey("sentence", params);
  const cached = getFromCache<ResourceSearchResult>(cacheKey);
  if (cached) {
    console.log("[ResourceService] 句子缓存命中:", params.query);
    return cached;
  }

  try {
    const apiParams: Record<string, any> = {
      search: params.query,
      currentPage: params.page || 1,
      pageSize: params.limit || 10,
      searchMode: params.searchMode || "vector", // 默认启用混合向量检索
    };

    const result = await fetchApi("/api/sentences/page", apiParams);

    const searchResult: ResourceSearchResult = {
      items: (result.list || []).map((item: any) => ({
        id: item.id,
        content: item.content || "",
        description: item.description || "",
        keywords: item.keywords || "",
      })),
      total: result.total || 0,
      query: params.query || "",
    };

    if (searchResult.items.length > 0) {
      setCache(cacheKey, searchResult);
    }

    return searchResult;
  } catch (error) {
    console.error("[ResourceService] 搜索句子失败:", error);
    return { items: [], total: 0, query: params.query || "" };
  }
}

// ============ 文档资源服务 ============

export async function searchTextDocumentResources(
  params: TextDocumentSearchParams,
): Promise<ResourceSearchResult> {
  const cacheKey = getCacheKey("textDocument", params);
  const cached = getFromCache<ResourceSearchResult>(cacheKey);
  if (cached) {
    console.log("[ResourceService] 文档缓存命中:", params.query);
    return cached;
  }

  try {
    const apiParams: Record<string, any> = {
      keyword: params.query,
      page: params.page || 1,
      pageSize: params.limit || 10,
      searchMode: params.searchMode || "vector", // 默认启用混合向量检索
    };
    if (params.category) apiParams.category = params.category;

    const result = await fetchApi("/api/text-document/page", apiParams);

    const searchResult: ResourceSearchResult = {
      items: (result.list || []).map((item: any) => ({
        id: item.id,
        title: item.title || "",
        content: item.content || "",
        summary: item.summary || "",
        category: item.category || "",
        tags: item.tags || "",
      })),
      total: result.total || 0,
      query: params.query || "",
    };

    if (searchResult.items.length > 0) {
      setCache(cacheKey, searchResult);
    }

    return searchResult;
  } catch (error) {
    console.error("[ResourceService] 搜索文档失败:", error);
    return { items: [], total: 0, query: params.query || "" };
  }
}

// ============ 自定义贴纸/模板资源服务 ============

export async function searchDesignInspirationResources(
  params: { query?: string; limit?: number } = {},
): Promise<{ items: DesignInspirationResource[]; total: number }> {
  const cacheKey = getCacheKey("designInspiration", params);
  const cached = getFromCache<{ items: DesignInspirationResource[]; total: number }>(cacheKey);
  if (cached) return cached;

  try {
    const res = await apiInstance.post("/design-inspiration/page", {
      keyword: params.query || "",
      page: 1,
      pageSize: params.limit || 10,
    });
    const data = res.data?.data || res.data || {};
    const items = (data.list || data.items || []).map((item: any) => ({
      id: String(item.id),
      name: item.name || item.title || "未命名",
      description: item.description || "",
      url: item.url || item.imageUrl || "",
      tags: item.tags || [],
      category: item.category || "",
    }));
    const result = { items, total: data.total || items.length };
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.warn("[Resource] searchDesignInspiration failed:", error);
    return { items: [], total: 0 };
  }
}

export async function searchCustomStickerResources(
  params: CustomStickerSearchParams,
): Promise<ResourceSearchResult> {
  const cacheKey = getCacheKey("customSticker", params);
  const cached = getFromCache<ResourceSearchResult>(cacheKey);
  if (cached) {
    console.log("[ResourceService] 自定义贴纸模板缓存命中:", params.query);
    return cached;
  }

  try {
    const apiParams: Record<string, any> = {
      searchText: params.query || "",
      page: params.page || 1,
      pageSize: params.limit || 10,
    };
    if (params.folderId) apiParams.folderId = params.folderId;

    const response = await apiInstance.get("/api/custom-sticker", {
      params: apiParams,
    });
    const result = response.data?.data || response.data;
    const list = result?.list || result || [];

    const searchResult: ResourceSearchResult = {
      items: (Array.isArray(list) ? list : []).map((item: any) => ({
        id: String(item.id),
        name: item.name || "未命名模板",
        description: item.description || "",
        keywords: item.keywords || "",
        url: item.url || "",
        width: item.width || 0,
        height: item.height || 0,
        aspectRatio:
          item.aspectRatio || (item.height ? item.width / item.height : 1),
        hasEditableCanvasData: Boolean(
          item?.meta?.data || item?.meta?.canvasData,
        ),
        folderId: item.folderId || null,
        createdAt: item.createdAt || "",
      })),
      total: result?.total || (Array.isArray(list) ? list.length : 0),
      query: params.query || "",
    };

    if (searchResult.items.length > 0) {
      setCache(cacheKey, searchResult);
    }

    return searchResult;
  } catch (error) {
    console.error("[ResourceService] 搜索自定义贴纸模板失败:", error);
    return { items: [], total: 0, query: params.query || "" };
  }
}

// ============ 单个资源获取 ============

export async function getFontResource(
  id: string,
): Promise<FontResource | null> {
  try {
    const response = await apiInstance.get(
      `/api/font-template/${encodeURIComponent(id)}`,
    );
    const result = response.data?.data || response.data;
    if (!result) return null;
    return {
      id: result.id,
      name: result.name || "未命名字体",
      description: result.description || "",
      url: result.url || "",
      thumbnail: result.thumbnail || "",
      category: result.category || "",
      keywords: result.keywords || "",
      languages: result.languages || [],
    };
  } catch (error) {
    console.error("[ResourceService] 获取字体失败:", error);
    return null;
  }
}

export async function getImageResource(
  id: string,
): Promise<ImageResource | null> {
  try {
    const result = await fetchApi(`/api/sticker/${id}`);
    if (!result) return null;
    return {
      id: result.id,
      name: result.name || "未命名图片",
      description: result.description || "",
      url: result.url || "",
      thumbnail: result.thumbnail || result.url || "",
      category: result.category || "",
      keywords: result.keywords || "",
      width: result.width || 0,
      height: result.height || 0,
      isCustom: Boolean(result.isCustom),
      isCutout: Boolean(result.isCutout),
      colorPalette: result.colorPalette || "",
    };
  } catch (error) {
    console.error("[ResourceService] 获取图片失败:", error);
    return null;
  }
}

// ============ AI 工具定义 ============

export const resourceTools = [
  {
    type: "function" as const,
    function: {
      name: "resource.searchFont",
      description: `搜索字体库。支持后端向量混合语义搜索。返回字体列表，每项包含 id/name/url/category/keywords。

如果在 HTML 中使用字体资源，将字体放入 canvas.addHtml 的 htmlBindings.font，并用 {{font.xxx.family}} 引用。`,
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "搜索关键词或自然语言描述，语义匹配效果极好。推荐：标题字、手写体、艺术、简约、可爱、复古、科技、书法、衬线",
          },
          limit: {
            type: "number",
            description: "返回数量，默认 5，最大 20",
          },
          category: {
            type: "string",
            description:
              "字体分类过滤，如：标题字、正文字、手写体。不填则搜索全部分类。",
          },
          searchMode: {
            type: "string",
            enum: ["vector", "text"],
            description:
              "检索模式，vector=向量语义搜索（推荐，用于模糊匹配与自然语言意图），text=关键词精准文本搜索",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "resource.searchSticker",
      description: `从素材库/贴纸库搜索贴纸和插画素材。支持后端向量混合语义搜索，并能进行比例、尺寸过滤。
返回图片候选列表，每项包含 id/name/url/keywords/colorPalette/width/height/isCutout。你可以根据设计目标选择合适项，也可以忽略不相关结果、换关键词继续搜索，或改用 HTML/CSS 绘制。

搜索会在一次调用内自动放宽尺寸/比例过滤并简化关键词。query 使用 2-4 个核心名词即可，不要堆叠中英文同义词；一次调用没有结果时不要立刻连续重试。

如果决定在 HTML 中使用某张外部图片，需要把它放入 canvas.addHtml 的 htmlBindings.image，并在 htmlContent 中用 {{image.xxx.url}} 引用。`,
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "搜索描述语或关键词，语义匹配效果极好。如：猫咪、极简风纹理、中国风底纹",
          },
          limit: {
            type: "number",
            description: "返回数量，默认 5，最大 20",
          },
          searchMode: {
            type: "string",
            enum: ["vector", "text"],
            description:
              "检索模式，vector=向量语义搜索（推荐，用于模糊匹配与自然语言意图），text=关键词精准文本搜索",
          },
          isCustom: {
            type: "boolean",
            description: "仅返回素材库中标记为自定义的贴纸（兼容旧数据）",
          },
          isCutout: {
            type: "boolean",
            description: "仅返回已抠图素材（透明背景，适合图层重叠叠加）",
          },
          aspectRatio: {
            type: "string",
            description:
              "按宽高比筛选，格式如 '1:1', '16:9', '9:16', '3:4' 等，不传代表不限。可根据当前目标画布形状进行选择",
          },
          aspectRatioTolerance: {
            type: "number",
            description: "宽高比允许的偏差值，默认 0.15 表示允许偏差 ±15%",
          },
          minWidth: {
            type: "number",
            description: "筛选像素宽度 >= 这里的数值，避免素材过小模糊",
          },
          maxWidth: {
            type: "number",
            description: "筛选像素宽度 <= 这里的数值",
          },
          minHeight: {
            type: "number",
            description: "筛选像素高度 >= 这里的数值",
          },
          maxHeight: {
            type: "number",
            description: "筛选像素高度 <= 这里的数值",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "resource.searchSentence",
      description: `从文案库中搜索优美的句子、广告词、心情语录等文案素材。支持后端向量混合语义搜索。
返回文案候选列表，每项包含 id/content/description/keywords。你可以选择合适文案使用，也可以只作为风格参考。`,
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "文案搜索关键词或自然语言描述，语义匹配效果极好，如：治愈、猫咪、七夕、中秋、促销、正能量",
          },
          limit: {
            type: "number",
            description: "返回数量，默认 5，最大 20",
          },
          searchMode: {
            type: "string",
            enum: ["vector", "text"],
            description:
              "检索模式，vector=向量语义搜索（推荐，用于模糊匹配与自然语言意图），text=关键词精准文本搜索",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "resource.searchTextDocument",
      description: `从文档库中搜索文本文档（如详细描述、背景文章、设计规范等）。支持后端向量混合语义搜索。
返回文档列表，每项包含 id/title/content/summary/category/tags。`,
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "文档搜索关键词或自然语言描述，语义匹配效果极好",
          },
          limit: {
            type: "number",
            description: "返回数量，默认 5，最大 20",
          },
          category: {
            type: "string",
            description: "分类过滤",
          },
          searchMode: {
            type: "string",
            enum: ["vector", "text"],
            description:
              "检索模式，vector=向量语义搜索（推荐，用于模糊匹配与自然语言意图），text=关键词精准文本搜索",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "resource.searchDesignInspiration",
      description: "搜索设计灵感，获取设计参考和创意灵感",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "搜索关键词" },
          limit: { type: "number", description: "返回数量" },
        },
      },
    },
    },
    {
      type: "function" as const,
      function: {
        name: "resource.searchCustomSticker",
        description: `从用户的自定义贴纸/模板库中搜索已有的成品设计与模板作品。
当用户需要复刻、修改、或者设计与已有作品类似风格的主题时，优先调用此工具搜索模板。
返回列表包含 id/name/description/keywords/url/hasEditableCanvasData。
如果命中合适模板，可以直接调用 canvas.loadCustomSticker({ customStickerId: id }) 将其完整排版加载到画布上，然后在此成熟排版基底上进行文案替换、插画替换或局部微调！`,
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "搜索关键词或风格描述，如：咖啡、日系、复古、中秋、标牌、国潮",
            },
            limit: {
              type: "number",
              description: "返回数量，默认 5，最大 20",
            },
          },
          required: ["query"],
        },
      },
    },
];

// ============ AI 工具执行 ============

export async function executeResourceTool(
  toolName: string,
  args: Record<string, any>,
): Promise<any> {
  switch (toolName) {
    case "resource.searchFont": {
      const result = await searchFontResources({
        query: args.query,
        limit: args.limit || 5,
        category: args.category,
        searchMode: args.searchMode,
      });
      if (result.items.length === 0) {
        return {
          success: true,
          data: [],
          total: 0,
          query: result.query,
          message: `未找到与"${result.query}"相关的字体，建议：\n1. 尝试更简洁的关键词（如：手写、艺术、可爱、简约）\n2. 直接使用系统默认字体`,
        };
      }
      return {
        success: true,
        data: result.items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          thumbnail: item.thumbnail,
          url: item.url,
          category: item.category,
          keywords: item.keywords,
          languages: item.languages,
        })),
        total: result.total,
        query: result.query,
      };
    }

    case "resource.searchSticker": {
      const searchParams = {
        query: args.query,
        limit: args.limit || 5,
        searchMode: args.searchMode,
        isCustom: args.isCustom,
        isCutout: args.isCutout,
        aspectRatio: args.aspectRatio,
        aspectRatioTolerance: args.aspectRatioTolerance,
        minWidth: args.minWidth,
        maxWidth: args.maxWidth,
        minHeight: args.minHeight,
        maxHeight: args.maxHeight,
      };
      const attempts = buildImageSearchAttempts(searchParams);
      let result: ResourceSearchResult = {
        items: [],
        total: 0,
        query: args.query || "",
      };
      let usedStrategy = attempts[0]?.strategy || "exact";
      let attemptCount = 0;

      for (const attempt of attempts) {
        attemptCount += 1;
        usedStrategy = attempt.strategy;
        result = await searchImageResources(attempt.params);
        if (result.items.length > 0) break;
      }

      if (result.items.length === 0) {
        return {
          success: true,
          data: [],
          total: 0,
          query: result.query,
          searchStrategy: usedStrategy,
          searchAttempts: attemptCount,
          message: `系统已自动尝试原始条件、放宽过滤和简化关键词，仍未找到与"${args.query}"相关的贴纸。不要继续重复搜索，请改用兼容的 SVG/CSS 图形或明确说明素材库没有合适资源。`,
        };
      }
      return {
        success: true,
        data: result.items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          thumbnail: item.thumbnail,
          url: item.url,
          keywords: item.keywords,
          category: item.category,
          isCustom: item.isCustom,
          isCutout: item.isCutout,
          width: item.width,
          height: item.height,
          colorPalette: item.colorPalette,
        })),
        total: result.total,
        query: result.query,
        searchStrategy: usedStrategy,
        searchAttempts: attemptCount,
      };
    }

    case "resource.searchSentence": {
      const result = await searchSentenceResources({
        query: args.query,
        limit: args.limit || 5,
        searchMode: args.searchMode,
      });
      if (result.items.length === 0) {
        return {
          success: true,
          data: [],
          total: 0,
          query: result.query,
          message: `未找到与"${result.query}"相关的文案，建议：\n1. 尝试更通用的词语\n2. 直接使用默认文案`,
        };
      }
      return {
        success: true,
        data: result.items.map((item: any) => ({
          id: item.id,
          content: item.content,
          description: item.description,
          keywords: item.keywords,
        })),
        total: result.total,
        query: result.query,
      };
    }

    case "resource.searchTextDocument": {
      const result = await searchTextDocumentResources({
        query: args.query,
        limit: args.limit || 5,
        category: args.category,
        searchMode: args.searchMode,
      });
      if (result.items.length === 0) {
        return {
          success: true,
          data: [],
          total: 0,
          query: result.query,
          message: `未找到与"${result.query}"相关的文档，建议：\n1. 放宽或更换搜索词\n2. 检查分类参数`,
        };
      }
      return {
        success: true,
        data: result.items.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          summary: item.summary,
          category: item.category,
          tags: item.tags,
        })),
        total: result.total,
        query: result.query,
      };
    }

    case "resource.searchDesignInspiration": {
      const result = await searchDesignInspirationResources({
        query: args.query,
        limit: args.limit,
      });
      return {
        success: true,
        message: `找到 ${result.items.length} 个设计灵感`,
        data: result,
      };
    }
    case "resource.searchCustomSticker": {
      const result = await searchCustomStickerResources({
        query: args.query,
        limit: args.limit || 5,
      });
      if (result.items.length === 0) {
        return {
          success: true,
          data: [],
          total: 0,
          query: result.query,
          message: `未找到与"${result.query}"相关的自定义贴纸模板，建议从零创建全新设计。`,
        };
      }
      return {
        success: true,
        data: result.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          url: item.url,
          width: item.width,
          height: item.height,
          aspectRatio: item.aspectRatio,
          hasEditableCanvasData: item.hasEditableCanvasData,
          keywords: item.keywords,
        })),
        total: result.total,
        query: result.query,
      };
    }

    default:
      return { success: false, error: `未知工具: ${toolName}` };
  }
}

// ============ 搜索历史导出 ============

export interface SearchHistoryEntry {
  tool: string;
  query: string;
  resultCount: number;
  timestamp: number;
}

export function getSearchHistory(): SearchHistoryEntry[] {
  const history: SearchHistoryEntry[] = [];
  for (const [key, entry] of searchCache.entries()) {
    if (key.startsWith("bundle:")) continue;
    const data = entry.data as ResourceSearchResult;
    let tool = "resource.searchSticker";
    if (key.startsWith("font:")) tool = "resource.searchFont";
    else if (key.startsWith("sentence:")) tool = "resource.searchSentence";
    else if (key.startsWith("textDocument:"))
      tool = "resource.searchTextDocument";
    history.push({
      tool,
      query: data.query,
      resultCount: data.items.length,
      timestamp: entry.timestamp,
    });
  }
  return history.sort((a, b) => b.timestamp - a.timestamp);
}

export function getCachedResultsSummary(): string {
  const history = getSearchHistory();
  if (history.length === 0) return "";

  const lines = history.map(
    (h) => `- ${h.tool}("${h.query}") → ${h.resultCount} 个结果`,
  );
  return `已缓存的搜索结果（无需重复搜索）:\n${lines.join("\n")}`;
}

export function clearSearchCache(): void {
  searchCache.clear();
}

// ============ 资源服务导出 ============

export const resourceService = {
  searchFont: searchFontResources,
  searchImage: searchImageResources,
  searchSentence: searchSentenceResources,
  searchTextDocument: searchTextDocumentResources,
  searchCustomSticker: searchCustomStickerResources,
  getFont: getFontResource,
  getImage: getImageResource,
  executeTool: executeResourceTool,
  tools: resourceTools,
  getSearchHistory,
  getCachedResultsSummary,
  clearSearchCache,
};
