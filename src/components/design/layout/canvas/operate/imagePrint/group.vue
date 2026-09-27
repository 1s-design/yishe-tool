<template>
  <div class="image-print-group">
    <operate-form-item>
      <template #icon>
        <icon-background></icon-background>
      </template>
      <template #name> 铺图方式 </template>
      <template #content>
        <Select v-model="printEffect.fillMode">
          <SelectTrigger class="h-6 text-[11px]" style="width: 150px">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="item in ImageFillModeOptions"
              :key="item.value"
              :value="item.value"
            >
              <span> {{ item.label }} </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </template>
    </operate-form-item>

    <template v-if="printEffect.fillMode === ImageFillMode.TILE">
      <operate-form-item>
        <template #icon>
          <icon-size></icon-size>
        </template>
        <template #name> 平铺尺寸 </template>
        <template #content>
          <div class="image-print-row">
            <span class="mini-label">方向</span>
            <Select v-model="printEffect.pattern.repeatMode">
              <SelectTrigger class="h-6 text-[11px]" style="width: 110px">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="item in ImagePatternRepeatOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  <span> {{ item.label }} </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <span class="mini-label">宽度</span>
            <size-input
              v-model="printEffect.pattern.tileWidth.value"
              v-model:unit="printEffect.pattern.tileWidth.unit"
              :unit-options="unitOptions"
              placeholder="图案宽度"
            >
            </size-input>
          </div>
        </template>
      </operate-form-item>

      <operate-form-item>
        <template #icon>
          <icon-position></icon-position>
        </template>
        <template #name> 平铺偏移 </template>
        <template #content>
          <div class="image-print-row">
            <span class="mini-label">X</span>
            <size-input
              v-model="printEffect.pattern.offsetX.value"
              v-model:unit="printEffect.pattern.offsetX.unit"
              :unit-options="unitOptions"
              placeholder="偏移 X"
            >
            </size-input>
            <span class="mini-label">Y</span>
            <size-input
              v-model="printEffect.pattern.offsetY.value"
              v-model:unit="printEffect.pattern.offsetY.unit"
              :unit-options="unitOptions"
              placeholder="偏移 Y"
            >
            </size-input>
          </div>
        </template>
      </operate-form-item>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import iconBackground from "@/components/design/assets/icon/background-image.svg?component";
import iconSize from "@/components/design/assets/icon/size.svg?component";
import iconPosition from "@/components/design/assets/icon/position.svg?component";
import operateFormItem from "@/components/design/layout/canvas/operate/operateFormItem.vue";
import sizeInput from "@/components/design/layout/canvas/operate/sizeInput.vue";
import { canvasStickerOptionsOnlyChild } from "@/components/design/layout/canvas/index.tsx";
import {
  ensureImagePrintEffectOptions,
  ImageFillMode,
  ImageFillModeOptions,
  ImagePatternRepeatOptions,
} from "@/components/design/layout/canvas/children/imagePrint.ts";

const model = defineModel({
  default: {} as any,
});

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
      label: "画布高度百分比",
      value: "vh",
    },
  ];
});

watchEffect(() => {
  ensureImagePrintEffectOptions(model.value, canvasStickerOptionsOnlyChild.value.width.unit);
});

const printEffect = computed(() => {
  return ensureImagePrintEffectOptions(model.value, canvasStickerOptionsOnlyChild.value.width.unit);
});
</script>

<style scoped lang="less">
.image-print-group {
  display: flex;
  flex-direction: column;
}

.image-print-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.mini-label {
  font-size: 11px;
  color: #7a7f87;
  line-height: 1;
}
</style>
