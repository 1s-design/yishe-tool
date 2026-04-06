<template>
  <div class="designiy-image-upload">
    <el-upload class="designiy-image-upload-main" :auto-upload="false" :show-file-list="false" v-model:file-list="files"
      :limit="1" :on-exceed="handleExceed" ref="upload" drag>
      <img v-if="files[0]" :src="previewUrl" />
      <template v-else>
        <icon-upload style="width: 50px; height: 50px"></icon-upload>
        <div>点击或拖拽文件上传</div>
      </template>
    </el-upload>
    <a-divider />
    <a-qrcode style="width: 50px; height: 50px" value="http://www.antdv.com" color="var(--el-color-primary)"
      bg-color="#fff" />
    <div class="designiy-image-upload-form">
      <div class="designiy-image-upload-form-label">贴纸名称</div>
      <el-input></el-input>
      <div class="designiy-image-upload-form-label">描述</div>
      <el-input type="textarea"></el-input>
      <div style="flex: 1"></div>
      <el-button :loading="loading" @click="submit" :disabled="!previewUrl">
        上传该图片
      </el-button>
    </div>
  </div>
</template>

<script setup>
import iconUpload from "@/icon/upload.svg?component";
import { ref, reactive, watch, computed, shallowRef } from "vue";
import { uploadImage } from "@/api/index";
import { uploadToCOS } from "@/api/cos";

const files = ref([]);
const upload = ref();
const loading = ref(false);
const name = ref("");
const desc = ref("");

const previewUrl = computed(() => {
  let file = files.value[0];
  if (file) {
    return URL.createObjectURL(file.raw);
  }
  return false;
});

function handleExceed(files) {
  upload.value.clearFiles();
  const file = files[0];
  upload.value.handleStart(file);
}

async function submit() {
  loading.value = true;

  const { getLocalUserInfo } = await import("@/store/stores/loginAction");
  const userInfo = getLocalUserInfo();
  const currentUser = userInfo?.userInfo || userInfo || {};

  const { url } = await uploadToCOS({
    file: files.value[0].raw,
    category: 'sticker',
    account: currentUser?.account || currentUser?.name || 'anonymous',
    userId: currentUser?.id,
  });

  await uploadImage({
    name: "",
    description: "",
    file: files.value[0].raw,
  });
  loading.value = false;
}
</script>

<style lang="less">
.designiy-image-upload {
  width: 800px;
  height: 500px;
  padding: 20px;
  overflow: auto;
}

.designiy-image-upload-main {
  width: 260px;
  height: 260px;

  .el-upload {
    width: 100%;
    height: 100%;
  }

  .el-upload-dragger {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    row-gap: 10px;
    align-items: center;
  }
}

.designiy-image-upload-form {
  width: 260px;
  height: 260px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.designiy-image-upload-form-label {
  padding: 5px 0;
  font-size: 12px;
  font-weight: bold;
  color: #666;
}
</style>
