<template>
  <Accordion
    type="multiple"
    :model-value="activeNames"
    @update:model-value="v => (activeNames = v as string[])"
  >
    <AccordionItem value="particles">
      <AccordionTrigger>粒子效果</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>预设</template>
          <template #content>
            <Select v-model="currentOperatingCanvasChild.preset">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stars">星星 (Stars)</SelectItem>
                <SelectItem value="bubbles">气泡 (Bubbles)</SelectItem>
                <SelectItem value="snow">雪花 (Snow)</SelectItem>
                <SelectItem value="fire">火焰 (Fire)</SelectItem>
              </SelectContent>
            </Select>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>粒子数量</template>
          <template #content>
            <Input
              type="number"
              :model-value="currentOperatingCanvasChild.particleCount"
              :min="10"
              :max="500"
              :step="10"
              class="h-6 text-[11px]"
              @update:model-value="v => (currentOperatingCanvasChild.particleCount = Number(v))"
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
import { Input } from "@/components/ui/input";
import { currentOperatingCanvasChild } from "../index.tsx";

const activeNames = ref(["particles", "basic", "style", "common"]);
</script>
