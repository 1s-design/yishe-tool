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
          <el-input
            v-model="model.color"
            size="small"
            placeholder="粘贴 CSS 样式..."
            @change="handleCSSChange"
          >
            <template #prefix>
              <el-icon><edit-pen /></el-icon>
            </template>
          </el-input>
        </div>
        <el-button
          plain
          class="w-full"
          size="small"
          style="margin-top: 12px"
          :icon="Picture"
          @click="open"
        >
          颜色库 / 高级编辑器
        </el-button>
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
import { Picture, EditPen } from "@element-plus/icons-vue";

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
  box-shadow: rgba(67, 71, 85, 0.27) 0px 0px 0.25em,
    rgba(90, 125, 188, 0.05) 0px 0.25em 1em;
}

.custom-css-input {
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
  .label {
    font-size: 11px;
    color: #999;
    margin-bottom: 5px;
  }
}

.vc-color-wrap {
  margin-right: 0px !important;
  height: 100% !important;
  width: 100% !important;
}
</style>
