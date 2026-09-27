<template>
  <div class="designiy-scene-control">
    <!-- 背景色选择（原 color-picker，暂未启用） -->

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <Label>画板背景</Label>
        <RadioGroup v-model="selectedCanvasBackgroundId">
          <div class="background-options">
            <div
              v-for="item in builtInCanvasBackgrounds"
              :key="item.id"
              class="background-option"
              @click="selectedCanvasBackgroundId = item.id"
            >
              <RadioGroupItem :value="item.id" />
              <div
                class="background-preview"
                :style="{ background: item.backgroundCss }"
              ></div>
              <span class="background-name">{{ item.name }}</span>
            </div>
          </div>
        </RadioGroup>
        <div class="background-tip">
          该颜色只作为辅助，不会真实渲染到画布，也不会影响导出的截图
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <Label>画布背景色</Label>
        <div class="canvas-background-control">
          <input
            type="color"
            class="canvas-background-color-input"
            :value="canvasBackgroundColor"
            @input="canvasBackgroundColor = $event.target.value; handleActiveColorChange($event.target.value)"
            @change="handleBackgroundColorChange($event.target.value)"
          />
          <span class="background-tip">此颜色会真实渲染到画布背景</span>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <Label>画布背景图</Label>
        <RadioGroup v-model="selectedBackgroundImageId">
          <div class="background-image-options">
            <div
              v-for="item in builtInCanvasBackgroundImages"
              :key="item.id"
              class="background-image-option"
              @click="selectedBackgroundImageId = item.id"
            >
              <RadioGroupItem :value="item.id" />
              <div
                class="background-image-preview"
                :style="{ backgroundImage: `url(${item.url})` }"
              ></div>
              <span class="background-image-name">{{ item.name }}</span>
            </div>
          </div>
        </RadioGroup>
        <div class="background-tip">选择背景图会覆盖背景色设置</div>
      </div>
    </div>
  </div>
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
  .background-tip {
    font-size: 11px;
    color: var(--1s-text-color-tertiary);
    margin-top: 4px;
    line-height: 1.2;
  }

  .background-options {
    display: flex;
    flex-wrap: wrap;
  }

  .background-option {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .background-preview {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    border: 1px solid #d9d9d9;
  }

  .background-name {
    font-size: 12px;
  }

  .canvas-background-control {
    display: flex;
    align-items: center;
  }

  .canvas-background-color-input {
    width: 32px;
    height: 24px;
    padding: 0;
    border: 1px solid #d9d9d9;
    border-radius: 2px;
    background: transparent;
    cursor: pointer;
  }

  .background-image-options {
    display: flex;
    flex-wrap: wrap;
  }

  .background-image-option {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .background-image-preview {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    border: 1px solid #d9d9d9;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-color: #f5f5f5;
  }

  .background-image-name {
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 120px;
  }
}
</style>
