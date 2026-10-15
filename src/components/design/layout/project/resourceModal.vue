<template>
  <div class="resource-center">
    <!-- 左侧分组竖排导航 -->
    <aside class="resource-center__sidebar">
      <div class="resource-center__sidebar-brand">
        <strong class="resource-center__brand-title">创作资源</strong>
      </div>

      <nav class="resource-center__nav" aria-label="资源类型">
        <div
          v-for="group in groups"
          :key="group.name"
          class="resource-center__group"
        >
          <div class="resource-center__group-title">{{ group.name }}</div>
          <div class="resource-center__group-items">
            <button
              v-for="tab in group.items"
              :key="tab.key"
              type="button"
              class="resource-center__nav-item"
              :class="{ 'resource-center__nav-item--active': activeKey === tab.key }"
              @click="activeKey = tab.key"
            >
              <span class="resource-center__nav-label">{{ tab.label }}</span>
            </button>
          </div>
        </div>
      </nav>

      <!-- 底部：提示词托盘状态 -->
      <div v-if="attachmentCount > 0" class="resource-center__sidebar-tray">
        <div class="resource-center__tray-card">
          <span class="font-medium text-xs">已选资源</span>
          <span class="resource-center__tray-badge">{{ attachmentCount }}</span>
        </div>
      </div>
    </aside>

    <!-- 右侧内容展示区 -->
    <section class="resource-center__content">
      <component :is="activeComponent" :key="activeKey">
        <template #tabs>
          <span class="resource-center__hidden-tabs" aria-hidden="true"></span>
        </template>
      </component>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { usePromptAttachments } from "@/composables/usePromptAttachments";
import tabSticker from "./sticker/index.vue";
import tabCustomSticker from "./customSticker/index.vue";
import tabFont from "./font/index.vue";
import tabSentence from "./sentence/index.vue";
import tabDocument from "./document/index.vue";
import tabTips from "./tips/index.vue";
import tabDesignPrompt from "./designPrompt/index.vue";
import tabDesignInspiration from "./designInspiration/index.vue";

type ResourceKey =
  | "sticker"
  | "customSticker"
  | "font"
  | "sentence"
  | "document"
  | "tips"
  | "prompt"
  | "designInspiration";

const { count: attachmentCount } = usePromptAttachments();

const activeKey = useLocalStorage<ResourceKey>(
  "_1s_projectActiveTab",
  "sticker",
);

interface TabItem {
  label: string;
  key: ResourceKey;
  component: any;
}

interface TabGroup {
  name: string;
  items: TabItem[];
}

const groups = ref<TabGroup[]>([
  {
    name: "素材",
    items: [
      {
        label: "普通贴纸",
        key: "sticker",
        component: markRaw(tabSticker),
      },
      {
        label: "自定义贴纸",
        key: "customSticker",
        component: markRaw(tabCustomSticker),
      },
      {
        label: "字体库",
        key: "font",
        component: markRaw(tabFont),
      },
    ],
  },
  {
    name: "内容",
    items: [
      {
        label: "文案",
        key: "sentence",
        component: markRaw(tabSentence),
      },
      {
        label: "文档库",
        key: "document",
        component: markRaw(tabDocument),
      },
      {
        label: "设计灵感",
        key: "designInspiration",
        component: markRaw(tabDesignInspiration),
      },
    ],
  },
  {
    name: "知识",
    items: [
      {
        label: "设计技巧",
        key: "tips",
        component: markRaw(tabTips),
      },
      {
        label: "设计提示词",
        key: "prompt",
        component: markRaw(tabDesignPrompt),
      },
    ],
  },
]);

const allTabs = computed(() => {
  return groups.value.flatMap((g) => g.items);
});

const activeComponent = computed(() => {
  return (
    allTabs.value.find((item) => item.key === activeKey.value)?.component ||
    allTabs.value[0].component
  );
});
</script>

<style lang="less">
.resource-center {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--1s-panel-background);
  color: var(--1s-text-color);
}

.resource-center__sidebar {
  display: flex;
  width: 156px;
  min-width: 156px;
  min-height: 0;
  flex-direction: column;
  padding: 14px 10px 12px;
  border-right: 1px solid var(--1s-border-color);
  background: var(--1s-surface-background);
  user-select: none;
}

.resource-center__sidebar-brand {
  padding: 2px 8px 12px;
  border-bottom: 1px solid var(--1s-border-color);
  margin-bottom: 8px;
}

.resource-center__brand-title {
  color: var(--1s-text-color);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.resource-center__nav {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.resource-center__group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.resource-center__group-title {
  font-size: 11px;
  font-weight: 500;
  color: var(--1s-text-color-tertiary);
  padding: 2px 8px;
}

.resource-center__group-items {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.resource-center__nav-item {
  appearance: none;
  display: flex;
  width: 100%;
  height: 30px;
  align-items: center;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
  color: var(--1s-text-color-secondary);
  cursor: pointer;
  font-size: 12px;
  font-weight: 450;
  text-align: left;
  transition: all 0.12s ease;

  &:hover {
    background: var(--1s-hover-background);
    color: var(--1s-text-color);
  }

  &--active {
    background: color-mix(in srgb, var(--1s-accent-color) 10%, var(--1s-hover-background));
    color: var(--1s-accent-color);
    font-weight: 600;
  }
}

.resource-center__nav-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-center__sidebar-tray {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid var(--1s-border-color);
}

.resource-center__tray-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border-radius: 5px;
  background: var(--1s-hover-background);
  color: var(--1s-text-color-secondary);
}

.resource-center__tray-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--1s-accent-color);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
}

.resource-center__content {
  min-width: 0;
  min-height: 0;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  background: var(--1s-panel-background);
}

.resource-center__hidden-tabs {
  display: none;
}
</style>
