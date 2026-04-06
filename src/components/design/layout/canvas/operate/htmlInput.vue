<template>
  <operate-form-item style="align-items: start">
    <template #icon>
      <icon></icon>
    </template>
    <template #name> {{ label }} </template>
    <template #content>
      <div class="html-editor-trigger">
        <div class="html-editor-trigger__actions">
          <el-button size="small" type="primary" plain @click="openEditor">全屏编辑</el-button>
          <el-button size="small" @click="clearContent" :disabled="!model">清空</el-button>
        </div>
      </div>
    </template>
  </operate-form-item>

  <el-dialog
    v-model="dialogVisible"
    title="编辑 HTML 代码"
    fullscreen
    append-to-body
    class="html-editor-dialog"
    :close-on-click-modal="false"
    @open="handleDialogOpen"
  >
    <div class="html-editor-dialog__layout">
      <div class="html-editor-dialog__toolbar">
        <div class="html-editor-dialog__hint">
          支持直接输入 HTML，也可以在代码里内联 <code>&lt;style&gt;</code>，并使用
          <code v-pre>{{text.title}}</code> 这类魔术变量。
        </div>
        <div class="html-editor-dialog__meta">{{ draftSummary }}</div>
      </div>

      <div class="html-editor-dialog__variables">
        <div class="html-editor-dialog__variables-header">
          <div class="html-editor-dialog__variables-title">可用魔术变量</div>
          <div class="html-editor-dialog__variables-tip">
            系统变量始终可用；模板变量会随当前模板变化。
          </div>
        </div>

        <div class="html-editor-dialog__variable-section">
          <div class="html-editor-dialog__variable-section-name">系统变量</div>
          <div class="html-editor-dialog__variable-list">
            <div
              v-for="item in systemMagicVariableItems"
              :key="item.token"
              class="html-editor-dialog__variable-item"
            >
              <code>{{ item.token }}</code>
              <span>{{ item.description }}</span>
            </div>
          </div>
        </div>

        <div class="html-editor-dialog__variable-section">
          <div class="html-editor-dialog__variable-section-name">
            当前模板变量
            <span v-if="templateMagicVariableItems.length">
              · {{ templateMagicVariableItems.length }} 项
            </span>
          </div>
          <div v-if="templateMagicVariableItems.length" class="html-editor-dialog__variable-list">
            <div
              v-for="item in templateMagicVariableItems"
              :key="item.token"
              class="html-editor-dialog__variable-item"
            >
              <code>{{ item.token }}</code>
              <span>{{ item.description }}</span>
            </div>
          </div>
          <div v-else class="html-editor-dialog__variable-empty">
            当前没有模板变量。你可以直接写纯 HTML / CSS，或先从模板库选择带变量的模板。
          </div>
        </div>
      </div>

      <div v-if="editorError" class="html-editor-dialog__error">
        <span>{{ editorError }}</span>
        <el-button size="small" type="primary" link @click="retryLoadEditor">重新加载</el-button>
      </div>

      <div v-loading="loadingEditor" class="html-editor-dialog__editor-shell">
        <div v-show="!editorError" ref="editorContainerRef" class="html-editor-dialog__editor"></div>
      </div>
    </div>

    <template #footer>
      <div class="html-editor-dialog__footer">
        <div class="html-editor-dialog__footer-tip">
          当前元素只维护一份 HTML 源码；模板库和变量绑定最终都会编译到这里并同步预览。
        </div>
        <div class="html-editor-dialog__footer-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/text-content.svg?component";
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from "vue";
import {
  detachHtmlTemplateFromTarget,
  hasHtmlMagicVariables,
  syncHtmlTemplateFieldsFromContent,
} from "@/components/design/layout/canvas/htmlTemplate/runtime.ts";
import type { HtmlTemplateFieldDefinition } from "@/components/design/layout/canvas/htmlTemplate/types";

declare global {
  interface Window {
    CodeMirror?: any;
  }
}

const CODEMIRROR_STYLE_ASSETS = ["/lib/codemirror/lib/codemirror.min.css"];
const CODEMIRROR_SCRIPT_ASSETS = [
  "/lib/codemirror/lib/codemirror.min.js",
  "/lib/codemirror/mode/xml/xml.min.js",
  "/lib/codemirror/mode/javascript/javascript.min.js",
  "/lib/codemirror/mode/css/css.min.js",
  "/lib/codemirror/mode/htmlmixed/htmlmixed.min.js",
  "/lib/codemirror/addon/edit/closetag.min.js",
  "/lib/codemirror/addon/edit/closebrackets.min.js",
];

let codeMirrorAssetsPromise: Promise<void> | null = null;

function loadStyleAsset(url: string) {
  if (document.querySelector(`link[data-html-editor-asset="${url}"]`)) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = url;
    style.dataset.htmlEditorAsset = url;
    style.addEventListener("load", () => resolve(), { once: true });
    style.addEventListener("error", () => reject(new Error(`Failed to load asset: ${url}`)), {
      once: true,
    });
    document.head.appendChild(style);
  });
}

function loadScriptAsset(url: string) {
  const existingScript = document.querySelector(
    `script[data-html-editor-asset="${url}"]`
  ) as HTMLScriptElement | null;

  if (existingScript?.dataset.loaded === "true") {
    return Promise.resolve();
  }

  if (existingScript) {
    return new Promise<void>((resolve, reject) => {
      const handleLoad = () => {
        cleanup();
        resolve();
      };
      const handleError = () => {
        cleanup();
        reject(new Error(`Failed to load asset: ${url}`));
      };
      const cleanup = () => {
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };

      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = false;
    script.dataset.htmlEditorAsset = url;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true }
    );
    script.addEventListener("error", () => reject(new Error(`Failed to load asset: ${url}`)), {
      once: true,
    });
    document.body.appendChild(script);
  });
}

async function ensureCodeMirrorAssets() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.CodeMirror) {
    return;
  }

  if (!codeMirrorAssetsPromise) {
    codeMirrorAssetsPromise = (async () => {
      await Promise.all(CODEMIRROR_STYLE_ASSETS.map((asset) => loadStyleAsset(asset)));
      for (const asset of CODEMIRROR_SCRIPT_ASSETS) {
        await loadScriptAsset(asset);
      }

      if (!window.CodeMirror) {
        throw new Error("CodeMirror is unavailable after loading local assets.");
      }
    })().catch((error) => {
      codeMirrorAssetsPromise = null;
      throw error;
    });
  }

  return codeMirrorAssetsPromise;
}

const model = defineModel<string>({ default: "" });

const props = defineProps({
  label: {
    default: "html代码",
  },
  placeholder: {
    default: "请输入",
  },
  templateTarget: {
    type: Object,
    default: null,
  },
});

const dialogVisible = ref(false);
const loadingEditor = ref(false);
const editorError = ref("");
const draftValue = ref("");
const editorContainerRef = ref<HTMLElement | null>(null);
const editorInstance = shallowRef<any>(null);

const draftSummary = computed(() => {
  const value = String(draftValue.value ?? "");
  return `${value.split(/\r?\n/).length} 行 · ${value.length} 字符`;
});

const systemMagicVariableItems = [
  { token: "{{canvas.width}}", description: "画布宽度数值" },
  { token: "{{canvas.height}}", description: "画布高度数值" },
  { token: "{{canvas.widthUnit}}", description: "画布宽度单位" },
  { token: "{{canvas.heightUnit}}", description: "画布高度单位" },
  { token: "{{canvas.widthCss}}", description: "画布宽度 CSS 值" },
  { token: "{{canvas.heightCss}}", description: "画布高度 CSS 值" },
  { token: "{{element.id}}", description: "当前元素 id" },
  { token: "{{element.zIndex}}", description: "当前元素层级" },
];

const templateMagicVariableItems = computed(() => {
  const fields = Array.isArray(props.templateTarget?.htmlTemplateFields)
    ? (props.templateTarget?.htmlTemplateFields as HtmlTemplateFieldDefinition[])
    : [];

  return fields.flatMap((field) => createMagicVariableItemsForField(field));
});

function createMagicVariableItemsForField(field: HtmlTemplateFieldDefinition) {
  switch (field.type) {
    case "color":
      return [
        {
          token: `{{${field.key}}}`,
          description: `${field.label}，直接输出颜色值`,
        },
        {
          token: `{{${field.key}.css}}`,
          description: `${field.label}，颜色 CSS 别名`,
        },
      ];
    case "image":
      return [
        {
          token: `{{${field.key}.url}}`,
          description: `${field.label}，图片地址`,
        },
        {
          token: `{{${field.key}.src}}`,
          description: `${field.label}，图片地址别名`,
        },
        {
          token: `{{${field.key}.name}}`,
          description: `${field.label}，图片名称`,
        },
      ];
    case "font":
      return [
        {
          token: `{{${field.key}.family}}`,
          description: `${field.label}，渲染后的字体 family`,
        },
        {
          token: `{{${field.key}.name}}`,
          description: `${field.label}，字体名称`,
        },
      ];
    case "number":
      return [
        {
          token: `{{${field.key}}}`,
          description: `${field.label}，数值变量`,
        },
      ];
    case "textarea":
    case "text":
    default:
      return [
        {
          token: `{{${field.key}}}`,
          description: `${field.label}，文本变量`,
        },
      ];
  }
}

function refreshEditor() {
  nextTick(() => {
    if (!editorInstance.value) {
      return;
    }

    editorInstance.value.setSize?.("100%", "100%");
    editorInstance.value.refresh?.();
    editorInstance.value.focus?.();
  });
}

function syncEditorValue(value: string) {
  if (!editorInstance.value) {
    return;
  }

  if (editorInstance.value.getValue?.() === value) {
    refreshEditor();
    return;
  }

  editorInstance.value.setValue?.(value);
  refreshEditor();
}

function mountEditor() {
  if (!editorContainerRef.value || !window.CodeMirror) {
    return;
  }

  if (!editorInstance.value) {
    editorContainerRef.value.innerHTML = "";
    editorInstance.value = window.CodeMirror(editorContainerRef.value, {
      value: draftValue.value,
      mode: "htmlmixed",
      lineNumbers: true,
      lineWrapping: true,
      tabSize: 2,
      indentUnit: 2,
      autoCloseTags: true,
      autoCloseBrackets: true,
    });

    editorInstance.value.on?.("change", (instance: any) => {
      const nextValue = instance.getValue?.() ?? "";
      if (nextValue !== draftValue.value) {
        draftValue.value = nextValue;
      }
    });
  } else {
    syncEditorValue(draftValue.value);
  }

  refreshEditor();
}

function openEditor() {
  draftValue.value = String(model.value ?? "");
  editorError.value = "";
  dialogVisible.value = true;
}

async function initializeEditor() {
  loadingEditor.value = true;
  editorError.value = "";

  try {
    await ensureCodeMirrorAssets();
    await nextTick();
    mountEditor();
  } catch (error) {
    console.error("[htmlInput] failed to initialize CodeMirror", error);
    editorError.value = "编辑器加载失败，请稍后重试。";
  } finally {
    loadingEditor.value = false;
  }
}

function handleDialogOpen() {
  initializeEditor();
}

function retryLoadEditor() {
  initializeEditor();
}

function handleCancel() {
  draftValue.value = String(model.value ?? "");
  syncEditorValue(draftValue.value);
  dialogVisible.value = false;
}

function handleSave() {
  const nextValue = String(draftValue.value ?? "");
  const previousValue = String(model.value ?? "");
  const hasChanged = nextValue !== previousValue;

  model.value = nextValue;

  if (hasChanged && props.templateTarget) {
    const preserveBindings = hasHtmlMagicVariables(nextValue);
    if (preserveBindings) {
      const inferredFields = syncHtmlTemplateFieldsFromContent(props.templateTarget, nextValue);
      detachHtmlTemplateFromTarget(props.templateTarget, {
        preserveBindings: inferredFields.length > 0,
      });
    } else {
      detachHtmlTemplateFromTarget(props.templateTarget);
    }
  }

  dialogVisible.value = false;
}

function clearContent() {
  model.value = "";
  draftValue.value = "";
  syncEditorValue("");

  if (props.templateTarget) {
    detachHtmlTemplateFromTarget(props.templateTarget);
  }
}

watch(dialogVisible, (visible) => {
  if (visible) {
    refreshEditor();
  }
});

watch(
  () => model.value,
  (value) => {
    if (!dialogVisible.value) {
      draftValue.value = String(value ?? "");
    }
  }
);

onBeforeUnmount(() => {
  if (editorContainerRef.value) {
    editorContainerRef.value.innerHTML = "";
  }

  editorInstance.value = null;
});
</script>

<style scoped lang="less">
.html-editor-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.html-editor-trigger__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.html-editor-dialog__layout {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.html-editor-dialog__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.html-editor-dialog__hint {
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.html-editor-dialog__hint code {
  padding: 2px 6px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  color: var(--el-color-primary);
}

.html-editor-dialog__meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.html-editor-dialog__variables {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.html-editor-dialog__variables-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.html-editor-dialog__variables-title {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

.html-editor-dialog__variables-tip {
  font-size: 11px;
  color: #64748b;
}

.html-editor-dialog__variable-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.html-editor-dialog__variable-section-name {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.html-editor-dialog__variable-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 8px;
  max-height: 160px;
  overflow: auto;
  padding-right: 4px;
}

.html-editor-dialog__variable-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.86);
  background: #f8fafc;
}

.html-editor-dialog__variable-item code {
  width: fit-content;
  padding: 4px 8px;
  border-radius: 8px;
  background: #ffffff;
  color: var(--el-color-primary);
  font-size: 12px;
}

.html-editor-dialog__variable-item span {
  font-size: 11px;
  line-height: 1.55;
  color: #64748b;
}

.html-editor-dialog__variable-empty {
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8fafc;
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
}

.html-editor-dialog__error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--el-color-danger-light-5);
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
  font-size: 13px;
  box-shadow: 0 10px 24px rgba(252, 165, 165, 0.14);
}

.html-editor-dialog__editor-shell {
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
  padding: 12px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    0 18px 40px rgba(15, 23, 42, 0.08);
}

.html-editor-dialog__editor {
  width: 100%;
  height: 100%;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 14px;
  overflow: hidden;
  background: #ffffff;
}

.html-editor-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.html-editor-dialog__footer-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.html-editor-dialog__footer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.html-editor-dialog.el-dialog.is-fullscreen) {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #eff4fa 100%);
}

:deep(.html-editor-dialog .el-dialog__header) {
  flex-shrink: 0;
  margin: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(10px);
}

:deep(.html-editor-dialog .el-dialog__body) {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  padding: 16px 20px;
}

:deep(.html-editor-dialog .el-dialog__footer) {
  position: sticky;
  bottom: 0;
  z-index: 2;
  flex-shrink: 0;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
  box-shadow: 0 -12px 30px rgba(15, 23, 42, 0.06);
  padding: 12px 20px 16px;
}

:deep(.html-editor-dialog__editor .CodeMirror) {
  height: 100%;
  font-size: 14px;
  line-height: 1.6;
  color: #0f172a;
  background: #ffffff;
  font-family:
    "SFMono-Regular",
    "JetBrains Mono",
    "Fira Code",
    Consolas,
    "Liberation Mono",
    Menlo,
    monospace;
}

:deep(.html-editor-dialog__editor .CodeMirror-gutters) {
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
}

:deep(.html-editor-dialog__editor .CodeMirror-linenumber) {
  color: #94a3b8;
}

:deep(.html-editor-dialog__editor .CodeMirror-scroll) {
  background: #ffffff;
}

:deep(.html-editor-dialog__editor .CodeMirror-lines) {
  padding: 10px 0;
}

:deep(.html-editor-dialog__editor-shell .el-loading-mask) {
  background: rgba(248, 250, 252, 0.72);
}

@media (max-width: 768px) {
  .html-editor-trigger {
    justify-content: flex-end;
  }

  .html-editor-trigger__actions {
    flex-wrap: wrap;
  }

  .html-editor-dialog__footer {
    align-items: stretch;
    flex-direction: column;
  }

  .html-editor-dialog__variables-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .html-editor-dialog__variable-list {
    grid-template-columns: 1fr;
    max-height: 180px;
  }

  .html-editor-dialog__footer-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
