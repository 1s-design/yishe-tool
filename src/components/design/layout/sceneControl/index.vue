<template>
  <section class="designiy-scene-control u-panel">
    <div class="u-panel__section">
      <div class="u-panel__section-title">画板背景</div>
      <div class="scene-control-body">
        <RadioGroup v-model="selectedCanvasBackgroundId" class="background-options">
          <div
            v-for="item in builtInCanvasBackgrounds"
            :key="item.id"
            class="background-option"
            :class="{ 'is-selected': selectedCanvasBackgroundId === item.id }"
            @click="selectedCanvasBackgroundId = item.id"
          >
            <RadioGroupItem :value="item.id" />
            <div class="background-preview" :style="{ background: item.backgroundCss }"></div>
            <span class="background-name">{{ item.name }}</span>
          </div>
        </RadioGroup>
        <div class="background-tip">该颜色只作为辅助，不会真实渲染到画布，也不会影响导出的截图</div>
      </div>
    </div>

    <div class="u-panel__section">
      <div class="u-panel__section-title">画布背景色</div>
      <div class="scene-control-body">
        <div class="canvas-background-control u-row">
          <input
            type="color"
            class="canvas-background-color-input"
            aria-label="画布背景色"
            :value="canvasBackgroundColor"
            @input="canvasBackgroundColor = $event.target.value; handleActiveColorChange($event.target.value)"
            @change="handleBackgroundColorChange($event.target.value)"
          />
          <span class="background-tip">此颜色会真实渲染到画布背景</span>
        </div>
      </div>
    </div>

    <div class="u-panel__section">
      <div class="u-panel__section-title">画布背景图</div>
      <div class="scene-control-body">
        <RadioGroup v-model="selectedBackgroundImageId" class="background-image-options">
          <div
            v-for="item in builtInCanvasBackgroundImages"
            :key="item.id"
            class="background-image-option"
            :class="{ 'is-selected': selectedBackgroundImageId === item.id }"
            @click="selectedBackgroundImageId = item.id"
          >
            <RadioGroupItem :value="item.id" />
            <div class="background-image-preview" :style="{ backgroundImage: `url(${item.url})` }"></div>
            <span class="background-image-name">{{ item.name }}</span>
          </div>
        </RadioGroup>
        <div class="background-tip">选择背景图会覆盖背景色设置</div>
      </div>
    </div>
  </section>
</template>
<script setup>
import { onMounted, ref, computed, watch } from "vue";
import {
  showBaseModelSelect,
  currentCanvasBackground,
  currentOperatingBaseModelInfo,
  canvasBgColor,
  canvasBgOpacity,
  builtInCanvasBackgrounds,
  currentModelController,
  currentCanvasBackgroundImageId,
  builtInCanvasBackgroundImages,
} from "../../store.ts";
import Color from "color";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const predefineColors = ref(["#ffffff", "#dddddd", "#333333", "#555555"]);

const predefineBackgroundColors = ref([
  "#ffffff", // 白色
  "#f5f5f5", // 浅灰
  "#eeeeee", // 淡灰
  "#e0e0e0", // 中灰
  "#fafafa", // 超浅灰
  "#f0f0f0", // 浅灰白
  "#f8f8f8", // 近白
  "#f2f2f2", // 淡灰白
]);

const bgColor = computed({
  get() {
    let color = Color(canvasBgColor.value);
    let _color = color.alpha(canvasBgOpacity.value);
    let __color = `rgba(${_color.rgb().array().join(",")},${_color.valpha})`;
    return __color;
  },
  set(val) {
    val ||= "rgba(0,0,0,0)"; // 模拟透明色
    let color = Color(val);
    canvasBgOpacity.value = color.valpha;
    canvasBgColor.value = color.hex();
  },
});

// 画布背景色
const canvasBackgroundColor = computed({
  get() {
    return currentModelController.value?.state.canvasBackground.color || "#eee";
  },
  set(val) {
    if (currentModelController.value) {
      currentModelController.value.setCanvasBackground(val);
    }
  },
});

// 选中的背景图ID
const selectedBackgroundImageId = computed({
  get() {
    return currentCanvasBackgroundImageId.value || "";
  },
  set(val) {
    currentCanvasBackgroundImageId.value = val;
  },
});

// 选中的画板背景ID
const selectedCanvasBackgroundId = computed({
  get() {
    return currentCanvasBackground.value?.id || "";
  },
  set(val) {
    const selectedBackground = builtInCanvasBackgrounds.value.find(
      (item) => item.id === val
    );
    if (selectedBackground) {
      currentCanvasBackground.value = selectedBackground;
    }
  },
});

// 处理背景色变化
const handleBackgroundColorChange = (val) => {
  if (currentModelController.value) {
    const color = Color(val);
    currentModelController.value.setCanvasBackground(val, color.alpha());
  }
};

// 处理颜色选择过程中的变化
const handleActiveColorChange = (val) => {
  if (currentModelController.value && val) {
    const color = Color(val);
    currentModelController.value.setCanvasBackground(val, color.alpha());
  }
};

// 处理背景图变化
const handleBackgroundImageChange = (imageId) => {
  if (currentModelController.value) {
    const selectedImage = builtInCanvasBackgroundImages.value.find(
      (item) => item.id === imageId
    );
    if (selectedImage && selectedImage.url) {
      currentModelController.value.setBackground(selectedImage.url);
    } else {
      currentModelController.value.setBackground();
    }
  }
};

// 监听背景图选择变化
watch(currentCanvasBackgroundImageId, (newValue) => {
  handleBackgroundImageChange(newValue);
});

function useCurrentBackground(item) {
  currentCanvasBackground.value = item;
}
</script>
<style lang="less">
.designiy-scene-control {
  .scene-control-body {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 1px 8px 8px;
  }

  .background-tip {
    color: var(--1s-text-color-tertiary);
    font-size: var(--1s-control-font);
    line-height: 1.35;
  }

  .background-options,
  .background-image-options {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .background-option,
  .background-image-option {
    display: flex;
    align-items: center;
    gap: 5px;
    min-height: var(--1s-control-h-md);
    padding: 2px 5px;
    border: 1px solid transparent;
    border-radius: var(--1s-control-radius-sm);
    cursor: pointer;
    transition: var(--1s-control-transition);

    &:hover {
      background: var(--1s-state-hover);
    }

    &.is-selected {
      border-color: var(--1s-accent-color);
      background: var(--1s-state-selected);
    }
  }

  .background-preview,
  .background-image-preview {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    border: 1px solid var(--1s-control-border-color);
    border-radius: var(--1s-control-radius-sm);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .background-name,
  .background-image-name {
    max-width: 112px;
    overflow: hidden;
    color: var(--1s-text-color-secondary);
    font-size: var(--1s-control-font);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .canvas-background-control {
    justify-content: flex-start;
    gap: 8px;
  }

  .canvas-background-color-input {
    width: 30px;
    height: 22px;
    padding: 1px;
    border: 1px solid var(--1s-control-border-color);
    border-radius: var(--1s-control-radius-sm);
    background: var(--1s-control-surface-muted);
    cursor: pointer;
  }
}
</style>
