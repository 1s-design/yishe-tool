<template>
  >
    <section class="operate-section">
      <h4 class="operate-section__title">节点和边</h4>
      
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
              :rows="14"
              class="cytoscape-graph-elements-input resize-vertical"
              spellcheck="false"
              placeholder='{
  "nodes": [
    {"data": {"id": "a", "label": "A"}},
    {"data": {"id": "b", "label": "B"}}
  ],
  "edges": [
    {"data": {"source": "a", "target": "b"}}
  ]
}'
            />
            <div v-if="jsonError" class="cytoscape-graph-json-error">
              {{ jsonError }}
            </div>
          </template>
        </operate-form-item>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">样式</h4>
      
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
import { ref, computed, watch } from "vue";
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

const jsonError = ref("");

const elementsJson = computed({
  get() {
    return JSON.stringify(
      currentOperatingCanvasChild.value?.elements || { nodes: [], edges: [] },
      null,
      2,
    );
  },
  set(val: string) {
    jsonError.value = "";
    try {
      const parsed = JSON.parse(val);
      if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed)) {
          currentOperatingCanvasChild.value.elements = {
            nodes: parsed.filter((el: any) => el.data && !el.data.source),
            edges: parsed.filter((el: any) => el.data && el.data.source),
          };
        } else {
          currentOperatingCanvasChild.value.elements = parsed;
        }
      } else {
        jsonError.value = "请输入 JSON 对象";
      }
    } catch {
      jsonError.value = "JSON 格式错误";
    }
  },
});

const nodeColor = computed({
  get() {
    return currentOperatingCanvasChild.value?.style?.nodeColor || "#4A90D9";
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
    return currentOperatingCanvasChild.value?.style?.edgeColor || "#666666";
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
    return currentOperatingCanvasChild.value?.style?.labelColor || "#333333";
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
.cytoscape-graph-elements-input {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.55;
}

.cytoscape-graph-json-error {
  color: #c45656;
  font-size: 12px;
  margin-top: 4px;
}
</style>
