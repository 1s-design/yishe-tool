<template>
  <div class="upload-container">
    <div class="content">
    <div v-if="uploadTabType == 'local'">
      <FileUpload
        ref="uploadRef"
        style="padding: 0"
        :disabled="!loginStore.isLogin"
        v-model:file-list="fileList"
        :multiple="false"
        :limit="999"
        :accept="Utils.const.RecourceFileAcceptString"
        @change="fileListChange"
        @exceed="handleExceed"
        v-bind="$attrs"
      >
        <div class="placeholder">
          <icon-file-upload></icon-file-upload>
          <div>点击或拖拽上传, jpg,png,svg,ttf,woff,psd ,glb</div> 
        </div>

        <template #file="{ file, url }">
          <div class="file-bar">
            <div class="file-bar-header">
              <button
                type="button"
                class="file-preview-trigger"
                title="预览文件"
                @click.stop="openFilePreview(file)"
              >
                <s1-img
                  v-if="Utils.type.isImageName(file.name)"
                  @focus="null"
                  :src="file.url"
                  class="file-preview-thumb"
                  fit="contain"
                ></s1-img>
                <component
                  v-else
                  :is="fileTypeIcons[getFileSuffix(file.name)] || FileText"
                  class="h-8 w-8"
                ></component>
              </button>

              <div style="font-size: 12px">{{ file.name }}</div>

              <div style="flex: 1"></div>
              <div>{{ file.displaySize }}</div>
              <Button
                @click="removeFile(file)"
                variant="link"
                class="text-destructive"
                style="height: 2em"
              >
                <XCircle class="h-5 w-5" />
              </Button>
            </div>

            <div class="file-bar-form">
              <div class="file-bar-form-item">
                <Label class="file-bar-form-label">资源名称</Label>
                <Input v-model="file.customName" placeholder="资源名称" />
              </div>
              <div class="file-bar-form-item">
                <Label class="file-bar-form-label">文件描述</Label>
                <Textarea
                  v-model="file.description"
                  placeholder="文件描述"
                  :rows="2"
                />
              </div>
              <div class="file-bar-form-item">
                <Label class="file-bar-form-label">文件标签</Label>
                <tags-input
                  v-model="file.tags"
                  :autocompleteTags="
                    Utils.type.isFontName(file.name)
                      ? fontAutoplacementTags
                      : imageAutoplacementTags
                  "
                  :autocompleteWidth="460"
                ></tags-input>
              </div>

              <div class="file-bar-form-item">
                <Label class="file-bar-form-label">是否公开资源</Label>
                <div class="flex items-center gap-2">
                  <Switch v-model:checked="file.isPublic" />
                  <span class="text-xs text-muted-foreground">{{ file.isPublic ? '公开' : '私密' }}</span>
                </div>
              </div>

              <div
                v-if="Utils.type.isImageName(file.name)"
                class="file-bar-form-item"
              >
                <Label class="file-bar-form-label">是否作为材质文件</Label>
                <div class="flex items-center gap-2">
                  <Switch v-model:checked="file.isTexture" />
                  <span class="text-xs text-muted-foreground">{{ file.isTexture ? '是' : '否' }}</span>
                </div>
              </div>
            </div>

            <template v-if="Utils.type.isFontName(file.name)">
              <div class="flex items-center justify-center" style="padding: 20px">
                <div
                  class="file-bar-font-preview"
                  ref="fileBarFontPreviewRef"
                  contenteditable="true"
                  @vue:mounted="initFontFamily(file, $event)"
                  @paste="fontContainerPaste"
                >
                  {{ file.name }}
                </div>
              </div>
              <div class="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">该图片会作为字体预览图，并且可以手动调整内容</div>
            </template>

            <template v-if="Utils.type.isModelName(file.name)">
              <div class="w-full flex justify-center">
                <base-gltf-viewer
                  ref="baseViewerRef"
                  style="width: 200px; height: 200px"
                  :src="objectUrl"
                ></base-gltf-viewer>
              </div>
            </template>
          </div>
        </template>
      </FileUpload>
    </div>

    <div v-if="uploadTabType == 'scan'" class="flex flex-col justify-center items-center">
      <div class="qrcode" style="width: 10rem; height: 10rem"></div>
      <div class="tip">打开app扫码上传</div>
    </div>
    </div>

    <div class="footer">
      <Button variant="link" class="text-destructive">
        {{ loginStore.isLogin ? "" : "当前未登录，请登录后再上传" }}
      </Button>
      <div style="flex: 1"></div>
      <template v-if="uploadTabType == 'local'">
        <!-- <Button class="rounded-full" @click="showLinkUploadModal = true">
          链接上传
        </Button>
        <Button class="rounded-full" @click="uploadTabType = 'scan'">
          手机扫码上传
        </Button> -->
        <Button
          class="rounded-full"
          @click="doUpload"
          :disabled="loading || fileList.length == 0"
        >
          <UploadCloud class="h-4 w-4 mr-1" />
          {{ fileList.length ? `上传该文件` : "选择文件" }}
        </Button>
      </template>
      <template v-if="uploadTabType == 'scan'">
        <Button class="rounded-full" @click="uploadTabType = 'local'"> 返回本地上传 </Button>
      </template>
    </div>
  </div>

  <Dialog :modal="false" v-model:open="showLinkUploadModal">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>链接上传</DialogTitle>
      </DialogHeader>
      <Textarea
        placeholder="请输入文件地址"
        v-model="linkUploadUrl"
        auto-size
      ></Textarea>
      <p>请确保输入完成的地址，以防止加载失败，目前只支持图片和字体类型</p>
      <DialogFooter>
        <Button variant="ghost" size="sm" @click="showLinkUploadModal = false">取消</Button>
        <Button size="sm" :disabled="linkUploadConfirmLoading" @click="linkUploadOk">确定</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog :modal="false" v-model:open="previewModalOpen">
    <DialogContent class="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 rounded-none gap-0 overflow-hidden flex flex-col">
      <DialogHeader class="px-5 py-3 border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
        <DialogTitle class="text-sm font-semibold">{{ previewFile?.name || '文件预览' }}</DialogTitle>
      </DialogHeader>
      <div class="flex-1 overflow-auto min-h-0">
        <div class="file-preview-shell" v-if="previewFile">
          <img
            v-if="previewKind === 'image'"
            :src="previewFile.url"
            class="file-preview-image"
            :alt="previewFile.name"
          />
          <iframe
            v-else-if="previewKind === 'pdf' || previewKind === 'text'"
            :src="previewFile.url"
            class="file-preview-frame"
            :title="previewFile.name"
          ></iframe>
          <video
            v-else-if="previewKind === 'video'"
            :src="previewFile.url"
            class="file-preview-media"
            controls
          ></video>
          <audio
            v-else-if="previewKind === 'audio'"
            :src="previewFile.url"
            class="file-preview-audio"
            controls
          ></audio>
          <div v-else-if="previewKind === 'model'" class="file-preview-model">
            <base-gltf-viewer :src="previewFile.url"></base-gltf-viewer>
          </div>
          <div v-else class="file-preview-fallback">
            <component
              :is="fileTypeIcons[getFileSuffix(previewFile.name)] || FileText"
              class="h-20 w-20"
            ></component>
            <div class="file-preview-fallback-name">{{ previewFile.name }}</div>
            <div class="file-preview-fallback-meta">
              {{ getFileSuffix(previewFile.name).toUpperCase() || 'FILE' }}
              <span v-if="previewFile.displaySize"> · {{ previewFile.displaySize }}</span>
            </div>
            <a :href="previewFile.url" :download="previewFile.name" class="file-preview-download">
              下载文件
            </a>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, toRaw, nextTick } from "vue";
import { message } from '@/common/message';
import Api, { uploadManyFile, createSticker, uploadFile } from "@/api";
import { uploadToCOS } from "@/api/cos";
import { showUpload } from "@/components/design/store.ts";
import { FileText, XCircle, UploadCloud } from "lucide-vue-next";
import iconFileUpload from "@/icon/file-upload.svg";
import iconImg from "@/icon/fileType/img.svg";

import iconFont from "@/icon/fileType/font.svg";
import iconGlb from "@/icon/fileType/glb.svg";
import iconPsd from "@/icon/fileType/psd.svg";
import tags from "@/components/design/components/tags.vue";
import tagsInput from "@/components/design/components/tagsInput/tagsInput.vue";
import {
  fontAutoplacementTags,
  imageAutoplacementTags,
} from "@/components/design/components/tagsInput/index.ts";

import { htmlToPngFile } from "@/common/transform";
import {} from "@/components/design/utils/utils";
import Utils from "@/common/utils";
import { useLoginStatusStore } from "@/store/stores/login";
import { filesize } from "filesize";
import { genFileId } from "@/components/ui/file-upload";
import { uploadRef } from "./index";
import baseGltfViewer from "@/components/model/baseGltfViewer/index.vue";
import { fetchFile } from "@/api";
import { apiInstance } from "@/api/apiInstance";

import { saveAs } from "file-saver";
import { uploadFont } from "@/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
const loginStore = useLoginStatusStore();

/*
  scan
  local
  link
*/
const uploadTabType = ref("local");

/**
 * @description 链接上传逻辑
 */

const showLinkUploadModal = ref(false);

const linkUploadConfirmLoading = ref(false);

const linkUploadUrl = ref("");

async function linkUploadOk() {
  try {
    linkUploadConfirmLoading.value = true;

    let file = await fetchFile(linkUploadUrl.value, {
      method: "GET",
      mode: "cors",
    });

    if (!Utils.type.isImageFileType(file.type) && !Utils.type.isFontFileType(file.type)) {
      return message.warning("不合理的文件类型，或无效的地址");
    }

    // 这里需要判断类型并且判断一下

    file.uid = genFileId();
    uploadRef.value!.handleStart(file);
    showLinkUploadModal.value = false;
  } catch (e) {
    console.log(e);
    message.warning("文件请求失败，请检查链接地址");
  } finally {
    linkUploadConfirmLoading.value = false;
  }
}

/**
 *  @description 如果同时上传多个 ， 会多次调用
 * */

const objectUrl = ref();

function fileListChange(file) {
  // 为文件生成一个预览的路径
  file.url = URL.createObjectURL(file.raw);
  file.displaySize = filesize(file.size);
  objectUrl.value = URL.createObjectURL(file.raw);
}

/* 获取文件后缀 */
function getFileSuffix(filename) {
  return filename.split(".").pop();
}

const fileTypeIcons = {
  jpg: iconImg,
  jpeg: iconImg,
  png: iconImg,
  webp: iconImg,
  svg: iconImg,
  ttf: iconFont,
  glb: iconGlb,
  gltf: iconGlb,
  otf: iconFont,
  woff: iconFont,
  woff2: iconFont,
  psd: iconPsd,
};

const previewModalOpen = ref(false);
const previewFile = ref<any>(null);
const previewKind = ref("file");

function getPreviewKind(file) {
  const suffix = getFileSuffix(file?.name || "").toLowerCase();
  const type = String(file?.raw?.type || file?.type || "").toLowerCase();
  if (Utils.type.isImageName(file?.name || "")) return "image";
  if (suffix === "pdf" || type === "application/pdf") return "pdf";
  if (["mp4", "webm", "ogg", "mov"].includes(suffix) || type.startsWith("video/")) return "video";
  if (["mp3", "wav", "ogg", "m4a", "aac"].includes(suffix) || type.startsWith("audio/")) return "audio";
  if (["txt", "csv", "json", "md", "html", "css", "js", "ts"].includes(suffix) || type.startsWith("text/")) return "text";
  if (Utils.type.isModelName(file?.name || "")) return "model";
  return "file";
}

function openFilePreview(file) {
  previewFile.value = file;
  previewKind.value = getPreviewKind(file);
  previewModalOpen.value = true;
}

/**
 * @description 暂时不支持多个文件上传
 */

async function handleExceed(files) {
  uploadRef.value!.clearFiles();
  const file = files[0];
  // 手动选择文件
  await nextTick();
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
}

const baseViewerRef = ref();

function close() {
  loading.value = false;
}

/*
 如果上传的是字体的话，直接生成缩略图
*/
var id = 999;
function initFontFamily(file, e) {
  if (!Utils.type.isFontName(file.name)) {
    return;
  }

  const el = e.el;
  const fontId = `font_${id++}`;
  const style = document.createElement("style");

  style.innerHTML = `
                @font-face {
                    font-family: ${fontId};
                    src: url(${URL.createObjectURL(file.raw)});
                }
              `;

  document.head.appendChild(style);

  el.style.fontFamily = fontId;
  // 在文件列表中保存当前元素，用于获取缩略图
  file.el = el;
}

// 文件列表
const fileList = ref([]);

function removeFile(file) {
  fileList.value.splice(fileList.value.indexOf(file), 1);
}

/**
 * @description 防止删除键将选中的文件删除
 */
function beforeRemove() {
  return false;
}

const loading = ref(false);

const fileBarFontPreviewRef = ref();

async function uploadSingleFile(file) {
  file = toRaw(file);
  const keywords = file.tags && file.tags.join(",");
  const userAccount = loginStore.userInfo?.account || loginStore.userInfo?.name || 'anonymous'
  const userId = loginStore.userInfo?.id

  // 自动识别文件后缀
  let suffix = '';
  if (file.name) {
    const match = file.name.match(/\.([a-zA-Z0-9]+)$/);
    if (match) {
      suffix = match[1].toLowerCase();
    }
  }

  if (Utils.type.isImageName(file.name)) {
    const fileCos = await uploadToCOS({ 
      file: file.raw,
      category: 'sticker',
      account: userAccount,
      userId
    });

    const params = {
      name: file.customName,
      size: file.size,
      url: fileCos.url,
      keywords,
      description: file.description,
      isPublic: file.isPublic,
      isTexture:file.isTexture,
      userId: loginStore.userInfo.id,
      suffix // 图片类型后缀
    };
    await createSticker(params);
  }


  if (Utils.type.isFontName(file.name)) {
    /* 需要生成缩略图 */

    const png = await htmlToPngFile(fileBarFontPreviewRef.value);

    // 先上传字体文件，然后使用其ID作为entityId上传缩略图
    const fileCos = await uploadToCOS({ 
      file: file.raw,
      category: 'font-template',
      account: userAccount,
      userId
    });

    // 注意：这里缩略图暂时没有entityId，因为字体文件刚上传还没有ID
    // 如果需要，可以先创建字体记录获取ID，再上传缩略图
    const thumbnailCos = await uploadToCOS({
      file: png,
      category: 'font-template',
      account: userAccount,
      userId,
      isThumbnail: true
    });

    const params = {
      url: fileCos.url,
      name: file.customName || file.raw.name,
      size: file.size,
      keywords,
      thumbnail: thumbnailCos.url,
      description: file.description,
      isPublic: file.isPublic,
      userId: loginStore.userInfo.id,
      type: file.name.split(".").pop(),
      suffix // 字体类型后缀
    };

    await uploadFont(params);
  }

  if (Utils.type.isModelName(file.name)) {
    /* 需要生成缩略图 */

    const png = baseViewerRef.value.getScreenShotFile();

    // 先上传模型文件，然后使用其ID作为entityId上传缩略图
    const fileCos = await uploadToCOS({ 
      file: file.raw,
      category: 'product-model',
      account: userAccount,
      userId
    });

    // 注意：这里缩略图暂时没有entityId，因为模型文件刚上传还没有ID
    // 如果需要，可以先创建模型记录获取ID，再上传缩略图
    const thumbnailCos = await uploadToCOS({
      file: png,
      category: 'product-model',
      account: userAccount,
      userId,
      isThumbnail: true
    });

    const params = {
      url: fileCos.url,
      name: file.customName || file.raw.name,
      size: file.size,
      keywords,
      thumbnail: thumbnailCos.url,
      description: file.description,
      isPublic: file.isPublic,
      userId: loginStore.userInfo.id,
      suffix // 模型类型后缀
    };

    await Api.createProductModel(params);
  }

  if (Utils.type.isPsd(file.name)) {
    const fileCos = await uploadToCOS({ 
      file: file.raw,
      category: 'psd-template',
      account: userAccount,
      userId
    });

    const params = {
      url: fileCos.url,
      name: file.customName || file.raw.name,
      size: file.size,
      keywords,
      thumbnail: null,
      description: file.description,
      isPublic: file.isPublic,
      userId: loginStore.userInfo.id,
      type: file.name.split(".").pop(),
      suffix // PSD文件后缀
    };
    await uploadFile(params);
  }
}

/**
 * 防止拷贝时多余的样式影响
 */
function fontContainerPaste(e: ClipboardEvent) {
  // 阻止默认的粘贴行为
  e.preventDefault();

  // 获取剪贴板中的纯文本
  const text = e.clipboardData?.getData("text/plain") ?? "";
  // 将纯文本插入到光标位置
  document.execCommand("insertText", false, text);
}

async function doUpload() {
  if (!fileList.value.length) {
    return;
  }

  /*
   上传时区分 图片和字体等其他文件
   图片直接上传到 贴纸
   其他上传到文件
 */

  loading.value = true;

  try {
    await Promise.all(fileList.value.map(uploadSingleFile));
    message.success("上传成功!");
    // showUpload.value = false;
    loading.value = false;
    fileList.value = [];
  } catch (e) {

    message.error("上传失败!");
    loading.value = false;
  }
}
</script>




<style lang="less" scoped>
.upload-container {
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  // max-height: 70vh; 
  overflow: hidden;
  width: 100%;
}

.content {
  flex: 1 1 auto;
  min-height: 0; // 使内部滚动生效
  overflow-y: auto;
  overflow-x: hidden;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  row-gap: 12px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

:deep .file-upload-trigger {
  background: var(--1s-surface-background) !important;
}

.tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  font-size: 1rem;
  font-weight: bold;
  width: 100%;
  color: #ccc;
}

.file-bar {
  border-radius: 4px;
  padding: 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  row-gap: 20px;
}

.file-bar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 1em;
  display: flex;
  font-size: 1rem;
}

.file-preview-trigger {
  width: 40px;
  height: 40px;
  padding: 4px;
  border: 1px solid #ececec;
  border-radius: 6px;
  background: var(--1s-surface-background);
  color: #555;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
}

.file-preview-trigger:hover {
  border-color: var(--1s-color-primary, #6900ff);
  color: var(--1s-color-primary, #6900ff);
}

.file-preview-thumb {
  width: 32px;
  height: 32px;
}

.footer {
  display: flex;
  align-items: center;
  padding: 3rem 1rem 1rem 1rem;
  background: var(--1s-surface-background);
  border-top: 1px solid #f0f0f0;
}

:deep(.file-upload-list) {
  max-height: 420px;
  overflow-y: auto;
  overflow-x: hidden;

  ::-webkit-scrollbar {
    display: none;
  }
}

:deep(.file-upload-item:hover) {
  // background-color: #fafafa;
  background-color: transparent;
}

.file-bar-form {
  display: flex;
  flex-direction: column;
  column-gap: 1em;
  row-gap: 12px;
  width: 100%;
}

.file-bar-form-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  column-gap: 1em;
}

.file-bar-form-label {
  width: 100px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--1s-text-color-secondary);
  text-align: left;
}

.file-bar-font-preview {
  min-width: 100px;
  font-size: 48px;
  line-height: 64px;
  color: var(--1s-text-color);
  background: transparent;
  padding: 0;
}
</style>

<style lang="less">
.file-preview-shell {
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--1s-control-surface-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.file-preview-frame {
  width: 100%;
  height: 100%;
  border: 0;
  background: var(--1s-surface-background);
}

.file-preview-media {
  width: min(100%, 1200px);
  max-height: 100%;
}

.file-preview-audio {
  width: min(720px, calc(100% - 48px));
}

.file-preview-model {
  width: 100%;
  height: 100%;
}

.file-preview-fallback {
  color: var(--1s-text-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
}

.file-preview-fallback-name {
  max-width: min(680px, calc(100vw - 48px));
  overflow-wrap: anywhere;
  font-size: 18px;
  font-weight: 600;
}

.file-preview-fallback-meta {
  color: var(--1s-text-color-secondary);
  font-size: 13px;
}

.file-preview-download {
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 6px;
  padding: 7px 14px;
}
</style>
