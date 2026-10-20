import { useLocalStorage } from "@vueuse/core";
import { postAgentProxy } from "./proxy-client";
import { DESIGN_TOOL_FEATURE_CODES } from "./feature-codes";

export type AiRequestMode = "proxy" | "direct";

/**
 * AI 设置。
 *
 * 硬保证：直连也只允许使用「AI 使用设置」中为本功能绑定的 Key，
 * 因此不再提供自定义 BaseURL / API Key / 模型 的配置项。
 */
export interface AiSettings {
  mode: AiRequestMode;
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  mode: "proxy",
};

export const aiSettings = useLocalStorage<AiSettings>(
  "_1s_ai_client_settings",
  DEFAULT_AI_SETTINGS,
  {
    mergeDefaults: true,
  },
);

export function getAiSettings(): AiSettings {
  return { mode: aiSettings.value.mode || "proxy" };
}

export function updateAiSettings(partial: Partial<AiSettings>) {
  aiSettings.value = {
    mode: partial.mode || aiSettings.value.mode || "proxy",
  };
}

export function resetAiSettings() {
  aiSettings.value = JSON.parse(JSON.stringify(DEFAULT_AI_SETTINGS));
}

export interface ConnectionTestResult {
  success: boolean;
  latencyMs: number;
  message: string;
  model?: string;
  responsePreview?: string;
}

/**
 * 测试 AI 连接可用性
 */
export async function testAiConnection(
  targetConfig?: Partial<AiSettings>,
): Promise<ConnectionTestResult> {
  const current = {
    ...aiSettings.value,
    ...(targetConfig || {}),
  };

  const startTime = Date.now();

  if (current.mode === "proxy") {
    try {
      const res: any = await postAgentProxy(
        {
          featureCode: DESIGN_TOOL_FEATURE_CODES.chat,
          messages: [{ role: "user", content: "Hi" }],
          max_tokens: 10,
        },
        { timeoutMs: 15000 },
      );

      const latencyMs = Date.now() - startTime;
      const text =
        res?.choices?.[0]?.message?.content ||
        res?.message ||
        "连接成功";
      const model = res?.model || "后端代理模型";

      return {
        success: true,
        latencyMs,
        message: "服务端代理连接成功",
        model,
        responsePreview: String(text).slice(0, 100),
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      return {
        success: false,
        latencyMs,
        message: err?.response?.data?.message || err?.message || "代理请求失败",
      };
    }
  }

  // 直连模式测试：只用「AI 使用设置」中绑定的 Key
  let baseURL = "";
  let apiKey = "";
  let model = "";
  try {
    const { getAIConfig } = await import("./direct-client");
    const sysConfig = await getAIConfig();
    baseURL = sysConfig.baseURL;
    apiKey = sysConfig.apiKey;
    model = sysConfig.model;
  } catch (err: any) {
    return {
      success: false,
      latencyMs: 0,
      message: `获取系统 API Key 失败: ${err.message || err}`,
    };
  }

  const endpoint = `${baseURL.replace(/\/+$/, "")}/chat/completions`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 10,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errorText = await res.text();
      let parsedMsg = errorText;
      try {
        const json = JSON.parse(errorText);
        parsedMsg = json.error?.message || json.message || errorText;
      } catch {}
      return {
        success: false,
        latencyMs,
        message: `HTTP ${res.status}: ${parsedMsg}`,
      };
    }

    const data = await res.json();
    const text =
      data?.choices?.[0]?.message?.content ||
      "连接成功";
    const resModel = data?.model || model;

    return {
      success: true,
      latencyMs,
      message: "直连成功",
      model: resModel,
      responsePreview: String(text).slice(0, 100),
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    if (err.name === "AbortError") {
      return {
        success: false,
        latencyMs,
        message: "请求超时（超过 15 秒未响应）",
      };
    }
    if (err.name === "TypeError" && err.message?.includes("Failed to fetch")) {
      return {
        success: false,
        latencyMs,
        message: `跨域或网络连接失败（CORS 拦截）：目标服务未开放 CORS 或网络不可达。若直连外部 API 遇跨域限制，请切换为「服务端代理」模式。`,
      };
    }
    return {
      success: false,
      latencyMs,
      message: err.message || "直连请求失败",
    };
  }
}
