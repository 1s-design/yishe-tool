<template>
  >
    <section class="operate-section">
      <h4 class="operate-section__title">噪声参数</h4>
      
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
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">渐变颜色</h4>
      
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
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">基础</h4>
      
        <operateItemSize
          label="尺寸"
          v-model:width="currentOperatingCanvasChild.width"
          v-model:height="currentOperatingCanvasChild.height"
        ></operateItemSize>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">样式</h4>
      
        <operateItemBackgroundColor
          v-model="currentOperatingCanvasChild.backgroundColor"
        ></operateItemBackgroundColor>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">通用属性</h4>
      
        <operateItemCommonGroup
          v-model="currentOperatingCanvasChild"
        ></operateItemCommonGroup>
      
    </section>
  
</template>

<script setup lang="ts">
import { ref } from "vue";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";
import operateItemBackgroundColor from "@/components/design/layout/canvas/operate/backgroundColor.vue";
import colorPicker from "@/components/design/layout/canvas/operate/color/index.vue";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { currentOperatingCanvasChild } from "../index.tsx";

</script>

<style scoped></style>
