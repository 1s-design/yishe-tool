<template>
  <loading v-if="isFirstPageLoading"></loading>

  <div id="layout-container" class="design-layout">
    <div id="layout-body" class="design-layout__body">
      <div
        v-if="showLeftMenu"
        id="layout-left-menu"
        class="design-layout__rail"
      >
        <left-menu></left-menu>
      </div>

      <div
        id="layout-left"
        class="design-layout__panel design-layout__panel--browser"
      >
        <div class="design-layout__panel-scroll">
          <keep-alive include="sticker">
            <component v-if="leftComponent" :is="leftComponent"></component>
            <div v-else class="design-layout__panel-empty">
              <span class="design-layout__panel-empty-icon">⌘</span>
              <strong>选择一个工作区</strong>
              <small>从左侧导航打开资源、画布或工具</small>
            </div>
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

      <aside id="layout-ai" class="design-layout__ai">
        <AiPanel :open="true" embedded />
      </aside>
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

  <!-- 创作资源全屏资源中心 -->
  <Dialog :modal="true" v-model:open="menuState.showProject">
    <DialogContent class="project-resource-modal">
      <div class="project-resource-modal__frame">
        <header class="project-resource-modal__header">
          <div class="project-resource-modal__heading">
            <div class="project-resource-modal__mark" aria-hidden="true">
              <Sparkles class="h-4 w-4" />
            </div>
            <div class="project-resource-modal__heading-copy">
              <DialogTitle class="project-resource-modal__title">创作资源</DialogTitle>
              <DialogDescription class="project-resource-modal__description">
                集中管理贴纸、字体、文案与设计资产
              </DialogDescription>
            </div>
          </div>

          <div class="project-resource-modal__header-actions">
            <span class="project-resource-modal__shortcut">资源中心</span>
            <DialogClose class="project-resource-modal__close" aria-label="关闭创作资源">
              <X class="h-4 w-4" />
            </DialogClose>
          </div>
        </header>

        <main class="project-resource-modal__body">
          <projectResourceModal />
        </main>
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
import upload from "./upload/index.vue";
import stamp from "./stamp/index.vue";
import svgCanvas from "./svgCanvas/index.vue";
import canvasLayout from "./canvas/index.vue";
import basicCanvas from "./basic-canvas/index.vue";
import { showMainCanvas } from "./canvas/index.tsx";
import stickerModal from "./sticker/modal.vue";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Sparkles, X } from "lucide-vue-next";
import projectResourceModal from "./project/resourceModal.vue";
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
isAiPanelOpen.value = true;

const showLoginConfirmModal = ref(false);

const basicContainerAnimation = ref({
  "enter-active-class": "animate__animated animate__bounceIn",
  "leave-active-class": "animate__animated animate__bounceOut",
  duration: 66,
});

const basicCanvasRef = ref();

const leftComponent = computed(() => {
  // 贴纸属性和列表属于画布操作面板，和资源面板一样放在左侧。
  if (showDecalControl.value) return decalControl;
  if (showDecalList.value) return decalList;

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
  /* 左轨/左面板宽度由 vars.less 统一管理（含响应式断点），这里只保留本地私有变量 */
  --1s-ai-panel-width: 360px;

  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  background: var(--1s-shell-background);
  color: var(--1s-text-color);
}

.design-layout__body {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.design-layout__rail {
  position: relative;
  z-index: 8;
  width: var(--1s-left-menu-width);
  flex: 0 0 var(--1s-left-menu-width);
  border-right: 1px solid var(--1s-border-color);
  background: var(--1s-left-menu-background-color);
}

.design-layout__panel {
  display: flex;
  min-width: 0;
  min-height: 0;
  background: var(--1s-panel-background);
}

.design-layout__panel--browser {
  width: var(--1s-left-panel-width);
  flex: 0 0 var(--1s-left-panel-width);
  border-right: 1px solid var(--1s-border-color);
  background: var(--1s-left-menu-container-background-color);
}

.design-layout__panel-scroll {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.design-layout__panel-scroll > * {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.design-layout__panel-empty {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 24px 18px;
  color: var(--1s-text-color-tertiary);
  text-align: center;
}

.design-layout__panel-empty strong {
  color: var(--1s-text-color-secondary);
  font-size: 11px;
  font-weight: 600;
}

.design-layout__panel-empty small {
  max-width: 170px;
  font-size: 10px;
  line-height: 1.55;
}

.design-layout__panel-empty-icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  margin-bottom: 2px;
  border: 1px solid var(--1s-dialog-border);
  border-radius: 0;
  background: var(--1s-control-surface-muted);
  color: var(--1s-text-color-secondary);
  font-size: 13px;
}

#layout-canvas {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  min-width: 320px;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  background: var(--1s-canvas-stage-background);
}

.design-layout__canvas-stage {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 0;
  overflow: hidden;
  background-color: var(--1s-canvas-stage-background);
  isolation: isolate;
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
  border: 1px solid var(--1s-dialog-border);
  border-radius: 0;
  box-: none;
}

.design-layout__basic-canvas {
  width: 100%;
  height: 100%;
  z-index: 3;
}

.design-layout__bottom {
  position: absolute;
  left: 50%;
  bottom: 14px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateX(-50%);
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}

.design-layout__ai {
  position: relative;
  z-index: 6;
  width: var(--1s-ai-panel-width);
  min-width: 288px;
  flex: 0 0 var(--1s-ai-panel-width);
  min-height: 0;
  overflow: hidden;
  border-left: 1px solid var(--1s-border-color);
  background: var(--1s-surface-background);
}

/*
 * AiPanel.vue 当前为只读 root-owned 文件。
 * 这里把它从悬浮拖拽形态无侵入地约束为右侧常驻 Dock，
 * 不改业务逻辑，也不影响弹窗内部的 AI 会话能力。
 */
.design-layout__ai > .ai-panel {
  position: static !important;
  inset: auto !important;
  width: 100% !important;
  max-width: none !important;
  height: 100% !important;
  min-height: 0 !important;
  z-index: auto !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-: none;
  transform: none !important;
}

.design-layout__ai .ai-panel-header {
  height: 40px !important;
  min-height: 40px !important;
  cursor: default !important;
  padding-left: 12px !important;
  padding-right: 10px !important;
}

.design-layout__ai .ai-panel-close-btn {
  display: none !important;
}

.design-layout__ai .ai-panel-messages {
  min-height: 0 !important;
  max-height: none !important;
  padding: 12px !important;
}

.design-layout__ai .ai-panel-input-area {
  flex-shrink: 0;
  padding: 10px !important;
}

.design-layout__ai .ai-input-textarea {
  min-height: 64px !important;
}

.bg-transparent {
  background: transparent !important;
}

.scene-control-drawer {
  position: fixed;
  top: 0;
  right: var(--1s-ai-panel-width);
  width: 320px;
  max-width: calc(100vw - var(--1s-ai-panel-width));
  height: 100vh;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--1s-panel-background, hsl(var(--background)));
  border-left: 1px solid var(--1s-border-color, hsl(var(--border)));
  box-: none;
}

.scene-control-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 12px 14px;
  border-bottom: 1px solid var(--1s-border-color, hsl(var(--border)));
}

.scene-control-drawer__body {
  flex: 1;
  overflow: auto;
  min-height: 0;
  padding: 14px;
}

.aspect-ratio-selector {
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 10;
  width: 112px;
  border: 1px solid var(--1s-dialog-border);
  border-radius: var(--1s-radius-sm);
  background: var(--1s-elevated-background);
  overflow: hidden;
}

.aspect-ratio-selector__control {
  width: 100%;
  font-size: 11px;
}

/* 创作资源全屏资源中心 */
.project-resource-modal {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  max-height: none !important;
  padding: 0 !important;
  gap: 0 !important;
  overflow: hidden !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: var(--1s-surface-background) !important;
  color: var(--1s-text-color) !important;
  transform: none !important;
  box-: none;
  grid-template-rows: 1fr !important;
}

.project-resource-modal > button.absolute {
  display: none !important;
}

.project-resource-modal__frame {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  background: var(--1s-surface-background);
}

.project-resource-modal__header {
  display: flex;
  min-height: 68px;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 24px;
  border-bottom: 1px solid var(--1s-border-color);
  background: var(--1s-surface-background);
}

.project-resource-modal__heading,
.project-resource-modal__header-actions {
  display: flex;
  align-items: center;
}

.project-resource-modal__heading {
  min-width: 0;
  gap: 12px;
}

.project-resource-modal__mark {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--1s-accent-color) 35%, transparent);
  border-radius: 9px;
  background: var(--1s-accent-color-soft);
  color: var(--1s-accent-color);
}

.project-resource-modal__heading-copy {
  min-width: 0;
}

.project-resource-modal__title {
  color: var(--1s-text-color) !important;
  font-size: 15px !important;
  font-weight: 650 !important;
  line-height: 1.25 !important;
  letter-spacing: -0.01em !important;
}

.project-resource-modal__description {
  margin-top: 3px;
  color: var(--1s-text-color-tertiary) !important;
  font-size: 11px !important;
  line-height: 1.35 !important;
}

.project-resource-modal__header-actions {
  flex-shrink: 0;
  gap: 10px;
}

.project-resource-modal__shortcut {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  padding: 0 8px;
  border: 1px solid var(--1s-dialog-border);
  border-radius: 0;
  background: var(--1s-control-surface-muted);
  color: var(--1s-text-color-tertiary);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.project-resource-modal__close {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--1s-text-color-secondary);
  cursor: pointer;
  transition: var(--1s-control-transition);

  &:hover {
    background: var(--1s-state-hover);
    color: var(--1s-text-color);
  }

  &:focus-visible {
    outline: none;
    box-: none;
  }
}

.project-resource-modal__body {
  min-width: 0;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  background: var(--1s-panel-background);
}

.project-resource-modal__body > .project-shell,
.project-resource-modal__body .project-shell {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--1s-panel-background);
}

.project-resource-modal__body .project-shell__main {
  min-height: 0;
  overflow: auto;
  background: var(--1s-panel-background);
  scrollbar-gutter: stable;
}

.project-resource-modal__body .project-page {
  min-height: 100%;
  background: var(--1s-panel-background);
}

.project-resource-modal__body .project-toolbar {
  min-height: 56px;
  padding: 10px 20px;
  gap: 12px;
  background: var(--1s-surface-background);
  border-bottom-color: var(--1s-border-color);
}

.project-resource-modal__body .project-toolbar__controls {
  gap: 8px;
}

.project-resource-modal__body .project-toolbar__caption {
  color: var(--1s-text-color-tertiary);
}

.project-resource-modal__body [role='tablist'] {
  min-height: 32px;
  padding: 3px;
  gap: 2px;
  border: 1px solid var(--1s-dialog-border);
  border-radius: 0;
  background: var(--1s-control-surface-muted);
}

.project-resource-modal__body [role='tab'] {
  min-height: 24px;
  padding: 0 10px;
  border-radius: 0;
  color: var(--1s-text-color-secondary);
  font-size: 11px;
  font-weight: 600;
}

.project-resource-modal__body [role='tab'][data-state='active'] {
  background: var(--1s-surface-background);
  color: var(--1s-text-color);
  box-: none;
}

.project-resource-modal__body .project-gallery-card {
  background: var(--1s-surface-background);
  border-color: var(--1s-border-color);
  border-radius: 0;
}

.project-resource-modal__body .project-gallery-card:hover {
  border-color: color-mix(in srgb, var(--1s-accent-color) 45%, var(--1s-border-color));
  box-: none;
}

.project-resource-modal__body .project-footer {
  background: var(--1s-surface-background);
  border-top-color: var(--1s-border-color);
}

@media (max-width: 1440px) {
  .design-layout {
    --1s-ai-panel-width: 320px;
  }

  .aspect-ratio-selector {
    width: 104px;
    bottom: 8px;
    left: 8px;
  }
}

@media (max-width: 1180px) {
  .design-layout {
    --1s-ai-panel-width: 292px;
  }

  #layout-canvas {
    min-width: 280px;
  }

  .aspect-ratio-selector {
    width: 100px;
  }
}

@media (max-width: 980px) {
  .design-layout {
    --1s-ai-panel-width: 276px;
  }

  #layout-canvas {
    min-width: 250px;
  }
}

@media (max-width: 760px) {
  .design-layout {
    --1s-ai-panel-width: min(42vw, 276px);
  }

  .design-layout__panel--browser {
    display: none;
  }

  .design-layout__bottom {
    padding: 0 8px;
    bottom: 8px;
  }

  .aspect-ratio-selector {
    width: 96px;
  }
}
</style>
