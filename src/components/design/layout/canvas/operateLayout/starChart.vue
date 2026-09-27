<template>
  <Accordion
    type="multiple"
    :model-value="activeNames"
    @update:model-value="v => (activeNames = v as string[])"
  >
    <AccordionItem value="params">
      <AccordionTrigger>星图参数</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>日期时间</template>
          <template #content>
            <Input
              type="datetime-local"
              v-model="currentOperatingCanvasChild.date"
              class="h-6 text-[11px]"
              placeholder="留空表示当前时间"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>纬度</template>
          <template #content>
            <div class="flex w-full items-center gap-2">
              <Slider
                class="flex-1"
                :model-value="[currentOperatingCanvasChild.latitude]"
                :min="-90"
                :max="90"
                :step="0.1"
                @update:model-value="v => (currentOperatingCanvasChild.latitude = v[0])"
              />
              <Input
                type="number"
                class="h-6 w-16 text-[11px]"
                :model-value="currentOperatingCanvasChild.latitude"
                :min="-90"
                :max="90"
                :step="0.1"
                @update:model-value="v => (currentOperatingCanvasChild.latitude = Number(v))"
              />
            </div>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>经度</template>
          <template #content>
            <div class="flex w-full items-center gap-2">
              <Slider
                class="flex-1"
                :model-value="[currentOperatingCanvasChild.longitude]"
                :min="-180"
                :max="180"
                :step="0.1"
                @update:model-value="v => (currentOperatingCanvasChild.longitude = v[0])"
              />
              <Input
                type="number"
                class="h-6 w-16 text-[11px]"
                :model-value="currentOperatingCanvasChild.longitude"
                :min="-180"
                :max="180"
                :step="0.1"
                @update:model-value="v => (currentOperatingCanvasChild.longitude = Number(v))"
              />
            </div>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>显示星座线</template>
          <template #content>
            <Switch v-model:checked="currentOperatingCanvasChild.showConstellations" />
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
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { currentOperatingCanvasChild } from "../index.tsx";

const activeNames = ref(["params", "basic", "style", "common"]);
</script>

<style scoped></style>
