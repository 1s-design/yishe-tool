import { registerOperation } from "../registry";
import {
  currentCanvasControllerInstance,
  canvasStickerOptions,
} from "@/components/design/layout/canvas";
import { canvasToFile } from "@/common/transform";
import { uploadToCOS } from "@/api/cos";
import {
  createCustomSticker,
  updateCustomSticker,
  importCustomStickerToLibrary,
} from "@/api";
import { useLoginStatusStore } from "@/store/stores/login";
import Utils from "@/common/utils";
import { captureCanvasForAI, renderCurrentCanvasNow } from "@/ai/capture";
import { directChat } from "@/ai/direct-client";
import { AI_TIMEOUTS } from "@/ai/shared/timeout";
import { extractContent, extractJSON } from "@/ai/shared/response-parser";
import {
  buildStickerRecordMeta,
  getAgentDesignProvenance,
} from "@/ai/design-provenance";
import { beginLibraryUpload } from "@/services/designTabStatus";
import { currentEditingCustomStickerId, currentEditingCustomStickerFolderId } from "@/components/design/layout/canvas";

// 批量任务状态
let batchTaskState: {
  total: number;
  completed: number;
  description: string;
} | null = null;

const DEFAULT_HTML_TEMPLATE_MARKER = "主 HTML 模板";

function getCanvasDesignChildren() {
  return (canvasStickerOptions.value.children || []).filter(
    (child: any) => child?.type !== "canvas",
  );
}

function validateCanvasBeforeSave(): string {
  const children = getCanvasDesignChildren();
  if (!children.length) {
    return "当前画布没有可保存的设计内容";
  }

  const htmlChild = children.find(
    (child: any) => child?.id === "this_is_html_id" || child?.type === "html",
  );
  const htmlContent = String(htmlChild?.htmlContent || "").trim();
  const hasOnlyDefaultHtml =
    children.length === 1 &&
    htmlChild &&
    (!htmlContent || htmlContent.includes(DEFAULT_HTML_TEMPLATE_MARKER));

  if (hasOnlyDefaultHtml) {
    return "当前画布仍是默认 HTML 空模板，未保存。请等待设计生成完成后再保存";
  }

  return "";
}

function stripHtmlText(html: string): string {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferStickerMetaFromCanvas() {
  const htmlChild = getCanvasDesignChildren().find(
    (child: any) => child?.type === "html",
  );
  const plainText = stripHtmlText(htmlChild?.htmlContent || "");
  const title = plainText.slice(0, 18) || "AI生成贴纸";
  const description = plainText
    ? `基于当前画布生成的贴纸设计：${plainText.slice(0, 80)}`
    : "基于当前画布生成的贴纸设计";

  return {
    name: title,
    description,
    keywords: ["贴纸", "AI生成", title].filter(Boolean).join(","),
  };
}

function normalizeKeywords(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join(",");
  }
  return String(value || "")
    .split(/[,，、\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join(",");
}

function normalizeGeneratedMeta(value: any) {
  return {
    name: String(value?.name || "").trim(),
    description: String(value?.description || "").trim(),
    keywords: normalizeKeywords(value?.keywords),
  };
}

async function generateStickerMetaFromPrompt(
  prompt: string,
  promptHistory: Array<{ prompt: string }>,
): Promise<{
  name: string;
  description: string;
  keywords: string;
} | null> {
  try {
    const canvasMeta = inferStickerMetaFromCanvas();
    const revisions = promptHistory
      .slice(1)
      .map((entry, index) => `${index + 1}. ${entry.prompt}`)
      .join("\n");
    const response = await directChat({
      messages: [
        {
          role: "system",
          content: `你是贴纸素材信息编辑。根据设计提示词生成可用于素材库检索和展示的信息。

只输出 JSON：
{
  "name": "5-15字的明确名称",
  "description": "20-60字，说明主题、画面和风格",
  "keywords": "4-8个逗号分隔关键词"
}

不要使用“AI生成贴纸”这类空泛名称，不要输出 Markdown。`,
        },
        {
          role: "user",
          content: `原始设计提示词：\n${prompt.slice(0, 3000)}\n\n${revisions ? `后续修改提示词：\n${revisions.slice(0, 2000)}\n\n` : ""}画布文字摘要：\n${canvasMeta.description}`,
        },
      ],
      temperature: 0.2,
      maxTokens: 240,
      timeoutMs: AI_TIMEOUTS.quickEvaluate,
    });
    const parsed = extractJSON(extractContent(response));
    if (!parsed) return null;
    return normalizeGeneratedMeta(parsed);
  } catch (error) {
    console.error("[SaveSticker] 根据提示词生成元数据失败:", error);
    return null;
  }
}

// 批量任务工具
registerOperation({
  id: "canvas.startBatchTask",
  name: "开始批量任务",
  description:
    "开始一个批量创建任务。调用后系统会追踪任务进度，每次保存后会提示还需要完成多少个。在批量创建素材前必须先调用此工具。",
  group: "贴纸",
  params: [
    {
      name: "total",
      label: "总数",
      type: "number",
      required: true,
      description: "需要创建的素材总数",
    },
    {
      name: "description",
      label: "任务描述",
      type: "string",
      description: "任务描述，如：创建3个渐变素材",
    },
  ],
  async execute(params) {
    const { total, description } = params;

    if (!total || total < 1) {
      return { success: false, message: "总数必须大于0" };
    }

    batchTaskState = {
      total: Number(total),
      completed: 0,
      description: description || `创建${total}个素材`,
    };

    return {
      success: true,
      message: `批量任务已开始：${batchTaskState.description}`,
      data: {
        total: batchTaskState.total,
        description: batchTaskState.description,
        hint: `请开始创建第 1/${total} 个素材，完成后调用 canvas.updateAndSaveSticker 保存。`,
      },
    };
  },
});

// 获取批量任务进度
registerOperation({
  id: "canvas.getBatchProgress",
  name: "获取批量任务进度",
  description: "获取当前批量任务的进度信息。",
  group: "贴纸",
  params: [],
  async execute() {
    if (!batchTaskState) {
      return { success: true, message: "当前没有进行中的批量任务", data: null };
    }

    return {
      success: true,
      message: "批量任务进度",
      data: {
        total: batchTaskState.total,
        completed: batchTaskState.completed,
        remaining: batchTaskState.total - batchTaskState.completed,
        description: batchTaskState.description,
      },
    };
  },
});

// AI 分析画布生成贴纸信息
async function generateStickerMetaFromCanvas(): Promise<{
  name: string;
  description: string;
  keywords: string;
}> {
  try {
    const imageBase64 = await captureCanvasForAI();

    const response = await directChat({
      messages: [
        {
          role: "system",
          content: `你是一个设计分析助手。分析图片内容，生成贴纸的元数据信息。

返回 JSON 格式：
{
  "name": "简洁的贴纸名称（5-15字）",
  "description": "描述设计内容和风格（20-50字）",
  "keywords": "关键词1,关键词2,关键词3（3-5个，逗号分隔）"
}

只返回 JSON，不要其他内容。`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请分析这个贴纸设计，生成名称、描述和关键词。",
            },
            {
              type: "image_url",
              image_url: { url: imageBase64, detail: "low" },
            },
          ],
        },
      ],
      temperature: 0.3,
      maxTokens: 200,
      timeoutMs: AI_TIMEOUTS.quickEvaluate,
    });

    const res = response as any;
    let content = "";
    if (res?.choices?.[0]?.message?.content) {
      content = res.choices[0].message.content;
    } else if (res?.data?.choices?.[0]?.message?.content) {
      content = res.data.choices[0].message.content;
    } else if (typeof res?.data === "string") {
      content = res.data;
    }

    // 解析 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return normalizeGeneratedMeta(parsed);
    }

    return { name: "AI生成贴纸", description: "", keywords: "" };
  } catch (error) {
    console.error("[SaveSticker] AI 生成元数据失败:", error);
    return { name: "AI生成贴纸", description: "", keywords: "" };
  }
}

registerOperation({
  id: "canvas.updateAndSaveSticker",
  name: "保存自定义贴纸",
  description:
    "一键将当前画布内容渲染为贴纸图片，上传并保存到自定义贴纸。可编辑的画布数据仅存于自定义贴纸；用户可从该模块再次打开编辑，或另行复制到素材库。",
  group: "贴纸",
  params: [
    {
      name: "name",
      label: "贴纸名称",
      type: "string",
      placeholder: "输入贴纸名称（留空则使用画布内容生成）",
      description: "保存到自定义贴纸库时的名称，留空会从画布内容生成基础名称",
    },
    {
      name: "description",
      label: "贴纸描述",
      type: "string",
      placeholder: "输入贴纸描述（留空则使用画布内容生成）",
      description: "贴纸的描述信息，留空会从画布内容生成基础描述",
    },
    {
      name: "keywords",
      label: "关键字",
      type: "string",
      placeholder: "多个关键字用逗号分隔（留空则使用画布内容生成）",
      description: "贴纸的搜索关键字，留空会从画布内容生成基础关键词",
    },
    {
      name: "autoTrim",
      label: "自动裁剪",
      type: "boolean",
      default: true,
      description: "自动去除白色/透明边框",
    },
    {
      name: "folderId",
      label: "文件夹ID",
      type: "string",
      placeholder: "输入文件夹ID（留空则保存到根目录）",
      description: "指定保存到哪个文件夹，留空则保存到根目录",
    },
    {
      name: "autoGenerateMeta",
      label: "AI生成元数据",
      type: "boolean",
      default: false,
      description:
        "是否通过视觉分析自动生成名称、描述和关键词。Agent 制作的贴纸会自动根据提示词生成，无需开启此选项。",
    },
    {
      name: "customStickerId",
      label: "自定义贴纸ID",
      type: "string",
      description: "编辑已有自定义贴纸时传入；不传则创建新的自定义贴纸",
    },
    {
      name: "autoImportToLibrary",
      label: "同时导入素材库",
      type: "boolean",
      default: false,
      description: "保存自定义贴纸后，是否同时物理复制一份到普通贴纸素材库（获取 stickerId）",
    },
    {
      name: "materialFolderId",
      label: "素材库文件夹ID",
      type: "string",
      placeholder: "留空则保存到素材库根目录",
      description: "如果开启了同时导入素材库，可指定导入到素材库的目标文件夹ID",
    },
  ],
  async execute(params, ctx) {
    let {
      name,
      description,
      keywords,
      autoTrim = true,
      folderId,
      autoGenerateMeta = false,
      customStickerId: requestedCustomStickerId,
      autoImportToLibrary = false,
      materialFolderId,
    } = params;
    // 批量创作的每一张图都必须创建独立的 custom_sticker，不能沿用上一张的编辑 ID。
    const editingCustomStickerId = batchTaskState
      ? undefined
      : requestedCustomStickerId || currentEditingCustomStickerId.value || undefined;

    let controller = currentCanvasControllerInstance.value;
    if (!controller) {
      // 尝试等待 DOM / 控制器挂载 (最多 1500ms)
      for (let i = 0; i < 3 && !controller; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        controller = currentCanvasControllerInstance.value;
      }
    }
    if (!controller) {
      return {
        success: false,
        message: "画布控制器未初始化，请确保画布已加载",
      };
    }

    const loginStore = useLoginStatusStore();
    if (!loginStore.isLogin) {
      return { success: false, message: "请先登录后再保存自定义贴纸" };
    }

    let finishLibraryUpload: ((success?: boolean) => void) | null = null;

    try {
      const validationError = validateCanvasBeforeSave();
      if (validationError) {
        return { success: false, message: validationError };
      }

      const provenance = getAgentDesignProvenance(canvasStickerOptions.value);
      // 只有完全无元数据时才走 AI 生成（耗时操作）；有 name 就用快速 fallback
      const needGenerate =
        !name &&
        (!!autoGenerateMeta || provenance?.source === "ai-agent");
      const promptMetaPromise =
        needGenerate && provenance
          ? generateStickerMetaFromPrompt(
              provenance.prompt,
              provenance.promptHistory,
            )
          : null;

      await renderCurrentCanvasNow({ timeoutMs: 30_000 });

      const postRenderValidationError = validateCanvasBeforeSave();
      if (postRenderValidationError) {
        return { success: false, message: postRenderValidationError };
      }

      let metadataGenerationSource = "provided";
      if (needGenerate) {
        const generatedMeta = promptMetaPromise
          ? await Promise.race([
              promptMetaPromise,
              new Promise<null>((resolve) => setTimeout(() => resolve(null), 15_000)),
            ])
          : await Promise.race([
              generateStickerMetaFromCanvas(),
              new Promise<null>((resolve) => setTimeout(() => resolve(null), 15_000)),
            ]);
        if (generatedMeta) {
          name = name || generatedMeta.name;
          description = description || generatedMeta.description;
          keywords = keywords || generatedMeta.keywords;
          metadataGenerationSource = provenance ? "prompt" : "vision";
        }
      }

      const fallbackMeta = inferStickerMetaFromCanvas();
      name = name || fallbackMeta.name;
      description = description || fallbackMeta.description;
      keywords = keywords || fallbackMeta.keywords;
      keywords = normalizeKeywords(keywords);
      if (metadataGenerationSource === "provided" && needGenerate) {
        metadataGenerationSource = "canvas-fallback";
      }

      const canvasEl = controller.canvasEl;
      if (!canvasEl) {
        return { success: false, message: "画布元素未找到" };
      }

      let file: File;
      const uniqueFileName = `sticker_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
      if (autoTrim) {
        const trimmedCanvas = Utils.trimCanvas(canvasEl);
        file = await canvasToFile(trimmedCanvas, uniqueFileName);
      } else {
        file = await canvasToFile(canvasEl, uniqueFileName);
      }

      // 验证文件有效性
      if (!file || file.size < 100) {
        return { success: false, message: `画布导出文件异常（大小: ${file?.size ?? 0} bytes），已阻止保存` };
      }

      finishLibraryUpload = beginLibraryUpload();
      const cos = await Promise.race([
        uploadToCOS({
          file,
          category: "custom-sticker",
          account:
            loginStore.userInfo?.account ||
            loginStore.userInfo?.name ||
            undefined,
          userId: loginStore.userInfo?.id,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("COS 上传超时 (30s)")), 30_000),
        ),
      ]);

      // 验证上传结果：检查 URL 是否可达
      if (!cos?.url) {
        return { success: false, message: "COS 上传未返回有效 URL" };
      }
      try {
        const headResp = await fetch(cos.url, { method: "HEAD" });
        if (!headResp.ok) {
          return { success: false, message: `上传验证失败：文件不可访问 (${headResp.status})` };
        }
      } catch (verifyErr: any) {
        // HEAD 请求可能因 CORS 失败，不阻断保存但记录警告
        console.warn("[SaveSticker] 上传验证 HEAD 请求失败（可能为 CORS）:", verifyErr?.message);
      }

      const canvasData = JSON.parse(JSON.stringify(canvasStickerOptions.value));
      const stickerMeta = buildStickerRecordMeta(canvasData, provenance);

      const payload = {
        url: cos.url,
        suffix: "png",
        name: name || "未命名贴纸",
        description: description || "",
        keywords: keywords || "",
        width: canvasEl.width,
        height: canvasEl.height,
        aspectRatio: canvasEl.height ? canvasEl.width / canvasEl.height : undefined,
        folderId: folderId ?? currentEditingCustomStickerFolderId.value ?? null,
        meta: stickerMeta,
      };
      const savedRecord: any = await Promise.race([
        editingCustomStickerId
          ? updateCustomSticker(String(editingCustomStickerId), payload)
          : createCustomSticker(payload),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("保存到贴纸库超时 (15s)")), 15_000),
        ),
      ]);
      const customStickerId = String(savedRecord?.id || editingCustomStickerId || "").trim();
      if (!customStickerId) throw new Error("自定义贴纸已上传，但服务端未返回 customStickerId");
      currentEditingCustomStickerId.value = customStickerId;
      currentEditingCustomStickerFolderId.value = payload.folderId || null;
      finishLibraryUpload?.(true);
      finishLibraryUpload = null;
      let importedSticker: any = null;
      if (autoImportToLibrary) {
        try {
          importedSticker = await importCustomStickerToLibrary({
            customStickerId,
            folderId: materialFolderId || null,
          });
        } catch (importErr: any) {
          console.warn("[SaveSticker] 自动导入素材库失败:", importErr);
        }
      }

      const nextBatchProgress = batchTaskState
        ? {
            total: batchTaskState.total,
            completed: Math.min(
              batchTaskState.completed + 1,
              batchTaskState.total,
            ),
            remaining: Math.max(
              batchTaskState.total - batchTaskState.completed - 1,
              0,
            ),
          }
        : null;

      if (batchTaskState && nextBatchProgress) {
        batchTaskState.completed = nextBatchProgress.completed;
        if (batchTaskState.completed >= batchTaskState.total) {
          batchTaskState = null;
        }
      }

      const successMessage = importedSticker?.id
        ? `贴纸「${name}」已保存到自定义贴纸，并已同步导入到素材库 (stickerId: ${importedSticker.id})`
        : `贴纸「${name}」已保存到自定义贴纸`;

      return {
        success: true,
        message: successMessage,
        data: {
          customStickerId,
          stickerId: importedSticker?.id || null,
          importedToLibrary: !!importedSticker?.id,
          name,
          description,
          keywords,
          url: cos.url,
          cosKey: cos.key,
          savedAs: editingCustomStickerId ? "updated" : "created",
          aiGenerated: needGenerate,
          metadataGenerationSource,
          source: provenance?.source || "manual",
          prompt: provenance?.prompt || null,
          promptHistoryCount: provenance?.promptHistory.length || 0,
          // 批量任务进度
          batchProgress: nextBatchProgress,
        },
      };
    } catch (err: any) {
      finishLibraryUpload?.(false);
      return {
        success: false,
        message: `保存失败: ${err?.message || "未知错误"}`,
      };
    }
  },
});
