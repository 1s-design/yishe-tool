<template>
  <div class="main">
    <header></header>
    <sticker-canvas class="canvas"></sticker-canvas>
    <operating-form></operating-form>
    <footer>
      <div class="footer-btns">
        <Button :disabled="loading" @click="exportPng"> 导出 png </Button>
        <!-- <Button @click="exportTextStickerSvg" variant="default"> 导出svg </Button> -->
        <Button variant="ghost"> 分享 </Button>
        <Button
          variant="ghost"
          @click="confirm({ title: '确认要上传该贴纸吗', okText: '确认', cancelText: '暂不' }).then((ok) => ok && upload())"
        >
          上传
        </Button>
      </div>
    </footer>
  </div>
</template>
<script setup>
import { ref } from "vue";
import stickerCanvas from "./canvas.vue";
import operatingForm from "./operatingForm.vue";
import { uploadTextSticker, createSticker, uploadToCOS } from "@/api";
import { base64 } from "./watch";
import { base64ToFile } from "@/common/transform/base64ToFile";
import {
  exportTextStickerFile,
  exportTextStickerPng,
  exportTextStickerSvg,
} from "./watch";
import { message } from '@/common/message';
import { Button } from '@/components/ui/button';
import { confirm } from '@/components/ui/confirm';

const loading = ref(false);

/*
 导出本地png格式
*/
function exportPng() {
  exportTextStickerPng();
}

async function upload() {
  let file = await exportTextStickerFile();
  const { getLocalUserInfo } = await import("@/store/stores/loginAction");
  const userInfo = getLocalUserInfo();
  const currentUser = userInfo?.userInfo || userInfo || {};
  let cos = await uploadToCOS({
    file,
    category: "sticker",
    account: currentUser?.account || currentUser?.name || "anonymous",
    userId: currentUser?.id,
  });
  await createSticker({
    url: cos.url,
    thumbnail: cos.url,
    type: "text",
    userId: currentUser?.id || null,
  });
  message.success("上传成功");
}
</script>
<style lang="less" scoped>
header {
  width: 90%;
  height: 20px;
}
.main {
  height: 100%;
  width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.canvas {
  width: 300px;
  height: 300px;
}

footer {
  padding: 1em;
  width: 100%;
  .footer-btns {
    display: flex;
    width: 100%;
    button {
      flex: 1;
    }
  }
}
</style>
