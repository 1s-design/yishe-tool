<template>
  <div class="color-picker">
    <color-picker
      v-bind="attrs"
      :useType="type"
      v-model:pureColor="model.color"
      v-model:gradientColor="model.color"
      v-model:activeKey="model.type"
      :z-index="99"
    >
      <template #extra>
        <div class="custom-css-input">
          <div class="label">直接输入 CSS (十六进制/渐变/OKLCH)</div>
          <div class="relative">
            <Edit class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            <Input
              v-model="model.color"
              class="pl-7 h-6 text-xs"
              placeholder="粘贴 CSS 样式..."
              @change="handleCSSChange"
            />
          </div>
        </div>
        <Button
          variant="outline"
          class="w-full"
          size="sm"
          style="margin-top: 12px"
          @click="open"
        >
          <Picture class="w-3.5 h-3.5 mr-1" />
          颜色库 / 高级编辑器
        </Button>
        <slot />
      </template>
    </color-picker>
    <modal @select="select" v-model:open="showColorPickerModal"></modal>
  </div>
</template>
<script setup>
import { ColorPicker } from "vue3-colorpicker";
import "vue3-colorpicker/style.css";
import { ref, watch } from "vue";
import { useAttrs } from "vue";
import { Image as Picture, Edit } from "lucide-vue-next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import modal from "./modal.vue";

const model = defineModel({
  default: {
    color: "#fff",
    type: "pure", // pure or gradient
  },
});

let attrs = useAttrs();

const props = defineProps({
  type: {
    default: "both",
  },
});

const showColorPickerModal = ref(false);

function open() {
  showColorPickerModal.value = true;
}

function select(item) {
  model.value = {
    color: item.color,
    type: item.type,
  };
  showColorPickerModal.value = false;
}

function handleCSSChange() {
  const val = model.value.color;
  if (val.includes('-gradient') || val.includes('oklch') || val.includes('hsl')) {
    model.value.type = 'gradient';
  } else {
    model.value.type = 'pure';
  }
}
</script>
<style lang="less">
.color-picker {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  box-: none;
}

.custom-css-input {
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
  .label {
    font-size: 11px;
    color: var(--1s-text-color-tertiary);
    margin-bottom: 5px;
  }
}

.vc-color-wrap {
  margin-right: 0px !important;
  height: 100% !important;
  width: 100% !important;
}
</style>
