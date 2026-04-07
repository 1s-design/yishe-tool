<template>
  <div class="menu-bar">
    <el-tooltip :hide-after="0" content="创作资源" placement="right">
      <div
        class="menu-bar-item"
        :class="{ 'menu-bar-item-focus': menuState.showProject }"
        @click="menuState.showProject = !menuState.showProject"
      >
        <div class="menu-bar-item-icon"><icon-project></icon-project></div>
        <span>创作资源</span>
      </div>
    </el-tooltip>

    <el-tooltip v-if="isDesign3DEnabled" :hide-after="0" content="工作台" placement="right">
      <div
        class="menu-bar-item"
        :class="{ 'menu-bar-item-focus': menuState.activeMenu === menuItems.workspace }"
        @click="setActiveMenu(menuItems.workspace)"
      >
        <div class="menu-bar-item-icon"><icon-workspace></icon-workspace></div>
        <span>工作台</span>
      </div>
    </el-tooltip>

    <el-tooltip :hide-after="0" content="许多贴纸哦～" placement="right">
      <div
        class="menu-bar-item"
        :class="{ 'menu-bar-item-focus': menuState.activeMenu === menuItems.sticker }"
        @click="setActiveMenu(menuItems.sticker)"
      >
        <div class="menu-bar-item-icon"><icon-sticker></icon-sticker></div>
        <span>贴纸资源</span>
      </div>
    </el-tooltip>

    <el-tooltip v-if="isDesign3DEnabled" :hide-after="0" content="选择模型" placement="right">
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
        <span>{{ currentOperatingBaseModelInfo?.id ? "切换模型" : "选择模型" }}</span>
      </div>
    </el-tooltip>

    <el-tooltip v-if="isDesign3DEnabled" :hide-after="0" content="服装材质" placement="right">
      <div
        class="menu-bar-item"
        :class="{ 'menu-bar-item-focus': menuState.activeMenu === menuItems.material }"
        @click="setActiveMenu(menuItems.material)"
      >
        <div class="menu-bar-item-icon">
          <s1-icon name="material"></s1-icon>
        </div>
        <span>服装材质</span>
      </div>
    </el-tooltip>

    <el-tooltip :hide-after="0" content="制作贴纸" placement="right">
      <div
        class="menu-bar-item"
        :class="{ 'menu-bar-item-focus': menuState.activeMenu === menuItems.canvas }"
        @click="setActiveMenu(menuItems.canvas)"
      >
        <div class="menu-bar-item-icon">
          <icon-canvas></icon-canvas>
        </div>
        <span>制作贴纸</span>
      </div>
    </el-tooltip>

    <el-tooltip :hide-after="0" content="图片编辑" placement="right">
      <div
        class="menu-bar-item"
        :class="{ 'menu-bar-item-focus': showImageEditorModal }"
        @click="handleSpecialMenuClick(menuItems.imageEditor)"
      >
        <div class="menu-bar-item-icon"><icon-image-editor></icon-image-editor></div>
        <span>图片编辑</span>
      </div>
    </el-tooltip>

    <el-tooltip :hide-after="0" content="字体" placement="right">
      <div
        class="menu-bar-item"
        :class="{ 'menu-bar-item-focus': showFontModal }"
        @click="handleSpecialMenuClick(menuItems.font)"
      >
        <div class="menu-bar-item-icon"><icon-font></icon-font></div>
        <span>字体</span>
      </div>
    </el-tooltip>

    <el-tooltip v-if="isDesign3DEnabled" :hide-after="0" content="辅助视频剪辑" placement="right">
      <div
        class="menu-bar-item"
        :class="{ 'menu-bar-item-focus': menuState.activeMenu === menuItems.videoClip }"
        @click="setActiveMenu(menuItems.videoClip)"
      >
        <div class="menu-bar-item-icon">
          <VideoCameraOutlined />
        </div>
        <span>图像导出</span>
      </div>
    </el-tooltip>

    <el-tooltip v-if="isDesign3DEnabled" :hide-after="0" content="设置场景" placement="right">
      <div
        class="menu-bar-item"
        :class="{ 'menu-bar-item-focus': showSceneControl }"
        @click="handleSpecialMenuClick(menuItems.scene)"
      >
        <div class="menu-bar-item-icon"><icon-earth></icon-earth></div>
        <span>场景</span>
      </div>
    </el-tooltip>
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
  menuState,
  menuItems,
  setActiveMenu,
  clearAllMenus,
} from "../store";

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
import { VideoCameraOutlined } from "@ant-design/icons-vue";
import desimage from "@/components/image.vue";
import { DESIGN_3D_ENABLED } from "../featureFlags";

const isDesign3DEnabled = DESIGN_3D_ENABLED;

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
  row-gap: 2px;
  overflow: auto;
  background: var(--1s-left-menu-background-color);
  padding: 10px 0 12px;
  box-sizing: border-box;
}

.menu-bar-item {
  width: calc(var(--1s-left-menu-width) - 8px);
  min-height: 56px;
  padding: 7px 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
  color: var(--1s-left-menu-item-text-color);
  border-radius: 10px;
  transition: background-color 0.18s ease, color 0.18s ease;

  .menu-bar-item-icon {
    flex-shrink: 0;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  svg {
    width: 15px;
    height: 15px;
  }

  span {
    margin-top: 2px;
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: calc(var(--1s-left-menu-width) - 10px);
    font-weight: 500;
    color: inherit;
    line-height: 1.2;
    text-align: center;
    white-space: normal;
    word-break: break-word;
  }

  &:hover {
    background: var(--1s-left-menu-icon-hover-background-color);
  }
}

.menu-bar-item-focus {
  background: var(--1s-left-menu-item-active-background);
  color: var(--1s-left-menu-item-text-active-color);
}

@media (max-width: 1080px) {
  .menu-bar-item {
    min-height: 52px;

    span {
      font-size: 8px;
    }
  }
}

@media (max-width: 768px) {
  .menu-bar {
    padding-top: 8px;
  }

  .menu-bar-item {
    min-height: 48px;
    padding: 5px 3px;

    svg {
      width: 14px;
      height: 14px;
    }
  }
}
</style>
