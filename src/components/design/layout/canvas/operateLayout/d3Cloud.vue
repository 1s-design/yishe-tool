<template>
  <Accordion
    type="multiple"
    :model-value="activeNames"
    @update:model-value="v => (activeNames = v as string[])"
  >
    <AccordionItem value="basic">
      <AccordionTrigger>基础</AccordionTrigger>
      <AccordionContent>
        <operateItemSize
          label="尺寸"
          v-model:width="currentOperatingCanvasChild.width"
          v-model:height="currentOperatingCanvasChild.height"
        ></operateItemSize>

        <operate-form-item style="align-items: start">
          <template #name>词语数据</template>
          <template #content>
            <Textarea
              v-model="wordsText"
              :rows="5"
              class="resize-vertical"
              placeholder='JSON 格式: [{"text": "Hello", "size": 40}]'
              @change="applyWordsText"
              @blur="applyWordsText"
            />
          </template>
        </operate-form-item>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="presentation">
      <AccordionTrigger>表现</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>字体</template>
          <template #content>
            <Input
              v-model="d3Cloud.fontFamily"
              class="h-6 text-[11px]"
              placeholder="sans-serif"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>字重</template>
          <template #content>
            <Input
              v-model="d3Cloud.fontWeight"
              class="h-6 text-[11px]"
              placeholder="normal / bold / 600"
            />
          </template>
        </operate-form-item>

        <operate-form-item style="align-items: start">
          <template #name>颜色列表</template>
          <template #content>
            <Textarea
              v-model="colorsText"
              :rows="2"
              class="resize-vertical"
              placeholder="#111111, #ff4d6d, #2ec4b6"
              @change="applyColorsText"
              @blur="applyColorsText"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>背景色</template>
          <template #content>
            <!-- TODO: 原 el-color-picker 支持 show-alpha，原生 color input 不支持透明度 -->
            <input
              v-model="backgroundColor"
              type="color"
              class="h-6 w-8 cursor-pointer rounded border border-input bg-transparent p-0"
            />
          </template>
        </operate-form-item>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="layout">
      <AccordionTrigger>布局</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>内边距</template>
          <template #content>
            <Input
              type="number"
              :model-value="d3Cloud.padding"
              :min="0"
              class="h-6 text-[11px]"
              @update:model-value="v => (d3Cloud.padding = Number(v))"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>螺旋方式</template>
          <template #content>
            <Select v-model="d3Cloud.spiral">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="archimedean">阿基米德</SelectItem>
                <SelectItem value="rectangular">矩形</SelectItem>
              </SelectContent>
            </Select>
          </template>
        </operate-form-item>
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
import { computed, ref, watch } from "vue";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { currentOperatingCanvasChild } from "../index.tsx";
import { createDefaultD3CloudOptions } from "../children/d3Cloud.tsx";

const activeNames = ref(["basic", "presentation", "layout", "common"]);
const wordsText = ref("");
const colorsText = ref("");

const d3Cloud = computed(() => {
  const child = currentOperatingCanvasChild.value;
  if (!child.d3Cloud) {
    child.d3Cloud = {
      version: 1,
      ...createDefaultD3CloudOptions(),
    };
  }
  return child.d3Cloud;
});

const backgroundColor = computed({
  get() {
    return d3Cloud.value.backgroundColor || "#ffffff";
  },
  set(value: string) {
    d3Cloud.value.backgroundColor = value;
  },
});

function syncWordsText() {
  wordsText.value = JSON.stringify(d3Cloud.value.words || [], null, 2);
}

function applyWordsText() {
  try {
    const parsed = JSON.parse(wordsText.value);
    if (Array.isArray(parsed)) {
      d3Cloud.value.words = parsed.filter(
        (item) => item && typeof item.text === "string",
      );
    }
  } catch (error) {
    // 忽略解析错误
  }
}

function syncColorsText() {
  colorsText.value = (d3Cloud.value.colors || []).join(", ");
}

function applyColorsText() {
  d3Cloud.value.colors = colorsText.value
    .split(/[,\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

watch(
  d3Cloud,
  () => {
    syncWordsText();
    syncColorsText();
  },
  { immediate: true },
);
</script>
