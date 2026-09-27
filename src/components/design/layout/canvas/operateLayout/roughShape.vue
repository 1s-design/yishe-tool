<template>
  <Accordion
    type="multiple"
    :model-value="activeNames"
    @update:model-value="v => (activeNames = v as string[])"
  >
    <AccordionItem value="shape">
      <AccordionTrigger>形状设置</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>形状类型</template>
          <template #content>
            <Select v-model="currentOperatingCanvasChild.shape">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rect">矩形</SelectItem>
                <SelectItem value="circle">圆形</SelectItem>
                <SelectItem value="line">线条</SelectItem>
                <SelectItem value="ellipse">椭圆</SelectItem>
              </SelectContent>
            </Select>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>填充色</template>
          <template #content>
            <!-- TODO: 原 el-color-picker（含透明度），改用项目已有 vue3-colorpicker，绑定纯色字符串 -->
            <div class="color-swatch">
              <ColorPicker
                v-model:pureColor="currentOperatingCanvasChild.fill"
                use-type="pure"
                :z-index="99"
              />
            </div>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>描边色</template>
          <template #content>
            <!-- TODO: 原 el-color-picker（含透明度），改用项目已有 vue3-colorpicker，绑定纯色字符串 -->
            <div class="color-swatch">
              <ColorPicker
                v-model:pureColor="currentOperatingCanvasChild.stroke"
                use-type="pure"
                :z-index="99"
              />
            </div>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>描边宽度</template>
          <template #content>
            <div class="flex w-full items-center gap-2">
              <Slider
                class="flex-1"
                :model-value="[currentOperatingCanvasChild.strokeWidth]"
                :min="1"
                :max="10"
                :step="0.5"
                @update:model-value="v => (currentOperatingCanvasChild.strokeWidth = v[0])"
              />
              <Input
                type="number"
                class="h-6 w-16 text-[11px]"
                :model-value="currentOperatingCanvasChild.strokeWidth"
                :min="1"
                :max="10"
                :step="0.5"
                @update:model-value="v => (currentOperatingCanvasChild.strokeWidth = Number(v))"
              />
            </div>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>粗糙度</template>
          <template #content>
            <div class="flex w-full items-center gap-2">
              <Slider
                class="flex-1"
                :model-value="[currentOperatingCanvasChild.roughness]"
                :min="0"
                :max="5"
                :step="0.1"
                @update:model-value="v => (currentOperatingCanvasChild.roughness = v[0])"
              />
              <Input
                type="number"
                class="h-6 w-16 text-[11px]"
                :model-value="currentOperatingCanvasChild.roughness"
                :min="0"
                :max="5"
                :step="0.1"
                @update:model-value="v => (currentOperatingCanvasChild.roughness = Number(v))"
              />
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
import { ref } from "vue";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
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
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ColorPicker } from "vue3-colorpicker";
import "vue3-colorpicker/style.css";
import { currentOperatingCanvasChild } from "../index.tsx";

const activeNames = ref(["shape", "basic", "common"]);
</script>

<style scoped>
.rough-shape-settings {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.color-swatch {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
}

.color-swatch :deep(.vc-color-wrap) {
  margin-right: 0 !important;
  width: 100% !important;
  height: 100% !important;
}
</style>
