<template>
  >
    <section class="operate-section">
      <h4 class="operate-section__title">文字</h4>
      
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
import operateItemFontSize from "@/components/design/layout/canvas/operate/fontSize.vue";
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

const figletFonts = FIGLET_FONTS;
</script>
