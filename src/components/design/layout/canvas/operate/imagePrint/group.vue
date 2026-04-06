<template>
  <div class="image-print-group">
    <operate-form-item>
      <template #icon>
        <icon-filter></icon-filter>
      </template>
      <template #name> 印花风格 </template>
      <template #content>
        <el-select
          v-model="printEffect.preset"
          size="small"
          style="width: 150px"
          @change="handlePresetChange"
        >
          <el-option
            v-for="item in ImagePrintPresetOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </template>
    </operate-form-item>

    <operate-form-item>
      <template #icon>
        <icon-background></icon-background>
      </template>
      <template #name> 铺图方式 </template>
      <template #content>
        <el-select v-model="printEffect.fillMode" size="small" style="width: 150px">
          <el-option
            v-for="item in ImageFillModeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
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
            <el-select
              v-model="printEffect.pattern.repeatMode"
              size="small"
              style="width: 110px"
            >
              <el-option
                v-for="item in ImagePatternRepeatOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
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

    <operate-form-item>
      <template #icon>
        <icon-sticker></icon-sticker>
      </template>
      <template #name> 白边轮廓 </template>
      <template #content>
        <div class="image-print-stack">
          <el-switch v-model="printEffect.outline.enabled" size="small"></el-switch>
          <div v-if="printEffect.outline.enabled" class="image-print-row">
            <span class="mini-label">颜色</span>
            <color-picker v-model="printEffect.outline.color" type="pure"></color-picker>
            <span class="mini-label">宽度</span>
            <size-input
              v-model="printEffect.outline.width.value"
              v-model:unit="printEffect.outline.width.unit"
              :unit-options="unitOptions"
              placeholder="轮廓宽度"
            >
            </size-input>
          </div>
        </div>
      </template>
    </operate-form-item>

    <operate-form-item>
      <template #icon>
        <icon-shadow></icon-shadow>
      </template>
      <template #name> 投影质感 </template>
      <template #content>
        <div class="image-print-stack">
          <el-switch v-model="printEffect.shadow.enabled" size="small"></el-switch>
          <div v-if="printEffect.shadow.enabled" class="image-print-row">
            <span class="mini-label">颜色</span>
            <color-picker v-model="printEffect.shadow.color" type="pure"></color-picker>
            <span class="mini-label">模糊</span>
            <size-input
              v-model="printEffect.shadow.blur.value"
              v-model:unit="printEffect.shadow.blur.unit"
              :unit-options="unitOptions"
              placeholder="投影模糊"
            >
            </size-input>
          </div>
          <div v-if="printEffect.shadow.enabled" class="image-print-row">
            <span class="mini-label">X</span>
            <size-input
              v-model="printEffect.shadow.offsetX.value"
              v-model:unit="printEffect.shadow.offsetX.unit"
              :unit-options="unitOptions"
              placeholder="投影 X"
            >
            </size-input>
            <span class="mini-label">Y</span>
            <size-input
              v-model="printEffect.shadow.offsetY.value"
              v-model:unit="printEffect.shadow.offsetY.unit"
              :unit-options="unitOptions"
              placeholder="投影 Y"
            >
            </size-input>
          </div>
        </div>
      </template>
    </operate-form-item>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import iconFilter from "@/components/design/assets/icon/filter.svg?component";
import iconBackground from "@/components/design/assets/icon/background-image.svg?component";
import iconSticker from "@/components/design/assets/icon/sticker.svg?component";
import iconSize from "@/components/design/assets/icon/size.svg?component";
import iconPosition from "@/components/design/assets/icon/position.svg?component";
import iconShadow from "@/components/design/assets/icon/text-shadow.svg?component";
import operateFormItem from "@/components/design/layout/canvas/operate/operateFormItem.vue";
import sizeInput from "@/components/design/layout/canvas/operate/sizeInput.vue";
import { canvasStickerOptionsOnlyChild } from "@/components/design/layout/canvas/index.tsx";
import {
  applyImagePrintPreset,
  ensureImagePrintEffectOptions,
  ImageFillMode,
  ImageFillModeOptions,
  ImagePatternRepeatOptions,
  ImagePrintPreset,
  ImagePrintPresetOptions,
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

function handlePresetChange(preset: ImagePrintPreset) {
  applyImagePrintPreset(model.value, preset);
}
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

.image-print-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.mini-label {
  font-size: 11px;
  color: #7a7f87;
  line-height: 1;
}
</style>
