<template>
  <div class="container canvas-editor-panel u-panel">
    <header class="u-panel__header canvas-editor-header">
      <div class="canvas-editor-heading">
        <strong>制作贴纸</strong>
        <span>{{ layerItems.length }} 图层</span>
      </div>
      <div class="u-panel__actions">
        <addPopover>
          <button type="button" class="u-icon-btn u-icon-btn--xs" title="添加图层" aria-label="添加图层">
            <Plus class="w-3.5 h-3.5" />
          </button>
        </addPopover>
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

    <!-- 图层列表 -->
    <div class="layer-list">
      <div
        v-for="child in layerItems"
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
          v-if="!isFixedLayer(child)"
          type="button"
          class="u-icon-btn u-icon-btn--xs layer-row__remove"
          title="删除图层"
          aria-label="删除图层"
          @click.stop="removeLayer(child.id)"
        >
          <X class="w-3 h-3" />
        </button>
      </div>
    </div>

    <!-- 上下文属性：只显示选中图层 -->
    <div class="operate">
      <operateLayout></operateLayout>
    </div>

    <!-- 底部动作栏 -->
    <div class="canvas-actions-panel">
      <div class="canvas-actions-panel__row">
        <button
          type="button"
          class="u-btn u-btn--outline canvas-action-secondary"
          :class="{ 'update-required': shouldUpdateCanvasSticker && !isUpdatingSticker }"
          :disabled="isUpdatingSticker || !shouldUpdateCanvasSticker"
          @click="genSticker"
        >
          {{ isUpdatingSticker ? '渲染中…' : '渲染' }}
        </button>

        <button
          type="button"
          class="u-btn u-btn--outline canvas-action-secondary"
          :disabled="shouldUpdateCanvasSticker && !isUpdatingSticker"
          @click="exportPng"
        >
          导出
        </button>

        <button
          type="button"
          class="u-btn u-btn--outline canvas-action-secondary"
          :disabled="shouldUpdateCanvasSticker && !isUpdatingSticker"
          @click="exportTrimmedPng"
        >
          裁边导出
        </button>

        <button
          type="button"
          class="u-btn u-btn--outline canvas-action-secondary"
          @click="consoleStikcerOptions"
        >
          打印信息
        </button>

        <button
          type="button"
          class="u-btn u-btn--outline canvas-action-secondary canvas-action-danger"
          @click="confirm({ title: '确定清空画布所有图层？', okText: '清空', cancelText: '取消' }).then((ok) => ok && clearCanvasChildren())"
        >
          清空
        </button>
      </div>

      <button
        type="button"
        class="u-btn u-btn--solid u-btn--block canvas-action-primary"
        :disabled="shouldUpdateCanvasSticker && !isUpdatingSticker"
        @click="handleUploadClick"
      >
        <Check class="w-3.5 h-3.5" />
        {{ currentEditingCustomStickerId ? '保存修改' : '保存' }}
      </button>
    </div>
  </div>

  <Dialog :modal="false" v-model:open="showUploadModal">
    <DialogContent class="max-w-[540px]">
      <DialogHeader>
        <DialogTitle class="text-sm font-semibold">
          {{ currentEditingCustomStickerId ? '更新自定义贴纸（保存将覆盖原作品）' : '保存自定义贴纸（新建作品）' }}
        </DialogTitle>
      </DialogHeader>
    <div
      style="padding: 12px"
      class="flex flex-col gap-3"
    >
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
        <Label class="w-[100px] shrink-0 text-xs">自动去除白色边框:</Label>
        <Switch v-model:checked="editForm.autoTrim" />
        <span class="ml-2 text-xs text-muted-foreground">{{ editForm.autoTrim ? '是' : '否' }}</span>
      </div>
    </div>
      <DialogFooter>
        <Button variant="outline" @click="showUploadModal = false">取消</Button>
        <Button :disabled="submitLoading" @click="doUpload">
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
import {
  ref,
  computed,
} from "vue";

import { Check, Maximize2, Plus, X, Frame, Code, Type, Image, Layers, Cloud, BarChart3, Music, PenTool, Shapes, Activity } from 'lucide-vue-next'
import { useLoadingOptions } from "@/components/loading/index.tsx";
import addPopover from "./addPopover.vue";
import Api from "@/api";
import { message } from '@/common/message';
import tagsInput from "@/components/design/components/tagsInput/tagsInput.vue";
import { stickerAutoplacementTags } from "@/components/design/components/tagsInput/index.ts";
import { executeAITool } from "@/ai/shared/execute-tool";
import { clearAgentDesignProvenance } from "@/ai/design-provenance";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
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

let canvass = canvasController.getRender();

/* ---------- 图层列表 ---------- */

const layerItems = computed(() => canvasStickerOptions.value.children || []);

const FIXED_LAYER_IDS = new Set(["this_is_canvas_id", "this_is_html_id"]);

function isFixedLayer(child: any) {
  return FIXED_LAYER_IDS.has(child.id) || child.type === "canvas" || child.type === "html";
}

function selectLayer(id: string) {
  currentOperatingCanvasChildId.value = id;
}

function removeLayer(id: string) {
  removeCavnasChild(id);
}

function layerLabel(child: any) {
  if (child.type === "canvas") return "画布";
  if (child.type === "html") return "代码画布";
  return canvasChildLabelMap[child.type] || child.type;
}

function layerMeta(child: any) {
  if (child.type === "canvas") {
    const w = Math.round(Number(child.width?.value) || 0);
    const h = Math.round(Number(child.height?.value) || 0);
    return w && h ? `${w}×${h}` : "";
  }
  if (child.type === "html") {
    return child.htmlTemplateFields?.length ? "模板" : "HTML";
  }
  return "";
}

function layerIcon(child: any) {
  const t = child.type;
  if (t === "canvas") return Frame;
  if (t === "html") return Code;
  if (t === "text" || t === "opentypeText" || t === "figlet") return Type;
  if (t === "image") return Image;
  if (t === "wordCloud") return Cloud;
  if (t === "rawCanvas" || t === "waveform" || t === "simplexNoise") return Activity;
  if (t === "music" || t === "abcNotation" || t === "vexFlow") return Music;
  if (t === "roughShape" || t === "trianglify") return PenTool;
  if (String(t).includes("chart") || String(t).includes("Chart") || t === "d3" || t === "plotly" || t === "vegaLite" || t === "markmap" || t === "d3Cloud" || t === "d3Sankey") return BarChart3;
  return Shapes;
}

function checkAndUpdate() {
  if (shouldUpdateCanvasSticker.value) {
    message.warning("请先点击「渲染」按钮更新画布内容");
    return false;
  }
  return true;
}

function exportPng() {
  if (!checkAndUpdate()) return;
  canvasController.downloadPng();
}

/* 导出去除多余空白的图片 */
function exportTrimmedPng() {
  if (!checkAndUpdate()) return;
  canvasController.downloadTrimmedPng();
}

function clearCanvasChildren() {
  // 除了画布和 Master HTML 元素，其他全移除；并将 HTML 元素重置为初始状态
  const canvasChild =
    canvasStickerOptions.value.children.find(
      (child) => child.type === "canvas",
    ) || canvasStickerOptions.value.children[0];

  const htmlChild =
    canvasStickerOptions.value.children.find(
      (child) => child.id === "this_is_html_id",
    ) || {
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

  // 重置 HTML 内容与绑定关系
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

/**
 * @method 在控制台打印当前贴纸配置信息
 */
function consoleStikcerOptions() {
  console.log(JSON.parse(JSON.stringify(canvasStickerOptions.value)));
}

/**
 * @method 处理保存逻辑
 */

const showUploadModal = ref(false);
const submitLoading = ref(false);

const editForm = ref({
  name: "",
  description: "",
  keywords: [],
  autoTrim: true, // 默认开启自动去除白色边框
  folderId: null as string | null, // 文件夹 ID
});

const folderTree = ref<any[]>([]);

const selectedFolderName = computed(() => {
  if (!editForm.value.folderId) return '';
  function findName(nodes: any[]): string | null {
    for (const n of nodes) {
      if (n.id === editForm.value.folderId) return n.name;
      const found = findName(n.children || []);
      if (found) return found;
    }
    return null;
  }
  return findName(folderTree.value) || '';
});

function toggleFolderSelect(id: string) {
  editForm.value.folderId = editForm.value.folderId === id ? null : id;
}

function clearFolderSelect() {
  editForm.value.folderId = null;
}

async function loadFolderTree() {
  if (folderTree.value.length > 0) return; // 已加载过则不重复加载
  try {
    const res = await Api.getStickerFolderTree({ folderCategory: "customsticker" });
    folderTree.value = res || [];
  } catch (e) {
    console.error("获取文件夹树失败:", e);
  }
}

function handleUploadClick() {
  if (shouldUpdateCanvasSticker.value) {
    message.warning("请先点击「渲染」按钮更新画布内容");
    return;
  }
  loadFolderTree();
  if (currentEditingCustomStickerId.value) {
    editForm.value.name = currentEditingCustomStickerName.value || editForm.value.name;
    editForm.value.folderId = currentEditingCustomStickerFolderId.value || null;
  }
  showUploadModal.value = true;
}

async function doUpload() {
  if (shouldUpdateCanvasSticker.value) {
    message.warning("请先点击「渲染」按钮更新画布内容");
    return;
  }
  submitLoading.value = true;

  try {
    // 先更新画布确保内容是最新的
    await canvasController.activeUpdateRenderingCanvas();

    // 等待画布更新完成
    while (canvasController.loading.value || renderingLoading.value) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // 检查画布尺寸是否合法
    const canvasWidth = canvasController.canvasEl.width;
    const canvasHeight = canvasController.canvasEl.height;

    if (canvasWidth <= 0 || canvasHeight <= 0) {
      throw new Error("无效的画布尺寸");
    }

    // 针对超大尺寸进行安全提示 (例如超过 16384 像素)
    if (canvasWidth > 16384 || canvasHeight > 16384) {
      console.warn("当前画布尺寸极大，可能会导致处理时间过长或内存不足。");
    }

    const result = await executeAITool("canvas.updateAndSaveSticker", {
      name: editForm.value.name,
      description: editForm.value.description,
      keywords: editForm.value.keywords.join(","),
      autoTrim: editForm.value.autoTrim,
      folderId: editForm.value.folderId || null,
    });

    if (!result?.success) {
      throw new Error(result?.message || "保存失败");
    }

    message.success(result.message || "保存成功");

    submitLoading.value = false;
    showUploadModal.value = false;
  } catch (e) {
    console.error("保存失败:", e);
    submitLoading.value = false;
    message.error("保存失败: " + (e.message || e));
  }
}

/**
 * @methods 手动渲染贴纸
 */
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
  max-height: 168px;
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

/* ---- 底部动作栏 ---- */
.canvas-actions-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 8px;
  box-sizing: border-box;
  border-top: 1px solid var(--1s-divider-color);
  flex-shrink: 0;
  background: var(--1s-panel-background);
}

.canvas-action-primary {
  width: 100%;
  height: 32px;
  font-size: var(--1s-control-font-md);
  font-weight: 600;
  border-radius: 0;
}

.canvas-actions-panel__row {
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  gap: 5px;
}

.canvas-action-secondary {
  min-width: 0;
  height: 28px;
  font-size: var(--1s-control-font-md);
  border-radius: 0;
}

.canvas-action-danger {
  color: var(--1s-danger-text, #ef4444);
  border-color: color-mix(in srgb, var(--1s-danger-text, #ef4444) 36%, transparent);

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--1s-danger-text, #ef4444) 10%, transparent);
    border-color: color-mix(in srgb, var(--1s-danger-text, #ef4444) 55%, transparent);
    color: var(--1s-danger-text, #ef4444);
  }
}

:deep(.update-required) {
  color: var(--1s-warning-text, #f59e0b);
  border-color: color-mix(in srgb, var(--1s-warning-text, #f59e0b) 42%, transparent);
  background: color-mix(in srgb, var(--1s-warning-text, #f59e0b) 10%, transparent);
}
</style>
