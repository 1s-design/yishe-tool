<template>
  <Accordion
    type="multiple"
    :model-value="activeNames"
    @update:model-value="v => (activeNames = v as string[])"
  >
    <AccordionItem value="data">
      <AccordionTrigger>节点和边</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>布局方向</template>
          <template #content>
            <Select v-model="currentOperatingCanvasChild.rankdir">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TB">从上到下 (TB)</SelectItem>
                <SelectItem value="LR">从左到右 (LR)</SelectItem>
                <SelectItem value="BT">从下到上 (BT)</SelectItem>
                <SelectItem value="RL">从右到左 (RL)</SelectItem>
              </SelectContent>
            </Select>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>节点数据</template>
          <template #content>
            <Textarea
              v-model="nodesJson"
              :rows="6"
              class="dagre-graph-json-input resize-vertical"
              spellcheck="false"
              placeholder='[
  {"id": "a", "label": "A"},
  {"id": "b", "label": "B"}
]'
            />
            <div v-if="nodesJsonError" class="dagre-graph-json-error">
              {{ nodesJsonError }}
            </div>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>边数据</template>
          <template #content>
            <Textarea
              v-model="edgesJson"
              :rows="6"
              class="dagre-graph-json-input resize-vertical"
              spellcheck="false"
              placeholder='[
  {"from": "a", "to": "b"}
]'
            />
            <div v-if="edgesJsonError" class="dagre-graph-json-error">
              {{ edgesJsonError }}
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { currentOperatingCanvasChild } from "../index.tsx";

const activeNames = ref(["data", "basic", "common"]);
const nodesJsonError = ref("");
const edgesJsonError = ref("");

const nodesJson = computed({
  get() {
    return JSON.stringify(
      currentOperatingCanvasChild.value?.nodes || [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      null,
      2,
    );
  },
  set(val: string) {
    nodesJsonError.value = "";
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        currentOperatingCanvasChild.value.nodes = parsed;
      } else {
        nodesJsonError.value = "请输入 JSON 数组";
      }
    } catch {
      nodesJsonError.value = "JSON 格式错误";
    }
  },
});

const edgesJson = computed({
  get() {
    return JSON.stringify(
      currentOperatingCanvasChild.value?.edges || [{ from: "a", to: "b" }],
      null,
      2,
    );
  },
  set(val: string) {
    edgesJsonError.value = "";
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        currentOperatingCanvasChild.value.edges = parsed;
      } else {
        edgesJsonError.value = "请输入 JSON 数组";
      }
    } catch {
      edgesJsonError.value = "JSON 格式错误";
    }
  },
});
</script>

<style scoped>
.dagre-graph-json-input {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.55;
}

.dagre-graph-json-error {
  color: #c45656;
  font-size: 12px;
  margin-top: 4px;
}
</style>
