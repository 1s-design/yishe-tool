<!--
 * @Author: chan-max 2651308363@qq.com
 * @Date: 2023-12-19 18:50:06
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2023-12-30 21:53:29
 * @FilePath: /1s/src/components/design/layout/bottomMenu.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by 1s, All Rights Reserved. 
-->
<template>
  <div class="designiy-bottom-menu">
    <Tooltip>
      <TooltipTrigger as-child>
        <button class="bottom-icon-btn" @click="openEyeDropper">
          <Palette class="bottom-icon" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">拾色器</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <button class="bottom-icon-btn" @click="takeshot">
          <Camera class="bottom-icon" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">截图</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <button class="bottom-icon-btn" @click="showScreenshotDrawer = true">
          <Image class="bottom-icon" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">截图列表</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <button class="bottom-icon-btn" @click="isFullScreen = !isFullScreen">
          <Maximize2 class="bottom-icon" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{{ isFullScreen ? '退出全屏' : '全屏' }}</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <button class="bottom-icon-btn bottom-icon-btn--danger" @click="currentModelController.removeDecals()">
          <Trash2 class="bottom-icon" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">移除所有贴纸</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <button class="bottom-icon-btn" @click="doBuiltInAnimations">
          <Video class="bottom-icon" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">内置动画</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <button class="bottom-icon-btn" @click="showCropGuideModal = true">
          <Scissors class="bottom-icon" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">裁剪参考线</TooltipContent>
    </Tooltip>

    <div class="bottom-divider" />

    <Tooltip>
      <TooltipTrigger as-child>
        <button class="bottom-action-btn" @click="autocreate">
          <Sparkles class="bottom-icon" />
          <span>自动生成</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">自动根据当前控制台生成模型</TooltipContent>
    </Tooltip>
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
import { Camera, Image, Maximize2, Palette, Scissors, Trash2, Video } from 'lucide-vue-next';
import { Sparkles } from "lucide-vue-next";
import { useEyeDropper } from "@vueuse/core";
import { toast } from '@/components/ui/toast';
import screenshotDrawer from "@/components/design/components/screenshotDrawer.vue";
import { showAutocreateModal } from "@/components/design/layout/autocreate/index.ts";
import CropGuideModal from "@/components/design/layout/canvas/crop/components/CropGuideModal.vue";
import { showCropGuideModal } from "@/components/design/layout/canvas/crop/store";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const { isSupported, open, sRGBHex } = useEyeDropper();

async function openEyeDropper() {
  let { sRGBHex } = await open();
  navigator.clipboard.writeText(sRGBHex);

  toast.success(`颜色 ${sRGBHex} 已复制到粘贴板`);
}

function takeshot() {
  saveScreenshot();
}

function autocreate() {
  showAutocreateModal.value = true;
}

function doBuiltInAnimations() {}
</script>

<style lang="less" scoped>
.designiy-bottom-menu {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 12px;
  background-color: var(--1s-surface-background);
  border-top: 1px solid var(--1s-divider-color);
  column-gap: 2px;
}

.bottom-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 5px;
  background: none;
  color: var(--1s-text-color-secondary);
  cursor: pointer;
  transition: background 0.08s, color 0.08s;

  &:hover {
    background: var(--1s-hover-overlay);
    color: var(--1s-text-color);
  }

  &:active {
    background: var(--1s-pressed-overlay);
  }

  &--danger:hover {
    color: var(--1s-text-color);
    background: color-mix(in srgb, #ef4444 10%, transparent);
  }
}

.bottom-icon {
  width: 15px;
  height: 15px;
}

.bottom-divider {
  width: 1px;
  height: 16px;
  background: var(--1s-divider-color);
  margin: 0 6px;
}

.bottom-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 10px;
  border: none;
  border-radius: 5px;
  background: var(--1s-accent-color);
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.1s;

  &:hover {
    opacity: 0.9;
  }
}

@media (max-width: 768px) {
  .designiy-bottom-menu {
    padding: 0 6px;
    column-gap: 1px;
  }
}
</style>
