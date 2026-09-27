<template>
  <div class="designiy-image-upload">
    <FileUpload
      class="designiy-image-upload-main"
      v-model:file-list="files"
      :limit="1"
      :multiple="false"
      accept="image/*"
      ref="upload"
      @exceed="handleExceed"
    >
      <div class="upload-dragger">
        <img v-if="files[0]" :src="previewUrl" />
        <template v-else>
          <icon-upload style="width: 50px; height: 50px"></icon-upload>
          <div>点击或拖拽文件上传</div>
        </template>
      </div>
    </FileUpload>
    <Separator />
    <div
      class="flex items-center justify-center rounded-md border border-border bg-white text-[8px] text-center text-muted-foreground"
      style="width: 50px; height: 50px"
    >
      http://www.antdv.com
    </div>
    <div class="designiy-image-upload-form">
      <div class="designiy-image-upload-form-label">贴纸名称</div>
      <Input></Input>
      <div class="designiy-image-upload-form-label">描述</div>
      <Textarea></Textarea>
      <div style="flex: 1"></div>
      <Button :disabled="loading || !previewUrl" @click="submit">
        上传该图片
      </Button>
    </div>
  </div>
</template>

<script setup>
import iconUpload from "@/icon/upload.svg?component";
import { ref, reactive, watch, computed, shallowRef } from "vue";
import { uploadImage } from "@/api/index";
import { uploadToCOS } from "@/api/cos";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";

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
}

.upload-dragger {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  row-gap: 10px;
  align-items: center;
  cursor: pointer;
  border: 1px dashed var(--1s-control-border-color, #d9d9d9);
  border-radius: 6px;
  overflow: hidden;
  box-sizing: border-box;
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
  color: var(--1s-text-color-secondary);
}
</style>
