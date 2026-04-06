<template>
  <el-collapse v-model="htmlCollapseActives">
    <el-collapse-item name="1" title="模板库">
      <operate-item-html-template-library
        v-model="currentOperatingCanvasChild"
      />
    </el-collapse-item>

    <el-collapse-item v-if="hasTemplateBindings" name="2" title="模板绑定">
      <operate-item-html-bindings-editor
        v-model="currentOperatingCanvasChild"
      />
    </el-collapse-item>

    <el-collapse-item name="3" title="HTML代码">
      <operateItemHtmlInput
        label="HTML"
        placeholder="<div class='card'>这里输入 HTML 代码</div>"
        :template-target="currentOperatingCanvasChild"
        v-model="currentOperatingCanvasChild.htmlContent"
      />
    </el-collapse-item>
  </el-collapse>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import operateItemHtmlInput from "@/components/design/layout/canvas/operate/htmlInput.vue";
import operateItemHtmlTemplateLibrary from "@/components/design/layout/canvas/operate/htmlTemplate/templateLibrary.vue";
import operateItemHtmlBindingsEditor from "@/components/design/layout/canvas/operate/htmlTemplate/bindingsEditor.vue";
import { currentOperatingCanvasChild } from "../index.tsx";
import {
  detachHtmlTemplateFromTarget,
  ensureHtmlTemplateOptions,
  hasHtmlMagicVariables,
  syncHtmlTemplateFieldsFromContent,
} from "@/components/design/layout/canvas/htmlTemplate/runtime.ts";

const htmlCollapseActives = ref(["1", "2", "3"]);

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
