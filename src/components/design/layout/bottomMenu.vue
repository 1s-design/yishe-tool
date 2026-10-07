<template>
  <div class="designiy-bottom-menu u-float-toolbar" aria-label="画布工具">
    <Tooltip>
      <TooltipTrigger as-child>
        <button class="u-icon-btn u-icon-btn--sm" type="button" aria-label="拾色器" @click="openEyeDropper">
          <Palette />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">拾色器</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <button class="u-icon-btn u-icon-btn--sm" type="button" aria-label="截图" @click="takeshot">
          <Camera />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">截图</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <button class="u-icon-btn u-icon-btn--sm" type="button" aria-label="截图列表" @click="showScreenshotDrawer = true">
          <Image />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">截图列表</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <button
          class="u-icon-btn u-icon-btn--sm"
          type="button"
          aria-label="切换全屏"
          :aria-pressed="isFullScreen"
          @click="isFullScreen = !isFullScreen"
        >
          <Maximize2 />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{{ isFullScreen ? '退出全屏' : '全屏' }}</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <button
          class="u-icon-btn u-icon-btn--sm u-icon-btn--danger"
          type="button"
          aria-label="移除所有贴纸"
          :disabled="!currentModelController"
          @click="removeAllDecals"
        >
          <Trash2 />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">移除所有贴纸</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <button class="u-icon-btn u-icon-btn--sm" type="button" aria-label="内置动画" @click="doBuiltInAnimations">
          <Video />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">内置动画</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <button class="u-icon-btn u-icon-btn--sm" type="button" aria-label="裁剪参考线" @click="showCropGuideModal = true">
          <Scissors />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">裁剪参考线</TooltipContent>
    </Tooltip>

    <div class="u-float-toolbar__divider" />

    <Tooltip>
      <TooltipTrigger as-child>
        <button class="u-btn u-btn--sm u-btn--solid" type="button" aria-label="自动生成" @click="autocreate">
          <Sparkles />
          <span>自动生成</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">自动根据当前控制台生成模型</TooltipContent>
    </Tooltip>

    <template v-if="showMainCanvas">
      <div class="u-float-toolbar__divider" />

      <Tooltip>
        <TooltipTrigger as-child>
          <button class="u-icon-btn u-icon-btn--sm" type="button" aria-label="重置到中心" @click="resetCanvasView">
            <Crosshair />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">重置到中心</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <button class="u-icon-btn u-icon-btn--sm" type="button" aria-label="放大画布" @click="zoomCanvas(1.25)">
            <ZoomIn />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">放大</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <button class="u-icon-btn u-icon-btn--sm" type="button" aria-label="缩小画布" @click="zoomCanvas(0.8)">
            <ZoomOut />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">缩小</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <button
            class="u-icon-btn u-icon-btn--sm u-icon-btn--danger"
            type="button"
            aria-label="关闭主画布"
            @click="showMainCanvas = false"
          >
            <XCircle />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">关闭主画布</TooltipContent>
      </Tooltip>
    </template>
  </div>

  <screenshotDrawer></screenshotDrawer>
  <CropGuideModal />
</template>

<script setup>
import {
  isFullScreen,
  currentModelController,
  saveScreenshot,
  showScreenshotDrawer,
} from "../store";
import {
  Camera,
  Crosshair,
  Image,
  Maximize2,
  Palette,
  Scissors,
  Sparkles,
  Trash2,
  Video,
  XCircle,
  ZoomIn,
  ZoomOut,
} from "lucide-vue-next";
import { useEyeDropper } from "@vueuse/core";
import { toast } from "@/components/ui/toast";
import screenshotDrawer from "@/components/design/components/screenshotDrawer.vue";
import { showAutocreateModal } from "@/components/design/layout/autocreate/index.ts";
import CropGuideModal from "@/components/design/layout/canvas/crop/components/CropGuideModal.vue";
import { showCropGuideModal } from "@/components/design/layout/canvas/crop/store";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { showMainCanvas } from "@/components/design/layout/canvas/index.tsx";
import {
  resetCanvasView,
  zoomCanvas,
} from "@/components/design/layout/canvas/panzoomStore";

const { isSupported, open } = useEyeDropper();

async function openEyeDropper() {
  if (!isSupported.value) {
    toast.error("当前浏览器不支持拾色器");
    return;
  }

  const { sRGBHex: pickedColor } = await open();
  await navigator.clipboard.writeText(pickedColor);
  toast.success(`颜色 ${pickedColor} 已复制到剪贴板`);
}

function takeshot() {
  saveScreenshot();
}

function autocreate() {
  showAutocreateModal.value = true;
}

function doBuiltInAnimations() {}

function removeAllDecals() {
  currentModelController.value?.removeDecals();
}
</script>

<style lang="less" scoped>
.designiy-bottom-menu {
  width: max-content;
  max-width: calc(100vw - 32px);
  height: auto;
}


@media (max-width: 768px) {
  .designiy-bottom-menu {
    gap: 1px;
    padding: 3px;
  }
}
</style>
