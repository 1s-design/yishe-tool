<template>
  <div class="flex items-center">
    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="link" @click="handleRecord">
          <icon
            style="width: 20px; height: 20px; margin: 4px"
            :class="{
              red: isRecording,
              pulse: isRecording,
            }"
          ></icon>
          <div v-if="!isRecording && !(countdown > 0)">点击录制</div>
          <div v-if="isRecording" :class="{ red: isRecording }">
            录制中 {{ timeCount }} s 点击结束
          </div>
          <div v-if="countdown > 0">倒计时: {{ countdown }} 点击取消</div>
        </Button>
      </TooltipTrigger>
      <TooltipContent>录制画布模型内容</TooltipContent>
    </Tooltip>
  </div>
</template>

<script setup>
import { ref } from "vue";
import icon from "./record.svg?component";
import { currentModelController } from "@/components/design/store";
import { message } from '@/common/message';
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// 是否正在录制
const isRecording = ref(false);
const countdown = ref(0);

let interval = ref();

function clearState() {
  isRecording.value = false;
  countdown.value = 0;
  clearInterval(interval.value);
}

const handleRecord = async () => {
  if (isRecording.value) {
    // 停止录制
    stopRecording();
  } else {
    // 直接开始录制
    startRecording();
  }
};

// 开始录制
const startRecording = async () => {
  if (!currentModelController.value) {
    message.warning("请先加载模型");
    return;
  }

  isRecording.value = true;
  countdown.value = 0;

  interval.value = setInterval(() => {
    countdown.value++;
  }, 1000);

  // 开始录制
  try {
    currentModelController.value.startRecord({
      onSuccess: async (blob) => {
        clearState();
        await handleRecordedVideo(blob);
      },
      onError: (err) => {
        clearState();
        message.error("录制失败");
        console.error(err);
      },
    });
  } catch (error) {
    clearState();
    message.error("启动录制失败");
    console.error(error);
  }
};

// 停止录制
const stopRecording = () => {
  if (!currentModelController.value) return;
  currentModelController.value.stopRecord();
  clearState();
};

// 处理录制结束后的视频保存
const handleRecordedVideo = async (blob) => {
  try {
    const filename = `录制视频_${new Date().getTime()}.webm`;
    saveAs(blob, filename);
    message.success('视频已下载保存');
  } catch (err) {
    message.error('保存视频失败');
    console.error(err);
  }
};
</script>

<style scoped lang="less">
.red {
  color: rgb(255, 81, 80);
}

.pulse {
  animation-name: pulse;
  animation-duration: 1s;
  animation-fill-mode: both;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale3d(1, 1, 1);
  }
  50% {
    transform: scale3d(1.1, 1.1, 1.1);
  }
  100% {
    transform: scale3d(1, 1, 1);
  }
}
</style>
