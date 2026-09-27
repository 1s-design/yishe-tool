<template>
  <Accordion
    type="multiple"
    :model-value="waveformCollapseActives"
    @update:model-value="v => (waveformCollapseActives = v as string[])"
  >
    <AccordionItem value="1">
      <AccordionTrigger>音频波形</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #icon><icon></icon></template>
          <template #name>音频URL</template>
          <template #content>
            <Input
              v-model="currentOperatingCanvasChild.audioUrl"
              placeholder="请输入音频URL"
              class="h-6 text-[11px]"
            >
            </Input>
          </template>
        </operate-form-item>

        <operateItemColor
          label="波形色"
          v-model="currentOperatingCanvasChild.waveColor"
        >
        </operateItemColor>

        <operateItemColor
          label="进度色"
          v-model="currentOperatingCanvasChild.progressColor"
        >
        </operateItemColor>

        <operate-form-item>
          <template #icon><icon></icon></template>
          <template #name>波形高度</template>
          <template #content>
            <Slider
              :model-value="[currentOperatingCanvasChild.height]"
              :min="20"
              :max="300"
              :step="1"
              @update:model-value="v => (currentOperatingCanvasChild.height = v[0])"
            >
            </Slider>
          </template>
        </operate-form-item>

        <operateItemBackgroundColor
          v-model="currentOperatingCanvasChild.backgroundColor"
        >
        </operateItemBackgroundColor>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="2">
      <AccordionTrigger>尺寸</AccordionTrigger>
      <AccordionContent>
        <operateItemSize
          label="尺寸"
          v-model:width="currentOperatingCanvasChild.width"
          v-model:height="currentOperatingCanvasChild.height"
        >
        </operateItemSize>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="3">
      <AccordionTrigger>通用属性</AccordionTrigger>
      <AccordionContent>
        <operateItemCommonGroup
          v-model="currentOperatingCanvasChild"
        ></operateItemCommonGroup>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="4">
      <AccordionTrigger>
        <div class="title">滤镜效果</div>
      </AccordionTrigger>
      <AccordionContent>
        <operateItemFilterGroup
          v-model="currentOperatingCanvasChild.filter"
        ></operateItemFilterGroup>
      </AccordionContent>
    </AccordionItem>

    <operateItemClipPath
      v-model="currentOperatingCanvasChild.clipPath"
    ></operateItemClipPath>
  </Accordion>
</template>

<script setup lang="ts">
import { ref } from "vue";

import operateItemColor from "@/components/design/layout/canvas/operate/color/index.vue";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemBackgroundColor from "@/components/design/layout/canvas/operate/backgroundColor.vue";
import operateItemFilterGroup from "@/components/design/layout/canvas/operate/filter/group.vue";
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";
import operateItemClipPath from "@/components/design/layout/canvas/operate/clipPath/index.vue";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

import { currentOperatingCanvasChild } from "../index.tsx";

const waveformCollapseActives = ref(["1", "2", "3", "4"]);
</script>

<style></style>
