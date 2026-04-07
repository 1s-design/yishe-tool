<template>
  <loading v-if="isFirstPageLoading"></loading>

  <div id="layout-container" class="design-layout" :class="{ 'has-header': showHeader }">
    <div v-if="showHeader" id="layout-header" class="design-layout__header">
      <div class="design-layout__header-inner">
        <header-menu />
      </div>
    </div>

    <div id="layout-body" class="design-layout__body">
      <div v-if="showLeftMenu" id="layout-left-menu" class="design-layout__rail">
        <left-menu></left-menu>
      </div>

      <div v-if="leftComponent" id="layout-left" class="design-layout__panel design-layout__panel--left">
        <div class="design-layout__panel-scroll">
          <keep-alive include="sticker">
            <component :is="leftComponent"></component>
          </keep-alive>
        </div>
      </div>

      <div id="layout-canvas" class="design-layout__canvas">
        <!-- 截屏组件 -->
        <screenshot ref="screenshotInstance"></screenshot>

        <!-- 画布区域 -->
        <div
          ref="canvasViewportRef"
          class="design-layout__canvas-stage threejs-canvas-container-container"
          :class="{ 'design-layout__canvas-stage--main-canvas': showMainCanvas }"
        >
          <div
            v-if="isDesign3DEnabled"
            v-show="shouldShowThreeCanvas"
            class="threejs-canvas-container"
            :style="canvasContainerStyle"
          >
            <div
              id="threejs-canvas"
              class="design-layout__three-canvas"
              ref="mountContainer"
              :style="{ background: currentCanvasBackground?.backgroundCss }"
            ></div>

            <!-- 比例选择菜单 -->
            <div class="aspect-ratio-selector">
              <el-select
                v-model="selectedAspectRatio"
                size="small"
                class="aspect-ratio-selector__control"
                @change="updateAspectRatio"
              >
                <el-option
                  v-for="ratio in aspectRatioOptions"
                  :key="ratio.value"
                  :label="ratio.label"
                  :value="ratio.value"
                />
              </el-select>
            </div>
          </div>

          <basic-canvas
            v-show="showMainCanvas"
            class="design-layout__basic-canvas"
            ref="basicCanvasRef"
          ></basic-canvas>
        </div>

        <!-- 底部菜单 -->
        <div v-if="showBottomMenu" class="design-layout__bottom">
          <bottom-menu></bottom-menu>
        </div>
      </div>

      <div v-if="rightComponent" id="layout-right" class="design-layout__panel design-layout__panel--right">
        <div class="design-layout__panel-scroll">
          <component :is="rightComponent"></component>
        </div>
      </div>
    </div>
  </div>

  <a-modal
    title="选择基础模型"
    v-model:open="showBaseModelSelect"
    width="100%"
    :footer="null"
    wrap-class-name="full-modal"
  >
    <base-model-select></base-model-select>
  </a-modal>

  <el-drawer
    v-model="showSceneControl"
    :modal="true"
    :size="360"
    :with-header="true"
    :append-to-body="true"
    :wrapper-closable="true"
    modal-class="bg-transparent"
    title="场景控制"
  >
    <scene-control></scene-control>
  </el-drawer>

  <fontModal></fontModal>
  <imageEditorModal></imageEditorModal>

  <diydialog
    :show="menuState.showStickerModal"
    title="贴纸"
    @close="menuState.showStickerModal = false"
    :animation="basicContainerAnimation"
  >
    <sticker-modal></sticker-modal>
  </diydialog>

  <a-modal
    title="资源上传"
    v-model:open="showUpload"
    width="100%"
    :footer="null"
    wrap-class-name="full-modal"
  >
    <upload></upload>
  </a-modal>

  <a-modal
    title="保存模型"
    v-model:open="showSaveModel"
    :footer="null"
    width="100%"
    :mask-closable="true"
    centered
    wrap-class-name="full-modal"
  >
    <save-model></save-model>
  </a-modal>

  <!-- 个人项目弹层 -->

  <a-modal
    title="创作资源"
    v-model:open="menuState.showProject"
    width="100%"
    :footer="null"
    wrap-class-name="full-modal"
    :destroyOnClose="true"
  >
    <projectModal></projectModal>
  </a-modal>

  <!-- 贴纸详细信息弹层 -->
  <stickerDetailModal></stickerDetailModal>
  <!-- 自定义模型弹层 -->
  <customModelDetailModal></customModelDetailModal>

  <!-- 贴纸覆盖时显示的提示框 -->
  <decalTooltip></decalTooltip>

  <!-- 材质选择drawer -->
  <materialDrawer></materialDrawer>

  <!-- 卡片分享弹层 -->
  <shareCardModal></shareCardModal>

  <!-- 自动创建弹层 -->
  <autocreateModal></autocreateModal>
</template>
<script setup lang="tsx">
import { computed, onMounted, ref, watchEffect, watch, nextTick } from "vue";
import { useElementSize, useLocalStorage } from "@vueuse/core";
import { ModelController } from "../core/controller";
import headerMenu from "./headerMenu.vue";
import loading from "./loading.vue";
import { useLoginStatusStore } from "@/store/stores/login";
import {
  currentModelController,
  canvasBgColor,
  canvasBgOpacity,
  showBaseModelSelect,
  currentOperatingBaseModelInfo,
  showSceneControl,
  showImageSticker,
  showTextSticker,
  showDecalControl,
  isFirstPageLoading,
  showCustomTextSticker,
  showFontModal,
  showImageEditorModal,
  showModelInfo,
  showDecalList,
  showHeader,
  showSubHeader,
  showLeftMenu,
  showBottomMenu,
  showSaveModel,
  showThreeCanvas,
  useDesignStore,
  showUpload,
  showStamp,
  screenshotInstance,
  showCustomModel,
  showSvgCanvas,
  lastModifiedTime,
  currentCanvasBackground,
  menuState,
  menuItems,
} from "../store";
import leftMenu from "./leftMenu.vue";
import diydialog from "../components/dialog.vue";
import baseModelSelect from "./baseModelSelect/index.vue";
import sceneControl from "./sceneControl/index.vue";
import imageSticker from "./imageSticker/index.vue";
import textSticker from "./textSticker/index.vue";
import workspace from "./workspace/index.vue";
import bottomMenu from "./bottomMenu.vue";
import decalControl from "./decalControl/index.vue";
import imageUpload from "./imageUpload/index.vue";
import customTextSticker from "./customTextSticker/index.vue";
import fontUpload from "./fontUpload/index.vue";
import fontModal from "./font/index.vue";
import imageEditorModal from "./imageEditorModal/index.vue";
import subHeaderMenu from "./subHeaderMenu/index.vue";
import modelInfo from "./modelInfo/index.vue";
import decalList from "./decalList/index.vue";
import saveModel from "./saveModel/index.vue";
import decoration from "./decoration/index.vue";
import screenshot from "../components/screenshot.vue";
import sticker from "./sticker/index.vue";
import qrcode from "./qrcode/index.vue";
import customModel from "./customModel/index.vue";
import { DirectionalLight, AmbientLight, PointLight } from "three";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry";
import upload from "./upload/index.vue";
import stamp from "./stamp/index.vue";
import svgCanvas from "./svgCanvas/index.vue";
import canvasLayout from "./canvas/index.vue";
import basicCanvas from "./basic-canvas/index.vue";
import { showMainCanvas } from "./canvas/index.tsx";
import stickerModal from "./sticker/modal.vue";
import { Modal } from "ant-design-vue";
import Utils from "@/common/utils";
import { createVNode } from "vue";
import { isLogin } from "@/store/stores/loginAction";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import Api from "@/api";
import projectModal from "./project/index.vue";
import ContextMenu from "@imengyu/vue3-context-menu";
import { useRoute, useRouter } from "vue-router";
import {
  openLoginDialog,
  showLoginFormModal,
} from "@/modules/main/view/user/login/index.tsx";
import { useStickerDetailModal } from "@/components/design/layout/project/sticker/stickerModal";

import { useCustomModelDetailModal } from "@/components/design/layout/project/customModel/customModelModal";
import decalTooltip from "./decalTooltip/index.vue";
import materialDrawer from "./material/drawer.vue";
import shareCardModal from "@/components/design/layout/shareCard/modal.vue";
import material from "@/components/design/layout/material/index.vue";
import autocreateModal from "./autocreate/modal.vue";
import videoClip from "./videoClip/index.vue";
import { useEventBus } from "@vueuse/core";
import { DESIGN_3D_ENABLED } from "../featureFlags";

const { component: stickerDetailModal } = useStickerDetailModal();
const { component: customModelDetailModal } = useCustomModelDetailModal();

const router = useRouter();
const loginStore = useLoginStatusStore();

const des = useDesignStore();
const isDesign3DEnabled = DESIGN_3D_ENABLED;

const basicContainerAnimation = ref({
  "enter-active-class": "animate__animated animate__bounceIn",
  "leave-active-class": "animate__animated animate__bounceOut",
  duration: 66,
});

const basicCanvasRef = ref();

const leftComponent = computed(() => {
  // 使用新的统一菜单状态管理
  const activeMenu = menuState.value.activeMenu;
  
  switch (activeMenu) {
    case menuItems.workspace:
      return workspace;
    case menuItems.sticker:
      sticker.name = "sticker";
      return sticker;
    case menuItems.material:
      return material;
    case menuItems.videoClip:
      return videoClip;
    case menuItems.canvas:
      return canvasLayout;
    case menuItems.decoration:
      return decoration;
    default:
      return null;
  }
});

const rightComponent = computed(() => {
  if (showDecalControl.value) {
    return decalControl;
  }
  if (showDecalList.value) {
    return decalList;
  }
});

// 挂载容器
const mountContainer = ref();

// 画布可用区域引用
const canvasViewportRef = ref();

// 使用useElementSize获取容器尺寸
const { width: containerWidth, height: containerHeight } = useElementSize(canvasViewportRef);

// 比例选择相关
const aspectRatioOptions = [
  { label: '1:1 (正方形)', value: 1 },
  { label: '4:3 (传统)', value: 4/3 },
  { label: '16:9 (宽屏)', value: 16/9 },
  { label: '3:2 (照片)', value: 3/2 },
  { label: '2:1 (超宽)', value: 2 },
  { label: '3:4 (竖屏)', value: 3/4 },
  { label: '9:16 (手机)', value: 9/16 },
];

// 使用本地存储保存选择的比例
const selectedAspectRatio = useLocalStorage('canvas-aspect-ratio', 1);

// 更新比例的函数
const updateAspectRatio = () => {
  // 比例改变时会自动触发canvasContainerStyle的重新计算
};

// 计算画布容器样式：根据选择的比例计算宽度
const canvasContainerStyle = computed(() => {
  const height = Math.max(containerHeight.value - 2, 160);
  const width = Math.min(
    height * selectedAspectRatio.value,
    Math.max(containerWidth.value - 24, 180)
  );
  
  return {
    position: 'relative' as const,
    height: '100%',
    width: `${width}px`,
    maxWidth: '100%',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'center'
  };
});

// 渲染动画

isFirstPageLoading.value = true;

// 3D 逻辑先保留但不初始化，后续恢复时只需重新打开 DESIGN_3D_ENABLED。
const modelController = isDesign3DEnabled ? new ModelController() : null;

onMounted(async () => {
  if (isDesign3DEnabled && modelController) {
    modelController.render(mountContainer.value);
  } else {
    menuState.value.activeMenu = menuItems.canvas;
  }
  await nextTick();
  isFirstPageLoading.value = false;
  // 抛出页面加载完成事件
  const designPageLoadedBus = useEventBus("design-page-loaded");
  designPageLoadedBus.emit();


  // 初始化时根据 shouldShowThreeCanvas 状态设置渲染
  if (isDesign3DEnabled && modelController && !shouldShowThreeCanvas.value && modelController.isMounted) {
    modelController.stopRender();
  }
});

// 计算是否应该显示和运行 Three.js 画布
const shouldShowThreeCanvas = computed(() => {
  return showThreeCanvas.value && menuState.value.activeMenu !== menuItems.canvas;
});

// 控制 Three.js 渲染的函数
function updateThreeCanvasRenderState() {
  if (!isDesign3DEnabled) {
    return;
  }

  // 等待模型控制器初始化完成后再执行
  if (!modelController || !modelController.renderer) {
    return;
  }
  
  // 使用 nextTick 确保在渲染完成后执行
  nextTick(() => {
    if (!modelController.isMounted) {
      return;
    }
    
    const shouldRender = shouldShowThreeCanvas.value;
    
    if (shouldRender) {
      // 恢复渲染循环
      modelController.startRender();
    } else {
      // 停止渲染循环以节省性能
      modelController.stopRender();
    }
  });
}

// 监听 showThreeCanvas 变化，控制渲染循环以节省性能
watch(showThreeCanvas, () => {
  updateThreeCanvasRenderState();
});

// 监听菜单切换，当切换到贴纸画布时停止 Three.js 渲染
watch(() => menuState.value.activeMenu, () => {
  updateThreeCanvasRenderState();
});

initAction();

async function initAction() {
  setTimeout(() => {
    // 提示用户登录
    if (!loginStore.isLogin) {
      Modal.confirm({
        content: <div>请登录</div>,
        icon: createVNode(ExclamationCircleOutlined),
        onOk() {
          openLoginDialog();
        },
        okText: <div>登录</div>,
        cancelText: "暂不",
        onCancel() {
          Modal.destroyAll();
        },
      });
    }
  }, 1999);
}
</script>

<style lang="less">
.design-layout {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  background: var(--1s-shell-background);
  color: var(--1s-text-color);
}

.design-layout__header {
  z-index: 11;
  flex-shrink: 0;
  height: var(--1s-header-height);
  border-bottom: 1px solid var(--1s-border-color);
  background: var(--1s-surface-background);
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04);
}

.design-layout__header-inner {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
}

.design-layout__body {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.design-layout__rail {
  width: var(--1s-left-menu-width);
  flex-shrink: 0;
  border-right: 1px solid var(--1s-border-color-strong);
  background: var(--1s-left-menu-background-color);
}

.design-layout__panel {
  display: flex;
  min-width: 0;
  min-height: 0;
  background: var(--1s-panel-background);
}

.design-layout__panel--left {
  width: var(--1s-left-panel-width);
  flex-shrink: 0;
  border-right: 1px solid var(--1s-border-color);
}

.design-layout__panel--right {
  width: var(--1s-right-panel-width);
  flex-shrink: 0;
  border-left: 1px solid var(--1s-border-color);
  box-shadow: -1px 0 0 rgba(15, 23, 42, 0.03);
  z-index: 4;
}

.design-layout__panel-scroll {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: auto;
}

.design-layout__panel-scroll > * {
  width: 100%;
  min-width: 0;
}

#layout-canvas {
  position: relative;
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.design-layout__canvas-stage {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: var(--1s-canvas-stage-padding);
  background-color: var(--1s-canvas-stage-background);
  background-image:
    linear-gradient(var(--1s-grid-line-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--1s-grid-line-color) 1px, transparent 1px);
  background-size: 20px 20px;
}

.design-layout__canvas-stage--main-canvas {
  padding: 0;
}

.threejs-canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.design-layout__three-canvas,
#threejs-canvas {
  position: absolute;
  inset: var(--1s-canvas-inner-gap);
  z-index: 1;
  overflow: hidden;
  border: 1px solid var(--1s-accent-color-soft);
  border-radius: var(--1s-radius-md);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.design-layout__basic-canvas {
  width: 100%;
  height: 100%;
  z-index: 3;
}

.design-layout__bottom {
  display: flex;
  height: var(--1s-bottom-menu-height);
  flex-shrink: 0;
  align-items: flex-end;
  justify-content: center;
  padding: 0 12px;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.06), transparent);
}

.bg-transparent {
  background: transparent !important;
}

.auto-width-modal {
  .ant-modal {
    min-width: 320px;
    width: auto !important;
  }

  .ant-modal-content {
    width: fit-content;
    min-width: 320px;
  }
}

.aspect-ratio-selector {
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 10;
  width: 112px;
  border: 1px solid var(--1s-border-color);
  border-radius: var(--1s-radius-sm);
  background: var(--1s-elevated-background);
  box-shadow: var(--1s-shadow-sm);
  overflow: hidden;
}

.aspect-ratio-selector__control {
  width: 100%;
  font-size: 11px;
}

@media (max-width: 1366px) {
  .design-layout__canvas-stage {
    background-size: 18px 18px;
  }

  .aspect-ratio-selector {
    width: 104px;
    bottom: 8px;
    left: 8px;
  }
}

@media (max-width: 1080px) {
  .design-layout__canvas-stage {
    background-size: 16px 16px;
  }
}

@media (max-width: 768px) {
  .design-layout__bottom {
    padding: 0 8px;
  }

  .aspect-ratio-selector {
    width: 96px;
  }
}
</style>








