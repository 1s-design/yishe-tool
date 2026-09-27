<template>
  <operate-form-item>
    <template #icon>
      <icon></icon>
    </template>
    <template #name> 边距 </template>
    <template #content>
      <Popover>
        <PopoverTrigger as-child>
          <Button variant="ghost" size="sm">
            <Tooltip>
              <TooltipTrigger as-child>
                <div class="text-ellipsis overflow-hidden max-w-[200px]">边距设置</div>
              </TooltipTrigger>
              <TooltipContent side="top">边距设置</TooltipContent>
            </Tooltip>
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-[160px]">
          <div>
            <div class="font-bold py-4">边距设置</div>

            <template v-for="item in marginOptions">
              <div class="flex items-center">
                <div class="w-1/3">{{ item.label }}</div>
                <div class="w-2/3 input-item">
                  <Popover>
                    <PopoverTrigger as-child>
                      <div class="relative w-[80px]">
                        <Input type="number" v-model.number="model[item.type].value" class="h-6 pr-8 text-[11px]" min="0" step="1" />
                        <div class="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{{ model[item.type].unit }}</div>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent side="right" class="w-[180px]">
                      <div class="flex items-center justify-end">
                        <div class="w-full">
                          <RadioGroup v-model="model[item.type].unit" class="grid gap-1">
                            <label v-for="u in unitOptions" :key="u.value" class="flex items-center gap-2 cursor-pointer">
                              <RadioGroupItem :value="u.value" />
                              <span class="text-xs">{{ u.label }}</span>
                            </label>
                          </RadioGroup>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </template>
            <div class="input-item">
              <Button size="sm" variant="outline" class="w-full" @click="reset">
                重置间距
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </template>
  </operate-form-item>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import icon from "@/components/design/assets/icon/margin.svg?component";
import { canvasStickerOptions,canvasStickerOptionsOnlyChild } from "@/components/design/layout/canvas/index.tsx";
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

/*
   margin 存在五种单位
   像素
   相对于画布的宽
   相对于画布的高
   相对于当前元素的宽
   相对于当起元素的高
  */

const model = defineModel({
  default: {
    top: {
      unit: "px",
      value: 0,
    },
    right: {
      unit: "px",
      value: 0,
    },
    bottom: {
      unit: "px",
      value: 0,
    },
    left: {
      unit: "px",
      value: 0,
    },
  },
});

function reset() {
  function newVal() {
    return { value: 0, unit: "px" };
  }

  model.value = {
    top: newVal(),
    right: newVal(),
    bottom: newVal(),
    left: newVal(),
  };
}

const marginOptions = ref([
  {
    type: "top",
    label: "上间距",
  },
  {
    type: "right",
    label: "右间距",
  },
  {
    type: "bottom",
    label: "下间距",
  },
  {
    type: "left",
    label: "左间距",
  },
]);

const unitOptions = computed(() => {
  return [
    {
      label: `使用当前画布单位(${canvasStickerOptionsOnlyChild.value.width.unit})`,
      value: canvasStickerOptionsOnlyChild.value.width.unit,
    },

    /**
     * @description 这几个单位暂时先不考虑支持
     */
    // {
    //   label: "相对于画布宽的百分比",
    //   value: "vw",
    // },
    // {
    //   label: "相对于画布高的百分比",
    //   value: "vh",
    // },
    // {
    //   label: "相对于当前元素宽的百分比",
    //   value: "%w",
    // },
    // {
    //   label: "相对于当前元素高的百分比",
    //   value: "%h",
    // },
  ];
});
</script>

<style scoped lang="less">
.input-item {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: end;
}
</style>
