<template>
  <Accordion
    type="multiple"
    :model-value="activeNames"
    @update:model-value="v => (activeNames = v as string[])"
  >
    <AccordionItem value="chart">
      <AccordionTrigger>图表设置</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>图表类型</template>
          <template #content>
            <Select v-model="currentOperatingCanvasChild.chartType">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="type in chartTypes"
                  :key="type"
                  :value="type"
                >
                  {{ type }}
                </SelectItem>
              </SelectContent>
            </Select>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>标签 (Labels)</template>
          <template #content>
            <Textarea
              v-model="labelsText"
              :rows="3"
              class="resize-y"
              spellcheck="false"
              placeholder='["Jan","Feb","Mar","Apr","May"]'
              @blur="parseLabels"
            ></Textarea>
            <div v-if="labelsError" class="frappe-chart-error">
              {{ labelsError }}
            </div>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>数据集 (Datasets)</template>
          <template #content>
            <Textarea
              v-model="datasetsText"
              :rows="4"
              class="resize-y"
              spellcheck="false"
              placeholder='[{"values": [25, 40, 30, 35, 8]}]'
              @blur="parseDatasets"
            ></Textarea>
            <div v-if="datasetsError" class="frappe-chart-error">
              {{ datasetsError }}
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
import { ref, watch } from "vue";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";
import operateItemBackgroundColor from "@/components/design/layout/canvas/operate/backgroundColor.vue";
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
import { FRAPPE_CHART_TYPES } from "../children/frappeChart.tsx";

const activeNames = ref(["chart", "basic", "common"]);
const chartTypes = FRAPPE_CHART_TYPES;

const labelsText = ref("");
const labelsError = ref("");
const datasetsText = ref("");
const datasetsError = ref("");

function syncLabelsText() {
  try {
    const labels = currentOperatingCanvasChild.value?.labels;
    if (Array.isArray(labels)) {
      labelsText.value = JSON.stringify(labels, null, 2);
    } else {
      labelsText.value = '["Jan","Feb","Mar","Apr","May"]';
    }
    labelsError.value = "";
  } catch {
    labelsText.value = '["Jan","Feb","Mar","Apr","May"]';
    labelsError.value = "";
  }
}

function syncDatasetsText() {
  try {
    const datasets = currentOperatingCanvasChild.value?.datasets;
    if (Array.isArray(datasets)) {
      datasetsText.value = JSON.stringify(datasets, null, 2);
    } else {
      datasetsText.value = '[{"values": [25, 40, 30, 35, 8]}]';
    }
    datasetsError.value = "";
  } catch {
    datasetsText.value = '[{"values": [25, 40, 30, 35, 8]}]';
    datasetsError.value = "";
  }
}

function parseLabels() {
  try {
    const parsed = JSON.parse(labelsText.value);
    if (!Array.isArray(parsed)) {
      labelsError.value = "标签必须是一个数组";
      return;
    }
    currentOperatingCanvasChild.value.labels = parsed;
    labelsError.value = "";
  } catch (error: any) {
    labelsError.value = error?.message || "JSON 解析失败";
  }
}

function parseDatasets() {
  try {
    const parsed = JSON.parse(datasetsText.value);
    if (!Array.isArray(parsed)) {
      datasetsError.value = "数据集必须是一个数组";
      return;
    }
    currentOperatingCanvasChild.value.datasets = parsed;
    datasetsError.value = "";
  } catch (error: any) {
    datasetsError.value = error?.message || "JSON 解析失败";
  }
}

watch(
  () => currentOperatingCanvasChild.value?.id,
  () => {
    syncLabelsText();
    syncDatasetsText();
  },
  { immediate: true },
);
</script>

<style scoped>
.frappe-chart-error {
  color: #c45656;
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
}
</style>
