<template>
  <operate-form-item>
    <template #icon>
      <icon></icon>
    </template>
    <template #name> 文字描边 </template>
    <template #content>
      <div class="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>颜色</span>
        <color-picker v-model="color" type="pure"></color-picker>
        <span>宽度</span>
        <Popover>
          <PopoverTrigger as-child>
            <div class="flex items-center gap-1" style="width:80px">
              <Input class="h-6 text-[11px] min-w-0 flex-1" type="number" v-model.number="width.value" min="0" step="1" />
              <span class="text-[10px] text-muted-foreground">{{ width.unit }}</span>
            </div>
          </PopoverTrigger>
          <PopoverContent class="w-auto">
            <div class="flex flex-col items-end gap-2">
              <RadioGroup v-model="width.unit" class="flex flex-row flex-wrap items-center gap-3">
                <label v-for="u in unitOptions" :key="u.value" class="flex flex-row flex-wrap items-center gap-3">
                  <RadioGroupItem :value="u.value" />
                  <span class="text-xs">{{ u.label }}</span>
                </label>
              </RadioGroup>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </template>
  </operate-form-item>
</template>

<script setup lang="tsx">
import icon from "@/components/design/assets/icon/text-stroke.svg?component";
import { ref, computed } from "vue";
import { canvasStickerOptions,canvasStickerOptionsOnlyChild } from "@/components/design/layout/canvas/index.tsx";
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const props = defineProps({
  tooltip: {
    default: "",
  },
});

const width = defineModel("width", {});
const color = defineModel("color", {});

const unitOptions = computed(() => {
  return [
    {
      label: `使用当前画布单位(${canvasStickerOptionsOnlyChild.value.width.unit})`,
      value: canvasStickerOptionsOnlyChild.value.width.unit,
    },
    {
      label: "画布宽度百分比",
      value: "vw",
    },
    {
      label: "画布高度度百分比",
      value: "vh",
    },
  ];
});
</script>

<style></style>
