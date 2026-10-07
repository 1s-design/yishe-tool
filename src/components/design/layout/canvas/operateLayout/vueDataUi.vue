<template>
  >
    <section class="operate-section">
      <h4 class="operate-section__title">组件类型</h4>
      
        <operate-form-item>
          <template #name>图表类型</template>
          <template #content>
            <Select v-model="currentOperatingCanvasChild.component">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue placeholder="选择图表类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup
                  v-for="group in componentGroups"
                  :key="group.label"
                >
                  <SelectLabel>{{ group.label }}</SelectLabel>
                  <SelectItem
                    v-for="item in group.items"
                    :key="item.value"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </template>
        </operate-form-item>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">数据</h4>
      
        <operate-form-item>
          <template #name>数据集</template>
          <template #content>
            <Textarea
              v-model="datasetJson"
              :rows="10"
              class="vue-data-ui-dataset-input resize-y"
              spellcheck="false"
              placeholder='[
  {"name": "项目 A", "values": [30]},
  {"name": "项目 B", "values": [25]}
]'
            ></Textarea>
            <div v-if="datasetError" class="vue-data-ui-error">{{ datasetError }}</div>
          </template>
        </operate-form-item>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">配置</h4>
      
        <operate-form-item>
          <template #name>组件配置</template>
          <template #content>
            <Textarea
              v-model="configJson"
              :rows="8"
              class="vue-data-ui-config-input resize-y"
              spellcheck="false"
              placeholder='{"style": {"chart": {"title": {"text": "标题"}}}}'
            ></Textarea>
            <div v-if="configError" class="vue-data-ui-error">{{ configError }}</div>
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

        <operateItemBackgroundColor v-model="currentOperatingCanvasChild.backgroundColor" />
      
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
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { currentOperatingCanvasChild } from "../index.tsx";
import { VUE_DATA_UI_COMPONENTS } from "../children/vueDataUi.tsx";

const datasetError = ref("");
const configError = ref("");

const componentGroups = computed(() => {
  const groups: Record<string, { value: string; label: string }[]> = {};
  VUE_DATA_UI_COMPONENTS.forEach((item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  });

  const categoryLabels: Record<string, string> = {
    Charts: '图表',
    Mini: '迷你图',
    '3D': '3D',
    Table: '表格',
    Rating: '评分',
  };

  return Object.entries(groups).map(([key, items]) => ({
    label: categoryLabels[key] || key,
    items,
  }));
});

const datasetJson = computed({
  get() {
    return JSON.stringify(currentOperatingCanvasChild.value?.dataset || [], null, 2);
  },
  set(val: string) {
    datasetError.value = "";
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        currentOperatingCanvasChild.value.dataset = parsed;
      } else {
        datasetError.value = "请输入 JSON 数组";
      }
    } catch {
      datasetError.value = "JSON 格式错误";
    }
  },
});

const configJson = computed({
  get() {
    return JSON.stringify(currentOperatingCanvasChild.value?.config || {}, null, 2);
  },
  set(val: string) {
    configError.value = "";
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === 'object' && parsed !== null) {
        currentOperatingCanvasChild.value.config = parsed;
      } else {
        configError.value = "请输入 JSON 对象";
      }
    } catch {
      configError.value = "JSON 格式错误";
    }
  },
});
</script>

<style scoped>
.vue-data-ui-dataset-input,
.vue-data-ui-config-input {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.55;
}

.vue-data-ui-error {
  color: #c45656;
  font-size: 12px;
  margin-top: 4px;
}
</style>
