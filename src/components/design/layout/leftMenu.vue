<template>
  <nav class="menu-bar design-nav" role="navigation" aria-label="设计工具主导航">
    <div class="design-nav__brand" aria-label="1s Design">
      <img class="design-nav__logo" src="/yishe-logo.png" alt="Yishe logo" />
    </div>

    <div class="design-nav__scroll">
      <div class="design-nav__group" aria-label="创作">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="menu-bar-item"
              :class="{ 'menu-bar-item-focus': menuState.showProject }"
              aria-label="创作资源"
              @click="menuState.showProject = !menuState.showProject"
            >
              <icon-project></icon-project>
              <span class="menu-bar-item__label">创作资源</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">创作资源</TooltipContent>
        </Tooltip>

        <Tooltip v-if="isDesign3DEnabled">
          <TooltipTrigger as-child>
            <button
              type="button"
              class="menu-bar-item"
              :class="{ 'menu-bar-item-focus': menuState.activeMenu === menuItems.workspace }"
              aria-label="工作台"
              @click="setActiveMenu(menuItems.workspace)"
            >
              <icon-workspace></icon-workspace>
              <span class="menu-bar-item__label">工作台</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">工作台</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="menu-bar-item"
              :class="{ 'menu-bar-item-focus': menuState.activeMenu === menuItems.sticker }"
              aria-label="贴纸资源"
              @click="setActiveMenu(menuItems.sticker)"
            >
              <icon-sticker></icon-sticker>
              <span class="menu-bar-item__label">贴纸资源</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">贴纸资源</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="menu-bar-item"
              :class="{ 'menu-bar-item-focus': menuState.activeMenu === menuItems.customSticker }"
              aria-label="自定义贴纸"
              @click="setActiveMenu(menuItems.customSticker)"
            >
              <icon-brush></icon-brush>
              <span class="menu-bar-item__label">自定义</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">自定义贴纸</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="menu-bar-item"
              :class="{ 'menu-bar-item-focus': menuState.activeMenu === menuItems.canvas }"
              aria-label="制作贴纸"
              @click="setActiveMenu(menuItems.canvas)"
            >
              <icon-canvas></icon-canvas>
              <span class="menu-bar-item__label">制作贴纸</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">制作贴纸</TooltipContent>
        </Tooltip>
      </div>

      <div class="design-nav__divider"></div>

      <div class="design-nav__group" aria-label="工具">
        <Tooltip v-if="isDesign3DEnabled">
          <TooltipTrigger as-child>
            <button
              type="button"
              class="menu-bar-item"
              :class="{ 'menu-bar-item-focus': showBaseModelSelect }"
              aria-label="选择模型"
              @click="showBaseModelSelect = !showBaseModelSelect"
            >
              <desimage
                v-if="currentOperatingBaseModelInfo?.id"
                class="design-nav__model-image"
                :src="currentOperatingBaseModelInfo.thumbnail"
              ></desimage>
              <icon-shirt v-else></icon-shirt>
              <span class="menu-bar-item__label">模型</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {{ currentOperatingBaseModelInfo?.id ? "切换模型" : "选择模型" }}
          </TooltipContent>
        </Tooltip>

        <Tooltip v-if="isDesign3DEnabled">
          <TooltipTrigger as-child>
            <button
              type="button"
              class="menu-bar-item"
              :class="{ 'menu-bar-item-focus': menuState.activeMenu === menuItems.material }"
              aria-label="服装材质"
              @click="setActiveMenu(menuItems.material)"
            >
              <s1-icon name="material"></s1-icon>
              <span class="menu-bar-item__label">服装材质</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">服装材质</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="menu-bar-item"
              :class="{ 'menu-bar-item-focus': showImageEditorModal }"
              aria-label="图片编辑"
              @click="handleSpecialMenuClick(menuItems.imageEditor)"
            >
              <icon-image-editor></icon-image-editor>
              <span class="menu-bar-item__label">图片编辑</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">图片编辑</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="menu-bar-item"
              :class="{ 'menu-bar-item-focus': showFontModal }"
              aria-label="字体"
              @click="handleSpecialMenuClick(menuItems.font)"
            >
              <icon-font></icon-font>
              <span class="menu-bar-item__label">字体</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">字体</TooltipContent>
        </Tooltip>

        <Tooltip v-if="isDesign3DEnabled">
          <TooltipTrigger as-child>
            <button
              type="button"
              class="menu-bar-item"
              :class="{ 'menu-bar-item-focus': menuState.activeMenu === menuItems.videoClip }"
              aria-label="图像导出"
              @click="setActiveMenu(menuItems.videoClip)"
            >
              <Video />
              <span class="menu-bar-item__label">图像导出</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">图像导出</TooltipContent>
        </Tooltip>

        <Tooltip v-if="isDesign3DEnabled">
          <TooltipTrigger as-child>
            <button
              type="button"
              class="menu-bar-item"
              :class="{ 'menu-bar-item-focus': showSceneControl }"
              aria-label="场景设置"
              @click="handleSpecialMenuClick(menuItems.scene)"
            >
              <icon-earth></icon-earth>
              <span class="menu-bar-item__label">场景设置</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">设置场景</TooltipContent>
        </Tooltip>
      </div>

      <div class="design-nav__divider"></div>

      <div class="design-nav__group" aria-label="智能工具">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="menu-bar-item menu-bar-item--accent"
              :class="{ 'menu-bar-item-focus': isAiPanelOpen }"
              aria-label="AI 设计助手"
              @click="isAiPanelOpen = true"
            >
              <Bot />
              <span class="menu-bar-item__label">AI 助手</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">AI 设计助手（右侧常驻）</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="menu-bar-item"
              :class="{ 'menu-bar-item-focus': showOperationsModal }"
              aria-label="AI 操作"
              @click="showOperationsModal = !showOperationsModal"
            >
              <Zap />
              <span class="menu-bar-item__label">AI 操作</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">AI 操作</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="menu-bar-item"
              :class="{ 'menu-bar-item-focus': showPromptPicker }"
              aria-label="提示词库"
              @click="showPromptPicker = true"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span class="menu-bar-item__label">提示词库</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">提示词库</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="menu-bar-item"
              :class="{ 'menu-bar-item-focus': showCanvasStructure }"
              aria-label="数据结构"
              @click="showCanvasStructure = !showCanvasStructure"
            >
              <Code2 />
              <span class="menu-bar-item__label">数据结构</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">查看数据结构</TooltipContent>
        </Tooltip>
      </div>
    </div>

    <div class="menu-bar-utils">
      <Tooltip>
        <TooltipTrigger as-child>
          <div class="menu-bar-util design-nav__status" :class="`is-${wsStatus}`" aria-label="服务连接状态">
            <span class="menu-bar-util-dot" :class="`dot--${wsStatus}`"></span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">{{ wsStatusTooltip }}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <div class="menu-bar-util design-nav__status" :class="`is-${agentStatus}`" aria-label="Agent 状态">
            <span class="menu-bar-util-dot" :class="`dot--${agentStatus}`"></span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">{{ agentStatusTooltip }}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <button
            type="button"
            class="menu-bar-util"
            :class="{ 'menu-bar-util--active': batchIsRunning }"
            aria-label="自动制作"
            @click="showAutocreateModal = true"
          >
            <Sparkles />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{{ autoCreateButtonLabel }}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <button
            type="button"
            class="menu-bar-util"
            :class="{ 'menu-bar-util--active': screenShareActive }"
            aria-label="共享屏幕"
            @click="toggleScreenShare"
          >
            <Monitor />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{{ screenShareActive ? '停止共享' : '共享屏幕' }}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <button type="button" class="menu-bar-util" aria-label="下载客户端" @click="showDownloadModal = true">
            <Download />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">下载客户端</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <button type="button" class="menu-bar-util" aria-label="切换主题" @click="isDarkMode = !isDarkMode">
            <Moon v-if="isDarkMode" />
            <Sun v-else />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{{ isDarkMode ? '浅色模式' : '深色模式' }}</TooltipContent>
      </Tooltip>

      <div class="menu-bar-util menu-bar-util--user">
        <user-avatar v-if="loginStatusStore.isLogin" />
        <button v-else type="button" class="menu-bar-login" aria-label="登录" @click="login">
          <UserRound />
        </button>
      </div>
    </div>

    <DesignPromptPicker v-model="showPromptPicker" @select="handlePromptSelect" />
    <DownloadModal v-model:open="showDownloadModal" />
  </nav>
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
import { Bot, Video, Zap, Code2, Sparkles, Monitor, Download, Sun, Moon, UserRound } from 'lucide-vue-next';
import { ref, computed, watch } from "vue";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import DesignPromptPicker from "./ai/DesignPromptPicker.vue";
import DownloadModal from "./downloadModal/index.vue";
import userAvatar from "@/components/user/userAvatar.vue";
import { isDarkMode } from "../store";
import { openLoginDialog } from "@/modules/main/view/user/login/index.tsx";
import { useLoginStatusStore } from "@/store/stores/login";
import { websocketClient } from "@/services/websocketClient";
import { designAgent } from "@/ai/langgraph";
import { canvasStreamService } from "@/services/canvasStream";
import { showAutocreateModal } from "./autocreate/index";
import { batchProgress } from "@/ai/agent/batch";
import { getAgentPhaseLabel } from "@/ai/agent/presentation";

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
const showDownloadModal = ref(false);

const loginStatusStore = useLoginStatusStore();

function login() {
  openLoginDialog();
}

/* 从顶栏迁入的状态 */
const batchIsRunning = computed(() =>
  ["preparing", "running", "paused"].includes(batchProgress.status),
);
const autoCreateButtonLabel = computed(() => {
  if (batchProgress.status === "preparing") return "准备中";
  if (batchProgress.status === "paused") {
    return `已暂停 ${batchProgress.items.filter((i) => ["done","failed","skipped"].includes(i.status)).length}/${batchProgress.items.length}`;
  }
  if (batchProgress.status === "running") {
    return `制作中 ${batchProgress.items.filter((i) => ["done","failed","skipped"].includes(i.status)).length}/${batchProgress.items.length}`;
  }
  return "自动制作";
});

const wsStatus = computed(() => websocketClient.state.status);
const wsStatusTooltip = computed(() => {
  const latency = websocketClient.state.lastLatencyMs;
  const latencyText = latency != null ? ` · 延迟 ${latency}ms` : "";
  return `服务连接: ${wsStatus.value}${latencyText}`;
});

const agentStatus = computed(() => designAgent.state.status || "idle");
const agentStatusTooltip = computed(() => {
  const error = designAgent.state.error ? ` · ${designAgent.state.error}` : "";
  const count = designAgent.state.messages?.length ?? 0;
  return `AI Agent: ${getAgentPhaseLabel(agentStatus.value, designAgent.state.plan)} · ${count} 条消息${error}`;
});

const screenShareActive = ref(canvasStreamService.isActive());
watch(() => canvasStreamService.status.isStreaming, (active) => {
  screenShareActive.value = active;
  websocketClient.setScreenSharing(active);
});
const toggleScreenShare = async () => {
  if (screenShareActive.value) {
    canvasStreamService.stopMonitoring();
  } else {
    try {
      await canvasStreamService.startMonitoring();
    } catch (e) {
      console.warn("[ScreenShare] Failed:", e?.message);
    }
  }
};

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
.menu-bar,
.design-nav {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  background: var(--1s-left-menu-background-color);
  box-sizing: border-box;
}

.design-nav__brand {
  display: grid;
  place-items: center;
  width: 42px;
  height: 46px;
  margin: 8px 0 4px;
  flex-shrink: 0;
  border-radius: 11px;
}

.design-nav__logo {
  display: block;
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.design-nav__scroll {
  width: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 0 6px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.design-nav__group {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.design-nav__divider {
  width: 32px;
  height: 1px;
  margin: 8px 0;
  flex-shrink: 0;
  background: var(--1s-divider-color);
}

.menu-bar-item {
  appearance: none;
  border: 0;
  font: inherit;
  width: calc(100% - 8px);
  max-width: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 9px;
  padding: 8px 0 4px;
  flex-shrink: 0;
  position: relative;
  border-radius: 11px;
  background: transparent;
  color: var(--1s-text-color-secondary);
  cursor: pointer;
  user-select: none;
  transition: var(--1s-control-transition);

  /* 图标衬底 — 正方形 24×24，图标 14px 居中 */
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: transparent;
    transition: var(--1s-control-transition);
    z-index: 0;
  }

  svg,
  .s1-icon,
  .design-nav__model-image {
    position: relative;
    z-index: 1;
    width: 14px;
    height: 14px;
    display: block;
    flex-shrink: 0;
  }

  &:hover {
    color: var(--1s-text-color);

    &::before {
      background: var(--1s-state-hover);
    }
  }

  &:active::before {
    background: var(--1s-state-active);
  }

  &:focus-visible {
    outline: none;
    box-: none;
  }

  &--accent {
    color: var(--1s-accent-color);
  }
}

.menu-bar-item__label {
  position: relative;
  z-index: 1;
  font-size: 8.5px;
  line-height: 10px;
  font-weight: 400;
  letter-spacing: 0;
  white-space: nowrap;
  color: inherit;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 选中态 — 中性灰衬底（不使用主题色） */
.menu-bar-item-focus {
  color: var(--1s-text-color) !important;

  &::before {
    background: var(--1s-state-selected) !important;
  }

  &:hover {
    color: var(--1s-text-color) !important;

    &::before {
      background: var(--1s-state-selected) !important;
    }
  }
}

.design-nav__model-image {
  overflow: hidden;
  border-radius: 6px;
  object-fit: cover;
}

.menu-bar-utils {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
  border-top: 1px solid var(--1s-divider-color);
  flex-shrink: 0;
  background: var(--1s-left-menu-background-color);
}

.menu-bar-util {
  appearance: none;
  border: 0;
  font: inherit;
  display: grid;
  place-items: center;
  width: 40px;
  height: 30px;
  padding: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--1s-text-color-secondary);
  cursor: pointer;
  transition: var(--1s-control-transition);

  svg {
    width: 16px;
    height: 16px;
    display: block;
  }

  &:hover {
    background: var(--1s-state-hover);
    color: var(--1s-text-color);
  }

  &:active {
    background: var(--1s-state-active);
  }

  &:focus-visible {
    outline: none;
    box-: none;
  }

  &--active {
    color: var(--1s-state-selected-text);
    background: var(--1s-state-selected);
  }

  &--user {
    width: 34px;
    height: 34px;
    margin-top: 2px;
    overflow: visible;
    isolation: isolate;
    border-radius: 9px;

    /* Keep the avatar optically centered within the hover surface. */
    .user-avatar-fixed {
      margin: 0 !important;
      width: 28px !important;
      height: 28px !important;
      min-width: 28px !important;
      max-width: 28px !important;
      min-height: 28px !important;
      max-height: 28px !important;
    }

    .user-avatar-img {
      width: 28px !important;
      height: 28px !important;
      min-width: 28px !important;
      min-height: 28px !important;
      border-radius: 50%;
    }
  }
}

.design-nav__status {
  cursor: default;
}

.menu-bar-util-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--1s-text-color-tertiary);

  &.dot--connected,
  &.dot--idle,
  &.dot--done {
    background: var(--1s-bg-success);
    box-: none;
  }

  &.dot--connecting,
  &.dot--reconnecting,
  &.dot--thinking,
  &.dot--executing,
  &.dot--running,
  &.dot--preparing {
    background: var(--1s-bg-warning);
    box-: none;
  }

  &.dot--error,
  &.dot--failed {
    background: var(--1s-bg-danger);
    box-: none;
  }

  &.dot--disconnected {
    opacity: 0.45;
  }
}

.menu-bar-login {
  appearance: none;
  border: 0;
  box-sizing: border-box;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  padding: 0;
  border-radius: var(--1s-radius-medium);
  background: var(--1s-accent-color);
  color: #fff;
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: color-mix(in srgb, var(--1s-accent-color) 88%, #000);
  }
}
</style>
