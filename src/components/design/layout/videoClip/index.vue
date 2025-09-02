<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2025-05-20 06:50:38
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-08-10 07:29:30
 * @FilePath: /1s/src/components/design/layout/videoClip/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div style="width: 360px; padding: 12px">
    <el-form>
      <el-form-item label="导出图片">
        <div>
          <!-- 角度选择器 -->
          <div class="mb-3">
            <!-- 快速选择按钮 -->
            <div class="flex flex-wrap gap-1 mb-3">
              <el-button size="small" type="primary" plain @click="selectDefaultAngles">
                默认(前后左右)
              </el-button>
              <el-button size="small" type="primary" plain @click="selectAllAngles">
                全选
              </el-button>
              <el-button size="small" type="primary" plain @click="clearAllAngles">
                清空
              </el-button>
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
            <el-button
              class="w-full"
              type="primary"
              round
              :disabled="selectedAngles.length === 0"
              @click="handleExportImages"
            >
              下载多角度图 ({{ selectedAngles.length }}张)
            </el-button>
            <el-button
              class="w-full"
              type="success"
              round
              :disabled="selectedAngles.length === 0"
              :loading="isSavingToDraft"
              @click="handleSaveToDraft"
            >
              {{
                isSavingToDraft
                  ? "保存中..."
                  : `保存到草稿箱 (${selectedAngles.length}张)`
              }}
            </el-button>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="执行动画">
        <div>
          <div class="flex flex-wrap" style="gap: 8px">
            <a-button
              size="small"
              v-for="item in animations"
              class="cursor-pointer round"
              :class="{ 'disabled-button': isAnimationRunning }"
              :disabled="isAnimationRunning"
              @click="item.handle"
            >
              {{ item.title }}
            </a-button>
          </div>

          <div>
            <el-switch v-model="isRecordingEnabled" size="small" />
            <div class="text-xs text-gray-500 mt-1">开启后执行动画时会自动录制视频</div>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="录制视频">
        <div class="flex items-center gap-2">
          <el-button
            type="primary"
            round
            :class="{ recording: isRecording }"
            @click="handleRecord"
          >
            {{ isRecording ? `录制中 ${timeCount}s` : "开始录制" }}
          </el-button>
        </div>
      </el-form-item>

      <!-- <el-form-item label="调整视图">
        <div class="flex flex-wrap" style="gap: 8px">
          <a-button
            size="small"
            v-for="item in modelControllerViewSetterOptions"
            class="cursor-pointer round"
            @click="item.handle"
          >
            {{ item.name }}
          </a-button>
        </div>
      </el-form-item> -->
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { currentModelController } from "../../store";
import { ref, computed, onMounted } from "vue";
import { selectedAngles } from '../../store';
import gsap from "gsap";
import { message } from "ant-design-vue";
import { uploadToCOS, createDraft } from "@/api";
import { QuestionFilled } from "@element-plus/icons-vue";
import {
  isRecordingEnabled,
  animations,
  modelControllerViewSetterOptions,
  isEdit,
  currentEditingModelInfo,
  isAnimationRunning,
  stopAllAnimations,
} from "./index.ts";

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

    await currentModelController.value.batchDownloadMultiAngleImages({
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
const handleRecordedVideo = async (blob: Blob) => {
  try {
    // 创建文件对象
    const file = new File([blob], `录制视频_${new Date().getTime()}.webm`, {
      type: "video/webm",
    });

    // 上传到 COS
    const cos = await uploadToCOS({ file });

    // 保存到草稿箱
    const draftPayload = {
      url: cos.url,
      name: "模型录制视频",
      updateTime: new Date(),
      suffix: 'webm',
      customModelId: null,
    };
    if (isEdit?.value && currentEditingModelInfo?.value?.id) {
      draftPayload.customModelId = currentEditingModelInfo.value.id;
    }
    await createDraft(draftPayload);

    message.success("视频已保存到草稿箱");
  } catch (err) {
    message.error("保存视频失败");
    console.error(err);
  }
};

// 处理保存到草稿箱
const handleSaveToDraft = async () => {
  if (selectedAngles.value.length === 0) {
    message.warning("请至少选择一个角度");
    return;
  }

  isSavingToDraft.value = true;

  try {
    message.loading({
      content: `正在生成 ${selectedAngles.value.length} 张多角度图片...`,
      key: "saveToDraft",
    });

    // 获取多角度图片
    const images = await currentModelController.value.exportMultiAngleImages(
      selectedAngles.value
    );

    message.loading({
      content: `正在上传 ${images.length} 张图片到云端...`,
      key: "saveToDraft",
    });

    // 并发上传所有图片
    const uploadPromises = images.map(async (image) => {
      // 将base64转换为文件
      const base64Data = image.base64.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let j = 0; j < byteCharacters.length; j++) {
        byteNumbers[j] = byteCharacters.charCodeAt(j);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const file = new File([byteArray], `多角度图片_${image.label}.png`, {
        type: "image/png",
      });

      // 上传到 COS
      const cos = await uploadToCOS({ file });

      // 保存到草稿箱
      const draftPayload = {
        url: cos.url,
        name: `多角度图片_${image.label}`,
        updateTime: new Date(),
        customModelId:null,
      };
      if (isEdit?.value && currentEditingModelInfo?.value?.id) {
        draftPayload.customModelId = currentEditingModelInfo.value.id;
      }
      const draft = await createDraft(draftPayload);
      return draft;
    });

    // 等待所有上传完成
    const savedDrafts = await Promise.all(uploadPromises);

    message.success({
      content: `成功
      保存 ${savedDrafts.length} 张多角度图片到草稿箱`,
      key: "saveToDraft",
    });
  } catch (error) {
    message.error({
      content: "保存到草稿箱失败",
      key: "saveToDraft",
    });
    console.error("保存到草稿箱失败:", error);
  } finally {
    isSavingToDraft.value = false;
  }
};
</script>

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
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e0e0e0;
  font-size: 12px;
  user-select: none;
}

.custom-checkbox:hover {
  background-color: #e8e8e8;
  border-color: #d0d0d0;
}

.custom-checkbox.selected {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
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
