<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2023-12-27 19:20:45
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-12-14 08:07:29
 * @FilePath: /1s/src/components/design/layout/headerMenu.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by 1s, All Rights Reserved. 
-->
<template>
  <div class="designiy-header">
    <!-- 菜单 -->
    <div class="designiy-header__brand">
      <Menu class="designiy-header__menu-icon" />
    </div>

    <!-- 编辑状态 -->
    <template v-if="isEdit">
      <div class="designiy-header__status">
        <span class="designiy-header__status-dot designiy-header__status-dot--edit" />
        <span class="designiy-header__status-text">模型 {{ currentEditingModelId }}</span>
        <button type="button" class="designiy-header__ghost-btn" @click="confirmExitEditMode">退出</button>
      </div>
    </template>
    <template v-else-if="currentEditingCustomStickerId">
      <div class="designiy-header__status">
        <span class="designiy-header__status-dot designiy-header__status-dot--edit" />
        <span class="designiy-header__status-text">编辑中</span>
        <button type="button" class="designiy-header__ghost-btn" @click="handleConvertToCreateNew">转为新建</button>
      </div>
    </template>

    <div class="designiy-header__spacer"></div>

    <!-- 右侧操作区 -->
    <div class="designiy-header__actions">
      <!-- 连接状态 -->
      <Tooltip>
        <TooltipTrigger as-child>
          <div class="designiy-header__icon-btn" @click="showDownloadModal = true">
            <Download class="h-3.5 w-3.5" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">下载客户端</TooltipContent>
      </Tooltip>

      <!-- 连接状态指示 -->
      <div class="designiy-header__indicators">
        <Tooltip>
          <TooltipTrigger as-child>
            <div class="designiy-header__indicator">
              <span
                class="designiy-header__dot"
                :class="`designiy-header__dot--${wsStatus}`"
              />
              <span class="designiy-header__indicator-label">{{ wsStatusLabel }}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">{{ wsStatusTooltip }}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger as-child>
            <div class="designiy-header__indicator">
              <span
                class="designiy-header__dot"
                :class="`designiy-header__dot--${agentStatus}`"
              />
              <span class="designiy-header__indicator-label">{{ agentStatusLabel }}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">{{ agentStatusTooltip }}</TooltipContent>
        </Tooltip>
      </div>

      <!-- 自动制作 -->
      <Tooltip>
        <TooltipTrigger as-child>
          <button
            type="button"
            class="designiy-header__tool-btn"
            :class="{ 'designiy-header__tool-btn--active': batchIsRunning }"
            :aria-pressed="batchIsRunning"
            @click="showAutocreateModal = true"
          >
            <Sparkles class="h-3.5 w-3.5" />
            <span>{{ autoCreateButtonLabel }}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">自动制作</TooltipContent>
      </Tooltip>

      <!-- 共享屏幕 -->
      <Tooltip>
        <TooltipTrigger as-child>
          <button
            type="button"
            class="designiy-header__tool-btn"
            :class="{ 'designiy-header__tool-btn--active': screenShareActive }"
            :aria-pressed="screenShareActive"
            @click="toggleScreenShare"
          >
            <Monitor class="h-3.5 w-3.5" />
            <span>{{ screenShareActive ? '共享中' : '共享' }}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{{ screenShareActive ? '停止共享' : '共享屏幕给管理端' }}</TooltipContent>
      </Tooltip>

      <!-- 主题切换 -->
      <Tooltip>
        <TooltipTrigger as-child>
          <button
            type="button"
            class="designiy-header__icon-btn"
            :aria-pressed="isDarkMode"
            @click="isDarkMode = !isDarkMode"
          >
            <Moon v-if="isDarkMode" class="h-3.5 w-3.5" />
            <Sun v-else class="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{{ isDarkMode ? '浅色模式' : '深色模式' }}</TooltipContent>
      </Tooltip>

      <!-- 用户 -->
      <user-avatar v-if="loginStatusStore.isLogin" />
      <Button v-else @click="login" variant="default" size="sm" class="h-6 px-2.5 text-[11px] ">登录</Button>
    </div>

    <DownloadModal v-model:open="showDownloadModal" />
  </div>
</template>

<script setup>
import { getBaseModel, getBaseSkybox } from "@/api/index.ts";
import { ref, defineEmits, defineProps, computed, onMounted, watch } from "vue";
import { confirm as uiConfirm } from '@/components/ui/confirm';
import {
  canvasBgColor,
  canvasBgOpacity,
  currentModelController,
  showUpload,
  lastModifiedTime,
  storageName,
  builtInCanvasBackgrounds,
  currentCanvasBackground,
  isDarkMode,
  isEdit,
  currentEditingModelId,
  exitEditMode,
} from "../store";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Pencil, Sun, Moon, Download, Sparkles, Monitor, Menu } from "lucide-vue-next";
import { message } from '@/common/message';
import DownloadModal from "./downloadModal/index.vue";
import {
  currentEditingCustomStickerId,
  currentEditingCustomStickerName,
  exitCustomStickerEditMode,
} from "@/components/design/layout/canvas/index.tsx";

import { openFileModal } from "@/components/design/layout/upload/index.tsx";

import userAvatar from "@/components/user/userAvatar.vue";
import headerMenuDropdown from "./headerMenuDropdown/index.vue";
import { onShortcutTrigger } from "../shortcut/index";
import iconHelp from "@/icon/help.svg?component";
import { useLoginStatusStore } from "@/store/stores/login";
import { useDateFormat, useNow } from "@vueuse/core";
import { AlertCircle, Check, CheckCircle2, Eye, Loader2, Share, Upload } from 'lucide-vue-next';
import { useRouter } from "vue-router";
import { useFileDialog } from "@vueuse/core";
import { openLoginDialog } from "@/modules/main/view/user/login/index.tsx";
import Utils from "@/common/utils";
import { localFileListResource } from "@/components/design/store";
import { websocketClient } from "@/services/websocketClient";
import { designAgent } from "@/ai/langgraph";
import { canvasStreamService } from "@/services/canvasStream";
import { showAutocreateModal } from "./autocreate/index";
import { batchProgress } from "@/ai/agent/batch";
import { getAgentPhaseLabel } from "@/ai/agent/presentation";

const showDownloadModal = ref(false);

const batchIsRunning = computed(() =>
  ["preparing", "running", "paused"].includes(batchProgress.status),
);
const batchCompletedCount = computed(
  () =>
    batchProgress.items.filter((item) =>
      ["done", "failed", "skipped"].includes(item.status),
    ).length,
);
const autoCreateButtonLabel = computed(() => {
  if (batchProgress.status === "preparing") return "准备中";
  if (batchProgress.status === "paused") {
    return `已暂停 ${batchCompletedCount.value}/${batchProgress.items.length}`;
  }
  if (batchProgress.status === "running") {
    return `制作中 ${batchCompletedCount.value}/${batchProgress.items.length}`;
  }
  return "自动制作";
});

const wsStatus = computed(() => websocketClient.state.status);
const wsStatusLabel = computed(() => {
  switch (wsStatus.value) {
    case "connected": return "已连接";
    case "connecting": return "连接中";
    case "reconnecting": return "重连中";
    case "error": return "异常";
    case "disconnected": return "已断开";
    default: return "未连接";
  }
});
const wsStatusTooltip = computed(() => {
  const latency = websocketClient.state.lastLatencyMs;
  const latencyText = latency != null ? ` · 延迟 ${latency}ms` : "";
  return `服务连接: ${wsStatusLabel.value}${latencyText}`;
});

const agentStatus = computed(() => designAgent.state.status || "idle");
const agentStatusLabel = computed(() =>
  getAgentPhaseLabel(agentStatus.value, designAgent.state.plan),
);
const agentStatusTooltip = computed(() => {
  const error = designAgent.state.error ? ` · ${designAgent.state.error}` : "";
  const count = designAgent.state.messages?.length ?? 0;
  return `AI Agent: ${agentStatusLabel.value} · ${count} 条消息${error}`;
});

// 屏幕共享（监听 canvasStreamService 状态，无论谁触发都同步）
const screenShareActive = ref(canvasStreamService.isActive());

watch(() => canvasStreamService.status.isStreaming, (active) => {
  screenShareActive.value = active;
  websocketClient.setScreenSharing(active);
});

const toggleScreenShare = async () => {
  if (screenShareActive.value) {
    canvasStreamService.stopMonitoring();
    // watch 会自动更新 screenShareActive 和 setScreenSharing
  } else {
    try {
      await canvasStreamService.startMonitoring();
      // watch 会自动更新 screenShareActive 和 setScreenSharing
    } catch (e) {
      console.warn("[ScreenShare] Failed:", e?.message);
    }
  }
};

const router = useRouter();

const loginStatusStore = useLoginStatusStore();

const displayDate = useDateFormat(lastModifiedTime, "YYYY-MM-DD hh:mm:ss");

const props = defineProps([]);

function login() {
  openLoginDialog();
}

const { open: openFileDialog, reset, onCancel, onChange } = useFileDialog({
  accept: Utils.const.ImageFontFileAcceptString,
  multiple: true,
});

// 本地上传的文件

onChange((fileList) => {
  localFileListResource.value.push(...fileList);
});

function openUplaodModal(file) {
  openFileModal(file);
}

function handleConvertToCreateNew() {
  const previousName = currentEditingCustomStickerName.value;
  exitCustomStickerEditMode();
  message.success(`已转为新建模式${previousName ? `（基于「${previousName}」副本）` : ''}，保存时将生成新作品`);
}

function remove(file) {}

function confirmExitEditMode() {
  uiConfirm({
    title: '确认退出编辑模式',
    description: '退出编辑模式后，所有改动不会影响到已保存的模型，截图也不会关联到该模型。确定要退出吗？',
    okText: '确定退出',
    cancelText: '取消',
  }).then((ok) => {
    if (ok) exitEditMode();
  });
}

</script>

<style lang="less" scoped>
.designiy-header {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 8px 0 0;
  min-width: 0;
  background: var(--1s-surface-background);
  color: var(--1s-text-color);
  gap: 0;
}

/* 品牌 */
.designiy-header__brand {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--1s-left-menu-width);
  height: 100%;
  flex-shrink: 0;
  color: var(--1s-text-color-secondary);
  cursor: pointer;
  transition: color 0.08s;

  &:hover {
    color: var(--1s-text-color);
  }
}

.designiy-header__menu-icon {
  width: 18px;
  height: 18px;
}

/* 编辑状态 */
.designiy-header__status {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding-right: 12px;
  margin-right: 4px;
  border-right: 1px solid var(--1s-divider-color);
  height: 18px;
}

.designiy-header__status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;

  &--edit {
    background: var(--1s-accent-color);
  }
}

.designiy-header__status-text {
  font-size: 11px;
  color: var(--1s-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.designiy-header__ghost-btn {
  background: none;
  border: 1px solid var(--1s-dialog-border);
  height: var(--1s-control-h-sm);
  padding: 0 8px;
  border-radius: 0;
  font-family: inherit;
  font-size: var(--1s-control-font);
  font-weight: 500;
  line-height: 1;
  color: var(--1s-text-color-secondary);
  cursor: pointer;
  transition: var(--1s-control-transition);

  &:hover {
    color: var(--1s-text-color);
    background: var(--1s-state-hover);
  }
  &:active {
    background: var(--1s-state-active);
  }
  &:focus-visible {
    outline: none;
    box-: none;
  }
}

/* Spacer */
.designiy-header__spacer {
  flex: 1;
  min-width: 0;
}

/* 右侧操作区 */
.designiy-header__actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

/* 图标按钮 — 对齐 u-icon-btn */
.designiy-header__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--1s-control-h-md);
  height: var(--1s-control-h-md);
  border-radius: 0;
  border: 1px solid var(--1s-dialog-border);
  background: none;
  color: var(--1s-text-color-secondary);
  cursor: pointer;
  flex-shrink: 0;
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

  &--active,
  &.is-selected {
    color: var(--1s-state-selected-text);
    background: var(--1s-state-selected);
  }
}

/* 状态指示 */
.designiy-header__indicators {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
  margin: 0 2px;
  border-left: 1px solid var(--1s-divider-color);
  border-right: 1px solid var(--1s-divider-color);
  height: 18px;
}

.designiy-header__indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: default;
}

.designiy-header__indicator-label {
  font-size: 10px;
  color: var(--1s-text-color-tertiary);
  white-space: nowrap;
  line-height: 1;
}

.designiy-header__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--1s-text-color-tertiary);
  cursor: default;
  flex-shrink: 0;

  &--connected,
  &--idle {
    background: #34d399;
  }

  &--connecting,
  &--reconnecting,
  &--thinking,
  &--executing {
    background: #fbbf24;
  }

  &--error {
    background: #f87171;
  }

  &--disconnected {
    background: var(--1s-text-color-tertiary);
    opacity: 0.4;
  }
}

/* 工具按钮 (自动制作 / 共享) — 对齐 u-btn--sm--ghost */
.designiy-header__tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: var(--1s-control-h-sm);
  padding: 0 8px;
  border-radius: 0;
  border: 1px solid var(--1s-dialog-border);
  background: none;
  color: var(--1s-text-color-secondary);
  font-family: inherit;
  font-size: var(--1s-control-font);
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  white-space: nowrap;
  transition: var(--1s-control-transition);

  svg {
    width: 14px;
    height: 14px;
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
    background: var(--1s-state-selected);
    color: var(--1s-state-selected-text);

    &:hover {
      background: var(--1s-state-selected);
      color: var(--1s-state-selected-text);
    }
    &:active {
      background: color-mix(in srgb, var(--1s-state-selected) 85%, #000);
    }
  }
}
</style>
