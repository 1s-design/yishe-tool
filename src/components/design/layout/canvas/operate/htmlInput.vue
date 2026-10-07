<template>
  <operate-form-item style="align-items: start">
    <template #icon>
      <icon></icon>
    </template>
    <template #name> {{ label }} </template>
    <template #content>
      <div class="html-editor-trigger">
        <div class="html-editor-trigger__actions">
          <Button size="sm" variant="outline" class="text-primary border-primary/40 hover:bg-primary/10 hover:text-primary" @click="openEditor">全屏编辑</Button>
          <Button size="sm" variant="outline" @click="clearContent" :disabled="!model">清空</Button>
        </div>
      </div>
    </template>
  </operate-form-item>

  <Dialog
    v-model:open="dialogVisible"
  >
    <DialogContent
      class="html-editor-dialog max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 rounded-none gap-0 overflow-hidden flex flex-col"
      @interact-outside="e => e.preventDefault()"
      @pointer-down-outside="e => e.preventDefault()"
    >
    <DialogHeader class="html-editor-dialog__header px-6 pt-6 pb-2 shrink-0">
      <DialogTitle>编辑代码画布</DialogTitle>
    </DialogHeader>
    <div class="html-editor-dialog__layout html-editor-dialog__body">
      <div class="html-editor-dialog__main">
        <div class="html-editor-dialog__toolbar">
          <div class="html-editor-dialog__hint">
            <span class="html-editor-dialog__meta">{{ draftSummary }}</span>
          </div>
        </div>

        <div v-if="editorError" class="html-editor-dialog__error">
          <span>{{ editorError }}</span>
          <Button size="sm" variant="link" @click="retryLoadEditor">重新加载</Button>
        </div>

        <div v-loading="loadingEditor" class="html-editor-dialog__editor-shell">
          <div v-show="!editorError" ref="editorContainerRef" class="html-editor-dialog__editor"></div>
        </div>
      </div>

      <div class="html-editor-dialog__sidebar">
        <div class="html-editor-dialog__sidebar-header">
          <h3>模板变量速查</h3>
        </div>
        <div class="html-editor-dialog__sidebar-content scrollable-panel">
          <div class="html-editor-dialog__section-header">
            <span>提示：点击变量名可快速插入到编辑器光标处</span>
          </div>

          <!-- 当前模板已识别变量 -->
          <div class="html-editor-dialog__variable-section">
            <div class="html-editor-dialog__variable-section-name">
              当前模板变量
              <span class="badge" v-if="templateMagicVariableItems.length">
                {{ templateMagicVariableItems.length }}
              </span>
            </div>
            <div v-if="templateMagicVariableItems.length" class="html-editor-dialog__variable-list compact-list">
              <div
                v-for="field in templateMagicVariableItems"
                :key="field.key"
                class="html-editor-dialog__variable-row"
              >
                <div class="variable-row-left">
                  <div class="variable-header">
                    <Badge
                      class="type-tag"
                      :variant="getBadgeType(field.type) === 'danger' ? 'destructive' : getBadgeType(field.type) === 'primary' ? 'default' : getBadgeType(field.type) === 'info' ? 'secondary' : getBadgeType(field.type) === 'success' ? 'success' : 'warning'"
                    >{{ field.type.toUpperCase() }}</Badge>
                    <span class="field-label">{{ field.label }}</span>
                  </div>
                  <div class="tokens-container">
                    <span
                      v-for="tokenItem in field.tokens"
                      :key="tokenItem.token"
                      class="clickable-token-tag"
                      @click="insertVariable(tokenItem.token)"
                      :title="tokenItem.description"
                    >
                      {{ tokenItem.token.replace(/^\{\{/, '').replace(/\}\}$/, '') }}
                    </span>
                  </div>
                </div>
                <div class="variable-row-right" v-if="getFieldBoundId(field)">
                  <Button
                    size="sm"
                    variant="outline"
                    class="configure-btn text-primary border-primary/40 hover:bg-primary/10 hover:text-primary"
                    @click.stop="configureComponent(getFieldBoundId(field))"
                  >
                    配置
                  </Button>
                </div>
              </div>
            </div>
            <div v-else class="html-editor-dialog__variable-empty">
              当前暂无已识别的模板变量。
            </div>
          </div>

          <!-- 内置系统变量 -->
          <div class="html-editor-dialog__variable-section" style="margin-top: 12px;">
            <div class="html-editor-dialog__variable-section-name">
              内置系统变量
            </div>
            <div class="html-editor-dialog__variable-list compact-list">
              <div
                v-for="group in systemGroupedVariables"
                :key="group.label"
                class="html-editor-dialog__variable-row"
              >
                <div class="variable-row-left">
                  <div class="variable-header">
                    <Badge variant="secondary" class="type-tag">{{ group.type.toUpperCase() }}</Badge>
                    <span class="field-label">{{ group.label }}</span>
                  </div>
                  <div class="tokens-container">
                    <span
                      v-for="tokenItem in group.tokens"
                      :key="tokenItem.token"
                      class="clickable-token-tag"
                      @click="insertVariable(tokenItem.token)"
                      :title="tokenItem.description"
                    >
                      {{ tokenItem.token.replace(/^\{\{/, '').replace(/\}\}$/, '') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 语法与组件参考文档 -->
          <div class="html-editor-dialog__variable-section" style="margin-top: 14px; border-top: 1px solid var(--1s-border-color); padding-top: 12px;">
            <div class="html-editor-dialog__variable-section-name" style="color: var(--1s-text-color); font-weight: 700;">
              可插入组件
            </div>

            <div class="component-reference-list">
              <div v-for="group in componentReferenceItems" :key="group.category" class="doc-section">
                <div class="doc-title">{{ group.category }}</div>
                <div class="doc-content">
                  <div
                    v-for="item in group.items"
                    :key="item.token"
                    class="component-reference-item"
                    @click="insertVariable(item.token)"
                  >
                    <span class="component-ref-name">{{ item.name }}</span>
                    <span class="component-ref-token">{{ item.token.replace(/^\{\{/, '').replace(/\}\}$/, '') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
import icon from "@/components/design/assets/icon/text-content.svg?component";
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from "vue";
import {
  detachHtmlTemplateFromTarget,
  hasHtmlMagicVariables,
  syncHtmlTemplateFieldsFromContent,
  inferHtmlTemplateFieldsFromContent,
  getValueByPath,
  setValueByPath,
} from "@/components/design/layout/canvas/htmlTemplate/runtime.ts";
import type { HtmlTemplateFieldDefinition } from "@/components/design/layout/canvas/htmlTemplate/types";

import {
  canvasStickerOptions,
  currentOperatingCanvasChildId,
  CanvasChildOperationComponentMap,
  canvasChildLabelMap,
  canvasChildDefaultOptionsMap,
  autoCreateAndBindNewFields,
  cleanUpUnusedBindings,
  inferComponentTypeFromKey,
} from "../index.tsx";

import { EditorState, Extension } from "@codemirror/state";
import { EditorView, keymap, ViewUpdate } from "@codemirror/view";
import { html } from "@codemirror/lang-html";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { indentOnInput, bracketMatching, foldGutter, foldKeymap } from "@codemirror/language";
import { lineNumbers, highlightActiveLineGutter, highlightActiveLine } from "@codemirror/view";
import { indentUnit } from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const model = defineModel<string>({ default: "" });

const props = defineProps({
  label: {
    default: "代码画布",
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
const editorInstance = shallowRef<EditorView | null>(null);

// Removed tab-related state and computed properties since we use a simplified sidebar now

function getBadgeType(type: string) {
  switch (type) {
    case "text":
    case "textarea":
      return "info";
    case "color":
      return "success";
    case "image":
      return "warning";
    case "font":
      return "primary";
    case "child":
      return "danger";
    case "html":
      return "warning";
    default:
      return "info";
  }
}

function insertVariable(token: string) {
  if (!editorInstance.value) return;
  const view = editorInstance.value;
  const state = view.state;
  const mainSelection = state.selection.main;
  
  view.dispatch({
    changes: {
      from: mainSelection.from,
      to: mainSelection.to,
      insert: token
    },
    selection: { anchor: mainSelection.from + token.length }
  });
  view.focus();
}

function getFieldBoundId(field: any) {
  if (field.type !== "child" && field.type !== "html") return null;
  const key = field.key;
  const bindings = props.templateTarget?.htmlBindings || {};
  
  const boundValue = getValueByPath(bindings, key);
  if (boundValue && typeof boundValue === "object" && boundValue.id) {
    return boundValue.id;
  }
  return null;
}

function configureComponent(id: string) {
  // 保存 HTML 内容并关闭弹窗
  handleSave();
  // 切换活动聚焦元素，主画布侧边栏将自动渲染该组件的配置菜单
  nextTick(() => {
    currentOperatingCanvasChildId.value = id;
  });
}

const draftSummary = computed(() => {
  const value = String(draftValue.value ?? "");
  return `${value.split(/\r?\n/).length} 行 · ${value.length} 字符`;
});

const systemGroupedVariables = [
  {
    label: "画布尺寸",
    type: "canvas",
    tokens: [
      { token: "{{canvas.width}}", description: "画布宽度数值" },
      { token: "{{canvas.height}}", description: "画布高度数值" },
      { token: "{{canvas.widthUnit}}", description: "画布宽度单位" },
      { token: "{{canvas.heightUnit}}", description: "画布高度单位" },
      { token: "{{canvas.widthCss}}", description: "画布宽度 CSS 值" },
      { token: "{{canvas.heightCss}}", description: "画布高度 CSS 值" },
    ]
  },
  {
    label: "当前元素",
    type: "element",
    tokens: [
      { token: "{{element.id}}", description: "当前元素 id" },
      { token: "{{element.zIndex}}", description: "当前元素层级" },
    ]
  }
];

const componentReferenceItems = [
  {
    category: "数据图表",
    items: [
      { name: "ECharts 图表", token: "{{echart.myChart}}" },
      { name: "Chart.js 图表", token: "{{chartjs.myChart}}" },
      { name: "Plotly 科学图表", token: "{{plotlyChart.myChart}}" },
      { name: "Frappe 极简图表", token: "{{frappeChart.myChart}}" },
      { name: "xkcd 手绘图表", token: "{{chartXkcd.myChart}}" },
      { name: "Data UI 图表", token: "{{vueDataUi.myReport}}" },
      { name: "Vega-Lite 规范", token: "{{vegaLite.myChart}}" },
    ]
  },
  {
    category: "3D与图形",
    items: [
      { name: "Three.js 3D场景", token: "{{threejs.myScene}}" },
      { name: "Cytoscape 关系图", token: "{{cytoscape.myGraph}}" },
      { name: "Dagre 拓扑图", token: "{{dagreGraph.myGraph}}" },
      { name: "D3 自定义绘图", token: "{{d3.myChart}}" },
      { name: "Rough 手绘图形", token: "{{roughShape.myShape}}" },
      { name: "程序画布 Canvas", token: "{{rawCanvas.myCanvas}}" },
    ]
  },
  {
    category: "文字与编码",
    items: [
      { name: "二维码", token: "{{qrcode.myCode}}" },
      { name: "条形码", token: "{{barcode.myCode}}" },
      { name: "Figlet 艺术字", token: "{{figlet.artText}}" },
      { name: "OpenType 路径字", token: "{{opentypeText.brandTitle}}" },
      { name: "Shiki 代码高亮", token: "{{codeBlock.myCode}}" },
      { name: "D3 词云图", token: "{{wordCloud.myCloud}}" },
    ]
  },
  {
    category: "科学与文档",
    items: [
      { name: "KaTeX 数学公式", token: "{{math.formula}}" },
      { name: "Mermaid 流程图", token: "{{mermaid.flowchart}}" },
      { name: "Graphviz DOT网络", token: "{{graphviz.dotGraph}}" },
      { name: "RDKit 2D分子式", token: "{{molecule.mol2d}}" },
      { name: "3Dmol 3D分子结构", token: "{{threeMol.mol3d}}" },
      { name: "Markmap 思维导图", token: "{{markmapChart.mindmap}}" },
    ]
  },
  {
    category: "乐谱",
    items: [
      { name: "ABC 简易乐谱", token: "{{abcNotation.score}}" },
      { name: "VexFlow 五线谱", token: "{{vexFlow.musicSheet}}" },
    ]
  },
  {
    category: "特效与背景",
    items: [
      { name: "Particles 粒子特效", token: "{{particlesEffect.particles}}" },
      { name: "Confetti 撒花效果", token: "{{confetti.effect}}" },
      { name: "Trianglify 三角背景", token: "{{trianglify.pattern}}" },
      { name: "Astronomy 星座图", token: "{{starChart.starMap}}" },
      { name: "Waveform 音频波形", token: "{{waveform.audioWave}}" },
      { name: "Simplex 噪声纹理", token: "{{simplexNoise.noiseBg}}" },
    ]
  },
];

const templateMagicVariableItems = computed(() => {
  const fields = inferHtmlTemplateFieldsFromContent(
    draftValue.value,
    props.templateTarget?.htmlTemplateFields || []
  );

  return fields.map((field) => {
    let label = field.label || field.key;
    if (field.type === "child") {
      const componentType = inferComponentTypeFromKey(field.key);
      const componentLabel = canvasChildLabelMap[componentType] || componentType;
      const varName = field.key.includes(".") ? field.key.split(".").pop() : field.key;
      label = `${componentLabel} (${varName})`;
    } else if (field.type === "html") {
      const varName = field.key.includes(".") ? field.key.split(".").pop() : field.key;
      label = `子模板 (${varName})`;
    }

    return {
      key: field.key,
      label,
      type: field.type,
      tokens: createMagicVariableItemsForField(field),
    };
  });
});

function createMagicVariableItemsForField(field: HtmlTemplateFieldDefinition): any[] {
  switch (field.type) {
    case "color":
      return [
        {
          token: `{{${field.key}}}`,
          description: `${field.label}，直接输出颜色值`,
          type: field.type,
        },
        {
          token: `{{${field.key}.css}}`,
          description: `${field.label}，颜色 CSS 别名`,
          type: field.type,
        },
      ];
    case "image":
      return [
        {
          token: `{{${field.key}.url}}`,
          description: `${field.label}，图片地址`,
          type: field.type,
        },
        {
          token: `{{${field.key}.src}}`,
          description: `${field.label}，图片地址别名`,
          type: field.type,
        },
        {
          token: `{{${field.key}.name}}`,
          description: `${field.label}，图片名称`,
          type: field.type,
        },
      ];
    case "font":
      return [
        {
          token: `{{${field.key}.family}}`,
          description: `${field.label}，渲染后的字体 family`,
          type: field.type,
        },
        {
          token: `{{${field.key}.name}}`,
          description: `${field.label}，字体名称`,
          type: field.type,
        },
      ];
    case "child": {
      const hasPrefix = field.key.includes(".");
      return [
        {
          token: hasPrefix ? `{{${field.key}}}` : `{{child.${field.key}}}`,
          description: `${field.label}，嵌入组件插槽（如 ECharts、Sticker 等）`,
          type: field.type,
        },
      ];
    }
    case "html": {
      const hasPrefix = field.key.includes(".");
      return [
        {
          token: hasPrefix ? `{{${field.key}}}` : `{{html.${field.key}}}`,
          description: `${field.label}，递归嵌套的 HTML 代码片段`,
          type: field.type,
        },
      ];
    }
    case "textarea":
    case "text":
    default:
      return [
        {
          token: `{{${field.key}}}`,
          description: `${field.label}，文本变量`,
          type: field.type,
        },
      ];
  }
}

/** Build autocomplete completions from magic variable lists */
function buildCompletions(cx: CompletionContext) {
  const flatSystem = systemGroupedVariables.flatMap((g) => g.tokens);
  const flatTemplate = templateMagicVariableItems.value.flatMap((field) => field.tokens);
  
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

function refreshEditor() {
  nextTick(() => {
    if (!editorInstance.value) return;
    editorInstance.value.dispatch({ selection: editorInstance.value.state.selection });
    editorInstance.value.focus();
  });
}

function syncEditorValue(value: string) {
  if (!editorInstance.value) return;
  if (editorInstance.value.state.doc.toString() === value) {
    refreshEditor();
    return;
  }
  editorInstance.value.dispatch({
    changes: {
      from: 0,
      to: editorInstance.value.state.doc.length,
      insert: value,
    },
  });
  refreshEditor();
}

function mountEditor() {
  if (!editorContainerRef.value) return;

  if (editorInstance.value) {
    syncEditorValue(draftValue.value);
    return;
  }

  const extensions: Extension[] = [
    html({
      selfClosingTags: true,
      matchClosingTags: true,
    }),
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightActiveLine(),
    foldGutter(),
    bracketMatching(),
    closeBrackets(),
    autocompletion({ override: [buildCompletions] }),
    indentUnit.of("  "),
    indentOnInput(),
    history(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...historyKeymap,
      ...foldKeymap,
    ]),
    oneDark,
    EditorView.lineWrapping,
    EditorView.updateListener.of((update: ViewUpdate) => {
      if (update.docChanged) {
        const nextValue = update.state.doc.toString();
        if (nextValue !== draftValue.value) {
          draftValue.value = nextValue;
        }
      }
    }),
    EditorState.tabSize.of(2),
  ];

  const state = EditorState.create({
    doc: draftValue.value,
    extensions,
  });

  editorInstance.value = new EditorView({
    state,
    parent: editorContainerRef.value,
  });
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
    // 确保 DOM 更新完成后再挂载编辑器
    await nextTick();
    // 再等一帧确保 dialog 容器有实际尺寸
    await new Promise((r) => requestAnimationFrame(r));

    if (!editorContainerRef.value) {
      throw new Error("Editor container not available");
    }

    mountEditor();
  } catch (error) {
    console.error("[htmlInput] failed to initialize CodeMirror 6", error);
    editorError.value = `编辑器加载失败：${error instanceof Error ? error.message : "请稍后重试。"}`;
  } finally {
    loadingEditor.value = false;
  }
}

function handleDialogOpen() {
  initializeEditor();
}

function retryLoadEditor() {
  // Destroy existing instance and reinitialize
  if (editorInstance.value) {
    editorInstance.value.destroy();
    editorInstance.value = null;
  }
  initializeEditor();
}

function handleCancel() {
  draftValue.value = String(model.value ?? "");
  syncEditorValue(draftValue.value);
  dialogVisible.value = false;
}

// Auto creation and cleanup functions are imported from index.tsx

function handleSave() {
  const nextValue = String(draftValue.value ?? "");
  const previousValue = String(model.value ?? "");
  const hasChanged = nextValue !== previousValue;

  model.value = nextValue;

  if (hasChanged && props.templateTarget) {
    const preserveBindings = hasHtmlMagicVariables(nextValue);
    if (preserveBindings) {
      const inferredFields = syncHtmlTemplateFieldsFromContent(props.templateTarget, nextValue);
      
      // Auto create and bind components for new child variables
      autoCreateAndBindNewFields(inferredFields, props.templateTarget);
      // Clean up unused/removed child components
      cleanUpUnusedBindings(inferredFields, props.templateTarget);
      
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
    // 程序化打开时 Dialog 不会 emit update:open，必须在这里挂载编辑器
    handleDialogOpen();
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
  if (editorInstance.value) {
    editorInstance.value.destroy();
    editorInstance.value = null;
  }
  if (editorContainerRef.value) {
    editorContainerRef.value.innerHTML = "";
  }
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
  gap: 16px;
  height: 100%;
}

.html-editor-dialog__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  overflow: hidden;
}

.html-editor-dialog__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 10px;
  border: 1px solid var(--1s-border-color, #e4e4e7);
  border-radius: 6px;
  background: var(--1s-elevated-background, #f4f4f5);
}

:global(html.dark) .html-editor-dialog__toolbar,
:global(.dark) .html-editor-dialog__toolbar {
  background: var(--1s-elevated-background);
  border-color: var(--1s-border-color);
}

.html-editor-dialog__hint {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  font-size: 11px;
  color: var(--1s-text-color-secondary, #71717a);
}

.html-editor-dialog__meta {
  font-size: 11px;
  font-family: monospace;
  color: var(--1s-text-color-secondary, #71717a);
}

.html-editor-dialog__error {
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
}

.html-editor-dialog__editor-shell {
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  padding: 2px;
  border: 1px solid var(--1s-border-color, #e4e4e7);
  border-radius: 8px;
  overflow: hidden;
  background: #282c34;
}

:global(html.dark) .html-editor-dialog__editor-shell,
:global(.dark) .html-editor-dialog__editor-shell {
  border-color: var(--1s-border-color);
  background: var(--1s-surface-background);
}

.html-editor-dialog__editor {
  width: 100%;
  height: 100%;
  min-height: 0;
  border-radius: 6px;
  overflow: hidden;
  background: #282c34;
}

/* Sidebar Styles */
.html-editor-dialog__sidebar {
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

:global(html.dark) .html-editor-dialog__sidebar,
:global(.dark) .html-editor-dialog__sidebar {
  background: var(--1s-panel-background);
  border-color: var(--1s-border-color);
}

.html-editor-dialog__sidebar-header {
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

:global(html.dark) .html-editor-dialog__sidebar-header,
:global(.dark) .html-editor-dialog__sidebar-header {
  background: var(--1s-elevated-background);
  border-bottom-color: var(--1s-border-color);
}

.html-editor-dialog__sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 12px;
  color: var(--1s-text-color, #09090b);
}

.html-editor-dialog__section-header {
  padding: 6px 8px;
  background: var(--1s-elevated-background, #f4f4f5);
  border: 1px solid var(--1s-border-color, #e4e4e7);
  border-radius: 4px;
  margin-bottom: 10px;

  span {
    color: var(--1s-text-color-secondary, #71717a);
    font-size: 10px;
    font-weight: 500;
  }
}

:global(html.dark) .html-editor-dialog__section-header,
:global(.dark) .html-editor-dialog__section-header {
  background: var(--1s-elevated-background);
  border-color: var(--1s-border-color);
}

.html-editor-dialog__variable-section {
  .html-editor-dialog__variable-section-name {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    font-weight: 700;
    color: var(--1s-text-color, #09090b);
    margin-bottom: 6px;

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--1s-elevated-background, #f4f4f5);
      color: var(--1s-text-color-secondary, #71717a);
      font-size: 10px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 9999px;
      border: 1px solid var(--1s-border-color, #e4e4e7);
    }
  }
}

:global(html.dark) .html-editor-dialog__variable-section .html-editor-dialog__variable-section-name .badge,
:global(.dark) .html-editor-dialog__variable-section .html-editor-dialog__variable-section-name .badge {
  background: var(--1s-elevated-background);
  border-color: var(--1s-border-color);
  color: var(--1s-text-color-secondary);
}

.compact-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.html-editor-dialog__variable-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: var(--1s-surface-background, #ffffff);
  border: 1px solid var(--1s-border-color, #e4e4e7);
  border-radius: var(--1s-radius-medium);
  gap: 8px;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: var(--1s-accent-color);
  }

  .variable-row-left {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .variable-row-right {
    flex-shrink: 0;
  }
}

:global(html.dark) .html-editor-dialog__variable-row,
:global(.dark) .html-editor-dialog__variable-row {
  background: var(--1s-surface-background);
  border-color: var(--1s-border-color);

  &:hover {
    border-color: var(--1s-accent-color);
  }
}

.variable-header {
  display: flex;
  align-items: center;
  gap: 6px;

  .field-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--1s-text-color, #09090b);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.type-tag {
  font-size: 8px;
  font-weight: 700;
  padding: 0 3px;
  height: 14px;
  line-height: 14px;
}

.tokens-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.clickable-token-tag {
  display: inline-flex;
  align-items: center;
  font-family: monospace;
  font-size: 10px;
  font-weight: 500;
  color: var(--1s-text-color, #09090b);
  background: var(--1s-elevated-background, #f4f4f5);
  border: 1px solid var(--1s-border-color, #e4e4e7);
  padding: 1px 5px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s ease;
  word-break: break-all;

  &:hover {
    color: #ffffff;
    background: #3b82f6;
    border-color: #3b82f6;
  }
}

:global(html.dark) .clickable-token-tag,
:global(.dark) .clickable-token-tag {
  background: var(--1s-elevated-background);
  border-color: var(--1s-border-color);
  color: var(--1s-text-color);

  &:hover {
    color: #ffffff;
    background: #3b82f6;
    border-color: #3b82f6;
  }
}

.html-editor-dialog__variable-empty {
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--1s-elevated-background, #f4f4f5);
  font-size: 11px;
  line-height: 1.5;
  color: var(--1s-text-color-secondary, #71717a);
}

:global(html.dark) .html-editor-dialog__variable-empty,
:global(.dark) .html-editor-dialog__variable-empty {
  background: var(--1s-elevated-background);
  color: var(--1s-text-color-secondary);
}

.component-reference-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.doc-section {
  background: var(--1s-surface-background, #ffffff);
  border: 1px solid var(--1s-border-color, #e4e4e7);
  border-radius: 6px;
  padding: 8px;

  .doc-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--1s-text-color, #09090b);
    margin-bottom: 6px;
  }
}

:global(html.dark) .doc-section,
:global(.dark) .doc-section {
  background: var(--1s-surface-background);
  border-color: var(--1s-border-color);
}

.component-reference-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--1s-hover-background, rgba(0, 0, 0, 0.04));
  }

  .component-ref-name {
    font-size: 11px;
    color: var(--1s-text-color, #09090b);
    font-weight: 500;
    flex: 1;
    min-width: 0;
  }

  .component-ref-token {
    font-family: monospace;
    font-size: 10px;
    color: var(--1s-accent-color);
    background: var(--1s-hover-background);
    border: 1px solid color-mix(in srgb, var(--1s-accent-color) 25%, transparent);
    padding: 1px 4px;
    border-radius: 3px;
    flex-shrink: 0;
  }
}

:global(html.dark) .component-reference-item:hover,
:global(.dark) .component-reference-item:hover {
  background: var(--1s-hover-background);
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

:deep(.html-editor-dialog__editor .cm-editor) {
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

:deep(.html-editor-dialog__editor .cm-scroller) {
  height: 100% !important;
  min-height: 0;
  overflow-y: auto !important;
}

:deep(.html-editor-dialog__editor .cm-content) {
  padding: 8px 0;
}

@media (max-width: 768px) {
  .html-editor-dialog__sidebar {
    display: none;
  }
}
</style>
