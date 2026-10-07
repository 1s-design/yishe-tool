<template>
  >
    <section class="operate-section">
      <h4 class="operate-section__title">音频波形</h4>
      
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
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">尺寸</h4>
      
        <operateItemSize
          label="尺寸"
          v-model:width="currentOperatingCanvasChild.width"
          v-model:height="currentOperatingCanvasChild.height"
        >
        </operateItemSize>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">通用属性</h4>
      
        <operateItemCommonGroup
          v-model="currentOperatingCanvasChild"
        ></operateItemCommonGroup>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">
        <div class="title">滤镜效果</div>
      </h4>
      
        <operateItemFilterGroup
          v-model="currentOperatingCanvasChild.filter"
        ></operateItemFilterGroup>
      
    </section>

    <operateItemClipPath
      v-model="currentOperatingCanvasChild.clipPath"
    ></operateItemClipPath>
  
</template>

<script setup lang="ts">
import { ref } from "vue";

import operateItemColor from "@/components/design/layout/canvas/operate/color/index.vue";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemBackgroundColor from "@/components/design/layout/canvas/operate/backgroundColor.vue";
import operateItemFilterGroup from "@/components/design/layout/canvas/operate/filter/group.vue";
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";
import operateItemClipPath from "@/components/design/layout/canvas/operate/clipPath/index.vue";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

import { currentOperatingCanvasChild } from "../index.tsx";

</script>

<style></style>
