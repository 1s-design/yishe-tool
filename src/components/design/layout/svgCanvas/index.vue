<template>
  <div class="container flex flex-col items-center">
    <div class="svg-canvas">
      <div :style="{ transform: svgCanvasFitTransform }">
        <svg-canvas class="png-background" ref="svgCanvasRef" :width="svgCanvasWidth"
          :height="svgCanvasHeight"></svg-canvas>
      </div>
    </div>
    <div class="header">
      <el-button-group link style="width: 100%; display: flex;overflow:auto;">
        <el-popover trigger="click">
          <div class="tags">
            <el-tag @click="add" round> 文字 </el-tag>
            <div style="flex:1;"></div>
          </div>
          <template #reference>
            <el-button style="flex: 1">
              添加元素 {{ svgCanvasChildren.length }}
            </el-button>
          </template>
        </el-popover>
        <el-popover trigger="click">
          <layout></layout>
          <template #reference>
            <el-button>
              画布 {{ svgCanvasWidth }} : {{ svgCanvasHeight }}
            </el-button>
          </template>
        </el-popover>

        <el-button @click="exportToPng"> 导出 png </el-button>
      </el-button-group>
    </div>
    <div class="operate">
      <div class="w-full h-full flex items-center justify-center" v-if="!svgCanvasChildren.length"> 暂无元素 </div>
      <el-tabs v-else tab-position="top">
        <el-tab-pane v-for="item, index in svgCanvasChildren" label="1">
          <el-collapse v-model="actives">
            <el-collapse-item name="1">
              <template #title>
                <div class="title">文字属性</div>
              </template>
              <el-row :gutter="24" align="middle">
                <el-col :span="24">
                  <operateItemTextContent v-model="item.textContent"></operateItemTextContent>
                </el-col>
                <el-col :span="12">
                  <operateItemFontSize tooltip="文字大小是相对于画布的宽度，0.1即0.1个画布宽度" v-model="item.fontSize">
                  </operateItemFontSize>
                </el-col>
                <el-col :span="12">
                  <operateItemFontWeight v-model="item.fontWeight"></operateItemFontWeight>
                </el-col>
                <el-col :span="12">
                  <operateItemFontItalic v-model="item.italic"></operateItemFontItalic>
                </el-col>
                <el-col :span="12">
                  <operateItemFontColor v-model="item.fontColor"></operateItemFontColor>
                </el-col>

                <el-col :span="24">
                  <operateItemFontFamily v-model="item.fontFamilyInfo"></operateItemFontFamily>
                </el-col>
                <el-col :span="12">
                  <operateItemLineHeight v-model="item.lineHeight"></operateItemLineHeight>
                </el-col>
                <el-col :span="12">
                  <operateItemLetterSpacing v-model="item.letterSpacing"></operateItemLetterSpacing>
                </el-col>
                <el-col :span="12">
                  <operate-form-item>
                    <template #icon> <icon-writing-mode></icon-writing-mode> </template>
                    <template #name> 排列方式 </template>
                    <template #content> </template>
                  </operate-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>
            <el-collapse-item name="2">
              <template #title>
                <div class="title">文字位置</div>
              </template>
            </el-collapse-item>
          </el-collapse>
        </el-tab-pane>
      </el-tabs>
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

  :deep(.el-tag) {
    cursor: pointer;
  }
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
