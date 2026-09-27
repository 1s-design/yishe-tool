<template>
  <Accordion
    type="multiple"
    :model-value="activeNames"
    @update:model-value="v => (activeNames = v as string[])"
  >
    <AccordionItem value="spec">
      <AccordionTrigger>Vega-Lite Spec</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>Spec (JSON)</template>
          <template #content>
            <div class="vegalite-spec-editor">
              <Textarea
                v-model="specJson"
                :rows="12"
                class="vegalite-spec-input resize-y"
                spellcheck="false"
                placeholder='{&#10;  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",&#10;  "data": { "values": [...] },&#10;  "mark": "bar",&#10;  "encoding": { ... }&#10;}'
              ></Textarea>
              <div v-if="specError" class="vegalite-error">{{ specError }}</div>
            </div>
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

        <operateItemBackgroundColor
          v-model="currentOperatingCanvasChild.backgroundColor"
        />
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
import { ref, computed } from "vue";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemBackgroundColor from "@/components/design/layout/canvas/operate/backgroundColor.vue";
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { currentOperatingCanvasChild } from "../index.tsx";

const activeNames = ref(["spec", "basic", "common"]);
const specError = ref("");

const specJson = computed({
  get() {
    return JSON.stringify(
      currentOperatingCanvasChild.value?.spec || {},
      null,
      2,
    );
  },
  set(val: string) {
    specError.value = "";
    try {
      const parsed = JSON.parse(val);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        currentOperatingCanvasChild.value.spec = parsed;
      } else {
        specError.value = "请输入 JSON 对象";
      }
    } catch {
      specError.value = "JSON 格式错误";
    }
  },
});
</script>

<style scoped>
.vegalite-spec-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vegalite-spec-input {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.55;
}

.vegalite-error {
  color: #c45656;
  font-size: 12px;
  line-height: 1.4;
}
</style>
