import { apiInstance } from "@/api/apiInstance";
import { Url } from "@/api/url";
import { DESIGN_TOOL_FEATURE_CODES } from "./feature-codes";
import { directChat } from "./direct-client";
import type {
  AiChatOptions,
  AiTextOptions,
  AiVisionOptions,
  AiChatResponse,
} from "./types";

function unwrapResponseData<T>(response: any): T {
  return (response?.data?.data ?? response?.data ?? response) as T;
}

/**
 * 构建 OpenAI 风格的响应对象（从 fetch 响应解析）
 */
function buildChatResponse(data: any): AiChatResponse {
  return {
    id: data.id || `chatcmpl-${Date.now()}`,
    object: data.object || "chat.completion",
    created: data.created || Math.floor(Date.now() / 1000),
    model: data.model || "",
    choices: data.choices || [],
    usage: data.usage,
  };
}

export async function aiChat(options: AiChatOptions): Promise<AiChatResponse> {
  const {
    messages,
    featureCode,
    temperature,
    maxTokens,
    ...rest
  } = options;

  const data: any = await directChat({
    featureCode: featureCode || DESIGN_TOOL_FEATURE_CODES.chat,
    messages: messages as any,
    temperature: temperature ?? 0.7,
    maxTokens,
    ...rest,
  });

  return buildChatResponse(data);
}

export async function aiText(options: AiTextOptions): Promise<AiChatResponse> {
  const {
    prompt,
    systemPrompt,
    featureCode,
    temperature,
    maxTokens,
    responseFormat,
    ...rest
  } = options;

  // 构建消息
  const messages: Array<{ role: string; content: string }> = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const data: any = await directChat({
    featureCode: featureCode || DESIGN_TOOL_FEATURE_CODES.chat,
    messages: messages as any,
    temperature: temperature ?? 0.7,
    maxTokens,
    ...(responseFormat ? { response_format: responseFormat } : {}),
    ...rest,
  });

  return buildChatResponse(data);
}

export async function aiVision(
  options: AiVisionOptions,
): Promise<AiChatResponse> {
  const { prompt, imageUrls, systemPrompt, featureCode, ...rest } = options;

  // 构建消息内容（支持图文）
  const contentParts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

  // 添加图片
  for (const url of imageUrls) {
    contentParts.push({ type: "image_url", image_url: { url } });
  }

  // 添加文本
  contentParts.push({ type: "text", text: prompt });

  const messages: Array<{ role: string; content: any }> = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: contentParts });

  const data: any = await directChat({
    featureCode: featureCode || DESIGN_TOOL_FEATURE_CODES.chat,
    messages: messages as any,
    temperature: 0.7,
    ...rest,
  });

  return buildChatResponse(data);
}

export async function aiGetUsageOptions(): Promise<any[]> {
  const res = await apiInstance.get(Url.AI_API_KEY_USAGE_OPTIONS);
  return unwrapResponseData<any[]>(res);
}

export async function aiGetFeatureRegistry(): Promise<any[]> {
  const res = await apiInstance.get(Url.AI_FEATURE_REGISTRY);
  return unwrapResponseData<any[]>(res);
}

/**
 * 获取用户的 API Key（只能取该功能自己绑定的 Key）
 * @param feature 功能标识，如 'design.tool.ai.chat'
 */
export async function getUserApiKey(
  feature: string,
): Promise<{
  encryptedKey: string;
  config: Record<string, any>;
  name: string;
}> {
  const payload: Record<string, any> = { feature };

  const res = await apiInstance.post(Url.USER_GET_API_KEY, payload);
  return unwrapResponseData<{
    encryptedKey: string;
    config: Record<string, any>;
    name: string;
  }>(res);
}
