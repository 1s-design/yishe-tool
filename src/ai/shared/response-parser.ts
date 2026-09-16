export interface ParsedResponse {
  content: string;
  tool_calls?: any[];
  reasoning_content?: string;
}

function normalizeResponseContent(content: any): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      return part?.text || part?.content || part?.output_text || "";
    })
    .filter(Boolean)
    .join("\n");
}

function parseResponseCandidate(candidate: any): ParsedResponse | null {
  const message = candidate?.choices?.[0]?.message || candidate?.choices?.[0]?.delta;
  if (message) {
    return {
      content: normalizeResponseContent(message.content),
      tool_calls: message.tool_calls,
      reasoning_content: message.reasoning_content || undefined,
    };
  }

  if (candidate?.message && typeof candidate.message === "object") {
    return {
      content: normalizeResponseContent(candidate.message.content),
      tool_calls: candidate.message.tool_calls,
      reasoning_content: candidate.message.reasoning_content || undefined,
    };
  }

  if (Array.isArray(candidate?.output)) {
    const contentParts: string[] = [];
    const toolCalls: any[] = [];
    for (const item of candidate.output) {
      if (item?.type === "function_call" && item?.name) {
        toolCalls.push({
          id: item.call_id || item.id,
          type: "function",
          function: {
            name: item.name,
            arguments: item.arguments || "{}",
          },
        });
      }
      const text = normalizeResponseContent(item?.content);
      if (text) contentParts.push(text);
    }
    if (contentParts.length || toolCalls.length) {
      return {
        content: contentParts.join("\n"),
        tool_calls: toolCalls.length ? toolCalls : undefined,
      };
    }
  }

  if (typeof candidate?.output_text === "string") {
    return { content: candidate.output_text };
  }
  if (candidate?.content || candidate?.tool_calls) {
    return {
      content: normalizeResponseContent(candidate.content),
      tool_calls: candidate.tool_calls,
    };
  }
  return null;
}

export function parseChatResponse(response: any): ParsedResponse | null {
  const res = response as any;
  const candidates = [res, res?.data, res?.result, res?.response, res?.data?.data];
  for (const candidate of candidates) {
    const parsed = parseResponseCandidate(candidate);
    if (parsed) return parsed;
  }

  if (typeof res?.data === "string") return { content: res.data };
  if (typeof res?.result === "string") return { content: res.result };
  return null;
}

export function getChatResponseError(response: any): string {
  const candidates = [response, response?.data, response?.result, response?.response];
  for (const candidate of candidates) {
    const message =
      candidate?.error?.message ||
      candidate?.error ||
      candidate?.message ||
      candidate?.msg;
    if (typeof message === "string" && message.trim()) return message.trim();
  }
  return "";
}

export function extractContent(response: any): string {
  const parsed = parseChatResponse(response);
  return parsed?.content ?? "";
}

export function extractJSON(text: string): any {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }
  return null;
}
