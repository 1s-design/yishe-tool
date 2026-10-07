<template>
  >
    <section class="operate-section">
      <h4 class="operate-section__title">三角纹理</h4>
      
        <operate-form-item>
          <template #name>单元格大小</template>
          <template #content>
            <Input
              type="number"
              :model-value="currentOperatingCanvasChild.cellSize"
              :min="10"
              :max="200"
              :step="5"
              class="h-6 text-[11px]"
              @update:model-value="v => (currentOperatingCanvasChild.cellSize = Number(v))"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>随机度</template>
          <template #content>
            <Slider
              :model-value="[currentOperatingCanvasChild.variance]"
              :min="0"
              :max="1"
              :step="0.05"
              @update:model-value="v => (currentOperatingCanvasChild.variance = v[0])"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>种子</template>
          <template #content>
            <Input
              v-model="currentOperatingCanvasChild.seed"
              class="h-6 text-[11px]"
              placeholder="留空随机"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>X轴颜色</template>
          <template #content>
            <Input
              v-model="currentOperatingCanvasChild.xColors"
              class="h-6 text-[11px]"
              placeholder="random 或 #ff0000,#00ff00"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>Y轴颜色</template>
          <template #content>
            <Input
              v-model="currentOperatingCanvasChild.yColors"
              class="h-6 text-[11px]"
              placeholder="random 或 #ff0000,#00ff00"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>描边宽度</template>
          <template #content>
            <Slider
              :model-value="[currentOperatingCanvasChild.strokeWidth]"
              :min="0"
              :max="5"
              :step="0.1"
              @update:model-value="v => (currentOperatingCanvasChild.strokeWidth = v[0])"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>填充</template>
          <template #content>
            <Switch v-model:checked="currentOperatingCanvasChild.fill" />
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
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { currentOperatingCanvasChild } from "../index.tsx";

</script>
