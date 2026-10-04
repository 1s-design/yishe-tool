<template>
  <Accordion type="multiple" :model-value="htmlCollapseActives" @update:model-value="v => htmlCollapseActives = v as string[]">
    <AccordionItem v-if="hasTemplateBindings" value="2">
      <AccordionTrigger>模板绑定</AccordionTrigger>
      <AccordionContent>
      <operate-item-html-bindings-editor
        v-model="currentOperatingCanvasChild"
      />
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="3">
      <AccordionTrigger>代码画布</AccordionTrigger>
      <AccordionContent>
      <operateItemHtmlInput
        label="HTML"
        placeholder="<div class='card'>这里输入 HTML 代码</div>"
        :template-target="currentOperatingCanvasChild"
        v-model="currentOperatingCanvasChild.htmlContent"
      />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import operateItemHtmlInput from "@/components/design/layout/canvas/operate/htmlInput.vue";
import operateItemHtmlBindingsEditor from "@/components/design/layout/canvas/operate/htmlTemplate/bindingsEditor.vue";
import { currentOperatingCanvasChild } from "../index.tsx";
import {
  detachHtmlTemplateFromTarget,
  ensureHtmlTemplateOptions,
  hasHtmlMagicVariables,
  syncHtmlTemplateFieldsFromContent,
} from "@/components/design/layout/canvas/htmlTemplate/runtime.ts";

const htmlCollapseActives = ref(["2", "3"]);

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
