<template>
  <Accordion
    type="multiple"
    :model-value="activeNames"
    @update:model-value="v => (activeNames = v as string[])"
  >
    <AccordionItem value="basic">
      <AccordionTrigger>OpenType 文字</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>文字内容</template>
          <template #content>
            <Textarea
              v-model="currentOperatingCanvasChild.text"
              :rows="3"
              class="resize-y"
              spellcheck="false"
              placeholder="请输入文字内容"
            ></Textarea>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>字体URL</template>
          <template #content>
            <Textarea
              v-model="currentOperatingCanvasChild.fontUrl"
              :rows="3"
              class="resize-y"
              spellcheck="false"
              placeholder="请输入字体文件URL (.ttf, .otf, .woff, .woff2)"
            ></Textarea>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>字号</template>
          <template #content>
            <Input
              type="number"
              :model-value="currentOperatingCanvasChild.fontSize"
              :min="1"
              :max="1000"
              :step="1"
              class="h-6 text-[11px]"
              @update:model-value="v => (currentOperatingCanvasChild.fontSize = Number(v))"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>填充色</template>
          <template #content>
            <!-- TODO: 原 el-color-picker（含透明度），改用项目已有 vue3-colorpicker，绑定纯色字符串 -->
            <div class="color-swatch">
              <ColorPicker
                v-model:pureColor="currentOperatingCanvasChild.fillColor"
                use-type="pure"
                :z-index="99"
              />
            </div>
          </template>
        </operate-form-item>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="size">
      <AccordionTrigger>尺寸</AccordionTrigger>
      <AccordionContent>
        <operateItemSize
          label="尺寸"
          v-model:width="currentOperatingCanvasChild.width"
          v-model:height="currentOperatingCanvasChild.height"
        />
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="common">
      <AccordionTrigger>通用属性</AccordionTrigger>
      <AccordionContent>
        <operateItemCommonGroup v-model="currentOperatingCanvasChild" />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>

<script setup lang="ts">
import { ref } from "vue";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker } from "vue3-colorpicker";
import "vue3-colorpicker/style.css";
import { currentOperatingCanvasChild } from "../index.tsx";

const activeNames = ref(["basic", "size", "common"]);
</script>

<style scoped>
.color-swatch {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
}

.color-swatch :deep(.vc-color-wrap) {
  margin-right: 0 !important;
  width: 100% !important;
  height: 100% !important;
}
</style>
