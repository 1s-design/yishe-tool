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
        <Button variant="ghost" size="icon-sm" class="text-muted-foreground hover:text-foreground" @click="openEyeDropper">
          <Palette class="text-sm" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">拾色器</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" class="text-muted-foreground hover:text-foreground" @click="takeshot">
          <Camera class="text-sm" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">保存当前模型截图</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" class="text-muted-foreground hover:text-foreground" @click="showScreenshotDrawer = true">
          <Image class="text-sm" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">查看所有截图</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" class="text-muted-foreground hover:text-foreground" @click="isFullScreen = !isFullScreen">
          <Maximize2 class="text-sm" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{{ isFullScreen ? '退出全屏' : '进入全屏' }}</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" class="text-muted-foreground hover:text-destructive" @click="currentModelController.removeDecals()">
          <Trash2 class="text-sm" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">移除当前所有贴纸</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" class="text-muted-foreground hover:text-foreground" @click="doBuiltInAnimations">
          <Video class="text-sm" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">执行内置动画</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="default"
          size="xs"
          @click="autocreate"
          class="flex items-center gap-1 font-medium"
        >
          <Sparkles class="w-3 h-3" />
          <span>自动生成</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">自动根据当前控制台生成模型</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" class="text-muted-foreground hover:text-foreground" @click="showCropGuideModal = true">
          <Scissors class="text-sm" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">裁剪参考线</TooltipContent>
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
  border: 1px solid var(--1s-border-color);
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  column-gap: 3px;
  box-shadow: var(--1s-shadow-sm);
}

@media (max-width: 768px) {
  .designiy-bottom-menu {
    padding: 0 6px;
    column-gap: 1px;
  }
}
</style>
