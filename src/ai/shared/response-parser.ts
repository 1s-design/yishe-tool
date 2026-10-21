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

function decodeXmlEntities(val: string): string {
  return String(val || "")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export function parseEmbeddedToolCalls(content: string): {
  content: string;
  tool_calls: any[];
} {
  if (typeof content !== "string" || !content) {
    return { content: "", tool_calls: [] };
  }

  const toolCalls: any[] = [];
  let cleanedContent = content;

  // 1. Check for DSML format: <｜｜DSML｜｜ calls> or <||DSML|| calls>
  const dsmlCallsPattern =
    /<[｜|]{1,2}\s*DSML\s*[｜|]{1,2}\s*calls\s*>([\s\S]*?)<\/[｜|]{1,2}\s*DSML\s*[｜|]{1,2}\s*calls\s*>/gi;
  let dsmlCallsMatch: RegExpExecArray | null;

  const invokePattern =
    /<[｜|]{1,2}\s*DSML\s*[｜|]{1,2}\s*invoke\s+([^>]+)>([\s\S]*?)<\/[｜|]{1,2}\s*DSML\s*[｜|]{1,2}\s*invoke\s*>/gi;
  const paramPattern =
    /<[｜|]{1,2}\s*DSML\s*[｜|]{1,2}\s*parameter\s+([^>]+)>([\s\S]*?)<\/[｜|]{1,2}\s*DSML\s*[｜|]{1,2}\s*parameter\s*>/gi;

  function processInvokeBlock(attrs: string, inner: string) {
    const nameMatch = attrs.match(/name=["']([^"']+)["']/i);
    if (!nameMatch) return;
    const toolName = nameMatch[1].trim();

    const args: Record<string, any> = {};
    let hasParams = false;
    let pMatch: RegExpExecArray | null;
    paramPattern.lastIndex = 0;
    while ((pMatch = paramPattern.exec(inner)) !== null) {
      hasParams = true;
      const pAttrs = pMatch[1];
      const pNameMatch = pAttrs.match(/name=["']([^"']+)["']/i);
      if (!pNameMatch) continue;
      const pName = pNameMatch[1].trim();

      const isString = /string=["']true["']/i.test(pAttrs);
      const rawVal = decodeXmlEntities(pMatch[2].trim());

      if (isString) {
        args[pName] = rawVal;
      } else {
        try {
          args[pName] = JSON.parse(rawVal);
        } catch {
          args[pName] = rawVal;
        }
      }
    }

    if (!hasParams) {
      const trimmedInner = inner.trim();
      if (trimmedInner.startsWith("{") && trimmedInner.endsWith("}")) {
        try {
          Object.assign(args, JSON.parse(decodeXmlEntities(trimmedInner)));
        } catch {}
      }
    }

    toolCalls.push({
      id: `call_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`,
      type: "function",
      function: {
        name: toolName,
        arguments: JSON.stringify(args),
      },
    });
  }

  // Find all <DSML calls> blocks
  while ((dsmlCallsMatch = dsmlCallsPattern.exec(content)) !== null) {
    const callsBody = dsmlCallsMatch[1];
    invokePattern.lastIndex = 0;
    let invMatch: RegExpExecArray | null;
    while ((invMatch = invokePattern.exec(callsBody)) !== null) {
      processInvokeBlock(invMatch[1], invMatch[2]);
    }
  }

  // Also check for standalone <DSML invoke> without <DSML calls> wrapper
  if (toolCalls.length === 0) {
    invokePattern.lastIndex = 0;
    let invMatch: RegExpExecArray | null;
    while ((invMatch = invokePattern.exec(content)) !== null) {
      processInvokeBlock(invMatch[1], invMatch[2]);
    }
  }

  // Strip DSML blocks from cleaned content
  cleanedContent = cleanedContent
    .replace(
      /<[｜|]{1,2}\s*DSML\s*[｜|]{1,2}\s*calls\s*>[\s\S]*?<\/[｜|]{1,2}\s*DSML\s*[｜|]{1,2}\s*calls\s*>/gi,
      "",
    )
    .replace(
      /<[｜|]{1,2}\s*DSML\s*[｜|]{1,2}\s*invoke\s+[^>]+>[\s\S]*?<\/[｜|]{1,2}\s*DSML\s*[｜|]{1,2}\s*invoke\s*>/gi,
      "",
    )
    .replace(/<[｜|]{1,2}\s*DSML\s*[｜|]{1,2}\s*calls\s*>[\s\S]*$/gi, "") // truncated
    .trim();

  // 2. Also check for <tool_call>...</tool_call> format
  const toolCallTagPattern =
    /<(?:tool_call|function_call)>\s*([\s\S]*?)\s*<\/(?:tool_call|function_call)>/gi;
  let tcMatch: RegExpExecArray | null;
  while ((tcMatch = toolCallTagPattern.exec(cleanedContent)) !== null) {
    try {
      const parsed = JSON.parse(decodeXmlEntities(tcMatch[1].trim()));
      if (parsed && parsed.name) {
        toolCalls.push({
          id: `call_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`,
          type: "function",
          function: {
            name: parsed.name,
            arguments:
              typeof parsed.arguments === "string"
                ? parsed.arguments
                : JSON.stringify(parsed.arguments || {}),
          },
        });
      }
    } catch {}
  }
  cleanedContent = cleanedContent.replace(toolCallTagPattern, "").trim();

  return {
    content: cleanedContent,
    tool_calls: toolCalls,
  };
}

function postProcessParsedResponse(
  parsed: ParsedResponse | null,
): ParsedResponse | null {
  if (!parsed) return null;

  let content = parsed.content;
  let reasoningContent = parsed.reasoning_content;

  // Check for <think>...</think> in content if reasoning_content is absent
  if (typeof content === "string" && content.includes("<think>")) {
    const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/i);
    if (thinkMatch) {
      if (!reasoningContent) {
        reasoningContent = thinkMatch[1].trim();
      }
      content = content.replace(/<think>[\s\S]*?<\/think>/i, "").trim();
    }
  }

  const embedded = parseEmbeddedToolCalls(content);
  let toolCalls = parsed.tool_calls;

  if (!Array.isArray(toolCalls) || toolCalls.length === 0) {
    toolCalls = embedded.tool_calls.length > 0 ? embedded.tool_calls : undefined;
  } else if (embedded.tool_calls.length > 0) {
    const existingNames = new Set(
      toolCalls.map((tc: any) => tc?.function?.name).filter(Boolean),
    );
    for (const ec of embedded.tool_calls) {
      if (!existingNames.has(ec.function.name)) {
        toolCalls.push(ec);
      }
    }
  }

  return {
    content: embedded.content,
    tool_calls: toolCalls,
    reasoning_content: reasoningContent,
  };
}

export function parseChatResponse(response: any): ParsedResponse | null {
  const res = response as any;
  const candidates = [res, res?.data, res?.result, res?.response, res?.data?.data];
  for (const candidate of candidates) {
    const parsed = parseResponseCandidate(candidate);
    if (parsed) return postProcessParsedResponse(parsed);
  }

  if (typeof res?.data === "string")
    return postProcessParsedResponse({ content: res.data });
  if (typeof res?.result === "string")
    return postProcessParsedResponse({ content: res.result });
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
