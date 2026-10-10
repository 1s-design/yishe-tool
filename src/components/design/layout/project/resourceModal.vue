<template>
  <div class="resource-center">
    <aside class="resource-center__sidebar">


      <nav class="resource-center__nav" aria-label="资源类型">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="resource-center__nav-item"
          :class="{ 'resource-center__nav-item--active': activeKey === tab.key }"
          @click="activeKey = tab.key"
        >
          <span class="resource-center__nav-label">{{ tab.label }}</span>
        </button>
      </nav>


    </aside>

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
import {
  ChevronRight,
  FileText,
  FolderOpen,
  Lightbulb,
  MessageSquare,
  Shapes,
  Sparkles,
  Type,
} from "lucide-vue-next";
import tabSticker from "./sticker/index.vue";
import tabCustomSticker from "./customSticker/index.vue";
import tabFont from "./font/index.vue";
import tabSentence from "./sentence/index.vue";
import tabDocument from "./document/index.vue";
import tabTips from "./tips/index.vue";
import tabDesignPrompt from "./designPrompt/index.vue";

type ResourceKey =
  | "sticker"
  | "customSticker"
  | "font"
  | "sentence"
  | "document"
  | "tips"
  | "prompt";

const activeKey = useLocalStorage<ResourceKey>(
  "_1s_projectActiveTab",
  "sticker",
);

const tabs = ref([
  {
    label: "普通贴纸",
    key: "sticker" as ResourceKey,
    icon: markRaw(Shapes),
    component: markRaw(tabSticker),
  },
  {
    label: "自定义贴纸",
    key: "customSticker" as ResourceKey,
    icon: markRaw(Sparkles),
    component: markRaw(tabCustomSticker),
  },
  {
    label: "字体库",
    key: "font" as ResourceKey,
    icon: markRaw(Type),
    component: markRaw(tabFont),
  },
  {
    label: "文案",
    key: "sentence" as ResourceKey,
    icon: markRaw(MessageSquare),
    component: markRaw(tabSentence),
  },
  {
    label: "文档库",
    key: "document" as ResourceKey,
    icon: markRaw(FileText),
    component: markRaw(tabDocument),
  },
  {
    label: "设计技巧",
    key: "tips" as ResourceKey,
    icon: markRaw(Lightbulb),
    component: markRaw(tabTips),
  },
  {
    label: "设计提示词",
    key: "prompt" as ResourceKey,
    icon: markRaw(FolderOpen),
    component: markRaw(tabDesignPrompt),
  },
]);

if (!tabs.value.some((item) => item.key === activeKey.value)) {
  activeKey.value = "sticker";
}

const activeComponent = computed(() => {
  return (
    tabs.value.find((item) => item.key === activeKey.value)?.component ||
    tabs.value[0].component
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
  width: 110px;
  min-width: 110px;
  min-height: 0;
  flex-direction: column;
  padding: 22px 14px 16px;
  border-right: 1px solid var(--1s-border-color);
  background: var(--1s-surface-background);
}

.resource-center__sidebar-header {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0 10px 20px;

  strong {
    color: var(--1s-text-color);
    font-size: 16px;
    font-weight: 650;
    letter-spacing: -0.02em;
  }

  span {
    color: var(--1s-text-color-tertiary);
    font-size: 11px;
    line-height: 1.5;
  }
}

.resource-center__eyebrow {
  color: var(--1s-accent-color);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.resource-center__nav {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.resource-center__nav-item {
  appearance: none;
  display: flex;
  width: 100%;
  min-height: 38px;
  align-items: center;
  gap: 10px;
  padding: 4px 8px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--1s-text-color-secondary);
  cursor: pointer;
  font-size: 10px;
  font-weight: 600;
  text-align: left;
  transition: var(--1s-control-transition);

  &:hover {
    background: var(--1s-state-hover);
    color: var(--1s-text-color);
  }

  &--active {
    background: var(--1s-hover-background);
    color: var(--1s-text-color);
    font-weight: 600;
  }
}

.resource-center__nav-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
}

.resource-center__nav-arrow {
  width: 14px;
  height: 14px;
  margin-left: auto;
  opacity: 0.8;
}

.resource-center__sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 14px 10px 0;
  color: var(--1s-text-color-tertiary);
  font-size: 10px;
  line-height: 1.45;
}

.resource-center__footer-line {
  width: 100%;
  height: 1px;
  background: var(--1s-divider-color);
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

/* 旧资源页的通用内容层 */
.project-page {
  min-height: 100%;
  color: var(--1s-text-color);
  background: var(--1s-panel-background);
}

.project-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  min-height: 58px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 20px;
  border-bottom: 1px solid var(--1s-border-color);
  background: var(--1s-surface-background);
}

.project-toolbar__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.project-toolbar__group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.project-toolbar__label {
  color: var(--1s-text-color-secondary);
  font-size: 11px;
  font-weight: 500;
}

.project-toolbar__caption {
  color: var(--1s-text-color-tertiary);
  font-size: 11px;
  font-weight: 500;
}

.project-footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  padding: 9px 20px;
  border-top: 1px solid var(--1s-border-color);
  background: var(--1s-surface-background);
}

.project-gallery-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 6px;
  border: 1px solid var(--1s-dialog-border);
  border-radius: 10px;
  background: var(--1s-surface-background);
  transition: border-color 0.15s ease, box- 0.15s ease;

  &:hover {
    border-color: color-mix(in srgb, var(--1s-accent-color) 45%, var(--1s-border-color));
    box-: none;
  }

  &__media {
    display: block;
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    border-radius: 7px;
    background: var(--1s-control-surface-muted);
    cursor: pointer;
  }

  &__body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 7px 3px 3px;
  }

  &__content {
    min-width: 0;
    flex: 1;
  }

  &__title {
    overflow: hidden;
    color: var(--1s-text-color);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
  }
}

.project-tag {
  display: inline-flex;
  height: 18px;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border: 1px solid var(--1s-dialog-border);
  border-radius: 5px;
  background: var(--1s-control-surface-muted);
  color: var(--1s-text-color-secondary);
  font-size: 10px;
  font-weight: 600;

  &--accent {
    border-color: transparent;
    background: var(--1s-active-background);
    color: var(--1s-accent-color);
  }
}

.project-timeago {
  margin-left: auto;
  color: var(--1s-text-color-tertiary);
  font-size: 10px;
}

.project-action-button {
  display: flex;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 6px;
  color: var(--1s-text-color-secondary);
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--1s-state-hover);
    color: var(--1s-text-color);
  }
}

@media (max-width: 900px) {
  .resource-center__sidebar {
    width: 184px;
    min-width: 184px;
    padding-left: 10px;
    padding-right: 10px;
  }

  .project-toolbar {
    padding-left: 14px;
    padding-right: 14px;
  }
}

@media (max-width: 680px) {
  .resource-center__sidebar {
    width: 64px;
    min-width: 64px;
    align-items: center;
    padding: 16px 8px;
  }

  .resource-center__sidebar-header,
  .resource-center__sidebar-footer {
    display: none;
  }

  .resource-center__nav-item {
    justify-content: center;
    padding: 4px 8px;

    span,
    .resource-center__nav-arrow {
      display: none;
    }
  }
}
</style>
