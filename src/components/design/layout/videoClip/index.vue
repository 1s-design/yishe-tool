<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2025-05-20 06:50:38
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-08-10 07:29:30
 * @FilePath: /1s/src/components/design/layout/videoClip/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="video-clip-panel">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <Label>导出图片</Label>
        <div>
          <!-- 角度选择器 -->
          <div class="mb-3">
            <!-- 快速选择按钮 -->
            <div class="flex flex-wrap gap-1 mb-3">
              <Button size="sm" variant="outline" @click="selectDefaultAngles">
                默认(前后左右)
              </Button>
              <Button size="sm" variant="outline" @click="selectAllAngles">
                全选
              </Button>
              <Button size="sm" variant="outline" @click="clearAllAngles">
                清空
              </Button>
            </div>

            <div class="flex flex-wrap justify-center gap-2">
              <div
                v-for="angle in availableAngles"
                :key="angle.name"
                class="custom-checkbox"
                :class="{ selected: selectedAngles.includes(angle.name) }"
                @click="toggleAngle(angle.name)"
              >
                <div class="flex items-center gap-1">
                  <span class="text-xs">{{ angle.label }}</span>
                </div>
              </div>
            </div>

            <!-- 选中数量显示 -->
            <div class="text-xs text-gray-500 mt-2">
              已选择 {{ selectedAngles.length }} 个角度
            </div>
          </div>

          <!-- 导出按钮 -->
          <div class="flex gap-2">
            <Button
              class="w-full rounded-full"
              :disabled="selectedAngles.length === 0"
              @click="handleExportImages"
            >
              下载多角度图 ({{ selectedAngles.length }}张)
            </Button>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <Label>执行动画</Label>
        <div>
          <div class="flex flex-wrap" style="gap: 8px">
            <Button
              size="sm"
              variant="outline"
              v-for="item in animations"
              class="cursor-pointer round"
              :class="{ 'disabled-button': isAnimationRunning }"
              :disabled="isAnimationRunning"
              @click="item.handle"
            >
              {{ item.title }}
            </Button>
          </div>

          <div>
            <Switch v-model:checked="isRecordingEnabled" />
            <div class="text-xs text-gray-500 mt-1">开启后执行动画时会自动录制视频</div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <Label>录制视频</Label>
        <div class="flex items-center gap-2">
          <Button
            class="rounded-full"
            :class="{ recording: isRecording }"
            @click="handleRecord"
          >
            {{ isRecording ? `录制中 ${timeCount}s` : "开始录制" }}
          </Button>
        </div>
      </div>

      <!-- <div class="flex flex-col gap-1.5">
        <Label>调整视图</Label>
        <div class="flex flex-wrap" style="gap: 8px">
          <Button
            size="sm"
            variant="outline"
            v-for="item in modelControllerViewSetterOptions"
            class="cursor-pointer round"
            @click="item.handle"
          >
            {{ item.name }}
          </Button>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { currentModelController } from "../../store";
import { ref, computed, onMounted } from "vue";
import { selectedAngles } from '../../store';
import gsap from "gsap";
import { message } from '@/common/message';
import { saveAs } from "file-saver";
import {
  isRecordingEnabled,
  animations,
  modelControllerViewSetterOptions,
  isEdit,
  currentEditingModelInfo,
  isAnimationRunning,
  stopAllAnimations,
} from "./index.ts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// 录制相关状态
const isRecording = ref(false);
const timeCount = ref(0);
let timeCountInterval: any = null;

// 角度选择相关状态由 store 提供
const availableAngles = ref<any[]>([]);
const isSavingToDraft = ref(false);

// 初始化角度数据
onMounted(() => {
  if (currentModelController.value) {
    availableAngles.value = currentModelController.value.getAvailableAngles();
    // 默认选中前后左右
    selectedAngles.value = currentModelController.value.getDefaultSelectedAngles();
  }
});

// 选择默认角度（前后左右）
const selectDefaultAngles = () => {
  if (currentModelController.value) {
    selectedAngles.value = currentModelController.value.getDefaultSelectedAngles();
  }
};

// 全选所有角度
const selectAllAngles = () => {
  selectedAngles.value = availableAngles.value.map((angle) => angle.name);
};

// 清空所有选择
const clearAllAngles = () => {
  selectedAngles.value = [];
};

// 切换角度选择
const toggleAngle = (angleName: string) => {
  const index = selectedAngles.value.indexOf(angleName);
  if (index > -1) {
    selectedAngles.value.splice(index, 1);
  } else {
    selectedAngles.value.push(angleName);
  }
};

// 处理导出图片
const handleExportImages = async () => {
  if (selectedAngles.value.length === 0) {
    message.warning("请至少选择一个角度");
    return;
  }

  try {
    message.loading({
      content: `正在生成 ${selectedAngles.value.length} 张多角度图片...`,
      key: "exportImages",
    });

    await (currentModelController.value as any).batchDownloadMultiAngleImages({
      angles: selectedAngles.value,
      filename: "model",
      showProgress: true,
    });

    message.success({
      content: `成功导出 ${selectedAngles.value.length} 张图片`,
      key: "exportImages",
    });
  } catch (error) {
    message.error({
      content: "导出失败",
      key: "exportImages",
    });
    console.error("导出图片失败:", error);
  }
};

// 处理录制
const handleRecord = async () => {
  if (isRecording.value) {
    // 停止录制
    currentModelController.value.stopMediaRecord();
    clearInterval(timeCountInterval);
    isRecording.value = false;
    timeCount.value = 0;
  } else {
    // 开始录制
    isRecording.value = true;
    currentModelController.value.startMediaRecord({
      onStop: handleRecordedVideo,
    });

    // 开始计时
    timeCountInterval = setInterval(() => {
      if (timeCount.value >= 60) {
        // 最多录制60秒
        handleRecord();
        return;
      }
      timeCount.value++;
    }, 1000);
  }
};

// 处理录制结束后的视频保存
const handleRecordedVideo = async (blob: any) => {
  try {
    const file = new File([blob], `录制视频_${new Date().getTime()}.webm`, { type: 'video/webm' });
    saveAs(blob, `录制视频_${new Date().getTime()}.webm`);
    message.success("视频已下载保存");
  } catch (err) {
    message.error("保存视频失败");
    console.error(err);
  }
};
</script>

<style scoped lang="less">
.video-clip-panel {
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 12px;
  overflow: auto;
  box-sizing: border-box;
}

@media (max-width: 1080px) {
  .video-clip-panel {
    padding: 10px;
  }
}
</style>

<style scoped>
.recording {
  animation: pulse 1s infinite;
  background-color: #ff5150;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.custom-checkbox {
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f5f5f5;
  color: var(--1s-text-color);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--1s-border-color);
  font-size: 12px;
  user-select: none;
}

.custom-checkbox:hover {
  background-color: #e8e8e8;
  border-color: #d0d0d0;
}

.custom-checkbox.selected {
  background-color: var(--1s-accent-color);
  color: white;
  border-color: var(--1s-accent-color);
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
}

.custom-checkbox.selected:hover {
  background-color: #337ecc;
  border-color: #337ecc;
}

.disabled-button {
  opacity: 0.5;
  cursor: not-allowed !important;
}

.disabled-button:hover {
  opacity: 0.5;
  cursor: not-allowed !important;
}
</style>
