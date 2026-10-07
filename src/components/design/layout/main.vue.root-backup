<template>
  <loading v-if="isFirstPageLoading"></loading>

  <div
    id="layout-container"
    class="design-layout"
    :class="{ 'has-header': showHeader }"
  >
    <div v-if="showHeader" id="layout-header" class="design-layout__header">
      <div class="design-layout__header-inner">
        <header-menu />
      </div>
    </div>

    <div id="layout-body" class="design-layout__body">
      <div
        v-if="showLeftMenu"
        id="layout-left-menu"
        class="design-layout__rail"
      >
        <left-menu></left-menu>
      </div>

      <div
        v-if="leftComponent"
        id="layout-left"
        class="design-layout__panel design-layout__panel--left"
      >
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
          :class="{
            'design-layout__canvas-stage--main-canvas': showMainCanvas,
          }"
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
              <Select
                :model-value="String(selectedAspectRatio)"
                @update:model-value="v => { selectedAspectRatio = Number(v); updateAspectRatio(); }"
              >
                <SelectTrigger class="aspect-ratio-selector__control h-6 text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="ratio in aspectRatioOptions"
                    :key="ratio.value"
                    :value="String(ratio.value)"
                  >
                    {{ ratio.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
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

      <div
        v-if="rightComponent"
        id="layout-right"
        class="design-layout__panel design-layout__panel--right"
      >
        <div class="design-layout__panel-scroll">
          <component :is="rightComponent"></component>
        </div>
      </div>
    </div>
  </div>

  <Dialog :modal="false" v-model:open="showOperationsModal">
    <DialogContent class="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 rounded-none gap-0 overflow-hidden flex flex-col">
      <DialogHeader class="px-5 py-3 border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
        <DialogTitle class="text-sm font-semibold">AI 操作</DialogTitle>
      </DialogHeader>
      <div class="flex-1 overflow-auto min-h-0">
        <operationsPanel></operationsPanel>
      </div>
    </DialogContent>
  </Dialog>

  <Dialog :modal="false" v-model:open="showBaseModelSelect">
    <DialogContent class="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 rounded-none gap-0 overflow-hidden flex flex-col">
      <DialogHeader class="px-5 py-3 border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
        <DialogTitle class="text-sm font-semibold">选择基础模型</DialogTitle>
      </DialogHeader>
      <div class="flex-1 overflow-auto min-h-0">
        <base-model-select></base-model-select>
      </div>
    </DialogContent>
  </Dialog>

  <div
    v-if="showSceneControl"
    class="fixed inset-0 z-[1000] bg-transparent"
    @click="showSceneControl = false"
  ></div>
  <aside v-if="showSceneControl" class="scene-control-drawer">
    <div class="scene-control-drawer__header">
      <span class="text-sm font-semibold">场景控制</span>
      <Button variant="ghost" size="icon-sm" @click="showSceneControl = false">
        <X class="h-3.5 w-3.5" />
      </Button>
    </div>
    <div class="scene-control-drawer__body">
      <scene-control></scene-control>
    </div>
  </aside>

  <Dialog :modal="false" v-model:open="showCanvasStructure">
    <DialogContent class="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 rounded-none gap-0 overflow-hidden flex flex-col">
      <DialogHeader class="px-5 py-3 border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
        <DialogTitle class="text-sm font-semibold">数据结构</DialogTitle>
      </DialogHeader>
      <div class="flex-1 overflow-auto min-h-0">
        <canvas-structure />
      </div>
    </DialogContent>
  </Dialog>

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

  <Dialog :modal="false" v-model:open="showUpload">
    <DialogContent class="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 rounded-none gap-0 overflow-hidden flex flex-col">
      <DialogHeader class="px-5 py-3 border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
        <DialogTitle class="text-sm font-semibold">资源上传</DialogTitle>
      </DialogHeader>
      <div class="flex-1 overflow-auto min-h-0">
        <upload></upload>
      </div>
    </DialogContent>
  </Dialog>

  <Dialog :modal="false" v-model:open="showSaveModel">
    <DialogContent class="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 rounded-none gap-0 overflow-hidden flex flex-col">
      <DialogHeader class="px-5 py-3 border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
        <DialogTitle class="text-sm font-semibold">保存模型</DialogTitle>
      </DialogHeader>
      <div class="flex-1 overflow-auto min-h-0">
        <save-model></save-model>
      </div>
    </DialogContent>
  </Dialog>

  <!-- 创作资源弹层 (基于 shadcn-vue Dialog) -->
  <Dialog :modal="false" v-model:open="menuState.showProject">
    <DialogContent class="max-w-[94vw] w-[94vw] h-[88vh] max-h-[88vh] p-0 overflow-hidden flex flex-col rounded-lg border-[var(--1s-border-color)] bg-[var(--1s-surface-background)] shadow-2xl">
      <DialogHeader class="px-5 py-3 border-b border-[var(--1s-divider-color)] flex flex-row items-center justify-between space-y-0">
        <div class="flex items-center gap-2">
          <Sparkles class="h-4 w-4 text-[var(--1s-accent-color)]" />
          <DialogTitle class="text-sm font-semibold">创作资源</DialogTitle>
        </div>
      </DialogHeader>
      <div class="flex-1 overflow-hidden">
        <projectModal />
      </div>
    </DialogContent>
  </Dialog>

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

  <!-- AI 设计助手面板 -->
  <AiPanel :open="isAiPanelOpen" @close="isAiPanelOpen = false" />

  <!-- 登录提示弹窗 -->
  <Dialog :modal="false" v-model:open="showLoginConfirmModal">
    <DialogContent class="max-w-[320px] p-5 gap-3">
      <DialogHeader>
        <DialogTitle class="text-sm font-semibold">提示</DialogTitle>
        <DialogDescription class="text-xs">登录以继续使用设计工具</DialogDescription>
      </DialogHeader>
      <DialogFooter class="gap-2">
        <Button variant="outline" class="h-8 text-xs flex-1" @click="showLoginConfirmModal = false">暂不</Button>
        <Button class="h-8 text-xs flex-1" @click="showLoginConfirmModal = false; openLoginDialog()">登录</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
<script setup lang="tsx">
import { computed, onMounted, ref, watchEffect, watch, nextTick } from "vue";
import { useElementSize, useLocalStorage } from "@vueuse/core";
import { migrateLegacyWorkspaceStorage } from "@/services/designRuntime";
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
  showOperationsModal,
  showCanvasStructure,
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
import customSticker from "./customSticker/index.vue";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Sparkles, X } from "lucide-vue-next";
import projectModal from "./project/index.vue";
import ContextMenu from "@imengyu/vue3-context-menu";
import { openLoginDialog } from "@/modules/main/view/user/login/index.tsx";
import { useStickerDetailModal } from "@/components/design/layout/project/sticker/stickerModal";

import { useCustomModelDetailModal } from "@/components/design/layout/project/customModel/customModelModal";
import decalTooltip from "./decalTooltip/index.vue";
import materialDrawer from "./material/drawer.vue";
import shareCardModal from "@/components/design/layout/shareCard/modal.vue";
import material from "@/components/design/layout/material/index.vue";
import autocreateModal from "./autocreate/modal.vue";
import videoClip from "./videoClip/index.vue";
import operationsPanel from "./operations/index.vue";
import canvasStructure from "./canvasStructure/index.vue";
import AiPanel from "./ai/AiPanel.vue";
import { isAiPanelOpen } from "@/ai/store";
import { useEventBus } from "@vueuse/core";
import { DESIGN_3D_ENABLED } from "../featureFlags";

const { component: stickerDetailModal } = useStickerDetailModal();
const { component: customModelDetailModal } = useCustomModelDetailModal();

const loginStore = useLoginStatusStore();

const des = useDesignStore();
const isDesign3DEnabled = DESIGN_3D_ENABLED;

const showLoginConfirmModal = ref(false);

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
    case menuItems.customSticker:
      return customSticker;
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
const { width: containerWidth, height: containerHeight } =
  useElementSize(canvasViewportRef);

// 比例选择相关
const aspectRatioOptions = [
  { label: "1:1 (正方形)", value: 1 },
  { label: "4:3 (传统)", value: 4 / 3 },
  { label: "16:9 (宽屏)", value: 16 / 9 },
  { label: "3:2 (照片)", value: 3 / 2 },
  { label: "2:1 (超宽)", value: 2 },
  { label: "3:4 (竖屏)", value: 3 / 4 },
  { label: "9:16 (手机)", value: 9 / 16 },
];

// 使用本地存储保存选择的比例
const selectedAspectRatio = useLocalStorage(
  migrateLegacyWorkspaceStorage("canvas-aspect-ratio"),
  1,
);

// 更新比例的函数
const updateAspectRatio = () => {
  // 比例改变时会自动触发canvasContainerStyle的重新计算
};

// 计算画布容器样式：根据选择的比例计算宽度
const canvasContainerStyle = computed(() => {
  const height = Math.max(containerHeight.value - 2, 160);
  const width = Math.min(
    height * selectedAspectRatio.value,
    Math.max(containerWidth.value - 24, 180),
  );

  return {
    position: "relative" as const,
    height: "100%",
    width: `${width}px`,
    maxWidth: "100%",
    margin: "0 auto",
    display: "flex",
    justifyContent: "center",
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
  if (
    isDesign3DEnabled &&
    modelController &&
    !shouldShowThreeCanvas.value &&
    modelController.isMounted
  ) {
    modelController.stopRender();
  }
});

// 计算是否应该显示和运行 Three.js 画布
const shouldShowThreeCanvas = computed(() => {
  return (
    showThreeCanvas.value && menuState.value.activeMenu !== menuItems.canvas
  );
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
watch(
  () => menuState.value.activeMenu,
  () => {
    updateThreeCanvasRenderState();
  },
);

initAction();

async function initAction() {
  setTimeout(() => {
    if (!loginStore.isLogin) {
      showLoginConfirmModal.value = true;
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
  box-shadow: 0 1px 0 var(--1s-border-color);
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
  background: var(--1s-left-menu-container-background-color);
}

.design-layout__panel--right {
  width: var(--1s-right-panel-width);
  flex-shrink: 0;
  border-left: 1px solid var(--1s-border-color);
  box-shadow: -1px 0 0 var(--1s-border-color);
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
  padding: 0;
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
  inset: 0;
  z-index: 1;
  overflow: hidden;
  border: none;
  border-radius: 0;
  box-shadow: none;
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
  background: linear-gradient(to top, var(--1s-border-color), transparent);
}

.bg-transparent {
  background: transparent !important;
}

.scene-control-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 360px;
  max-width: 100vw;
  height: 100vh;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--1s-panel-background, hsl(var(--background)));
  border-left: 1px solid var(--1s-border-color, hsl(var(--border)));
  box-shadow: var(--1s-shadow-lg);
}

.scene-control-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 16px 20px;
  border-bottom: 1px solid var(--1s-border-color, hsl(var(--border)));
}

.scene-control-drawer__body {
  flex: 1;
  overflow: auto;
  min-height: 0;
  padding: 16px 20px;
}

.auto-width-modal {}

.aspect-ratio-selector {
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 10;
  width: 112px;
  border: 1px solid var(--1s-border-color);
  border-radius: var(--1s-radius-sm);
  background: var(--1s-elevated-background);
  
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
