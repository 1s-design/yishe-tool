<template>
  <div class="html-code-editor" :class="{ 'html-code-editor--compact': compact }">
    <div class="html-code-editor__main">
      <div class="html-code-editor__toolbar">
        <span class="html-code-editor__meta">{{ draftSummary }}</span>
        <span v-if="isDirty" class="html-code-editor__dirty">未保存</span>
      </div>

      <div v-if="editorError" class="html-code-editor__error">
        <span>{{ editorError }}</span>
        <Button size="sm" variant="link" @click="retryLoadEditor">重新加载</Button>
      </div>

      <div v-loading="loadingEditor" class="html-code-editor__editor-shell">
        <div v-show="!editorError" ref="containerRef" class="html-code-editor__editor"></div>
      </div>
    </div>

    <!-- 全屏模式：右侧常驻变量速查 -->
    <div v-if="!compact" class="html-code-editor__sidebar">
      <div class="html-code-editor__sidebar-header">
        <h3>模板变量速查</h3>
      </div>
      <htmlVariableReference
        :content="draftValue"
        :target="htmlLayerChild"
        @insert="insertToken"
        @configure="configureComponent"
      />
    </div>

    <!-- 小面板模式：底部折叠变量速查 -->
    <div v-else class="html-code-editor__reference">
      <button
        type="button"
        class="html-code-editor__reference-toggle"
        @click="showReference = !showReference"
      >
        <ChevronRight class="html-code-editor__reference-arrow" :class="{ 'is-open': showReference }" />
        <span>变量速查</span>
        <span class="html-code-editor__reference-count">{{ templateFieldCount }}</span>
      </button>
      <div v-show="showReference" class="html-code-editor__reference-body">
        <htmlVariableReference
          :content="draftValue"
          :target="htmlLayerChild"
          @insert="insertToken"
          @configure="configureComponent"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { ChevronRight } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import type { CompletionContext } from "@codemirror/autocomplete";
import htmlVariableReference from "./htmlVariableReference.vue";
import { useHtmlCodeMirror } from "./htmlCodeMirror.ts";
import { buildTemplateVariableItems, systemGroupedVariables } from "./htmlVariableTokens.ts";
import {
  detachHtmlTemplateFromTarget,
  hasHtmlMagicVariables,
  syncHtmlTemplateFieldsFromContent,
} from "@/components/design/layout/canvas/htmlTemplate/runtime.ts";
import {
  htmlLayerChild,
  currentOperatingCanvasChildId,
  autoCreateAndBindNewFields,
  cleanUpUnusedBindings,
} from "../index.tsx";

const props = defineProps<{
  /** 右侧小面板紧凑模式：变量速查收进底部折叠区 */
  compact?: boolean;
}>();

const showReference = ref(false);

/** 代码画布只维护一份 HTML 源码，这里直接绑定固定的 html 图层 */
const htmlContent = computed({
  get: () => String(htmlLayerChild.value?.htmlContent ?? ""),
  set: (value: string) => {
    if (htmlLayerChild.value) {
      htmlLayerChild.value.htmlContent = value;
    }
  },
});

const draftValue = ref(String(htmlContent.value ?? ""));
let lastModelValue = draftValue.value;

const isDirty = computed(() => draftValue.value !== String(htmlContent.value ?? ""));

const draftSummary = computed(() => {
  const value = String(draftValue.value ?? "");
  return `${value.split(/\r?\n/).length} 行 · ${value.length} 字符`;
});

const templateFieldCount = computed(() => buildTemplateVariableItems(draftValue.value, htmlLayerChild.value).length);

const loadingEditor = ref(false);
const editorError = ref("");
let initGeneration = 0;

function buildCompletions(cx: CompletionContext) {
  const flatSystem = systemGroupedVariables.flatMap((g) => g.tokens);
  const flatTemplate = buildTemplateVariableItems(draftValue.value, htmlLayerChild.value).flatMap((f) => f.tokens);
  const allVariables = [...flatSystem, ...flatTemplate];

  const word = cx.matchBefore(/\{\{[\w.]*$/);
  if (!word || word.from === word.to) return null;

  return {
    from: word.from,
    options: allVariables.map((v) => ({
      label: v.token,
      type: "variable",
      detail: v.description,
    })),
  };
}

const { containerRef, editor, mount, destroy, sync, refresh, insertToken } = useHtmlCodeMirror({
  getValue: () => draftValue.value,
  onChange: (value) => {
    draftValue.value = value;
  },
  buildCompletions,
});

/** 懒初始化：容器可见（面板/弹窗打开）后再挂载编辑器 */
async function ensureEditor() {
  if (editor.value) {
    refresh();
    return;
  }

  const generation = ++initGeneration;
  loadingEditor.value = true;
  editorError.value = "";

  try {
    await nextTick();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (generation !== initGeneration) return;
    if (!containerRef.value) throw new Error("Editor container not available");
    mount();
  } catch (error) {
    console.error("[htmlCodeEditor] failed to initialize CodeMirror 6", error);
    if (generation === initGeneration) {
      editorError.value = `编辑器加载失败：${error instanceof Error ? error.message : "请稍后重试。"}`;
    }
  } finally {
    if (generation === initGeneration) {
      loadingEditor.value = false;
    }
  }
}

function retryLoadEditor() {
  destroy();
  ensureEditor();
}

/** 提交草稿到 html 图层，并同步模板变量绑定 */
function save() {
  const target = htmlLayerChild.value;
  const nextValue = String(draftValue.value ?? "");
  const previousValue = String(htmlContent.value ?? "");

  htmlContent.value = nextValue;
  lastModelValue = nextValue;

  if (target && nextValue !== previousValue) {
    const preserveBindings = hasHtmlMagicVariables(nextValue);
    if (preserveBindings) {
      const inferredFields = syncHtmlTemplateFieldsFromContent(target, nextValue);
      autoCreateAndBindNewFields(inferredFields, target);
      cleanUpUnusedBindings(inferredFields, target);
      detachHtmlTemplateFromTarget(target, {
        preserveBindings: inferredFields.length > 0,
      });
    } else {
      detachHtmlTemplateFromTarget(target);
    }
  }

  return nextValue !== previousValue;
}

/** 放弃草稿，回到已保存内容 */
function reset() {
  draftValue.value = String(htmlContent.value ?? "");
  lastModelValue = draftValue.value;
  sync(draftValue.value);
}

function configureComponent(id: string) {
  save();
  nextTick(() => {
    currentOperatingCanvasChildId.value = id;
  });
}

watch(htmlContent, (value) => {
  const next = String(value ?? "");
  // 本地没有未保存修改时，跟随外部变更（AI 操作 / 清空画布等）
  if (draftValue.value === lastModelValue) {
    draftValue.value = next;
    sync(next);
  }
  lastModelValue = next;
});

onBeforeUnmount(() => {
  initGeneration += 1;
  destroy();
});

defineExpose({
  ensureEditor,
  save,
  reset,
  isDirty,
});
</script>

<style scoped lang="less">
.html-code-editor {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
  gap: 16px;
  overflow: hidden;
}

.html-code-editor__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  overflow: hidden;
}

.html-code-editor__toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 4px 10px;
  border: 1px solid var(--1s-border-color, #e4e4e7);
  border-radius: 6px;
  background: var(--1s-elevated-background, #f4f4f5);
  flex-shrink: 0;
}

.html-code-editor__meta {
  font-size: 11px;
  font-family: monospace;
  color: var(--1s-text-color-secondary, #71717a);
}

.html-code-editor__dirty {
  font-size: 10px;
  font-weight: 600;
  color: var(--1s-warning-text, #f59e0b);
}

.html-code-editor__error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #f87171;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 12px;
  flex-shrink: 0;
}

.html-code-editor__editor-shell {
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  padding: 2px;
  border: 1px solid var(--1s-border-color, #e4e4e7);
  border-radius: 8px;
  overflow: hidden;
  background: #282c34;
}

.html-code-editor__editor {
  width: 100%;
  height: 100%;
  min-height: 0;
  border-radius: 6px;
  overflow: hidden;
  background: #282c34;
}

/* ---- 全屏：右侧变量速查 ---- */
.html-code-editor__sidebar {
  width: 340px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--1s-panel-background, #fafafa);
  border: 1px solid var(--1s-border-color, #e4e4e7);
  border-radius: 8px;
  overflow: hidden;
}

.html-code-editor__sidebar-header {
  flex-shrink: 0;
  padding: 10px 14px;
  background: var(--1s-elevated-background, #f4f4f5);
  border-bottom: 1px solid var(--1s-border-color, #e4e4e7);

  h3 {
    margin: 0;
    font-size: 12px;
    font-weight: 700;
    color: var(--1s-text-color, #09090b);
    letter-spacing: 0.02em;
  }
}

/* ---- 小面板：紧凑布局 ---- */
.html-code-editor--compact {
  flex-direction: column;
  gap: 8px;
}

.html-code-editor--compact .html-code-editor__main {
  gap: 8px;
}

.html-code-editor--compact .html-code-editor__toolbar {
  padding: 2px 8px;
}

.html-code-editor__reference {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-top: 1px solid var(--1s-divider-color);
}

.html-code-editor__reference-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  height: 28px;
  padding: 0 2px;
  border: 0;
  background: transparent;
  color: var(--1s-text-color-secondary);
  font-size: var(--1s-control-font, 11px);
  font-weight: 600;
  cursor: pointer;
  user-select: none;

  &:hover {
    color: var(--1s-text-color);
  }
}

.html-code-editor__reference-arrow {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  transition: transform var(--1s-transition-fast, 0.15s ease);

  &.is-open {
    transform: rotate(90deg);
  }
}

.html-code-editor__reference-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 14px;
  padding: 0 4px;
  border-radius: 9999px;
  border: 1px solid var(--1s-border-color);
  background: var(--1s-elevated-background);
  font-size: 10px;
  font-weight: 700;
  color: var(--1s-text-color-secondary);
}

.html-code-editor__reference-body {
  height: 220px;
  max-height: 40vh;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  border: 1px solid var(--1s-border-color);
  border-radius: 6px;
  background: var(--1s-panel-background);
  margin-bottom: 2px;
}

:deep(.html-code-editor__editor .cm-editor) {
  height: 100% !important;
  min-height: 0;
  font-size: 13px;
  line-height: 1.6;
  font-family:
    "SFMono-Regular",
    "JetBrains Mono",
    "Fira Code",
    Consolas,
    "Liberation Mono",
    Menlo,
    monospace;
}

:deep(.html-code-editor__editor .cm-scroller) {
  height: 100% !important;
  min-height: 0;
  overflow-y: auto !important;
}

:deep(.html-code-editor__editor .cm-content) {
  padding: 8px 0;
}

.html-code-editor--compact :deep(.html-code-editor__editor .cm-editor) {
  font-size: 12px;
}

@media (max-width: 768px) {
  .html-code-editor__sidebar {
    display: none;
  }
}
</style>
