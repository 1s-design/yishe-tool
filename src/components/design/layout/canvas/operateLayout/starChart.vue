<template>
  >
    <section class="operate-section">
      <h4 class="operate-section__title">星图参数</h4>
      
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
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { currentOperatingCanvasChild } from "../index.tsx";

</script>

<style scoped></style>
