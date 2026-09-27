<template>
  <Accordion
    type="multiple"
    :model-value="activeNames"
    @update:model-value="v => (activeNames = v as string[])"
  >
    <AccordionItem value="noise">
      <AccordionTrigger>噪声参数</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>缩放 (Scale)</template>
          <template #content>
            <div class="flex w-full items-center gap-2">
              <Slider
                class="flex-1"
                :model-value="[currentOperatingCanvasChild.scale]"
                :min="10"
                :max="200"
                :step="1"
                @update:model-value="v => (currentOperatingCanvasChild.scale = v[0])"
              />
              <Input
                type="number"
                class="h-6 w-16 text-[11px]"
                :model-value="currentOperatingCanvasChild.scale"
                :min="10"
                :max="200"
                :step="1"
                @update:model-value="v => (currentOperatingCanvasChild.scale = Number(v))"
              />
            </div>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>八度 (Octaves)</template>
          <template #content>
            <div class="flex w-full items-center gap-2">
              <Slider
                class="flex-1"
                :model-value="[currentOperatingCanvasChild.octaves]"
                :min="1"
                :max="8"
                :step="1"
                @update:model-value="v => (currentOperatingCanvasChild.octaves = v[0])"
              />
              <Input
                type="number"
                class="h-6 w-16 text-[11px]"
                :model-value="currentOperatingCanvasChild.octaves"
                :min="1"
                :max="8"
                :step="1"
                @update:model-value="v => (currentOperatingCanvasChild.octaves = Number(v))"
              />
            </div>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>持续度 (Persistence)</template>
          <template #content>
            <div class="flex w-full items-center gap-2">
              <Slider
                class="flex-1"
                :model-value="[currentOperatingCanvasChild.persistence]"
                :min="0"
                :max="1"
                :step="0.05"
                @update:model-value="v => (currentOperatingCanvasChild.persistence = v[0])"
              />
              <Input
                type="number"
                class="h-6 w-16 text-[11px]"
                :model-value="currentOperatingCanvasChild.persistence"
                :min="0"
                :max="1"
                :step="0.05"
                @update:model-value="v => (currentOperatingCanvasChild.persistence = Number(v))"
              />
            </div>
          </template>
        </operate-form-item>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="colors">
      <AccordionTrigger>渐变颜色</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>颜色 1</template>
          <template #content>
            <color-picker
              v-model="currentOperatingCanvasChild.color1"
            ></color-picker>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>颜色 2</template>
          <template #content>
            <color-picker
              v-model="currentOperatingCanvasChild.color2"
            ></color-picker>
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

    <AccordionItem value="style">
      <AccordionTrigger>样式</AccordionTrigger>
      <AccordionContent>
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
import { ref } from "vue";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";
import operateItemBackgroundColor from "@/components/design/layout/canvas/operate/backgroundColor.vue";
import colorPicker from "@/components/design/layout/canvas/operate/color/index.vue";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { currentOperatingCanvasChild } from "../index.tsx";

const activeNames = ref(["noise", "colors", "basic", "style", "common"]);
</script>

<style scoped></style>
