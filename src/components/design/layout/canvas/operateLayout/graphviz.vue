<template>
  <Accordion
    type="multiple"
    :model-value="activeNames"
    @update:model-value="v => (activeNames = v as string[])"
  >
    <AccordionItem value="source">
      <AccordionTrigger>DOT 语法</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>Graphviz</template>
          <template #content>
            <Textarea
              v-model="currentOperatingCanvasChild.dot"
              :rows="10"
              class="graphviz-source-editor__input resize-y"
              spellcheck="false"
              placeholder="digraph {&#10;  a -> b&#10;}"
            ></Textarea>
          </template>
        </operate-form-item>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="basic">
      <AccordionTrigger>基础</AccordionTrigger>
      <AccordionContent>
        <operateItemSize
          label="尺寸"
          v-model:width="currentOperatingCanvasChild.width"
          v-model:height="currentOperatingCanvasChild.height"
        ></operateItemSize>

        <operateItemBackgroundColor
          v-model="currentOperatingCanvasChild.backgroundColor"
        ></operateItemBackgroundColor>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="common">
      <AccordionTrigger>通用属性</AccordionTrigger>
      <AccordionContent>
        <operateItemCommonGroup
          v-model="currentOperatingCanvasChild"
        ></operateItemCommonGroup>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>

<script setup lang="ts">
import { ref } from "vue";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";
import operateItemBackgroundColor from "@/components/design/layout/canvas/operate/backgroundColor.vue";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { currentOperatingCanvasChild } from "../index.tsx";

const activeNames = ref(["source", "basic", "common"]);
</script>

<style scoped>
.graphviz-source-editor__input {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.55;
}
</style>
