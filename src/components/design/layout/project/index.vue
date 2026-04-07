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
    <div class="project-shell__sidebar">
      <el-tabs v-model="activeKey" tab-position="left" class="project-shell__tabs">
        <el-tab-pane v-for="(tab, i) in tabs" :label="tab.label" :name="tab.key"></el-tab-pane>
      </el-tabs>
    </div>

    <div class="project-shell__main">
      <component :is="activeComponent"></component>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, toRaw } from "vue";

import { SearchOutlined } from "@ant-design/icons-vue";

import tabSticker from "./sticker/index.vue";
import tabFont from "./font/index.vue";
import tabSentence from './sentence/index.vue'
import { useLocalStorage } from "@vueuse/core";

const searchText = ref("");

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
    component: tabSticker,
  },
  {
    label: "字体",
    key: UserOwnSourceType.FONT,
    component: tabFont,
  },
  {
    label: "句子",
    key: "sentence",
    component: tabSentence,
  },
]);

if (!tabs.value.some((item) => item.key === activeKey.value)) {
  activeKey.value = UserOwnSourceType.STICKER;
}

const activeComponent = computed(() => {
  const currentTab = tabs.value.find((item) => item.key == activeKey.value) || tabs.value[0];
  return toRaw(currentTab.component);
});

</script>
<style lang="less">
.project-shell {
  display: flex;
  height: calc(100vh - 80px);
  margin: 12px;
  overflow: hidden;
  border: 1px solid var(--1s-border-color);
  border-radius: 12px;
  background: var(--1s-panel-background);
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

.project-shell__sidebar {
  width: 120px;
  flex-shrink: 0;
  border-right: 1px solid var(--1s-border-color);
  background: var(--1s-surface-background);
}

.project-shell__tabs {
  height: 100%;
}

.project-shell__main {
  width: 100%;
  min-width: 0;
  height: 100%;
  overflow: auto;
  background: var(--1s-panel-background);
}

.project-page {
  min-height: 100%;
  background: var(--1s-panel-background);
  color: var(--project-text-primary);
}

.project-toolbar,
.project-footer {
  background: var(--1s-surface-background);
  border-color: var(--1s-border-color) !important;
}

.project-card {
  background: var(--1s-control-surface-background);
  border: 1px solid var(--1s-control-border-color) !important;
  box-shadow: var(--1s-shadow-sm);
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.project-card:hover {
  border-color: var(--1s-accent-color-soft) !important;
  background: var(--1s-control-hover-background);
}

.project-thumb,
.project-preview-surface {
  background: var(--1s-control-surface-muted) !important;
}

.project-loading-overlay {
  background: rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(6px);
}

body.designiy-dark .project-loading-overlay,
.designiy.dark .project-loading-overlay {
  background: rgba(0, 0, 0, 0.38);
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
  border: 1px solid var(--1s-control-border-color);
  font-size: 9px;
  font-weight: 600;
  white-space: nowrap;
}

.project-tag--accent {
  background: var(--1s-accent-color-soft);
  color: var(--1s-text-color);
  border-color: transparent;
}

.project-tag--success {
  background: rgba(34, 197, 94, 0.16);
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.28);
}

.project-tag--warning {
  background: rgba(245, 158, 11, 0.16);
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.28);
}

.project-tag--danger {
  background: rgba(248, 113, 113, 0.16);
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.28);
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
  border-color: var(--1s-border-color) !important;
}

.project-media-frame {
  border-radius: 10px;
  overflow: hidden;
  background: var(--1s-control-surface-muted);
  border: 1px solid var(--1s-control-border-color);
}

.project-tooltip-panel {
  background: var(--1s-elevated-background);
  color: var(--1s-text-color);
  border: 1px solid var(--1s-border-color);
  box-shadow: var(--1s-shadow-md);
}

.project-hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.project-hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--1s-shadow-md);
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
</style>

<style lang="less" scoped>
.item {
  background: red;
  width: 100%;
  height: 160px;
  border-radius: 8px;
  background-color: var(--1s-control-surface-muted);

  &:hover {
    box-shadow: var(--1s-shadow-md);
  }
}

:deep(.el-tabs__item) {
  font-weight: 400;
  --el-text-color-primary: var(--1s-text-color-secondary);
}

:deep(.el-tabs__item.is-active) {
  font-weight: 900;
}

:deep(.el-tabs--left .el-tabs__item.is-left) {
  color: var(--1s-text-color-secondary);
}

:deep(.el-tabs--left .el-tabs__item.is-left.is-active) {
  color: var(--1s-text-color);
}

:deep(.el-tabs__active-bar) {
  background: var(--1s-accent-color);
}
</style>
