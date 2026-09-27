<template>
  <div class="menu-bar">
      <Tooltip>
        <TooltipTrigger as-child>
          <div
            class="menu-bar-item"
            :class="{ 'menu-bar-item-focus': menuState.showProject }"
            @click="menuState.showProject = !menuState.showProject"
          >
            <div class="menu-bar-item-icon"><icon-project></icon-project></div>
            <span>创作资源</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">创作资源</TooltipContent>
      </Tooltip>

      <Tooltip v-if="isDesign3DEnabled">
        <TooltipTrigger as-child>
          <div
            class="menu-bar-item"
            :class="{
              'menu-bar-item-focus': menuState.activeMenu === menuItems.workspace,
            }"
            @click="setActiveMenu(menuItems.workspace)"
          >
            <div class="menu-bar-item-icon"><icon-workspace></icon-workspace></div>
            <span>工作台</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">工作台</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <div
            class="menu-bar-item"
            :class="{
              'menu-bar-item-focus': menuState.activeMenu === menuItems.sticker,
            }"
            @click="setActiveMenu(menuItems.sticker)"
          >
            <div class="menu-bar-item-icon"><icon-sticker></icon-sticker></div>
            <span>贴纸资源</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">贴纸资源</TooltipContent>
      </Tooltip>

      <Tooltip v-if="isDesign3DEnabled">
        <TooltipTrigger as-child>
          <div
            class="menu-bar-item"
            :class="{ 'menu-bar-item-focus': showBaseModelSelect }"
            @click="showBaseModelSelect = !showBaseModelSelect"
          >
            <desimage
              style="width: 24px; height: 24px"
              v-if="currentOperatingBaseModelInfo?.id"
              :src="currentOperatingBaseModelInfo.thumbnail"
            ></desimage>
            <div v-else class="menu-bar-item-icon">
              <icon-shirt></icon-shirt>
            </div>
            <span>{{
              currentOperatingBaseModelInfo?.id ? "切换模型" : "选择模型"
            }}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">选择模型</TooltipContent>
      </Tooltip>

      <Tooltip v-if="isDesign3DEnabled">
        <TooltipTrigger as-child>
          <div
            class="menu-bar-item"
            :class="{
              'menu-bar-item-focus': menuState.activeMenu === menuItems.material,
            }"
            @click="setActiveMenu(menuItems.material)"
          >
            <div class="menu-bar-item-icon">
              <s1-icon name="material"></s1-icon>
            </div>
            <span>服装材质</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">服装材质</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <div
            class="menu-bar-item"
            :class="{ 'menu-bar-item-focus': menuState.activeMenu === menuItems.customSticker }"
            @click="setActiveMenu(menuItems.customSticker)"
          >
            <div class="menu-bar-item-icon"><icon-canvas></icon-canvas></div>
            <span>自定义贴纸</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">自定义贴纸</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <div
            class="menu-bar-item"
            :class="{
              'menu-bar-item-focus': menuState.activeMenu === menuItems.canvas,
            }"
            @click="setActiveMenu(menuItems.canvas)"
          >
            <div class="menu-bar-item-icon">
              <icon-canvas></icon-canvas>
            </div>
            <span>制作贴纸</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">制作贴纸</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <div
            class="menu-bar-item"
            :class="{ 'menu-bar-item-focus': showImageEditorModal }"
            @click="handleSpecialMenuClick(menuItems.imageEditor)"
          >
            <div class="menu-bar-item-icon">
              <icon-image-editor></icon-image-editor>
            </div>
            <span>图片编辑</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">图片编辑</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <div
            class="menu-bar-item"
            :class="{ 'menu-bar-item-focus': showFontModal }"
            @click="handleSpecialMenuClick(menuItems.font)"
          >
            <div class="menu-bar-item-icon"><icon-font></icon-font></div>
            <span>字体</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">字体</TooltipContent>
      </Tooltip>

      <Tooltip v-if="isDesign3DEnabled">
        <TooltipTrigger as-child>
          <div
            class="menu-bar-item"
            :class="{
              'menu-bar-item-focus': menuState.activeMenu === menuItems.videoClip,
            }"
            @click="setActiveMenu(menuItems.videoClip)"
          >
            <div class="menu-bar-item-icon">
              <Video />
            </div>
            <span>图像导出</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">图像导出</TooltipContent>
      </Tooltip>

      <Tooltip v-if="isDesign3DEnabled">
        <TooltipTrigger as-child>
          <div
            class="menu-bar-item"
            :class="{ 'menu-bar-item-focus': showSceneControl }"
            @click="handleSpecialMenuClick(menuItems.scene)"
          >
            <div class="menu-bar-item-icon"><icon-earth></icon-earth></div>
            <span>场景</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">设置场景</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <div
            class="menu-bar-item"
            :class="{ 'menu-bar-item-focus': showOperationsModal }"
            @click="showOperationsModal = !showOperationsModal"
          >
            <div class="menu-bar-item-icon"><Zap /></div>
            <span>操作</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">AI 操作</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <div
            class="menu-bar-item"
            :class="{ 'menu-bar-item-focus': isAiPanelOpen }"
            @click="isAiPanelOpen = !isAiPanelOpen"
          >
            <div class="menu-bar-item-icon"><Bot /></div>
            <span>AI</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">AI 设计助手</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <div
            class="menu-bar-item"
            :class="{ 'menu-bar-item-focus': showPromptPicker }"
            @click="showPromptPicker = true"
          >
            <div class="menu-bar-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span>提示词</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">提示词库</TooltipContent>
      </Tooltip>

      <DesignPromptPicker v-model="showPromptPicker" @select="handlePromptSelect" />

      <Tooltip>
        <TooltipTrigger as-child>
          <div
            class="menu-bar-item"
            :class="{ 'menu-bar-item-focus': showCanvasStructure }"
            @click="showCanvasStructure = !showCanvasStructure"
          >
            <div class="menu-bar-item-icon"><Code2 /></div>
            <span>数据</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">查看数据结构</TooltipContent>
      </Tooltip>
    </div>
</template>
<script setup>
import {
  showBaseModelSelect,
  isFullScreen,
  canvasBgColor,
  canvasBgOpacity,
  showSceneControl,
  showImageSticker,
  showTextSticker,
  showCustomTextSticker,
  showFontModal,
  showImageEditorModal,
  showStamp,
  showCustomModel,
  showSvgCanvas,
  currentOperatingBaseModelInfo,
  viewDisplayController,
  clearLeftLayout,
  showOperationsModal,
  showCanvasStructure,
  menuState,
  menuItems,
  setActiveMenu,
  clearAllMenus,
} from "../store";
import { isAiPanelOpen, pendingPromptInput } from "@/ai/store";
import { Bot, Video, Zap, Code2 } from 'lucide-vue-next';
import { ref } from "vue";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import DesignPromptPicker from "./ai/DesignPromptPicker.vue";

import iconWorkspace from "@/icon/workspace.svg?component";
import iconSticker from "@/components/design/assets/icon/sticker.svg?component";
import iconShirt from "@/icon/shirt.svg?component";
import iconPhoto from "@/icon/photo.svg?component";
import iconText from "@/icon/text.svg?component";
import iconPaint from "@/icon/paint.svg?component";
import iconBox from "@/icon/box.svg?component";
import iconBrush from "@/icon/brush.svg?component";
import iconRuler from "@/icon/ruler.svg?component";
import iconEarth from "@/icon/earth.svg?component";
import iconLight from "@/icon/light.svg?component";
import iconEye from "@/icon/eye.svg?component";
import iconHelp from "@/icon/help.svg?component";
import iconQrcode from "@/components/design/assets/icon/qrcode.svg?component";
import iconBadge from "@/components/design/assets/icon/badge.svg?component";
import iconSetting from "@/icon/setting.svg?component";
import iconFont from "@/icon/font.svg?component";
import iconImageEditor from "@/icon/photo.svg?component";
import iconDecoration from "@/icon/design/decoration.svg?component";
import iconCustomModel from "@/components/design/assets/icon/custom-model.svg?component";
import iconSvgCanvas from "@/components/design/assets/icon/svg-canvas.svg?component";
import iconCanvas from "@/components/design/assets/icon/canvas.svg?component";
import iconProject from "@/components/design/assets/icon/project.svg?component";
import Utils from "@/common/utils";
import desimage from "@/components/image.vue";
import { DESIGN_3D_ENABLED } from "../featureFlags";

const isDesign3DEnabled = DESIGN_3D_ENABLED;

const showPromptPicker = ref(false);

function handlePromptSelect(content) {
  pendingPromptInput.value = content;
  isAiPanelOpen.value = true;
}

function handleSpecialMenuClick(menuKey) {
  switch (menuKey) {
    case menuItems.font:
      showFontModal.value = true;
      break;
    case menuItems.scene:
      showSceneControl.value = !showSceneControl.value;
      break;
    case menuItems.imageEditor:
      showImageEditorModal.value = !showImageEditorModal.value;
      break;
    default:
      setActiveMenu(menuKey);
  }
}
</script>
<style lang="less">
.menu-bar {
  width: var(--1s-left-menu-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 1px;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--1s-left-menu-background-color);
  padding: 6px 0 8px;
  box-sizing: border-box;
}

.menu-bar-item {
  width: calc(var(--1s-left-menu-width) - 8px);
  min-height: 48px;
  padding: 6px 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
  color: var(--1s-text-color-secondary);
  border-radius: 6px;
  transition:
    background-color var(--1s-transition-fast),
    color var(--1s-transition-fast),
    transform var(--1s-transition-fast),
    box-shadow var(--1s-transition-fast);
  position: relative;

  .menu-bar-item-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform var(--1s-transition-fast);
  }

  svg {
    width: 16px;
    height: 16px;
  }

  span {
    margin-top: 3px;
    font-size: 10.5px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: calc(var(--1s-left-menu-width) - 12px);
    font-weight: 500;
    color: inherit;
    line-height: 1.2;
    text-align: center;
  }

  &:hover {
    background: var(--1s-hover-background);
    color: var(--1s-text-color);
    transform: scale(1.04);
  }

  &:active {
    transform: scale(0.97);
  }
}

.menu-bar-item-focus {
  background: var(--1s-active-background);
  color: var(--1s-text-color);
}
</style>
