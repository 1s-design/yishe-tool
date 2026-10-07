<template>
  >
    <section class="operate-section">
      <h4 class="operate-section__title">撒花效果</h4>
      
        <operate-form-item>
          <template #name>预设</template>
          <template #content>
            <Select v-model="currentOperatingCanvasChild.preset">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">默认</SelectItem>
                <SelectItem value="fireworks">烟花</SelectItem>
                <SelectItem value="snow">雪花</SelectItem>
                <SelectItem value="celebration">庆祝</SelectItem>
                <SelectItem value="school">校园</SelectItem>
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

        <operate-form-item>
          <template #name>扩散角度</template>
          <template #content>
            <Slider
              :model-value="[currentOperatingCanvasChild.spread]"
              :min="10"
              :max="180"
              :step="5"
              @update:model-value="v => (currentOperatingCanvasChild.spread = v[0])"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>初始速度</template>
          <template #content>
            <Slider
              :model-value="[currentOperatingCanvasChild.startVelocity]"
              :min="10"
              :max="100"
              :step="5"
              @update:model-value="v => (currentOperatingCanvasChild.startVelocity = v[0])"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>衰减</template>
          <template #content>
            <Slider
              :model-value="[currentOperatingCanvasChild.decay]"
              :min="0.5"
              :max="1"
              :step="0.05"
              @update:model-value="v => (currentOperatingCanvasChild.decay = v[0])"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>重力</template>
          <template #content>
            <Slider
              :model-value="[currentOperatingCanvasChild.gravity]"
              :min="0"
              :max="3"
              :step="0.1"
              @update:model-value="v => (currentOperatingCanvasChild.gravity = v[0])"
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
        />
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">样式</h4>
      
        <operateItemBackgroundColor
          v-model="currentOperatingCanvasChild.backgroundColor"
        />
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">通用属性</h4>
      
        <operateItemCommonGroup v-model="currentOperatingCanvasChild" />
      
    </section>
  
</template>

<script setup lang="ts">
import { ref } from "vue";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemBackgroundColor from "@/components/design/layout/canvas/operate/backgroundColor.vue";
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { currentOperatingCanvasChild } from "../index.tsx";

</script>
