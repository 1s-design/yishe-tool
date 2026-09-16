import CryptoJS from "crypto-js";
import { getUserApiKey } from "./api";
import { DESIGN_TOOL_FEATURE_CODES } from "./feature-codes";
import { postAgentProxy } from "./proxy-client";
import { AI_TIMEOUTS } from "./shared/timeout";
import { aiSettings } from "./settings";

// 加密密钥（需要与服务端 AI_API_KEY_RESPONSE_ENCRYPT_SECRET 一致）
const ENCRYPT_SECRET =
  String(
    import.meta.env.VITE_AI_API_KEY_RESPONSE_ENCRYPT_SECRET || "",
  ).trim() || "1s-design-encrypt-key";

// 缓存解密后的配置
type CachedAiConfig = {
  apiKey: string;
  model: string;
  baseURL: string;
  name: string;
};

const cachedConfigMap = new Map<string, CachedAiConfig>();

function getCacheKey(featureCode: string, keyId?: number | null): string {
  return `${featureCode}:${keyId ?? "default"}`;
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
 */
export async function getAIConfig(
  keyId?: number | null,
  featureCode: string = DESIGN_TOOL_FEATURE_CODES.chat,
): Promise<{
  apiKey: string;
  model: string;
  baseURL: string;
  name: string;
}> {
  const cacheKey = getCacheKey(featureCode, keyId);
  const cachedConfig = cachedConfigMap.get(cacheKey);
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    // 从服务端获取加密的 key
    const result = await getUserApiKey(featureCode, keyId);
    if (!result?.encryptedKey) {
      throw new Error("接口未返回可用的 API Key");
    }

    // 解密 key
    const apiKey = decryptKey(result.encryptedKey);

    // 缓存配置
    const nextConfig = {
      apiKey,
      model: result.config?.model || "gpt-4o",
      baseURL: result.config?.baseURL || "https://api.openai.com/v1",
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
 * 解析直连模式下的运行时参数
 */
async function resolveDirectConfig(
  keyId?: number | null,
  featureCode?: string,
  modelOverride?: string,
): Promise<{ baseURL: string; apiKey: string; model: string }> {
  const settings = aiSettings.value;
  if (settings.directKeySource === "custom") {
    const custom = settings.customConfig;
    if (!custom.baseURL) {
      throw new Error("直连模式未配置 Base URL，请在「AI 设置」中配置");
    }
    return {
      baseURL: custom.baseURL.trim(),
      apiKey: (custom.apiKey || "").trim(),
      model: modelOverride || custom.model || "gpt-4o",
    };
  }

  // 默认使用系统分配并解密的 key
  const sysConfig = await getAIConfig(
    keyId,
    featureCode || DESIGN_TOOL_FEATURE_CODES.chat,
  );
  return {
    baseURL: sysConfig.baseURL,
    apiKey: sysConfig.apiKey,
    model: modelOverride || sysConfig.model || "gpt-4o",
  };
}

/**
 * 前端调用 OpenAI Chat API（支持代理模式与直连模式）
 */
export async function directChat(options: {
  messages: Array<{ role: string; content: string | any[] }>;
  tools?: any[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  keyId?: number | null;
  featureCode?: string;
  timeoutMs?: number;
  reasoningEffort?: string;
  enableThinking?: boolean;
}): Promise<any> {
  const {
    messages,
    tools,
    model,
    temperature,
    maxTokens,
    keyId,
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
      keyId,
      model,
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
  const config = await resolveDirectConfig(keyId, featureCode, model);
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
    if (error.name === "AbortError") {
      throw new Error(`AI 直连请求超时 (${timeout}ms)`);
    }
    if (error.name === "TypeError" && error.message?.includes("Failed to fetch")) {
      throw new Error(
        `AI 直连失败（浏览器 CORS 跨域拦截）：目标地址 ${config.baseURL} 未允许跨域请求。请在「AI 设置」中切换为「服务端代理」模式，或为目标服务配置 CORS headers。`,
      );
    }
    throw error;
  }
}

/**
 * 前端调用 OpenAI Chat API（流式，支持代理与直连）
 */
export async function* directChatStream(options: {
  messages: Array<{ role: string; content: string | any[] }>;
  tools?: any[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  keyId?: number | null;
  featureCode?: string;
  timeoutMs?: number;
  reasoningEffort?: string;
}): AsyncGenerator<any, void, unknown> {
  const {
    messages,
    tools,
    model,
    temperature,
    maxTokens,
    keyId,
    featureCode,
    timeoutMs,
    reasoningEffort,
  } = options;

  const mode = aiSettings.value.mode || "proxy";

  // 1. 服务端代理模式
  if (mode === "proxy") {
    const body: any = {
      featureCode: featureCode || DESIGN_TOOL_FEATURE_CODES.chat,
      keyId,
      model,
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
  const config = await resolveDirectConfig(keyId, featureCode, model);
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
