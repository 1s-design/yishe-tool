<template>
  >
    <section class="operate-section">
      <h4 class="operate-section__title">粒子效果</h4>
      
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { currentOperatingCanvasChild } from "../index.tsx";

</script>
