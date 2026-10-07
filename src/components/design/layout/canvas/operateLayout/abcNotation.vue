<template>
  >
    <section class="operate-section">
      <h4 class="operate-section__title">ABC 记谱法</h4>
      
        <operate-form-item>
          <template #name>乐谱</template>
          <template #content>
            <Textarea
              v-model="currentOperatingCanvasChild.source"
              :rows="12"
              class="abc-notation-source-input resize-vertical"
              spellcheck="false"
              placeholder="X:1
T:小星星
M:4/4
K:C
C C G G | A A G2 | F F E E | D D C2 |"
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

        <operateItemBackgroundColor v-model="currentOperatingCanvasChild.backgroundColor" />
      
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
import { Textarea } from "@/components/ui/textarea";
import { currentOperatingCanvasChild } from "../index.tsx";

</script>

<style scoped>
.abc-notation-source-input {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.55;
}
</style>
