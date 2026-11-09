<template>
  <Dialog v-model:open="visible">
    <DialogContent
      class="html-editor-dialog max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 rounded-none gap-0 overflow-hidden flex flex-col"
      @interact-outside="e => e.preventDefault()"
      @pointer-down-outside="e => e.preventDefault()"
    >
      <DialogHeader class="html-editor-dialog__header px-6 pt-6 pb-2 shrink-0">
        <DialogTitle>编辑代码画布</DialogTitle>
      </DialogHeader>

      <div class="html-editor-dialog__layout html-editor-dialog__body">
        <htmlCodeEditorBody ref="bodyRef" />
      </div>

      <div class="html-editor-dialog__footer">
        <div class="html-editor-dialog__footer-tip">
          当前元素只维护一份 HTML 源码；模板库和变量绑定最终都会编译到这里。
        </div>
        <div class="html-editor-dialog__footer-actions">
          <Button variant="outline" @click="handleCancel">取消</Button>
          <Button @click="handleSave">保存</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import htmlCodeEditorBody from "./htmlCodeEditorBody.vue";
import { showCodeCanvasFullscreen } from "@/components/design/layout/rightDock.ts";

const visible = computed({
  get: () => showCodeCanvasFullscreen.value,
  set: (open: boolean) => {
    showCodeCanvasFullscreen.value = open;
  },
});

const bodyRef = ref<any>(null);

watch(visible, async (open) => {
  if (!open) return;
  await nextTick();
  // DialogContent 挂载后再拿子组件实例，避免首帧 ref 为空
  await new Promise((resolve) => requestAnimationFrame(resolve));
  bodyRef.value?.ensureEditor();
});

function handleSave() {
  bodyRef.value?.save();
  visible.value = false;
}

function handleCancel() {
  bodyRef.value?.reset();
  visible.value = false;
}
</script>

<style scoped lang="less">
.html-editor-dialog__layout {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 16px;
  height: 100%;
}

.html-editor-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.html-editor-dialog__footer-tip {
  font-size: 11px;
  color: var(--1s-text-color-secondary, #71717a);
}

.html-editor-dialog__footer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Fullscreen Dialog Theme Injections */
:deep(.html-editor-dialog) {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--1s-shell-background, #f4f4f5);
}

:deep(.html-editor-dialog .html-editor-dialog__header) {
  flex-shrink: 0;
  margin: 0;
  padding: 12px 20px;
  border-bottom: 1px solid var(--1s-border-color, #e4e4e7);
  background: var(--1s-surface-background, #ffffff);
}

:deep(.html-editor-dialog .html-editor-dialog__body) {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  padding: 12px 20px;
  height: calc(100vh - 100px);
}

:deep(.html-editor-dialog .html-editor-dialog__footer) {
  position: sticky;
  bottom: 0;
  z-index: 2;
  flex-shrink: 0;
  border-top: 1px solid var(--1s-border-color, #e4e4e7);
  background: var(--1s-surface-background, #ffffff);
  padding: 8px 20px 12px;
}

:global(html.dark) .html-editor-dialog,
:global(.dark) .html-editor-dialog {
  background: var(--1s-shell-background) !important;
}

:global(html.dark) .html-editor-dialog .html-editor-dialog__header,
:global(.dark) .html-editor-dialog .html-editor-dialog__header,
:global(html.dark) .html-editor-dialog .html-editor-dialog__footer,
:global(.dark) .html-editor-dialog .html-editor-dialog__footer {
  background: var(--1s-surface-background) !important;
  border-color: var(--1s-border-color) !important;
}
</style>
