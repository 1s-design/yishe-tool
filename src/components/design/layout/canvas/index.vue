<template>
  <div class="container flex flex-col items-center">
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
              class="canvas-expand-pill-btn"
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

    <!-- 顶部动作工具栏 -->
    <div class="canvas-actions-panel">
      <div class="canvas-actions-panel__row">
        <Button
          class="canvas-action-button canvas-action-button--primary"
          variant="default"
          size="sm"
          @click="handleUploadClick"
          :disabled="shouldUpdateCanvasSticker && !isUpdatingSticker"
        >
          <Check class="w-3 h-3 mr-0.5" />
          {{ currentEditingCustomStickerId ? '保存修改' : '保存作品' }}
        </Button>

        <Button
          v-if="shouldUpdateCanvasSticker && !isUpdatingSticker"
          class="canvas-action-button update-required"
          variant="outline"
          size="sm"
          @click="genSticker"
          :disabled="isUpdatingSticker"
        >
          更新贴纸
        </Button>
        <Button
          v-else
          class="canvas-action-button"
          variant="outline"
          size="sm"
          @click="genSticker"
          :disabled="isUpdatingSticker"
        >
          {{ isUpdatingSticker ? '更新中...' : '已更新' }}
        </Button>

        <Button
          class="canvas-action-button"
          variant="outline"
          size="sm"
          @click="exportPng"
          :disabled="shouldUpdateCanvasSticker && !isUpdatingSticker"
        >
          导出
        </Button>

        <Button
          class="canvas-action-button text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          variant="outline"
          size="sm"
          @click="confirm({ title: '确定清空画布所有图层？', okText: '清空', cancelText: '取消' }).then((ok) => ok && clearCanvasChildren())"
        >
          清空
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <div class="canvas-actions-panel__dropdown-trigger">
              <Button class="canvas-action-button canvas-action-button--more" variant="outline" size="sm">
                •••
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @select="exportTrimmedPng">
              自动去除空白边框导出
            </DropdownMenuItem>
            <DropdownMenuItem @select="consoleStikcerOptions">
              在控制台打印贴纸信息
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- 图层选择条 -->
    <div class="canvas-layer-selector">
      <div class="canvas-layer-selector__label">
        <span>当前编辑图层</span>
        <span class="canvas-layer-count">({{ canvasStickerOptions.children?.length || 0 }})</span>
      </div>
      <div class="canvas-layer-selector__row">
        <Select
          :model-value="String(currentOperatingCanvasChildId)"
          @update:model-value="v => (currentOperatingCanvasChildId = v)"
          class="canvas-layer-select"
        >
          <SelectTrigger class="h-6 text-[11px]">
            <div class="canvas-layer-selected-text">
              <span class="canvas-layer-dot" />
              <span>{{ canvasChildLabelMap[currentOperatingCanvasChild.type] }}</span>
            </div>
          </SelectTrigger>

          <SelectContent>
            <template v-for="(item, index) in canvasStickerOptions.children" :key="item.id">
              <SelectItem
                class="canvas-child-select-option"
                :value="String(item.id)"
              >
                <div
                  class="canvas-layer-option-item"
                >
                  <span>{{ canvasChildLabelMap[item.type] }}</span>
                  <div style="flex: 1"></div>
                  <Button
                    v-if="item.type !== 'canvas' && item.type !== 'html' && item.id !== 'this_is_html_id'"
                    variant="ghost"
                    size="icon-xs"
                    class="text-destructive hover:text-destructive"
                    @click.stop="remove(item.id)"
                  >
                    <XCircle class="w-3 h-3"></XCircle>
                  </Button>
                </div>
              </SelectItem>
            </template>
          </SelectContent>
        </Select>

        <!-- 当前选中图层的快捷删除按钮 (画布与主代码画布不展示) -->
        <Tooltip
          v-if="currentOperatingCanvasChild?.type !== 'canvas' && currentOperatingCanvasChild?.type !== 'html' && currentOperatingCanvasChild?.id !== 'this_is_html_id'"
          :delay-duration="0"
        >
          <TooltipTrigger as-child>
            <button
              type="button"
              class="canvas-layer-delete-btn"
              title="删除当前图层"
              @click="confirm({ title: `确定删除当前【${canvasChildLabelMap[currentOperatingCanvasChild.type] || '图层'}】？`, okText: '删除', cancelText: '取消' }).then((ok) => ok && remove(currentOperatingCanvasChild.id))"
            >
              <XCircle class="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">删除当前选中图层</TooltipContent>
        </Tooltip>
      </div>
    </div>

    <div class="operate">
      <operateLayout></operateLayout>
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

      <!-- <div class="flex items-center gap-3">
        <Label class="w-[100px] shrink-0 text-xs">是否共享:</Label>
        <Switch
          v-model:checked="editForm.isPublic"
        />
      </div> -->
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
  addCanvasChild,
  removeCavnasChild,
  CanvasChildType,
  currentOperatingCanvasChildId,
  currentOperatingCanvasChild,
  currentEditingCustomStickerId,
  currentEditingCustomStickerFolderId,
  currentEditingCustomStickerName,
  showMainCanvas,
  canvasChildLabelMap,
  renderingLoading,
} from "./index.tsx";

import operateLayout from "./operateLayout/index.vue";
import {
  onMounted,
  ref,
  computed,
  watch,
  reactive,
  watchEffect,
  nextTick,
} from "vue";

import { Check, Maximize2, XCircle } from 'lucide-vue-next'
import { useLoadingOptions } from "@/components/loading/index.tsx";
import addPopover from "./addPopover.vue";
import Api from "@/api";
import { message } from '@/common/message';
import tagsInput from "@/components/design/components/tagsInput/tagsInput.vue";
import { stickerAutoplacementTags } from "@/components/design/components/tagsInput/index.ts";
import { executeAITool } from "@/ai/shared/execute-tool";
import { clearAgentDesignProvenance } from "@/ai/design-provenance";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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

function checkAndUpdate() {
  if (shouldUpdateCanvasSticker.value) {
    message.warning("请先点击'更新贴纸'按钮更新画布内容");
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

function remove(id) {
  removeCavnasChild(id);
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

function handleFolderNodeClick(data: any) {
  // el-tree 的 node-click 由展开/折叠箭头触发，不改变选中状态
  // 选中状态由 toggleFolderSelect 控制
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
    message.warning("请先点击'更新贴纸'按钮更新画布内容");
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
    message.warning("请先点击'更新贴纸'按钮更新画布内容");
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
 * 获取贴纸的主题色
 */
async function getCanvasStickerColor() {
  let colors = await canvasController.getPalette();
}

/**
 * @methods 手动生成贴纸
 */
function genSticker() {
  canvasController.activeUpdateRenderingCanvas();
}
</script>

<style lang="less" scoped>
.folder-tree-wrapper {
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--1s-border-color, #e8e8e8);
  border-radius: 6px;
  padding: 4px 6px;
  background: var(--1s-surface-background, #fafafa);
  font-size: 12px;
}

:deep(.folder-tree-item) {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 2px 6px;
  border-radius: 3px;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
  color: var(--1s-text-color);
  transition: all 0.15s;

  &:hover {
    background-color: var(--1s-hover-background);
  }

  &.is-selected {
    background-color: var(--1s-accent-color);
    color: #fff;

    &:hover {
      background-color: var(--1s-accent-color);
      filter: brightness(0.9);
    }

    .folder-check-icon {
      color: #fff;
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
  transition: transform 0.15s;

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
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--1s-border-color, #e8e8e8);
  font-size: 12px;
  color: var(--1s-text-color-secondary, #999);
}

.container {
  width: 100%;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  background: var(--1s-panel-background, #fafafa);
}

.canvas-preview-card {
  width: calc(100% - 16px);
  max-width: 320px;
  height: min(280px, calc(100vw - 48px));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 8px 4px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid var(--1s-border-color, #e4e4e7);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.canvas-preview-badge-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
  z-index: 10;
}

.canvas-expand-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 8px;
  font-size: 10px;
  font-weight: 500;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--1s-surface-background) 85%, transparent);
  backdrop-filter: blur(var(--1s-blur-sm));
  color: var(--1s-text-color);
  border: 1px solid var(--1s-border-color);
  box-shadow: var(--1s-shadow-sm);
  cursor: pointer;
  transition:
    background-color var(--1s-transition-base),
    box-shadow var(--1s-transition-base),
    transform var(--1s-transition-base),
    backdrop-filter var(--1s-transition-base);

  &:hover {
    background: var(--1s-surface-background);
    transform: translateY(-2px);
    box-shadow: var(--1s-shadow-md);
    backdrop-filter: blur(var(--1s-blur-md));
  }

  &:active {
    transform: translateY(0);
  }
}

.dark .canvas-expand-pill-btn {
  background: rgba(24, 24, 27, 0.85);
  color: #f4f4f5;
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);

  &:hover {
    background: #27272a;
  }
}

.canvas-actions-panel {
  width: 100%;
  padding: 4px 8px;
  box-sizing: border-box;
}

.canvas-actions-panel__row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  min-width: 0;
}

.canvas-action-button {
  margin-left: 0 !important;
  height: 24px !important;
  padding: 0 8px !important;
  font-size: 11px !important;
  border-radius: 4px !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  white-space: nowrap;
  flex: 1 1 auto;
}

.canvas-actions-panel__dropdown-trigger {
  display: inline-flex;
  flex: 0 0 auto;
}

.canvas-action-button--more {
  flex: 0 0 auto !important;
  min-width: 24px !important;
  padding: 0 6px !important;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.canvas-action-button--primary {
  font-weight: 600;
  background: var(--1s-accent-color) !important;
  border-color: var(--1s-accent-color) !important;
  color: #ffffff !important;
}

body.designiy-dark .canvas-action-button--primary {
  background: var(--1s-accent-color) !important;
  border-color: var(--1s-accent-color) !important;
  color: #111318 !important;
}

.canvas-layer-selector {
  width: 100%;
  padding: 4px 8px 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  box-sizing: border-box;

  .canvas-layer-selector__label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10px;
    font-weight: 600;
    color: var(--1s-text-color-secondary, #71717a);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 0 2px;
  }

  .canvas-layer-count {
    font-size: 10px;
    font-weight: 400;
    color: var(--1s-text-color-tertiary, #a1a1aa);
  }

  .canvas-layer-selector__row {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
  }

  .canvas-layer-select {
    flex: 1;
    min-width: 0;

    :deep(.el-select__wrapper) {
      height: 26px !important;
      min-height: 26px !important;
      padding: 0 8px !important;
      font-size: 11px !important;
      border-radius: 4px !important;
      background: var(--1s-elevated-background, #f4f4f5);
      border: 1px solid var(--1s-border-color, #e4e4e7);
      box-shadow: none !important;
    }
  }

  .canvas-layer-delete-btn {
    height: 26px;
    width: 26px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    background: var(--1s-elevated-background, #f4f4f5);
    border: 1px solid var(--1s-border-color, #e4e4e7);
    color: #ef4444;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.4);
      transform: scale(1.05);
    }
  }

  .canvas-layer-selected-text {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 500;
  }

  .canvas-layer-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--1s-accent-color);
    flex-shrink: 0;
  }

  .canvas-layer-option-item {
    display: flex;
    align-items: center;
    font-size: 11px;
    height: 100%;
    width: 100%;
  }
}

.operate {
  flex: 1;
  width: 100%;
  overflow: auto;
}

// 需要更新贴纸时的样式
:deep(.update-required) {
  color: #f59e0b !important;
  border-color: #f59e0b !important;
  font-weight: 600 !important;
}
</style>
