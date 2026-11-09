<template>
  <div class="code-canvas-panel">
    <header class="code-canvas-panel__header">
      <div class="code-canvas-panel__title">
        <Code class="code-canvas-panel__title-icon" />
        <strong>代码画布</strong>
        <span v-if="isDirty" class="code-canvas-panel__dirty" title="存在未保存的修改">未保存</span>
      </div>
      <div class="code-canvas-panel__actions">
        <Button size="sm" variant="outline" class="code-canvas-panel__btn" @click="openFullscreen">全屏</Button>
        <Button size="sm" variant="outline" class="code-canvas-panel__btn" @click="handleCancel">取消</Button>
        <Button size="sm" class="code-canvas-panel__btn" @click="handleSave">保存</Button>
      </div>
    </header>

    <div class="code-canvas-panel__body">
      <htmlCodeEditorBody ref="bodyRef" compact />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { Code } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { message } from "@/common/message";
import htmlCodeEditorBody from "./htmlCodeEditorBody.vue";
import { showCodeCanvasFullscreen } from "@/components/design/layout/rightDock.ts";

const props = defineProps<{
  /** 当前是否处于代码画布分页 */
  active: boolean;
}>();

const bodyRef = ref<any>(null);
const isDirty = computed(() => Boolean(bodyRef.value?.isDirty));

watch(
  () => props.active,
  async (active) => {
    if (!active) return;
    await nextTick();
    bodyRef.value?.ensureEditor();
  },
  { immediate: true }
);

function handleSave() {
  const changed = bodyRef.value?.save();
  if (changed) message.success("代码画布已保存");
}

function handleCancel() {
  bodyRef.value?.reset();
}

function openFullscreen() {
  // 先提交当前草稿，全屏编辑器打开时读到的是最新内容
  bodyRef.value?.save();
  showCodeCanvasFullscreen.value = true;
}
</script>

<style scoped lang="less">
.code-canvas-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--1s-surface-background);
}

.code-canvas-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 40px;
  min-height: 40px;
  padding: 0 8px 0 12px;
  border-bottom: 1px solid var(--1s-divider-color);
  flex-shrink: 0;
}

.code-canvas-panel__title {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;

  strong {
    font-size: var(--1s-control-font-md, 12px);
    font-weight: 600;
    color: var(--1s-text-color);
    white-space: nowrap;
  }
}

.code-canvas-panel__title-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  color: var(--1s-text-color-secondary);
}

.code-canvas-panel__dirty {
  flex-shrink: 0;
  padding: 0 4px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--1s-warning-text, #f59e0b) 14%, transparent);
  color: var(--1s-warning-text, #f59e0b);
  font-size: 10px;
  font-weight: 600;
}

.code-canvas-panel__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.code-canvas-panel__btn {
  height: 24px;
  padding: 0 8px;
  font-size: var(--1s-control-font, 11px);
  border-radius: 0;
}

.code-canvas-panel__body {
  flex: 1;
  min-height: 0;
  display: flex;
  padding: 8px;
  box-sizing: border-box;
  overflow: hidden;
}
</style>
