/**
 * 视觉能力可用性跟踪 — 视觉模型失败后自动降级为纯文本，不影响任务继续。
 */

let visionUnavailable = false;
let visionUnavailableReason = "";

export function isVisionAvailable(): boolean {
  return !visionUnavailable;
}

export function markVisionUnavailable(reason?: string): void {
  if (!visionUnavailable) {
    visionUnavailable = true;
    visionUnavailableReason = reason || "";
    console.warn(
      `[Vision] 视觉能力已降级为纯文本${reason ? `（原因: ${reason}）` : ""}。后续请求不再携带图片。`,
    );
  }
}

export function resetVisionMode(): void {
  visionUnavailable = false;
  visionUnavailableReason = "";
}

export function getVisionUnavailableReason(): string {
  return visionUnavailableReason;
}

/** 消息列表中是否包含图片内容 */
export function messagesContainImages(
  messages: Array<{ role: string; content: any }>,
): boolean {
  return messages.some(
    (m) =>
      Array.isArray(m?.content) &&
      m.content.some((part: any) => part?.type === "image_url"),
  );
}

/** 将消息中的图片剥离，仅保留文本（图片部分替换为占位说明） */
export function stripImagesFromMessages(
  messages: Array<{ role: string; content: any }>,
): Array<{ role: string; content: any }> {
  return messages.map((m) => {
    if (!Array.isArray(m.content)) return m;
    const textParts = m.content
      .filter((part: any) => part?.type !== "image_url")
      .map((part: any) => (typeof part === "string" ? part : part?.text || ""))
      .filter(Boolean);
    const placeholder =
      "[参考图片暂不可用，视觉模型未响应。请仅基于文字描述与画布状态完成任务。]";
    return {
      ...m,
      content: textParts.length
        ? [...textParts, placeholder].join("\n")
        : placeholder,
    };
  });
}

/** 判断错误是否属于视觉/图片相关失败 */
export function isVisionRelatedError(error: any): boolean {
  const msg = String(
    error?.message || error?.error?.message || error || "",
  ).toLowerCase();
  return (
    msg.includes("connection error") ||
    msg.includes("service error") ||
    msg.includes("image") ||
    msg.includes("vision") ||
    msg.includes("multimodal") ||
    msg.includes("not support") ||
    msg.includes("unsupported") ||
    msg.includes("base64") ||
    msg.includes("invalid image")
  );
}
