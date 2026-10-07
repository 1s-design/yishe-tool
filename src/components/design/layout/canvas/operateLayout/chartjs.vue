<template>
  >
    <section class="operate-section">
      <h4 class="operate-section__title">图表类型</h4>
      
        <operate-form-item>
          <template #name>图表类型</template>
          <template #content>
            <Select v-model="currentOperatingCanvasChild.chartType">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue placeholder="选择图表类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="item in chartTypes"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </template>
        </operate-form-item>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">数据</h4>
      
        <operate-form-item>
          <template #name>数据 (JSON)</template>
          <template #content>
            <Textarea
              v-model="dataJson"
              :rows="10"
              class="chartjs-json-input resize-vertical"
              spellcheck="false"
              placeholder='{
  "labels": ["A", "B", "C"],
  "datasets": [{
    "label": "Sample",
    "data": [10, 20, 30]
  }]
}'
            />
            <div v-if="dataError" class="chartjs-error">{{ dataError }}</div>
          </template>
        </operate-form-item>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">配置</h4>
      
        <operate-form-item>
          <template #name>配置 (JSON)</template>
          <template #content>
            <Textarea
              v-model="optionsJson"
              :rows="8"
              class="chartjs-json-input resize-vertical"
              spellcheck="false"
              placeholder='{"plugins": {"legend": {"position": "top"}}}'
            />
            <div v-if="optionsError" class="chartjs-error">
              {{ optionsError }}
            </div>
          </template>
        </operate-form-item>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">基础</h4>
      
        <operateItemSize
          label="尺寸"
          v-model:width="currentOperatingCanvasChild.width"
          v-model:height="currentOperatingCanvasChild.height"
        />

        <operateItemBackgroundColor
          v-model="currentOperatingCanvasChild.backgroundColor"
        />
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">通用属性</h4>
      
        <operateItemCommonGroup v-model="currentOperatingCanvasChild" />
      
    </section>
  
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemBackgroundColor from "@/components/design/layout/canvas/operate/backgroundColor.vue";
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { currentOperatingCanvasChild } from "../index.tsx";
import { CHART_TYPES } from "../children/chartjs.tsx";

const dataError = ref("");
const optionsError = ref("");

const chartTypes = CHART_TYPES;

const dataJson = computed({
  get() {
    return JSON.stringify(
      currentOperatingCanvasChild.value?.data || {},
      null,
      2,
    );
  },
  set(val: string) {
    dataError.value = "";
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === "object" && parsed !== null) {
        currentOperatingCanvasChild.value.data = parsed;
      } else {
        dataError.value = "请输入 JSON 对象";
      }
    } catch {
      dataError.value = "JSON 格式错误";
    }
  },
});

const optionsJson = computed({
  get() {
    return JSON.stringify(
      currentOperatingCanvasChild.value?.options || {},
      null,
      2,
    );
  },
  set(val: string) {
    optionsError.value = "";
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === "object" && parsed !== null) {
        currentOperatingCanvasChild.value.options = parsed;
      } else {
        optionsError.value = "请输入 JSON 对象";
      }
    } catch {
      optionsError.value = "JSON 格式错误";
    }
  },
});
</script>

<style scoped>
.chartjs-json-input {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.55;
}

.chartjs-error {
  color: #c45656;
  font-size: 12px;
  margin-top: 4px;
}
</style>
