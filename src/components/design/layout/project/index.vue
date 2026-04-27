<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2025-05-20 06:50:38
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-06-12 21:30:29
 * @FilePath: /1s/src/components/design/layout/project/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="project-shell">
    <div class="project-shell__main">
      <component :is="activeComponent">
        <template #tabs>
          <nav class="project-shell__nav" aria-label="创作资源分类">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              class="project-shell__nav-item"
              :class="{ 'is-active': activeKey === tab.key }"
              @click="activeKey = tab.key"
            >
              {{ tab.label }}
            </button>
          </nav>
        </template>
      </component>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, markRaw } from "vue";

import tabSticker from "./sticker/index.vue";
import tabFont from "./font/index.vue";
import tabSentence from './sentence/index.vue'
import { useLocalStorage } from "@vueuse/core";

enum UserOwnSourceType {
  CUSTOM_MODEL = "customModel",
  STICKER = "sticker",
  FONT = "font",
  COLLECT = "collect",
  LIKED = "liked",
  DRAFT = "draft"
}

const activeKey = useLocalStorage('_1s_projectActiveTab', UserOwnSourceType.STICKER);

const tabs = ref([
  {
    label: "贴纸",
    key: "sticker",
    component: markRaw(tabSticker),
  },
  {
    label: "字体",
    key: UserOwnSourceType.FONT,
    component: markRaw(tabFont),
  },
  {
    label: "句子",
    key: "sentence",
    component: markRaw(tabSentence),
  },
]);

if (!tabs.value.some((item) => item.key === activeKey.value)) {
  activeKey.value = UserOwnSourceType.STICKER;
}

const activeComponent = computed(() => {
  const currentTab = tabs.value.find((item) => item.key == activeKey.value) || tabs.value[0];
  return currentTab.component;
});

</script>
<style lang="less">
.full-modal--project-resources {
  .ant-modal {
    max-width: 100vw;
  }

  .ant-modal-content {
    overflow: hidden;
    background: var(--1s-surface-background);
  }

  .ant-modal-header {
    height: 44px;
    padding: 0 18px;
    background: var(--1s-surface-background);
    display: flex;
    align-items: center;
  }

  .ant-modal-title {
    color: var(--1s-text-color);
    font-size: 14px;
    font-weight: 600;
  }

  .ant-modal-close {
    top: 7px;
    inset-inline-end: 12px;
    width: 30px;
    height: 30px;
    border-radius: var(--1s-radius-sm);
    background: transparent;
    color: var(--1s-text-color-secondary);
    transition: all 0.2s ease;
  }

  .ant-modal-close:hover {
    background: var(--1s-control-hover-background);
    color: var(--1s-text-color);
  }

  .ant-modal-body {
    height: calc(100vh - 44px);
    max-height: calc(100vh - 44px);
    overflow: hidden;
    padding: 0;
    background: var(--1s-surface-background);
  }
}

.project-shell {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  overflow: hidden;
  background: var(--1s-surface-background);
  color: var(--1s-text-color);
}

.project-shell,
.project-page,
.project-detail-modal {
  --project-text-primary: var(--1s-text-color);
  --project-text-secondary: var(--1s-text-color-secondary);
  --project-text-tertiary: var(--1s-text-color-tertiary);
}

body.designiy-dark .project-shell,
.designiy.dark .project-shell,
body.designiy-dark .project-page,
.designiy.dark .project-page,
body.designiy-dark .project-detail-modal,
.designiy.dark .project-detail-modal {
  --project-text-primary: #f3f4f6;
  --project-text-secondary: #d4d4d8;
  --project-text-tertiary: #b4b4bb;
}

.project-shell__nav {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 2px;
  height: 36px;
  padding: 3px;
  border-radius: var(--1s-radius-md);
  background: var(--1s-control-surface-muted);
}

.project-shell__nav-item {
  height: 28px;
  min-width: 52px;
  padding: 0 12px;
  border: 0;
  border-radius: var(--1s-radius-sm);
  background: transparent;
  color: var(--project-text-secondary);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.18s ease, background-color 0.18s ease;
}

.project-shell__nav-item:hover {
  background: var(--1s-control-hover-background);
  color: var(--project-text-primary);
}

.project-shell__nav-item.is-active {
  background: var(--1s-surface-background);
  color: var(--project-text-primary);
  font-weight: 700;
}

.project-shell__main {
  width: 100%;
  min-width: 0;
  flex: 1;
  overflow: auto;
  padding: 0;
  background: var(--1s-surface-background);
}

.project-page {
  min-height: 100%;
  background: transparent;
  color: var(--project-text-primary);
}

.project-toolbar {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  min-height: 36px;
  padding: 4px 10px;
  background: var(--1s-surface-background);
}

.project-toolbar__controls {
  margin-left: auto;
}

.project-footer {
  position: sticky;
  bottom: 0;
  z-index: 2;
  padding: 6px 10px;
  background: var(--1s-surface-background);
}

.project-toolbar__summary {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.project-toolbar__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.project-toolbar__group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 0;
  background: transparent;
}

.project-toolbar .el-button {
  height: 26px;
  padding: 0 10px;
  border: 0;
  border-radius: var(--1s-radius-sm);
}

.project-toolbar .el-select__wrapper {
  min-height: 26px;
  border-radius: var(--1s-radius-sm);
}

.project-toolbar__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--project-text-secondary);
}

.project-toolbar__heading {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.project-toolbar__caption {
  font-size: 11px;
  color: var(--project-text-tertiary);
}

.project-card {
  background: transparent;
  border: 0 !important;
  border-radius: 0;
  box-shadow: none;
}

.project-card:hover {
  box-shadow: none;
}

.project-thumb,
.project-preview-surface {
  background: var(--1s-control-surface-muted) !important;
}

.project-loading-overlay {
  background: rgba(243, 246, 249, 0.78);
}

.project-loading-overlay__spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.94);
  color: var(--1s-text-color-secondary);
}

body.designiy-dark .project-loading-overlay,
.designiy.dark .project-loading-overlay {
  background: rgba(0, 0, 0, 0.38);
}

body.designiy-dark .project-loading-overlay__spinner,
.designiy.dark .project-loading-overlay__spinner {
  background: rgba(24, 24, 27, 0.9);
  color: #e5e7eb;
}

.project-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--1s-control-surface-muted);
  color: var(--1s-text-color-secondary);
  border: 0;
  font-size: 9px;
  font-weight: 600;
  white-space: nowrap;
}

.project-tag--accent {
  background: var(--1s-accent-color-soft);
  color: var(--1s-text-color);
}

.project-tag--success {
  background: rgba(34, 197, 94, 0.16);
  color: #22c55e;
}

.project-tag--warning {
  background: rgba(245, 158, 11, 0.16);
  color: #f59e0b;
}

.project-tag--danger {
  background: rgba(248, 113, 113, 0.16);
  color: #f87171;
}

.project-timeago {
  font-size: 0.9rem;
  color: var(--project-text-tertiary);
  font-weight: 600;
  white-space: nowrap;
}

.project-empty-text {
  color: var(--project-text-secondary);
}

.project-muted-text {
  color: var(--project-text-secondary);
}

.project-placeholder-text {
  color: var(--project-text-tertiary);
}

.project-section-title {
  color: var(--project-text-primary);
}

.project-divider {
  opacity: 0;
}

.project-media-frame {
  border-radius: var(--1s-radius-md);
  overflow: hidden;
  background: var(--1s-control-surface-muted);
}

.project-tooltip-panel {
  background: var(--1s-elevated-background);
  color: var(--1s-text-color);
  border: 0;
  box-shadow: none;
}

.project-hover-lift {
  transition: none;
}

.project-hover-lift:hover {
  box-shadow: none;
}

.project-gallery-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  padding: 0;
}

.project-gallery-card__media {
  display: block;
  width: 100%;
  height: auto !important;
  min-height: 150px;
  aspect-ratio: 4 / 3;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: var(--1s-radius-sm);
}

.project-gallery-card__body {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-top: 0;
  min-width: 0;
}

.project-gallery-card__content {
  flex: 1;
  min-width: 0;
}

.project-gallery-card__title {
  color: var(--project-text-primary);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

.project-gallery-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}

.project-action-button {
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: var(--1s-radius-sm);
  color: var(--project-text-secondary);
  transition: all 0.2s ease;
}

.project-action-button:hover {
  background: rgba(148, 163, 184, 0.12);
  color: var(--1s-accent-color);
}

.project-page .text-color-regular,
.project-detail-modal .text-color-regular,
.project-page .text-gray-700,
.project-page .text-gray-600,
.project-page .text-gray-500 {
  color: var(--project-text-secondary) !important;
}

.project-page .text-color-placeholder,
.project-detail-modal .text-color-placeholder,
.project-page .text-gray-400 {
  color: var(--project-text-tertiary) !important;
}

.project-page .text-gray-900,
.project-page .text-gray-800,
.project-detail-modal h1,
.project-detail-modal h2,
.project-detail-modal h3,
.project-detail-modal h4,
.project-detail-modal h5,
.project-detail-modal h6 {
  color: var(--project-text-primary);
}

.project-page .el-empty__description,
.project-page .el-empty__description p,
.project-page .ant-empty-description,
.project-detail-modal .ant-empty-description {
  color: var(--project-text-secondary) !important;
}

.project-shell :is(.el-input__wrapper, .el-select__wrapper, .el-textarea__inner) {
  background: var(--1s-control-surface-background);
  border: 0;
  box-shadow: none;
}

.project-shell :is(.el-input__wrapper, .el-select__wrapper):hover,
.project-shell .el-textarea__inner:hover {
  background: var(--1s-control-surface-muted);
}

.project-shell :is(.el-input__wrapper.is-focus, .el-select__wrapper.is-focused),
.project-shell .el-textarea__inner:focus {
  background: var(--1s-control-surface-background);
  box-shadow: none !important;
}

.project-shell .el-pagination {
  padding: 0;
  background: transparent;
  border: 0;
}

@media (max-width: 720px) {
  .project-shell__nav {
    height: 32px;
    overflow-x: auto;
  }

  .project-toolbar {
    align-items: stretch;
    min-height: 0;
    padding: 4px 10px;
  }

  .project-toolbar__controls {
    width: 100%;
  }
}
</style>
