<template>
  <!-- 代码画布：HTML 编辑 + 模板绑定（如有）—— 全部直出 -->
  <section class="operate-section">
    <h4 class="operate-section__title">代码画布</h4>

    <operate-item-html-bindings-editor
      v-if="hasTemplateBindings"
      v-model="currentOperatingCanvasChild"
    />

    <operateItemHtmlInput
      label="HTML"
      placeholder="<div class='card'>这里输入 HTML 代码</div>"
      :template-target="currentOperatingCanvasChild"
      v-model="currentOperatingCanvasChild.htmlContent"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import operateItemHtmlInput from "@/components/design/layout/canvas/operate/htmlInput.vue";
import operateItemHtmlBindingsEditor from "@/components/design/layout/canvas/operate/htmlTemplate/bindingsEditor.vue";
/* 代码画布面板固定绑定 html 图层，与画布面板可同时显示 */
import { htmlLayerChild as currentOperatingCanvasChild } from "../index.tsx";
import {
  detachHtmlTemplateFromTarget,
  ensureHtmlTemplateOptions,
  hasHtmlMagicVariables,
  syncHtmlTemplateFieldsFromContent,
} from "@/components/design/layout/canvas/htmlTemplate/runtime.ts";

const hasTemplateBindings = computed(() => {
  ensureHtmlTemplateOptions(currentOperatingCanvasChild.value);
  return !!currentOperatingCanvasChild.value?.htmlTemplateFields?.length;
});

watch(
  () => [
    currentOperatingCanvasChild.value?.id,
    currentOperatingCanvasChild.value?.htmlContent,
  ],
  ([, htmlContent]) => {
    const target = currentOperatingCanvasChild.value;
    if (!target || target.type !== "html") {
      return;
    }

    ensureHtmlTemplateOptions(target);

    const nextHtmlContent = String(htmlContent ?? "");
    if (!hasHtmlMagicVariables(nextHtmlContent)) {
      if (!target.htmlTemplateMeta && target.htmlTemplateFields?.length) {
        detachHtmlTemplateFromTarget(target);
      }
      return;
    }

    syncHtmlTemplateFieldsFromContent(target, nextHtmlContent);
  },
  {
    immediate: true,
  }
);
</script>

<style></style>
