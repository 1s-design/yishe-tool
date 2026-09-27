<template>
  <Accordion
    type="multiple"
    :model-value="activeNames"
    @update:model-value="v => (activeNames = v as string[])"
  >
    <AccordionItem value="elements">
      <AccordionTrigger>节点和边</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>布局</template>
          <template #content>
            <Select v-model="currentOperatingCanvasChild.layout">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preset">预设位置 (preset)</SelectItem>
                <SelectItem value="grid">网格 (grid)</SelectItem>
                <SelectItem value="circle">圆形 (circle)</SelectItem>
                <SelectItem value="concentric">同心圆 (concentric)</SelectItem>
                <SelectItem value="breadthfirst">层级 (breadthfirst)</SelectItem>
                <SelectItem value="cose">力导向 (cose)</SelectItem>
              </SelectContent>
            </Select>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>元素数据</template>
          <template #content>
            <Textarea
              v-model="elementsJson"
              :rows="12"
              class="cytoscape-elements-input resize-vertical"
              spellcheck="false"
              placeholder='[
  {"data": {"id": "A", "label": "开始"}},
  {"data": {"id": "B", "label": "处理"}},
  {"data": {"source": "A", "target": "B"}}
]'
            />
            <div v-if="jsonError" class="cytoscape-json-error">{{ jsonError }}</div>
          </template>
        </operate-form-item>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="style">
      <AccordionTrigger>样式</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>节点颜色</template>
          <template #content>
            <input
              v-model="nodeColor"
              type="color"
              class="h-6 w-8 cursor-pointer rounded border border-input bg-transparent p-0"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>边颜色</template>
          <template #content>
            <input
              v-model="edgeColor"
              type="color"
              class="h-6 w-8 cursor-pointer rounded border border-input bg-transparent p-0"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>文字颜色</template>
          <template #content>
            <input
              v-model="labelColor"
              type="color"
              class="h-6 w-8 cursor-pointer rounded border border-input bg-transparent p-0"
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
import { ref, computed, watch } from "vue";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemBackgroundColor from "@/components/design/layout/canvas/operate/backgroundColor.vue";
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { currentOperatingCanvasChild } from "../index.tsx";

const activeNames = ref(["elements", "style", "basic", "common"]);
const jsonError = ref("");

const elementsJson = computed({
  get() {
    return JSON.stringify(currentOperatingCanvasChild.value?.elements || [], null, 2);
  },
  set(val: string) {
    jsonError.value = "";
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        currentOperatingCanvasChild.value.elements = parsed;
      } else {
        jsonError.value = "请输入 JSON 数组";
      }
    } catch {
      jsonError.value = "JSON 格式错误";
    }
  },
});

const nodeColor = computed({
  get() {
    return currentOperatingCanvasChild.value?.style?.nodeColor || '#4A90D9';
  },
  set(val: string) {
    if (!currentOperatingCanvasChild.value.style) {
      currentOperatingCanvasChild.value.style = {};
    }
    currentOperatingCanvasChild.value.style.nodeColor = val;
  },
});

const edgeColor = computed({
  get() {
    return currentOperatingCanvasChild.value?.style?.edgeColor || '#666666';
  },
  set(val: string) {
    if (!currentOperatingCanvasChild.value.style) {
      currentOperatingCanvasChild.value.style = {};
    }
    currentOperatingCanvasChild.value.style.edgeColor = val;
  },
});

const labelColor = computed({
  get() {
    return currentOperatingCanvasChild.value?.style?.labelColor || '#333333';
  },
  set(val: string) {
    if (!currentOperatingCanvasChild.value.style) {
      currentOperatingCanvasChild.value.style = {};
    }
    currentOperatingCanvasChild.value.style.labelColor = val;
  },
});
</script>

<style scoped>
.cytoscape-elements-input {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.55;
}

.cytoscape-json-error {
  color: #c45656;
  font-size: 12px;
  margin-top: 4px;
}
</style>
