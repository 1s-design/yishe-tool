<template>
  <Accordion
    type="multiple"
    :model-value="activeNames"
    @update:model-value="v => (activeNames = v as string[])"
  >
    <AccordionItem value="text">
      <AccordionTrigger>文字</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>文字内容</template>
          <template #content>
            <Textarea
              v-model="currentOperatingCanvasChild.text"
              :rows="4"
              class="resize-y"
              spellcheck="false"
              placeholder="输入文字内容"
            ></Textarea>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>字体</template>
          <template #content>
            <Select v-model="currentOperatingCanvasChild.font">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="font in figletFonts"
                  :key="font"
                  :value="font"
                >
                  {{ font }}
                </SelectItem>
              </SelectContent>
            </Select>
          </template>
        </operate-form-item>

        <operateItemFontSize
          label="字体大小"
          v-model="currentOperatingCanvasChild.fontSize"
        ></operateItemFontSize>
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
import operateItemFontSize from "@/components/design/layout/canvas/operate/fontSize.vue";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { currentOperatingCanvasChild } from "../index.tsx";
import { FIGLET_FONTS } from "../children/figlet.tsx";

const activeNames = ref(["text", "basic", "style", "common"]);
const figletFonts = FIGLET_FONTS;
</script>
