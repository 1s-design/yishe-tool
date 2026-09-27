<template>
  <div class="container flex flex-col items-center">
    <div class="svg-canvas">
      <div :style="{ transform: svgCanvasFitTransform }">
        <svg-canvas class="png-background" ref="svgCanvasRef" :width="svgCanvasWidth"
          :height="svgCanvasHeight"></svg-canvas>
      </div>
    </div>
    <div class="header">
      <div class="flex items-center gap-1 w-full overflow-auto">
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="ghost" class="flex-1">
              添加元素 {{ svgCanvasChildren.length }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto">
            <div class="tags">
              <Badge variant="secondary" class="cursor-pointer rounded-full" @click="add"> 文字 </Badge>
              <div style="flex:1;"></div>
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="ghost">
              画布 {{ svgCanvasWidth }} : {{ svgCanvasHeight }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto">
            <layout></layout>
          </PopoverContent>
        </Popover>

        <Button variant="ghost" @click="exportToPng"> 导出 png </Button>
      </div>
    </div>
    <div class="operate">
      <div class="w-full h-full flex items-center justify-center" v-if="!svgCanvasChildren.length"> 暂无元素 </div>
      <Tabs v-else :model-value="'0'" class="w-full">
        <TabsList class="w-full">
          <TabsTrigger v-for="item, index in svgCanvasChildren" :key="index" :value="String(index)" class="flex-1">
            1
          </TabsTrigger>
        </TabsList>
        <TabsContent v-for="item, index in svgCanvasChildren" :key="index" :value="String(index)" class="mt-2">
          <Accordion type="multiple" :model-value="actives" @update:model-value="v => actives = v as string[]">
            <AccordionItem value="1">
              <AccordionTrigger>
                <div class="title">文字属性</div>
              </AccordionTrigger>
              <AccordionContent>
                <div class="grid grid-cols-2 gap-x-6 gap-y-2 items-center">
                  <div class="col-span-2">
                    <operateItemTextContent v-model="item.textContent"></operateItemTextContent>
                  </div>
                  <div>
                    <operateItemFontSize tooltip="文字大小是相对于画布的宽度，0.1即0.1个画布宽度" v-model="item.fontSize">
                    </operateItemFontSize>
                  </div>
                  <div>
                    <operateItemFontWeight v-model="item.fontWeight"></operateItemFontWeight>
                  </div>
                  <div>
                    <operateItemFontItalic v-model="item.italic"></operateItemFontItalic>
                  </div>
                  <div>
                    <operateItemFontColor v-model="item.fontColor"></operateItemFontColor>
                  </div>

                  <div class="col-span-2">
                    <operateItemFontFamily v-model="item.fontFamilyInfo"></operateItemFontFamily>
                  </div>
                  <div>
                    <operateItemLineHeight v-model="item.lineHeight"></operateItemLineHeight>
                  </div>
                  <div>
                    <operateItemLetterSpacing v-model="item.letterSpacing"></operateItemLetterSpacing>
                  </div>
                  <div>
                    <operate-form-item>
                      <template #icon> <icon-writing-mode></icon-writing-mode> </template>
                      <template #name> 排列方式 </template>
                      <template #content> </template>
                    </operate-form-item>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="2">
              <AccordionTrigger>
                <div class="title">文字位置</div>
              </AccordionTrigger>
              <AccordionContent>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { Canvg } from "canvg";
import {
  svgToBase64,
  downloadByFile,
  svgToFile,
  svgToPngFile,
} from "@/common/transform/index";
import {
  SvgCanvas,
  addSvgCanvasChild,
} from "./template";
import {
  svgCanvasChildren, svgCanvasWidth,
  svgCanvasHeight,
} from '@/components/design/store'
import { onMounted, ref, computed, watch, reactive, watchEffect, nextTick } from "vue";
import operateFormItem from "@/components/design/layout/canvas/operate/operateFormItem.vue";


import iconWritingMode from "@/components/design/assets/icon/writing-mode.svg?component";

import iconBorderWidth from "@/components/design/assets/icon/border-width.svg?component";
import iconBorderStyle from "@/components/design/assets/icon/border-style.svg?component";
import iconBorderColor from "@/components/design/assets/icon/border-color.svg?component";
import { showFontModal } from "../../store";
import operateItemTextContent from '@/components/design/layout/canvas/operate/textContent.vue'
import operateItemFontSize from '@/components/design/layout/canvas/operate/fontSize.vue'
import operateItemFontWeight from '@/components/design/layout/canvas/operate/fontWeight.vue'
import operateItemFontItalic from '@/components/design/layout/canvas/operate/italic.vue'
import operateItemFontColor from '@/components/design/layout/canvas/operate/fontColor.vue'
import operateItemFontFamily from '@/components/design/layout/canvas/operate/fontFamily/fontFamily.vue'
import operateItemLineHeight from '@/components/design/layout/canvas/operate/lineHeight.vue'
import operateItemLetterSpacing from '@/components/design/layout/canvas/operate/letterSpacing.vue'

import layout from './layout.vue'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'


const r = ref();

const actives = ref(["1", "2", "3", "4"]);

const svgCanvasFitTransform = computed(() => {
  const scale = 300 / Math.max(svgCanvasWidth.value, svgCanvasHeight.value)
  const transform = `scale(${scale},${scale})`
  return transform
})



const svgCanvasRef = ref();

function add() {
  addSvgCanvasChild('text');
  document.body.click()
}

async function exportToPng() {
  let png = await svgToPngFile(svgCanvasRef.value);
  downloadByFile(png);
}

async function exportToSvg() {
  let svg = svgToFile(svgCanvasRef.value);
  downloadByFile(svg);
}

</script>

<style lang="less" scoped>
.container {
  width: 320px;
  height: 100%;
}

.svg-canvas {
  width: 300px;
  height: 300px;
  overflow: hidden;
  display: flex;
  margin: 10px;
  align-items: center;
  justify-content: center;

  svg {
    flex-shrink: 0;
  }
}

.operate {
  flex: 1;
  width: 100%;
  overflow: auto;
  padding: 1em 1.5em;
}

.header {
  padding: .4em 1em;
  width: 100%;
}

.tags {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: .8em .4em;
}

.main {
  height: 100%;
  width: 100%;
  overflow: auto;
}

.title {
  font-size: 1rem;
  font-weight: bold;
}
</style>
