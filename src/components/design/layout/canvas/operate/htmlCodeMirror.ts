import { nextTick, ref, shallowRef, type Ref } from "vue";
import { EditorState, type Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLineGutter,
  highlightActiveLine,
  type ViewUpdate,
} from "@codemirror/view";
import { html } from "@codemirror/lang-html";
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  type CompletionContext,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { indentOnInput, bracketMatching, foldGutter, foldKeymap, indentUnit } from "@codemirror/language";
import { oneDark } from "@codemirror/theme-one-dark";

type CompletionsBuilder = (cx: CompletionContext) => any;

/**
 * 代码画布 CodeMirror 编辑器内核。
 * 全屏编辑器与右侧小面板共用同一套初始化和销毁逻辑。
 */
export function useHtmlCodeMirror(options: {
  getValue: () => string;
  onChange: (value: string) => void;
  buildCompletions: CompletionsBuilder;
}) {
  const containerRef = ref<HTMLElement | null>(null);
  const editor = shallowRef<EditorView | null>(null);

  function createExtensions(): Extension[] {
    return [
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
      autocompletion({ override: [options.buildCompletions] }),
      indentUnit.of("  "),
      indentOnInput(),
      history(),
      keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...foldKeymap]),
      oneDark,
      EditorView.lineWrapping,
      EditorView.updateListener.of((update: ViewUpdate) => {
        if (update.docChanged) {
          options.onChange(update.state.doc.toString());
        }
      }),
      EditorState.tabSize.of(2),
    ];
  }

  /** 与目标容器同步（仅在实例仍挂在该容器上时复用） */
  function sync(value: string) {
    const view = editor.value;
    if (!view) return;
    if (view.state.doc.toString() === value) {
      refresh();
      return;
    }
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
    });
    refresh();
  }

  function refresh() {
    nextTick(() => {
      const view = editor.value;
      if (!view) return;
      view.dispatch({ selection: view.state.selection });
      view.requestMeasure();
    });
  }

  /**
   * 销毁实例并清空容器。
   * 弹窗/面板切换会卸载容器 DOM，必须销毁，否则下次挂载会拿到孤儿实例。
   */
  function destroy() {
    if (editor.value) {
      editor.value.destroy();
      editor.value = null;
    }
    if (containerRef.value) {
      containerRef.value.innerHTML = "";
    }
  }

  function mount() {
    if (!containerRef.value) return;

    if (editor.value) {
      if (editor.value.dom?.parentElement === containerRef.value) {
        sync(options.getValue());
        return;
      }
      destroy();
    }

    const state = EditorState.create({
      doc: options.getValue(),
      extensions: createExtensions(),
    });

    editor.value = new EditorView({
      state,
      parent: containerRef.value,
    });
  }

  function insertToken(token: string) {
    const view = editor.value;
    if (!view) return;
    const mainSelection = view.state.selection.main;
    view.dispatch({
      changes: { from: mainSelection.from, to: mainSelection.to, insert: token },
      selection: { anchor: mainSelection.from + token.length },
    });
    view.focus();
  }

  function focus() {
    editor.value?.focus();
  }

  return {
    containerRef,
    editor,
    mount,
    destroy,
    sync,
    refresh,
    insertToken,
    focus,
  };
}

export type HtmlCodeMirror = ReturnType<typeof useHtmlCodeMirror>;
export type HtmlCodeMirrorContainer = Ref<HTMLElement | null>;
