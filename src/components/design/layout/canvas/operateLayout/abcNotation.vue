<template>
  <Accordion
    type="multiple"
    :model-value="activeNames"
    @update:model-value="v => (activeNames = v as string[])"
  >
    <AccordionItem value="source">
      <AccordionTrigger>ABC 记谱法</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>乐谱</template>
          <template #content>
            <Textarea
              v-model="currentOperatingCanvasChild.source"
              :rows="12"
              class="abc-notation-source-input resize-vertical"
              spellcheck="false"
              placeholder="X:1
T:小星星
M:4/4
K:C
C C G G | A A G2 | F F E E | D D C2 |"
            />
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
        />

        <operateItemBackgroundColor v-model="currentOperatingCanvasChild.backgroundColor" />
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="common">
      <AccordionTrigger>通用属性</AccordionTrigger>
      <AccordionContent>
        <operateItemCommonGroup v-model="currentOperatingCanvasChild" />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>

<script setup lang="ts">
import { ref } from "vue";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemBackgroundColor from "@/components/design/layout/canvas/operate/backgroundColor.vue";
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { currentOperatingCanvasChild } from "../index.tsx";

const activeNames = ref(["source", "basic", "common"]);
</script>

<style scoped>
.abc-notation-source-input {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.55;
}
</style>
