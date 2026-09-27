<template>
  <div class="designiy-font-upload">
    <div
      class="designiy-font-upload-main"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".ttf"
        class="hidden"
        :disabled="files[0]"
        @change="handleFileChange"
      />
      <div
        class="designiy-font-upload-dragger"
        @click="!files[0] && fileInput && fileInput.click()"
      >
        <input
          v-if="files[0]"
          ref="previewEl"
          class="designiy-font-upload-preview"
          contenteditable="true"
          v-model="name"
        />

        <div v-else class="designiy-font-upload-placeholder">
          <icon-upload style="width: 20px; height: 20px"></icon-upload>
          <div style="font-size: 12px">点击或拖拽文件上传</div>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <Separator class="flex-1" />
      <span style="font-size: 10px; color: var(--1s-text-color-tertiary); font-weight: 400"
        >支持类型 ttf woff</span
      >
    </div>
    <Input
      v-model="name"
      placeholder="定义字体名称"
      class="text-[10px]"
    />
    <Textarea
      placeholder="定义字体描述"
      class="text-[10px]"
    />
    <div class="designiy-font-upload-footer">
      <Button size="sm" variant="ghost" @click="clear"> 清除 </Button>
      <Button size="sm" variant="default" @click="submit"> 上传 </Button>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, watch, computed, shallowRef, nextTick } from "vue";
import { Plus } from 'lucide-vue-next'
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import iconUpload from "@/icon/upload-normal.svg?component";

import { toPng, toJpeg, toBlob, toPixelData, toSvg } from "html-to-image";

import { uploadFont } from "@/api";
import { base64ToFile } from "../../../../common/transform/base64ToFile";

const files = ref([]);
const fileInput = ref();
const previewEl = ref();
const name = ref();

var id = 0;

//
watch(files, async (files) => {
  await nextTick();
  const file = files[0];
  if (!file) return;
  name.value = file.name;
  previewEl.value.innerHTML = file.name;
  let fontId = id++;
  const fontStyles = document.createElement("style");
  fontStyles.innerHTML = `
      @font-face {
          font-family: font_${fontId};
          src: url(${URL.createObjectURL(file.raw)}); /* 替换为实际的字体文件相对路径 */
      }
    `;
  document.head.appendChild(fontStyles);
  previewEl.value.style.fontFamily = ` font${fontId++}`;
});

function handleFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  files.value = [{ name: file.name, raw: file }];
  e.target.value = "";
}

function handleDrop(e) {
  const file = e.dataTransfer.files[0];
  if (!file || files.value[0]) return;
  files.value = [{ name: file.name, raw: file }];
}

function clear() {
  files.value = [];
}

async function submit() {
  const base64 = await toPng(previewEl.value);
  await uploadFont({
    file: files.value[0].raw,
    img: base64ToFile(base64),
    name: name.value,
  });
}
</script>

<style lang="less">
.designiy-font-upload {
  padding: 20px;
  row-gap: 10px;
  display: flex;
  flex-direction: column;
  row-gap: 20px;
}

.designiy-font-upload-main {
  .designiy-font-upload-dragger {
    width: 480px;
    height: 160px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    cursor: pointer;
  }
}

.designiy-font-upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 5px;
}

.designiy-font-upload-footer {
  display: flex;
  justify-content: right;
}

.designiy-font-upload-preview {
  outline-style: none;
  font-size: 40px;
  color: var(--1s-text-color);
}
</style>
