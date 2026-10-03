<template>
  <div class="project-shell">
    <div class="project-shell__main">
      <component :is="activeComponent">
        <template #tabs>
          <Tabs v-model="activeKey" class="w-auto">
            <TabsList>
              <TabsTrigger
                v-for="tab in tabs"
                :key="tab.key"
                :value="tab.key"
                @click="activeKey = tab.key"
              >
                {{ tab.label }}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </template>
      </component>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, markRaw } from "vue";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import tabSticker from "./sticker/index.vue";
import tabCustomSticker from "./customSticker/index.vue";
import tabFont from "./font/index.vue";
import tabSentence from "./sentence/index.vue";
import tabDocument from "./document/index.vue";
import tabTips from "./tips/index.vue";
import tabDesignPrompt from "./designPrompt/index.vue";
import { useLocalStorage } from "@vueuse/core";

enum UserOwnSourceType {
  STICKER = "sticker",
  CUSTOM_STICKER = "customSticker",
  FONT = "font",
  SENTENCE = "sentence",
  DOCUMENT = "document",
  TIPS = "tips",
  PROMPT = "prompt",
}

const activeKey = useLocalStorage(
  "_1s_projectActiveTab",
  UserOwnSourceType.STICKER,
);

const tabs = ref([
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
    key: UserOwnSourceType.FONT,
    component: markRaw(tabFont),
  },
  {
    label: "文案",
    key: "sentence",
    component: markRaw(tabSentence),
  },
  {
    label: "文档库",
    key: UserOwnSourceType.DOCUMENT,
    component: markRaw(tabDocument),
  },
  {
    label: "设计技巧",
    key: UserOwnSourceType.TIPS,
    component: markRaw(tabTips),
  },
  {
    label: "设计提示词",
    key: "prompt",
    component: markRaw(tabDesignPrompt),
  },
]);

if (!tabs.value.some((item) => item.key === activeKey.value)) {
  activeKey.value = UserOwnSourceType.STICKER;
}

const activeComponent = computed(() => {
  const currentTab =
    tabs.value.find((item) => item.key == activeKey.value) || tabs.value[0];
  return currentTab.component;
});
</script>

<style lang="less">
.project-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--1s-panel-background);
  color: var(--1s-text-color);

  &__main {
    width: 100%;
    min-width: 0;
    flex: 1;
    overflow: auto;
    background: var(--1s-panel-background);
  }
}

/* 顶部操作与筛选栏 */
.project-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 44px;
  padding: 6px 16px;
  background: var(--1s-surface-background);
  border-bottom: 1px solid var(--1s-border-color);

  &__controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }

  &__group {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  &__label {
    font-size: 11px;
    font-weight: 500;
    color: var(--1s-text-color-secondary);
  }

  &__caption {
    font-size: 11px;
    color: var(--1s-text-color-tertiary);
    font-weight: 500;
  }
}

/* 底部操作栏 */
.project-footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  padding: 8px 16px;
  background: var(--1s-surface-background);
  border-top: 1px solid var(--1s-border-color);
}

/* shadcn-vue 资源卡片网格 */
.project-gallery-card {
  display: flex;
  flex-direction: column;
  background: var(--1s-surface-background);
  border: 1px solid var(--1s-border-color);
  border-radius: var(--1s-radius-md);
  padding: 6px;
  overflow: hidden;
  
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    box-shadow: var(--1s-shadow-md);
    border-color: var(--1s-border-color-strong);
  }

  &__media {
    display: block;
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    border-radius: var(--1s-radius-sm);
    background: var(--1s-panel-background);
    cursor: pointer;
  }

  &__body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 6px 2px 2px 2px;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__title {
    color: var(--1s-text-color);
    font-size: 12px;
    font-weight: 500;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    margin-top: 3px;
  }
}

/* shadcn-vue 微徽标 (Badge) */
.project-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  padding: 0 6px;
  border-radius: var(--1s-radius-xs);
  background: var(--1s-control-surface-muted);
  border: 1px solid var(--1s-border-color);
  color: var(--1s-text-color-secondary);
  font-size: 10px;
  font-weight: 500;

  &--accent {
    background: var(--1s-active-background);
    color: var(--1s-accent-color);
    border-color: transparent;
    font-weight: 600;
  }

  &--success {
    background: rgba(34, 197, 94, 0.1);
    color: #16a34a;
    border-color: rgba(34, 197, 94, 0.2);
  }

  &--danger {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    border-color: rgba(239, 68, 68, 0.2);
  }
}

.project-timeago {
  font-size: 10px;
  color: var(--1s-text-color-tertiary);
  margin-left: auto;
}

.project-action-button {
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: var(--1s-radius-sm);
  color: var(--1s-text-color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--1s-hover-background);
    color: var(--1s-text-color);
  }
}
</style>
