<template>
  <operate-form-item>
    <template #icon> <icon-position></icon-position> </template>
    <template #name> 显示位置 </template>
    <template #content>
      <Popover>
        <PopoverTrigger as-child>
          <Button size="sm" variant="link">{{ positionLabel }}</Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto">
        <div>
          <div
            v-if="active == 'params'"
            class="flex flex-col items-center"
            style="width: 160px; row-gap: 0.2rem"
          >
            <div class="w-full">
              <div class="flex items-center justify-between">
                <span style="font-weight: bold; padding: 1em 0">优先级自上而下排列 </span>
              </div>
            </div>
            <div class="flex w-full items-center">
              <div class="w-1/3">整体居中</div>
              <div class="w-2/3 content">
                <Switch v-model:checked="model.center"></Switch>
              </div>
            </div>
            <div class="flex w-full items-center">
              <div class="w-1/3">垂直居中</div>
              <div class="w-2/3 content">
                <Switch v-model:checked="model.verticalCenter"></Switch>
              </div>
            </div>
            <div class="flex w-full items-center">
              <div class="w-1/3">水平居中</div>
              <div class="w-2/3 content">
                <Switch v-model:checked="model.horizontalCenter"></Switch>
              </div>
            </div>
            <template v-for="item in positionOptions">
              <div class="flex w-full items-center">
                <div class="w-1/3">{{ item.label }}</div>
                <div class="w-2/3">
                  <Popover>
                    <PopoverTrigger as-child>
                      <div class="content">
                        <div class="flex items-center gap-1" style="width: 80px">
                          <Input
                            class="h-6 text-[11px] min-w-0 flex-1"
                            min="0"
                            step="1"
                            type="number"
                            v-model.number="model[item.type].value"
                          />
                          <span class="text-[10px] text-muted-foreground">
                            {{ model[item.type].unit }}
                          </span>
                        </div>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent side="right" class="w-auto">
                      <div class="flex items-end justify-end">
                        <RadioGroup v-model="model[item.type].unit" class="flex flex-row flex-wrap items-center gap-3">
                          <label v-for="(u, index) in unitOptions" :key="u.value" class="flex flex-row flex-wrap items-center gap-3">
                            <RadioGroupItem :value="u.value" />
                            <span class="text-xs">{{ u.label }}</span>
                          </label>
                        </RadioGroup>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </template>
            <div class="w-full">
              <div style="height: 30px" class="flex items-center">
                <Button @click="active = 'drag'" class="w-full" size="sm" variant="outline">
                  <Crosshair />手动调整
                </Button>
              </div>
            </div>
          </div>

          <div v-if="active == 'drag'">
            <dragger
              ref="draggerRef"
              v-bind="draggerAttrs"
              v-model="draggerValue"
              @init="draggerInit"
              @drag="draggerDrag"
            >
            </dragger>

            <div class="flex w-full items-center" style="margin-top: 1rem">
              <Button variant="link" @click="active = 'params'">
                <ChevronLeft />返回
              </Button>
              <Button @click="reset" variant="link">
                <Redo2></Redo2>
                重置位置
              </Button>
            </div>
          </div>
        </div>
        </PopoverContent>
      </Popover>
    </template>
  </operate-form-item>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import iconPosition from "@/components/design/assets/icon/position.svg?component";
import {
  getPositionInfoFromOptions,
  getPositionLabelFromOptions,
  formatSizeOptionToPixelValue,
} from "@/components/design/layout/canvas/helper.tsx";
import {
  canvasStickerOptions,
  currentOperatingCanvasChild,
  canvasStickerOptionsOnlyChild,
} from "@/components/design/layout/canvas/index.tsx";
import dragger from "./dragger.vue";
import Utils from "@/common/utils";

import { ChevronLeft, Crosshair, Redo2 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const model = defineModel({
  default: {} as any,
});

const active = ref("params");

const positionLabel = computed(() => {
  return getPositionLabelFromOptions(model.value);
});

/*
 像素
 宽度百分比，
 高度百分比
*/

const draggerRef = ref();

function reset() {
  draggerRef.value.reset();
}

const draggerValue = ref({
  x: 0,
  y: 0,
});

const draggerAttrs = computed(() => {
  // 计算 宽高，子元素宽高 缩放尺寸
  const containerWidth = formatSizeOptionToPixelValue({
    value: canvasStickerOptionsOnlyChild.value.width.value,
    unit: canvasStickerOptionsOnlyChild.value.width.unit,
  });

  const containerHeight = formatSizeOptionToPixelValue({
    value: canvasStickerOptionsOnlyChild.value.height.value,
    unit: canvasStickerOptionsOnlyChild.value.height.unit,
  });

  // 控制拖拽板的大小
  let scale = 240 / Math.max(containerWidth, containerHeight);

  return {
    scale: scale,
    containerWidth: containerWidth,
    containerHeight: containerHeight,
    targetWidth: currentOperatingCanvasChild.value.targetComputedWidth,
    targetHeight: currentOperatingCanvasChild.value.targetComputedHeight,
  };
});

function draggerInit() {
  // 确认使用拖拽，清理参数 状态，

  // 初始化需要重新计算拖拽的长度

  model.value.center = false;
  model.value.horizontalCenter = false;
  model.value.verticalCenter = false;
  model.value.top.value = 0;
  model.value.left.value = 0;
}

// 实时拖拽触发
function draggerDrag(pos) {
  let { x, y } = pos;

  var top, left;

  top = Number(top);
  left = Number(left);

  // 强制把单位调整为画布单位
  let canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  if (canvasUnit == "px") {
    top = y;
    left = x;
  }

  if (canvasUnit == "cm") {
    top = Utils.pxToCM(y);
    left = Utils.pxToCM(x);
  }

  if (canvasUnit == "mm") {
    top = Utils.pxToMM(y);
    left = Utils.pxToMM(x);
  }

  if (canvasUnit == "in") {
    top = Utils.pxToIn(y);
    left = Utils.pxToIn(x);
  }

  model.value.top.value = top;
  model.value.left.value = left;
}

const unitOptions = computed(() => {
  return [
    {
      label: `使用当前画布单位(${canvasStickerOptionsOnlyChild.value.width.unit})`,
      value: canvasStickerOptionsOnlyChild.value.width.unit,
    },
    {
      label: "相对于画布宽的百分比",
      value: "vw",
    },
    {
      label: "相对于画布高的百分比",
      value: "vh",
    },
  ];
});

const positionOptions = ref([
  {
    label: "距离顶部",
    type: "top",
  },
  {
    label: "距离左侧",
    type: "left",
  },
  {
    label: "距离底部",
    type: "bottom",
  },
  {
    label: "距离右侧",
    type: "right",
  },
]);
</script>

<style scoped lang="less">
.content {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: end;
}
</style>
