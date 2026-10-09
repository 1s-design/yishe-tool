<template>
  <div class="workspace-panel u-panel">
    <header class="u-panel__header">
      <div class="workspace-heading">
        <strong>工作台</strong>
        <span>{{ currentOperatingBaseModelInfo?.name || '未选择模型' }}</span>
      </div>
    </header>

    <section class="u-panel__section">
      <div class="u-panel__section-title">
        <span>场景预览</span>
        <span class="u-panel__title">3D 模型</span>
      </div>
      <div class="workspace-preview u-media-preview">
        <base-gltf-viewer
          class="workspace-preview-viewer"
          :src="currentOperatingBaseModelInfo?.url"
        ></base-gltf-viewer>
      </div>
    </section>

    <section class="u-panel__section workspace-layers">
      <div class="u-panel__section-title">
        <span>贴纸图层</span>
        <span class="u-panel__title">{{ currentModelController?.decalControllers.length || 0 }}</span>
      </div>

      <div v-if="currentModelController?.decalControllers.length" class="workspace-layer-list">
        <div
          v-for="decal in currentModelController.decalControllers"
          :key="decal.id.value"
          class="u-list-row workspace-layer-row"
          :class="{ 'is-selected': isMouseover(decal) || isCurrent(decal) }"
          role="button"
          tabindex="0"
          @click="decalItemClick(decal)"
          @keydown.enter.prevent="decalItemClick(decal)"
          @keydown.space.prevent="decalItemClick(decal)"
        >
          <s1-img
            :src="decal.state.src"
            fit="contain"
            class="workspace-layer-thumb"
          ></s1-img>
          <span class="u-list-row__label">{{ decal.info?.name || '未命名贴纸' }}</span>
          <span class="u-list-row__meta">{{ formatDate(decal.createdAt) }}</span>
          <span class="u-list-row__actions">
            <button
              type="button"
              class="u-icon-btn u-icon-btn--xs"
              title="查看详情"
              aria-label="查看贴纸详情"
              @click.stop="showDetails(decal)"
            >
              <Info />
            </button>
            <button
              type="button"
              class="u-icon-btn u-icon-btn--xs"
              title="调整属性"
              aria-label="调整贴纸属性"
              @click.stop="setting(decal)"
            >
              <SlidersHorizontal />
            </button>
            <button
              type="button"
              class="u-icon-btn u-icon-btn--xs workspace-layer-delete"
              title="移除"
              aria-label="移除贴纸"
              @click.stop="confirm({ title: '确定要移除该贴纸吗？' }).then((ok) => ok && removeDecal(decal))"
            >
              <Trash2 />
            </button>
          </span>
        </div>
      </div>
      <div v-else class="u-panel__empty">暂无贴纸</div>
    </section>

    <div class="workspace-panel__footer">
      <button
        class="u-btn u-btn--sm u-btn--danger u-btn--block"
        type="button"
        :disabled="!currentModelController"
        @click="clear"
      >
        清空当前场景
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  currentOperatingBaseModelInfo,
  currentModelController,
  currentOperatingDecalController,
  showDecalControl,
} from "../../store";
import baseGltfViewer from "@/components/model/baseGltfViewer/index.vue";
import { useDateFormat } from "@vueuse/core";
import { Info, SlidersHorizontal, Trash2 } from "lucide-vue-next";
import { confirm } from "@/components/ui/confirm";
import { useStickerDetailModal } from "../project/sticker/stickerModal";

const { open: openStickerDetailModal } = useStickerDetailModal();

function formatDate(date) {
  if (!date) return "";
  return useDateFormat(date, "MM-DD HH:mm").value;
}

function isMouseover(decal) {
  return decal.mouseover.value;
}

function decalItemClick(decal) {
  currentOperatingDecalController.value = decal;
}

function isCurrent(decal) {
  return Boolean(
    currentOperatingDecalController.value &&
      decal.id.value === currentOperatingDecalController.value.id.value,
  );
}

function setting(decal) {
  currentOperatingDecalController.value = decal;
  showDecalControl.value = true;
}

function showDetails(decal) {
  const state = decal?.state || {};
  const info = decal?.info || {};
  openStickerDetailModal({
    ...info,
    url: state.url || state.src,
    name: info.name || state.name || "未命名贴纸",
    description: info.description || "",
    keywords: info.keywords || "",
    updateTime: info.updateTime || decal?.createdAt || "",
    id: state.id || info.id || decal?.id?.value || decal?.id || "",
  });
}

function removeDecal(decal) {
  decal.remove();
}

function clear() {
  currentModelController.value?.clear();
}
</script>

<style lang="less" scoped>
.workspace-heading {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;

  strong {
    color: var(--1s-text-color);
    font-size: var(--1s-control-font-md);
    font-weight: 600;
  }

  span {
    overflow: hidden;
    color: var(--1s-text-color-tertiary);
    font-size: var(--1s-control-font);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.workspace-panel {
  height: 100%;
  overflow: hidden;
}

.workspace-preview {
  height: 104px;
  min-height: 104px;
  margin: 0 8px 6px;
}

.workspace-preview-viewer {
  width: 100%;
  height: 104px;
  background: transparent;
}

.workspace-layers {
  flex: 1;
  min-height: 0;
}

.workspace-layer-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 1px 0 8px;
  overflow: auto;
}

.workspace-layer-row {
  height: 32px;
  min-height: 32px;
  text-align: left;
  border: 1px solid var(--1s-border-color);
  background: transparent;
  color: inherit;
  font-family: inherit;
}

.workspace-layer-row .u-list-row__meta {
  max-width: 34px;
  overflow: hidden;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-layer-thumb {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid var(--1s-border-color);
  border-radius: 3px;
  background: var(--1s-elevated-background);
}

.workspace-layer-delete:hover {
  color: var(--1s-destructive-text, #d92d20);
  background: rgba(217, 45, 32, 0.1);
}

.workspace-panel__footer {
  padding: 6px 8px;
  border-top: 1px solid var(--1s-divider-color);
}
</style>
