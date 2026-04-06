<template>
  <div class="flex items-center">
    <el-tooltip content="录制画布模型内容">
      <el-button @click="handleRecord" link>
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
      </el-button>
    </el-tooltip>
  </div>
</template>

<script setup>
import { ref } from "vue";
import icon from "./record.svg?component";
import { currentModelController, currentEditingModelId, isEdit } from "@/components/design/store";
import { uploadToCOS, createDraft } from "@/api";
import { message } from "ant-design-vue";

// 是否正在录制
const isRecording = ref(false);
const countdown = ref(0);

let interval = ref();

function clearState() {
  isRecording.value = false;
  countdown.value = 0;
  clearInterval(interval.value);
  timeCount.value = 1;
  clearInterval(timeCountInterval.value);
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

// 从第一秒开始
let timeCount = ref(1);
let timeCountInterval = ref();

const startRecording = async () => {
  isRecording.value = true;

  currentModelController.value.startMediaRecord({
    onStop: handleRecordedVideo
  });

  timeCountInterval.value = setInterval(() => {
    // 慕目前最多限制60秒
    if (timeCount.value == 60) {
      stopRecording();
      return;
    }

    timeCount.value++;
  }, 1000);
};

const stopRecording = () => {
  currentModelController.value.stopMediaRecord();
  clearState();
};

// 处理录制结束后的视频保存
const handleRecordedVideo = async (blob) => {
  try {
    // 创建文件对象
    const file = new File([blob], `录制视频_${new Date().getTime()}.webm`, { type: 'video/webm' });

    let userAccount = 'anonymous';
    let userId = undefined;
    try {
      const { getLocalUserInfo } = await import('@/store/stores/loginAction');
      const userInfo = getLocalUserInfo();
      const currentUser = userInfo?.userInfo || userInfo || {};
      userAccount = currentUser?.account || currentUser?.name || 'anonymous';
      userId = currentUser?.id;
    } catch (e) {
      console.warn('无法获取用户信息:', e);
    }
    
    // 上传到 COS
    const cos = await uploadToCOS({
      file,
      category: 'design-draft',
      account: userAccount,
      userId,
      entityId: isEdit.value && currentEditingModelId.value ? currentEditingModelId.value : undefined,
    });
    
    // 保存到草稿箱
    await createDraft({
      url: cos.url,
      name: '模型录制视频',
      type: 'video',
      suffix: 'webm',
      updateTime: new Date(),
      ...(isEdit.value && currentEditingModelId.value ? { customModelId: currentEditingModelId.value } : {})
    });
    
    message.success('视频已保存到草稿箱');
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
