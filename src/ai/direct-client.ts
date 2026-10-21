import CryptoJS from "crypto-js";
import { getUserApiKey } from "./api";
import { DESIGN_TOOL_FEATURE_CODES } from "./feature-codes";
import { postAgentProxy } from "./proxy-client";
import { AI_TIMEOUTS } from "./shared/timeout";
import { aiSettings } from "./settings";

// 加密密钥（需要与服务端 AI_API_KEY_RESPONSE_ENCRYPT_SECRET 一致）
const FALLBACK_ENCRYPT_SECRET = "1s-design-encrypt-key";
const configuredSecret = String(
  import.meta.env.VITE_AI_API_KEY_RESPONSE_ENCRYPT_SECRET || "",
).trim();
const ENCRYPT_SECRET = configuredSecret || FALLBACK_ENCRYPT_SECRET;

if (!configuredSecret) {
  console.warn(
    "[AI Client] VITE_AI_API_KEY_RESPONSE_ENCRYPT_SECRET 未配置，正在使用默认加密密钥；" +
      "请在 .env 中显式配置，并与服务端 AI_API_KEY_RESPONSE_ENCRYPT_SECRET 保持一致",
  );
}

// 缓存解密后的配置
type CachedAiConfig = {
  apiKey: string;
  model: string;
  baseURL: string;
  name: string;
};

const cachedConfigMap = new Map<string, CachedAiConfig>();

function getCacheKey(featureCode: string): string {
  return featureCode;
}

// 初始化状态
let initialized = false;
let initPromise: Promise<void> | null = null;

/**
 * 解密 API Key
 */
function decryptKey(encryptedKey: string): string {
  const value = String(encryptedKey || "").trim();
  if (!value) {
    throw new Error("API Key 为空");
  }

  // 目前服务端返回的是可直接使用的 key。只有 CryptoJS passphrase
  // 加密后的 OpenSSL 格式才会以 U2FsdGVkX1 开头，避免把明文 key 误送去解密。
  if (!value.startsWith("U2FsdGVkX1")) {
    return value;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(value, ENCRYPT_SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      throw new Error("解密失败");
    }
    return decrypted;
  } catch (error) {
    console.error("[AI Client] 解密 Key 失败:", error);
    throw new Error("API Key 解密失败");
  }
}

/**
 * 初始化 AI 配置（进入项目时调用）
 */
export async function initAIConfig(): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await getAIConfig();
      initialized = true;
      console.log("[AI Client] 初始化成功");
    } catch (error) {
      console.warn(
        "[AI Client] 初始化失败（API Key 未配置或接口不可用）:",
        error,
      );
      // 不抛出错误，允许用户继续使用
    }
  })();

  return initPromise;
}

/**
 * AI 是否已初始化
 */
export function isAIInitialized(): boolean {
  return initialized && cachedConfigMap.size > 0;
}

/**
 * 获取系统配置绑定的 AI Key（带缓存）
 *
 * 硬保证：只使用「该功能自己绑定的 Key」，不接受调用方指定其它 Key 或模型。
 */
export async function getAIConfig(
  featureCode: string = DESIGN_TOOL_FEATURE_CODES.chat,
): Promise<{
  apiKey: string;
  model: string;
  baseURL: string;
  name: string;
}> {
  const cacheKey = getCacheKey(featureCode);
  const cachedConfig = cachedConfigMap.get(cacheKey);
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    // 从服务端获取加密的 key（服务端只允许取该功能自己绑定的 Key）
    const result = await getUserApiKey(featureCode);
    if (!result?.encryptedKey) {
      throw new Error("接口未返回可用的 API Key");
    }

    const model = String(result.config?.model || "").trim();
    if (!model) {
      throw new Error(
        `功能「${featureCode}」绑定的 AI Key 未填写默认模型，请到「AI 使用设置」中补全`,
      );
    }
    const baseURL = String(result.config?.baseURL || "").trim();
    if (!baseURL) {
      throw new Error(
        `功能「${featureCode}」绑定的 AI Key 未填写 Base URL，请到「AI 使用设置」中补全`,
      );
    }

    // 解密 key
    const apiKey = decryptKey(result.encryptedKey);

    // 缓存配置
    const nextConfig = {
      apiKey,
      model,
      baseURL,
      name: result.name,
    };

    cachedConfigMap.set(cacheKey, nextConfig);
    return nextConfig;
  } catch (error) {
    console.error("[AI Client] 获取配置失败:", error);
    throw error;
  }
}

/**
 * 清除缓存（切换 key 时使用）
 */
export function clearAIConfigCache(): void {
  cachedConfigMap.clear();
}

/**
 * 解析直连模式下的运行时参数。
 *
 * 硬保证：只使用「该功能自己绑定的 Key」及其绑定模型，
 * 不读取「自定义配置」，也不接受调用方传入的模型覆盖。
 */
async function resolveDirectConfig(
  featureCode?: string,
): Promise<{ baseURL: string; apiKey: string; model: string }> {
  const sysConfig = await getAIConfig(
    featureCode || DESIGN_TOOL_FEATURE_CODES.chat,
  );
  return {
    baseURL: sysConfig.baseURL,
    apiKey: sysConfig.apiKey,
    model: sysConfig.model,
  };
}

/**
 * 前端调用 OpenAI Chat API（支持代理模式与直连模式）。
 *
 * 硬保证：Key 与模型固定取「AI 使用设置」中该功能绑定的配置，
 * 不接受调用方指定 keyId / model。
 */
export async function directChat(options: {
  messages: Array<{ role: string; content: string | any[] }>;
  tools?: any[];
  temperature?: number;
  maxTokens?: number;
  featureCode?: string;
  timeoutMs?: number;
  reasoningEffort?: string;
  enableThinking?: boolean;
}): Promise<any> {
  // 时间线埋点：LLM 接口请求耗时
  const { timelineStart, timelineEnd } = await import("./agent-timeline");
  const tlId = timelineStart(
    "llm",
    `LLM 请求（${aiSettings.value.mode || "proxy"}）`,
    `${options.messages?.length || 0} 条消息${options.tools?.length ? ` / ${options.tools.length} 个工具` : ""}`,
  );
  try {
    const result = await directChatInner(options);
    timelineEnd(tlId, "done");
    return result;
  } catch (error: any) {
    timelineEnd(tlId, "error", String(error?.message || error).slice(0, 200));
    throw error;
  }
}

async function directChatInner(options: {
  messages: Array<{ role: string; content: string | any[] }>;
  tools?: any[];
  temperature?: number;
  maxTokens?: number;
  featureCode?: string;
  timeoutMs?: number;
  reasoningEffort?: string;
  enableThinking?: boolean;
}): Promise<any> {
  const {
    messages,
    tools,
    temperature,
    maxTokens,
    featureCode,
    timeoutMs,
    reasoningEffort,
    enableThinking,
  } = options;

  const mode = aiSettings.value.mode || "proxy";

  // 1. 服务端代理模式
  if (mode === "proxy") {
    const body: any = {
      featureCode: featureCode || DESIGN_TOOL_FEATURE_CODES.chat,
      messages,
      temperature: temperature ?? 0.7,
    };

    if (maxTokens) body.max_tokens = maxTokens;
    if (tools && tools.length > 0) body.tools = tools;
    if (reasoningEffort) body.reasoning_effort = reasoningEffort;
    if (enableThinking !== undefined) body.enable_thinking = enableThinking;

    console.log("[DirectChat] proxy request body:", JSON.stringify(body, null, 2));

    return postAgentProxy(body, { timeoutMs: timeoutMs ?? AI_TIMEOUTS.chat });
  }

  // 2. 前端直连模式
  const config = await resolveDirectConfig(featureCode);
  const endpoint = `${config.baseURL.replace(/\/+$/, "")}/chat/completions`;
  const timeout = timeoutMs ?? AI_TIMEOUTS.chat;

  const controller = new AbortController();
  const timeoutTimer = setTimeout(() => controller.abort(), timeout);

  const requestBody: any = {
    model: config.model,
    messages,
    temperature: temperature ?? 0.7,
  };
  if (maxTokens) requestBody.max_tokens = maxTokens;
  if (tools && tools.length > 0) requestBody.tools = tools;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (config.apiKey) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    clearTimeout(timeoutTimer);

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError = errorText;
      try {
        const json = JSON.parse(errorText);
        parsedError = json.error?.message || json.message || errorText;
      } catch {}
      throw new Error(`AI 直连请求失败 (${response.status}): ${parsedError}`);
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutTimer);
    console.warn("[AI Client] 直连请求异常，自动降级至代理模式:", error);
    try {
      const { timelineMark } = await import("./agent-timeline");
      timelineMark("llm", "直连失败降级代理", String(error?.message || error).slice(0, 160));
    } catch {}

    const proxyBody: any = {
      featureCode: featureCode || DESIGN_TOOL_FEATURE_CODES.chat,
      messages,
      temperature: temperature ?? 0.7,
    };
    if (maxTokens) proxyBody.max_tokens = maxTokens;
    if (tools && tools.length > 0) proxyBody.tools = tools;
    if (reasoningEffort) proxyBody.reasoning_effort = reasoningEffort;
    if (enableThinking !== undefined) proxyBody.enable_thinking = enableThinking;

    return await postAgentProxy(proxyBody, { timeoutMs: timeoutMs ?? AI_TIMEOUTS.chat });
  }
}

/**
 * 前端调用 OpenAI Chat API（流式，支持代理与直连）。
 *
 * 硬保证：Key 与模型固定取「AI 使用设置」中该功能绑定的配置，
 * 不接受调用方指定 keyId / model。
 */
export async function* directChatStream(options: {
  messages: Array<{ role: string; content: string | any[] }>;
  tools?: any[];
  temperature?: number;
  maxTokens?: number;
  featureCode?: string;
  timeoutMs?: number;
  reasoningEffort?: string;
}): AsyncGenerator<any, void, unknown> {
  const {
    messages,
    tools,
    temperature,
    maxTokens,
    featureCode,
    timeoutMs,
    reasoningEffort,
  } = options;

  const mode = aiSettings.value.mode || "proxy";

  // 1. 服务端代理模式
  if (mode === "proxy") {
    const body: any = {
      featureCode: featureCode || DESIGN_TOOL_FEATURE_CODES.chat,
      messages,
      temperature: temperature ?? 0.7,
    };

    if (maxTokens) body.max_tokens = maxTokens;
    if (tools && tools.length > 0) body.tools = tools;
    if (reasoningEffort) body.reasoning_effort = reasoningEffort;

    const response = await postAgentProxy(body, {
      timeoutMs: timeoutMs ?? AI_TIMEOUTS.chat,
    });
    yield response;
    return;
  }

  // 2. 前端直连流式
  const config = await resolveDirectConfig(featureCode);
  const endpoint = `${config.baseURL.replace(/\/+$/, "")}/chat/completions`;
  const timeout = timeoutMs ?? AI_TIMEOUTS.chat;

  const controller = new AbortController();
  const timeoutTimer = setTimeout(() => controller.abort(), timeout);

  const requestBody: any = {
    model: config.model,
    messages,
    temperature: temperature ?? 0.7,
    stream: true,
  };
  if (maxTokens) requestBody.max_tokens = maxTokens;
  if (tools && tools.length > 0) requestBody.tools = tools;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (config.apiKey) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    clearTimeout(timeoutTimer);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI 直连流式请求失败 (${response.status}): ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("无法读取响应流");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const data = trimmed.slice(6).trim();
          if (data === "[DONE]") return;
          try {
            yield JSON.parse(data);
          } catch {
            // 忽略单行解析错误
          }
        }
      }
    }
  } catch (error: any) {
    clearTimeout(timeoutTimer);
    if (error.name === "AbortError") {
      throw new Error(`AI 直连流式请求超时 (${timeout}ms)`);
    }
    if (error.name === "TypeError" && error.message?.includes("Failed to fetch")) {
      throw new Error(
        `AI 直连流式失败（浏览器 CORS 跨域拦截）：目标地址 ${config.baseURL} 未允许跨域。建议在「AI 设置」中切换为「服务端代理」模式。`,
      );
    }
    throw error;
  }
}
