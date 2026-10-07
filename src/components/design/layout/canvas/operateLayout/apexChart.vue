<template>
  >
    <section class="operate-section">
      <h4 class="operate-section__title">配置</h4>
      
        <operate-form-item>
          <template #name>Options (JSON)</template>
          <template #content>
            <Textarea
              v-model="optionsJson"
              :rows="12"
              class="apexchart-json-input resize-vertical"
              spellcheck="false"
              placeholder='{
  "chart": { "type": "bar" },
  "series": [{ "name": "Sample", "data": [30, 40, 35, 50, 49] }],
  "xaxis": { "categories": ["A", "B", "C", "D", "E"] }
}'
            />
            <div v-if="optionsError" class="apexchart-error">
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
import { Textarea } from "@/components/ui/textarea";
import { currentOperatingCanvasChild } from "../index.tsx";

const optionsError = ref("");

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
.apexchart-json-input {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.55;
}

.apexchart-error {
  color: #c45656;
  font-size: 12px;
  margin-top: 4px;
}
</style>
