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
    <el-tooltip :hide-after="0" content="拾色器" placement="top">
      <div>
        <el-button link class="bottom-menu-icon-button" @click="openEyeDropper">
          <BgColorsOutlined class="bottom-menu-icon" />
        </el-button>
      </div>
    </el-tooltip>

    <el-tooltip :hide-after="0" content="保存当前模型截图" placement="top">
      <div>
        <el-button link class="bottom-menu-icon-button" @click="takeshot">
          <CameraOutlined class="bottom-menu-icon" />
        </el-button>
      </div>
    </el-tooltip>

    <el-tooltip :hide-after="0" content="查看所有截图" placement="top">
      <div>
        <el-button link class="bottom-menu-icon-button" @click="showScreenshotDrawer = true">
          <PictureOutlined class="bottom-menu-icon" />
        </el-button>
      </div>
    </el-tooltip>

    <el-tooltip
      :hide-after="0"
      :content="isFullScreen ? '退出全屏' : '进入全屏'"
      placement="top"
    >
      <div>
        <el-button link class="bottom-menu-icon-button" @click="isFullScreen = !isFullScreen">
          <ExpandOutlined class="bottom-menu-icon" />
        </el-button>
      </div>
    </el-tooltip>
    <el-tooltip :hide-after="0" content="移除当前所有贴纸" placement="top">
      <div>
        <el-button link class="bottom-menu-icon-button" @click="currentModelController.removeDecals()">
          <DeleteOutlined class="bottom-menu-icon" />
        </el-button>
      </div>
    </el-tooltip>

    <el-tooltip :hide-after="0" content="执行内置动画" placement="top">
      <div>
        <el-button link class="bottom-menu-icon-button" @click="doBuiltInAnimations">
          <VideoCameraOutlined class="bottom-menu-icon" />
        </el-button>
      </div>
    </el-tooltip>

    <el-tooltip :hide-after="0" content="自动根据当前控制台生成模型" placement="top">
      <div>
        <el-button
          class="bottom-menu-primary"
          size="small"
          @click="autocreate"
          :icon="Grid"
          color="var(--1s-accent-color)"
        >
          自动生成
        </el-button>
      </div>
    </el-tooltip>
  </div>

  <screenshotDrawer></screenshotDrawer>
</template>
<script setup>
import {
  isFullScreen,
  currentModelController,
  saveScreenshot,
  showScreenshotDrawer,
} from "../store";
import iconFullscreen from "@/icon/fullscreen.svg?component";
import iconRotate from "@/icon/rotate.svg?component";
import iconLocate from "@/icon/locate.svg?component";
import iconRefresh from "@/icon/refresh.svg?component";
import iconScreenshot from "@/icon/screenshot.svg?component";
import {
  ScissorOutlined,
  BgColorsOutlined,
  CameraOutlined,
  FileImageOutlined,
  PictureOutlined,
  ExpandOutlined,
  CloseCircleOutlined,
  RedoOutlined,
  DeleteOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons-vue";
import { useEyeDropper, useClipboard } from "@vueuse/core";
import { Pointer, Grid } from "@element-plus/icons-vue";
import { notification } from "ant-design-vue";
import screenshotDrawer from "@/components/design/components/screenshotDrawer.vue";
import canvasMediaRecorder from "@/components/design/components/canvasMediaRecorder/index.vue";
import { showAutocreateModal } from "@/components/design/layout/autocreate/index.ts";

const { isSupported, open, sRGBHex } = useEyeDropper();

async function openEyeDropper() {
  let { sRGBHex } = await open();
  navigator.clipboard.writeText(sRGBHex);

  notification.open({
    placement: "topRight",
    message: `颜色 ${sRGBHex} 已复制到粘贴板`,
    // style:`background-color:${sRGBHex}22`
  });
}

function takeshot() {
  saveScreenshot();
}

function locate() {
  currentModelController.value.resetPosition();
}

function animate() {
  currentModelController.value.animate = !currentModelController.value.animate;
}

/**
 * @method 根据当前控制台信息快速生成模型
 */
function autocreate() {
  showAutocreateModal.value = true;
}

/**
 * @method 执行内置动画，可以生成短视频
 */
function doBuiltInAnimations() {}
</script>
<style lang="less">
.designiy-bottom-menu {
  height: 100%;
  width: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 12px;
  background-color: var(--1s-elevated-background);
  border: 1px solid var(--1s-border-color);
  border-bottom: 0;
  border-radius: 12px 12px 0 0;
  column-gap: 4px;
  box-shadow: var(--1s-shadow-sm);
}

.bottom-menu-icon-button {
  min-width: 28px;
  min-height: 28px;
  padding: 4px;
  color: var(--1s-icon-color);
}

.bottom-menu-icon {
  font-size: 14px;
}

.bottom-menu-primary {
  min-height: 28px;
  padding-inline: 10px;
  border: 0;
  box-shadow: none;
}

@media (max-width: 768px) {
  .designiy-bottom-menu {
    padding: 0 8px;
    column-gap: 2px;
  }

  .bottom-menu-primary {
    padding-inline: 8px;
    font-size: 10px;
  }
}
</style>
