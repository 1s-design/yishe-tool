<template>
  <div class="container canvas-editor-panel u-panel">
    <header class="u-panel__header canvas-editor-header">
      <div class="canvas-editor-heading">
        <strong>制作贴纸</strong>
        <span>{{ componentLayerItems.length ? `${componentLayerItems.length} 组件` : '画布' }}</span>
      </div>
      <div class="u-panel__actions canvas-header-actions">
        <addPopover>
          <button type="button" class="u-icon-btn u-icon-btn--xs" title="添加组件" aria-label="添加组件">
            <Plus class="w-3.5 h-3.5" />
          </button>
        </addPopover>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              type="button"
              class="u-icon-btn u-icon-btn--xs"
              title="更多操作"
              aria-label="更多操作"
            >
              <MoreHorizontal class="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-[168px]">
            <DropdownMenuItem :disabled="isUpdatingSticker" @click="genSticker">
              <RefreshCw class="w-3.5 h-3.5 mr-2" :class="{ 'animate-spin': isUpdatingSticker }" />
              {{ isUpdatingSticker ? '正在刷新渲染…' : '刷新画布渲染' }}
            </DropdownMenuItem>
            <DropdownMenuItem @click="consoleStikcerOptions">
              <Terminal class="w-3.5 h-3.5 mr-2" />
              打印配置到控制台
            </DropdownMenuItem>
            <DropdownMenuItem
              class="text-destructive focus:text-destructive"
              @click="confirm({ title: '确定清空画布所有图层？', okText: '清空', cancelText: '取消' }).then((ok) => ok && clearCanvasChildren())"
            >
              <Trash2 class="w-3.5 h-3.5 mr-2" />
              清空画布
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    <!-- 预览画布卡片 -->
    <div
      ref="canvasContainerRef"
      v-if="!showMainCanvas"
      v-loading="renderingLoading"
      v-bind="loadingOptions"
      class="canvas-preview-card mini-png-background"
    >
      <canvass></canvass>
      <div class="canvas-preview-badge-overlay">
        <Tooltip :delay-duration="0">
          <TooltipTrigger as-child>
            <button
              type="button"
              class="canvas-expand-pill-btn u-btn u-btn--sm u-btn--outline"
              @click="showMainCanvas = true"
            >
              <Maximize2 class="w-2.5 h-2.5" />
              <span>大画布</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">在中央工作区开启大画布全屏显示与高精度实时编辑</TooltipContent>
        </Tooltip>
      </div>
    </div>

    <!-- 图层列表：画布与代码画布合并为单一入口，下方展示子组件 -->
    <div class="layer-list">
      <div
        role="button"
        tabindex="0"
        class="u-list-row layer-row"
        :class="{ 'is-selected': isCanvasOrHtmlSelected }"
        @click="selectLayer('this_is_html_id')"
        @keydown.enter.prevent="selectLayer('this_is_html_id')"
      >
        <Frame class="layer-row__icon" />
        <span class="u-list-row__label">画布与代码</span>
        <span class="u-list-row__meta">{{ canvasSizeMeta }}</span>
      </div>

      <div
        v-for="child in componentLayerItems"
        :key="child.id"
        role="button"
        tabindex="0"
        class="u-list-row layer-row"
        :class="{ 'is-selected': child.id === currentOperatingCanvasChildId }"
        @click="selectLayer(child.id)"
        @keydown.enter.prevent="selectLayer(child.id)"
      >
        <component :is="layerIcon(child)" class="layer-row__icon" />
        <span class="u-list-row__label">{{ layerLabel(child) }}</span>
        <span class="u-list-row__meta">{{ layerMeta(child) }}</span>
        <button
          type="button"
          class="u-icon-btn u-icon-btn--xs layer-row__remove"
          title="删除组件"
          aria-label="删除组件"
          @click.stop="removeLayer(child.id)"
        >
          <X class="w-3 h-3" />
        </button>
      </div>
    </div>

    <!-- 上下文属性区 -->
    <div class="operate">
      <operateLayout></operateLayout>
    </div>

    <!-- 底部精简双按钮操作栏（导出/保存自动先完成最新渲染，不再强制手动点渲染） -->
    <div class="canvas-actions-panel">
      <div class="canvas-actions-panel__main">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              type="button"
              class="u-btn u-btn--outline canvas-action-export"
              :disabled="isUpdatingSticker || isExporting"
            >
              <Download class="w-3.5 h-3.5" />
              <span>{{ isExporting ? '导出中…' : '导出' }}</span>
              <ChevronDown class="w-3 h-3 opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" class="w-[184px]">
            <DropdownMenuItem @click="exportImage('png', false)">
              PNG 原图（透明底）
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportImage('png', true)">
              PNG 裁边（透明底）
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportImage('jpg', false)">
              JPG 原图（白底）
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportImage('jpg', true)">
              JPG 裁边（白底）
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          class="u-btn u-btn--solid canvas-action-primary"
          :disabled="isUpdatingSticker || isPreparingSave"
          @click="handleUploadClick"
        >
          <Check class="w-3.5 h-3.5" />
          <span>
            {{
              isPreparingSave
                ? '准备中…'
                : currentEditingCustomStickerId
                  ? '保存修改'
                  : '保存贴纸'
            }}
          </span>
        </button>
      </div>
    </div>
  </div>

  <Dialog :modal="false" v-model:open="showUploadModal">
    <DialogContent class="max-w-[540px]">
      <DialogHeader>
        <DialogTitle class="text-sm font-semibold">
          {{ currentEditingCustomStickerId ? '更新自定义贴纸（保存将覆盖原作品）' : '保存自定义贴纸（新建作品）' }}
        </DialogTitle>
      </DialogHeader>
      <div style="padding: 12px" class="flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <Label class="w-[100px] shrink-0 text-xs">贴纸名称：</Label>
          <Input v-model="editForm.name" placeholder="贴纸名称" class="flex-1" />
        </div>
        <div class="flex items-start gap-3">
          <Label class="w-[100px] shrink-0 text-xs pt-1.5">贴纸描述:</Label>
          <Textarea
            v-model="editForm.description"
            placeholder="贴纸描述"
            :rows="2"
            class="flex-1"
          />
        </div>
        <div class="flex items-start gap-3">
          <Label class="w-[100px] shrink-0 text-xs pt-1.5">关键字:</Label>
          <div class="flex-1">
            <tagsInput
              v-model="editForm.keywords"
              :autocomplete-tags="stickerAutoplacementTags"
              :autocomplete-width="400"
              autocompletePlacement="bottom"
            ></tagsInput>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <Label class="w-[100px] shrink-0 text-xs pt-1.5">保存到:</Label>
          <div class="folder-tree-wrapper">
            <folderTreeNode
              :nodes="folderTree"
              :selected-id="editForm.folderId"
              :on-select="toggleFolderSelect"
            />
            <div class="folder-tree-hint">
              当前选择: {{ selectedFolderName || '根目录' }}
              <Button v-if="editForm.folderId" variant="link" size="sm" @click="clearFolderSelect">
                取消选择
              </Button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <Label class="w-[100px] shrink-0 text-xs">保存格式:</Label>
          <div class="flex gap-2">
            <button
              type="button"
              class="u-btn u-btn--outline text-xs px-3 py-1.5"
              :class="editForm.format === 'png' ? 'u-btn--solid' : ''"
              @click="editForm.format = 'png'"
            >
              PNG（透明背景）
            </button>
            <button
              type="button"
              class="u-btn u-btn--outline text-xs px-3 py-1.5"
              :class="editForm.format === 'jpg' ? 'u-btn--solid' : ''"
              @click="editForm.format = 'jpg'"
            >
              JPG（白底）
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <Label class="w-[100px] shrink-0 text-xs">自动去除白色边框:</Label>
          <Switch v-model:checked="editForm.autoTrim" />
          <span class="ml-2 text-xs text-muted-foreground">{{ editForm.autoTrim ? '是' : '否' }}</span>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showUploadModal = false">取消</Button>
        <Button
          v-if="currentEditingCustomStickerId"
          variant="outline"
          :disabled="submitLoading"
          @click="doUpload(true)"
        >
          另存为新贴纸
        </Button>
        <Button :disabled="submitLoading" @click="doUpload(false)">
          {{ currentEditingCustomStickerId ? '确认更新' : '确认保存' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="tsx">
import {
  CanvasController,
  canvasStickerOptions,
  removeCavnasChild,
  canvasChildLabelMap,
  currentOperatingCanvasChildId,
  currentEditingCustomStickerId,
  currentEditingCustomStickerFolderId,
  currentEditingCustomStickerName,
  showMainCanvas,
  renderingLoading,
} from "./index.tsx";

import operateLayout from "./operateLayout/index.vue";
import { ref, computed } from "vue";

import {
  Check,
  Maximize2,
  Plus,
  X,
  Frame,
  Code,
  Type,
  Image,
  Cloud,
  BarChart3,
  Music,
  PenTool,
  Shapes,
  Activity,
  ChevronDown,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  Terminal,
  Download,
} from "lucide-vue-next";
import { useLoadingOptions } from "@/components/loading/index.tsx";
import addPopover from "./addPopover.vue";
import Api from "@/api";
import { message } from "@/common/message";
import tagsInput from "@/components/design/components/tagsInput/tagsInput.vue";
import { stickerAutoplacementTags } from "@/components/design/components/tagsInput/index.ts";
import { executeAITool } from "@/ai/shared/execute-tool";
import { clearAgentDesignProvenance } from "@/ai/design-provenance";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { confirm } from "@/components/ui/confirm";
import folderTreeNode from "./folderTreeNode.vue";

const canvasContainerRef = ref();
const loadingOptions = useLoadingOptions({});

let canvasController = new CanvasController({
  max: 320,
});

const shouldUpdateCanvasSticker = computed(() => {
  return canvasController.shouldUpdateCanvasSticker.value;
});

const isUpdatingSticker = computed(() => {
  return renderingLoading.value || canvasController.loading.value;
});

const isExporting = ref(false);
const isPreparingSave = ref(false);

let canvass = canvasController.getRender();

/* ---------- 图层列表 ---------- */

const FIXED_LAYER_IDS = new Set(["this_is_canvas_id", "this_is_html_id"]);

function isFixedLayer(child: any) {
  return FIXED_LAYER_IDS.has(child.id) || child.type === "canvas" || child.type === "html";
}

const componentLayerItems = computed(() =>
  (canvasStickerOptions.value.children || []).filter((child: any) => !isFixedLayer(child)),
);

const isCanvasOrHtmlSelected = computed(() => {
  const id = currentOperatingCanvasChildId.value;
  return !id || FIXED_LAYER_IDS.has(id) || !componentLayerItems.value.some((c: any) => c.id === id);
});

const canvasSizeMeta = computed(() => {
  const canvasChild: any = (canvasStickerOptions.value.children || []).find((c: any) => c.type === "canvas");
  const w = Math.round(Number(canvasChild?.width?.value) || 0);
  const h = Math.round(Number(canvasChild?.height?.value) || 0);
  return w && h ? `${w}×${h}` : "";
});

function selectLayer(id: string) {
  currentOperatingCanvasChildId.value = id;
}

function removeLayer(id: string) {
  removeCavnasChild(id);
}

function layerLabel(child: any) {
  return canvasChildLabelMap[child.type] || child.type;
}

function layerMeta(child: any) {
  return child.type || "";
}

function layerIcon(child: any) {
  const t = child.type;
  if (t === "canvas") return Frame;
  if (t === "html") return Code;
  if (t === "text" || t === "opentypeText" || t === "figlet") return Type;
  if (t === "image") return Image;
  if (t === "wordCloud" || t === "d3Cloud") return Cloud;
  if (t === "rawCanvas" || t === "waveform" || t === "simplexNoise") return Activity;
  if (t === "music" || t === "abcNotation" || t === "vexFlow") return Music;
  if (t === "roughShape" || t === "trianglify") return PenTool;
  if (
    String(t).includes("chart") ||
    String(t).includes("Chart") ||
    t === "d3" ||
    t === "plotly" ||
    t === "vegaLite" ||
    t === "markmap"
  ) {
    return BarChart3;
  }
  return Shapes;
}

async function ensureCanvasRendered() {
  if (!shouldUpdateCanvasSticker.value && !isUpdatingSticker.value) {
    return;
  }
  if (!isUpdatingSticker.value) {
    await canvasController.updateRenderingCanvasJob();
  }
  const deadline = Date.now() + 20_000;
  while ((canvasController.loading.value || renderingLoading.value) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

async function exportImage(format: "png" | "jpg" = "png", trimmed = false) {
  if (isExporting.value) return;
  isExporting.value = true;
  try {
    await ensureCanvasRendered();
    if (trimmed) {
      await canvasController.downloadTrimmedPng(format);
    } else {
      await canvasController.downloadPng(format);
    }
  } catch (e: any) {
    console.error("导出失败:", e);
    message.error("导出失败: " + (e?.message || e));
  } finally {
    isExporting.value = false;
  }
}

function clearCanvasChildren() {
  const canvasChild =
    canvasStickerOptions.value.children.find((child) => child.type === "canvas") ||
    canvasStickerOptions.value.children[0];

  const htmlChild =
    canvasStickerOptions.value.children.find((child) => child.id === "this_is_html_id") || {
      id: "this_is_html_id",
      type: "html",
      htmlContent: `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--1s-surface-background); color: var(--1s-text-color-secondary); font-family: sans-serif; font-size: 24px;">\n  主 HTML 模板\n</div>`,
      htmlBindings: {},
      htmlTemplateFields: [],
      htmlTemplateDefaultBindings: {},
      htmlTemplateMeta: null,
      transform: { rotate: 0, scaleX: 1, scaleY: 1 },
      filter: {
        blur: { value: 0, unit: "px" },
        brightness: { value: 100, unit: "%" },
        contrast: { value: 100, unit: "%" },
        grayscale: { value: 0, unit: "%" },
        hueRotate: { value: 0, unit: "deg" },
        invert: { value: 0, unit: "%" },
        opacity: { value: 100, unit: "%" },
        saturate: { value: 100, unit: "%" },
        sepia: { value: 0, unit: "%" },
      },
      zIndex: 0,
      undeletable: true,
    };

  htmlChild.htmlContent = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--1s-surface-background); color: var(--1s-text-color-secondary); font-family: sans-serif; font-size: 24px;">\n  主 HTML 模板\n</div>`;
  htmlChild.htmlBindings = {};
  htmlChild.htmlTemplateFields = [];
  htmlChild.htmlTemplateDefaultBindings = {};
  htmlChild.htmlTemplateMeta = null;

  const count = canvasStickerOptions.value.children.filter(
    (child) => child.type !== "canvas" && child.id !== "this_is_html_id",
  ).length;

  canvasStickerOptions.value.children = [canvasChild, htmlChild];
  currentEditingCustomStickerId.value = null;
  currentEditingCustomStickerFolderId.value = null;
  clearAgentDesignProvenance(canvasStickerOptions.value);
  currentOperatingCanvasChildId.value = "this_is_html_id";
  message.success(`已清空画布，共删除 ${count} 个关联组件`);
}

function consoleStikcerOptions() {
  console.log(JSON.parse(JSON.stringify(canvasStickerOptions.value)));
  message.success("已打印画布配置到控制台");
}

/* ---------- 保存逻辑 ---------- */

const showUploadModal = ref(false);
const submitLoading = ref(false);

const editForm = ref({
  name: "",
  description: "",
  keywords: [],
  autoTrim: true,
  folderId: null as string | null,
  format: "png" as "png" | "jpg",
});

const folderTree = ref<any[]>([]);

const selectedFolderName = computed(() => {
  if (!editForm.value.folderId) return "";
  function findName(nodes: any[]): string | null {
    for (const n of nodes) {
      if (n.id === editForm.value.folderId) return n.name;
      const found = findName(n.children || []);
      if (found) return found;
    }
    return null;
  }
  return findName(folderTree.value) || "";
});

function toggleFolderSelect(id: string) {
  editForm.value.folderId = editForm.value.folderId === id ? null : id;
}

function clearFolderSelect() {
  editForm.value.folderId = null;
}

async function loadFolderTree() {
  if (folderTree.value.length > 0) return;
  try {
    const res = await Api.getStickerFolderTree({ folderCategory: "customsticker" });
    folderTree.value = res || [];
  } catch (e) {
    console.error("获取文件夹树失败:", e);
  }
}

async function handleUploadClick() {
  if (isPreparingSave.value) return;
  isPreparingSave.value = true;
  try {
    await ensureCanvasRendered();
    loadFolderTree();
    if (currentEditingCustomStickerId.value) {
      editForm.value.name = currentEditingCustomStickerName.value || editForm.value.name;
      editForm.value.folderId = currentEditingCustomStickerFolderId.value || null;
    }
    showUploadModal.value = true;
  } finally {
    isPreparingSave.value = false;
  }
}

async function doUpload(saveAsNew = false) {
  submitLoading.value = true;

  const stashedEditingId = saveAsNew ? currentEditingCustomStickerId.value : null;
  if (saveAsNew) currentEditingCustomStickerId.value = null;
  const restoreEditingId = () => {
    if (stashedEditingId && !currentEditingCustomStickerId.value) {
      currentEditingCustomStickerId.value = stashedEditingId;
    }
  };

  try {
    await ensureCanvasRendered();

    const canvasWidth = canvasController.canvasEl?.width || 0;
    const canvasHeight = canvasController.canvasEl?.height || 0;

    if (canvasWidth <= 0 || canvasHeight <= 0) {
      throw new Error("无效的画布尺寸");
    }

    if (canvasWidth > 16384 || canvasHeight > 16384) {
      console.warn("当前画布尺寸极大，可能会导致处理时间过长或内存不足。");
    }

    const result = await executeAITool("canvas.updateAndSaveSticker", {
      name: editForm.value.name,
      description: editForm.value.description,
      keywords: editForm.value.keywords.join(","),
      autoTrim: editForm.value.autoTrim,
      folderId: editForm.value.folderId || null,
      format: editForm.value.format,
    });

    if (!result?.success) {
      restoreEditingId();
      submitLoading.value = false;
      return;
    }

    submitLoading.value = false;
    showUploadModal.value = false;
  } catch (e: any) {
    console.error("保存失败:", e);
    restoreEditingId();
    submitLoading.value = false;
    message.error("保存失败: " + (e?.message || e));
  }
}

function genSticker() {
  canvasController.activeUpdateRenderingCanvas();
}
</script>

<style lang="less" scoped>
.folder-tree-wrapper {
  width: 100%;
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid var(--1s-dialog-border);
  border-radius: 0;
  padding: 3px;
  background: var(--1s-control-surface-muted);
  font-size: var(--1s-control-font-md);
}

:deep(.folder-tree-item) {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: var(--1s-control-h-sm);
  padding: 0 6px;
  border-radius: 0;
  cursor: pointer;
  user-select: none;
  font-size: var(--1s-control-font-md);
  color: var(--1s-text-color);
  transition: var(--1s-control-transition);

  &:hover {
    background-color: var(--1s-state-hover);
  }

  &.is-selected {
    background-color: var(--1s-state-selected);
    color: var(--1s-state-selected-text);

    .folder-check-icon {
      color: var(--1s-state-selected-text);
    }
  }
}

:deep(.folder-tree-text) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.folder-check-icon) {
  color: var(--1s-accent-color);
  flex-shrink: 0;
  margin-left: 4px;
}

:deep(.folder-tree-arrow) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--1s-text-color-tertiary);
  cursor: pointer;
  transition: transform var(--1s-transition-fast);

  &.is-expanded {
    transform: rotate(90deg);
  }
}

:deep(.folder-tree-arrow-placeholder) {
  width: 14px;
  flex-shrink: 0;
}

.folder-tree-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: var(--1s-control-h-md);
  margin-top: 4px;
  padding: 4px 2px 0;
  border-top: 1px solid var(--1s-divider-color);
  font-size: var(--1s-control-font);
  color: var(--1s-text-color-secondary);
}

.canvas-editor-panel {
  background: var(--1s-panel-background);
}

.canvas-editor-heading {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;

  strong {
    color: var(--1s-text-color);
    font-size: var(--1s-control-font-md);
    font-weight: 600;
  }

  span {
    color: var(--1s-text-color-tertiary);
    font-size: var(--1s-control-font);
    font-variant-numeric: tabular-nums;
  }
}

.canvas-header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.container {
  width: 100%;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow: hidden;
  background: var(--1s-panel-background);
}

.canvas-preview-card {
  width: calc(100% - 16px);
  max-width: 320px;
  height: clamp(152px, 23vh, 192px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 7px auto 3px;
  position: relative;
  overflow: hidden;
  border-radius: 0;
  border: 1px solid var(--1s-dialog-border);
  background: var(--1s-canvas-shell-background);
  flex-shrink: 0;
}

.canvas-preview-badge-overlay {
  position: absolute;
  right: 6px;
  bottom: 6px;
  z-index: 10;
}

.canvas-expand-pill-btn {
  gap: 4px;
}

/* ---- 图层列表 ---- */
.layer-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 4px 0;
  border-top: 1px solid var(--1s-divider-color);
  border-bottom: 1px solid var(--1s-divider-color);
  flex-shrink: 0;
  max-height: 156px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.layer-row {
  width: auto;
  margin: 0 6px;
  cursor: pointer;
  flex-shrink: 0;

  .layer-row__icon {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
    color: var(--1s-text-color-secondary);
  }

  &.is-selected .layer-row__icon {
    color: var(--1s-state-selected-text);
  }

  .layer-row__remove {
    opacity: 0;
    margin-left: 2px;
  }

  &:hover .layer-row__remove {
    opacity: 0.7;
  }

  .layer-row__remove:hover {
    opacity: 1;
    color: var(--1s-danger-text, #ef4444);
  }
}

/* ---- 上下文属性区 ---- */
.operate {
  flex: 1;
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ---- 底部精简双按钮动作栏 ---- */
.canvas-actions-panel {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border-top: 1px solid var(--1s-divider-color);
  flex-shrink: 0;
  background: var(--1s-panel-background);
}

.canvas-actions-panel__main {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
}

.canvas-action-export {
  flex: 1;
  min-width: 0;
  height: 32px;
  gap: 4px;
  font-size: var(--1s-control-font-md);
  border-radius: 0;
}

.canvas-action-primary {
  flex: 1.35;
  min-width: 0;
  height: 32px;
  gap: 5px;
  font-size: var(--1s-control-font-md);
  font-weight: 600;
  border-radius: 0;
}
</style>
