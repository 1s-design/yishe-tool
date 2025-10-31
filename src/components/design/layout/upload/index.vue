<template>
  <div class="upload-container">
    <div class="content">
    <div v-if="uploadTabType == 'local'">
      <el-upload
        ref="uploadRef"
        style="padding: 0"
        :disabled="!loginStore.isLogin"
        v-model:file-list="fileList"
        drag
        :before-remove="beforeRemove"
        :auto-upload="false"
        :multiple="false"
        v-bind="$attrs"
        :on-change="fileListChange"
        :limit="999"
        :on-exceed="handleExceed"
        :accept="Utils.const.RecourceFileAcceptString"
      >
        <div class="placeholder">
          <icon-file-upload></icon-file-upload>
          <div>点击或拖拽上传, jpg,png,svg,ttf,woff,psd ,glb</div> 
        </div>
        <template #tip>
        </template>

        <template #file="{ file, url }">
          <div class="file-bar">
            <div class="file-bar-header">
              <s1-img
                v-if="Utils.type.isImageName(file.name)"
                @focus="null"
                :src="file.url"
                style="height: 32px; width: 32px"
                fit="contain"
              ></s1-img>
              <el-icon v-else size="32px">
                <component :is="fileTypeIcons[getFileSuffix(file.name)]"></component>
              </el-icon>

              <div style="font-size: 12px">{{ file.name }}</div>

              <div style="flex: 1"></div>
              <div>{{ file.displaySize }}</div>
              <el-button @click="removeFile(file)" type="danger" link style="height: 2em"
                ><el-icon size="2rem"> <CircleCloseFilled /> </el-icon
              ></el-button>
            </div>

            <el-form
              :inline-message="false"
              :show-message="false"
              label-width="100px"
              label-position="left"
            >
              <el-form-item label="资源名称">
                <el-input v-model="file.customName" placeholder="资源名称" />
              </el-form-item>
              <el-form-item label="文件描述">
                <el-input
                  v-model="file.description"
                  placeholder="文件描述"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 5 }"
                />
              </el-form-item>
              <el-form-item label="文件标签">
                <tags-input
                  v-model="file.tags"
                  :autocompleteTags="
                    Utils.type.isFontName(file.name)
                      ? fontAutoplacementTags
                      : imageAutoplacementTags
                  "
                  :autocompleteWidth="460"
                ></tags-input>
              </el-form-item>

              <el-form-item label="是否公开资源">
                <a-switch
                  v-model:checked="file.isPublic"
                  checked-children="公开"
                  un-checked-children="私密"
                />
              </el-form-item>

              <el-form-item
                v-if="Utils.type.isImageName(file.name)"
                label="是否作为材质文件"
              >
                <a-switch
                  v-model:checked="file.isTexture"
                  checked-children="是"
                  un-checked-children="否"
                />
              </el-form-item>
            </el-form>

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
              <a-alert
                message="该图片会作为字体预览图，并且可以手动调整内容"
                type="info"
              />
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
      </el-upload>
    </div>

    <div v-if="uploadTabType == 'scan'" class="flex flex-col justify-center items-center">
      <div class="qrcode" style="width: 10rem; height: 10rem"></div>
      <div class="tip">打开app扫码上传</div>
    </div>
    </div>

    <div class="footer">
      <el-button link type="danger">
        {{ loginStore.isLogin ? "" : "当前未登录，请登录后再上传" }}
      </el-button>
      <div style="flex: 1"></div>
      <template v-if="uploadTabType == 'local'">
        <!-- <el-button round :icon="Link" @click="showLinkUploadModal = true">
          链接上传
        </el-button>
        <el-button round @click="uploadTabType = 'scan'" :icon="Iphone">
          手机扫码上传
        </el-button> -->
        <el-button
          type="primary"
          round
          @click="doUpload"
          :loading="loading"
          :icon="UploadFilled"
          :disabled="fileList.length == 0"
        >
          {{ fileList.length ? `上传该文件` : "选择文件" }}
        </el-button>
      </template>
      <template v-if="uploadTabType == 'scan'">
        <el-button round @click="uploadTabType = 'local'"> 返回本地上传 </el-button>
      </template>
    </div>
  </div>

  <a-modal
    v-model:open="showLinkUploadModal"
    centered
    title="链接上传"
    @ok="linkUploadOk"
    :confirmLoading="linkUploadConfirmLoading"
  >
    <a-textarea
      placeholder="请输入文件地址"
      v-model:value="linkUploadUrl"
      type="textarea"
      auto-size
    >
    </a-textarea>
    <p>请确保输入完成的地址，以防止加载失败，目前只支持图片和字体类型</p>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, toRaw, nextTick } from "vue";
import { message } from "ant-design-vue";
import Api, { uploadManyFile, createSticker, uploadFile } from "@/api";
import { uploadToCOS } from "@/api/cos";
import { showUpload } from "@/components/design/store.ts";
import {
  UploadFilled,
  CircleCloseFilled,
  QuestionFilled,
  View,
  Warning,
  Iphone,
  Link,
} from "@element-plus/icons-vue";
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
import { genFileId } from "element-plus";
import { uploadRef } from "./index";
import baseGltfViewer from "@/components/model/baseGltfViewer/index.vue";
import { fetchFile } from "@/api";
import { apiInstance } from "@/api/apiInstance";

import { saveAs } from "file-saver";
import { uploadFont } from "@/api";
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
  png: iconImg,
  svg: iconImg,
  ttf: iconFont,
  glb: iconGlb,
  otf: iconFont,
  psd: iconPsd,
};

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

  // 自动识别文件后缀
  let suffix = '';
  if (file.name) {
    const match = file.name.match(/\.([a-zA-Z0-9]+)$/);
    if (match) {
      suffix = match[1].toLowerCase();
    }
  }

  if (Utils.type.isImageName(file.name)) {
    const fileCos = await uploadToCOS({ file: file.raw });

    debugger;
    const params = {
      name: file.customName,
      size: file.size,
      url: fileCos.url,
      keywords,
      description: file.description,
      isPublic: file.isPublic,
      isTexture:file.isTexture,
      uploaderId: loginStore.userInfo.id,
      suffix // 图片类型后缀
    };
    await createSticker(params);
  }


  if (Utils.type.isFontName(file.name)) {
    /* 需要生成缩略图 */

    const png = await htmlToPngFile(fileBarFontPreviewRef.value);

    const thumbnailCos = await uploadToCOS({
      file: png,
    });

    const fileCos = await uploadToCOS({ file: file.raw });

    const params = {
      url: fileCos.url,
      name: file.customName || file.raw.name,
      size: file.size,
      keywords,
      thumbnail: thumbnailCos.url,
      description: file.description,
      isPublic: file.isPublic,
      uploaderId: loginStore.userInfo.id,
      type: file.name.split(".").pop(),
      suffix // 字体类型后缀
    };

    await uploadFont(params);
  }

  if (Utils.type.isModelName(file.name)) {
    /* 需要生成缩略图 */

    const png = baseViewerRef.value.getScreenShotFile();

    const thumbnailCos = await uploadToCOS({
      file: png,
    });

    const fileCos = await uploadToCOS({ file: file.raw });

    const params = {
      url: fileCos.url,
      name: file.customName || file.raw.name,
      size: file.size,
      keywords,
      thumbnail: thumbnailCos.url,
      description: file.description,
      isPublic: file.isPublic,
      uploaderId: loginStore.userInfo.id,
      suffix // 模型类型后缀
    };

    await Api.createProductModel(params);
  }

  if (Utils.type.isPsd(file.name)) {

    const fileCos = await uploadToCOS({ file: file.raw });

    const params = {
      url: fileCos.url,
      name: file.customName || file.raw.name,
      size: file.size,
      keywords,
      thumbnail: null,
      description: file.description,
      isPublic: file.isPublic,
      uploaderId: loginStore.userInfo.id,
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

:deep .el-upload-dragger {
  background: #fff !important;
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

.footer {
  display: flex;
  align-items: center;
  padding: 3rem 1rem 1rem 1rem;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

:deep(.el-upload-list) {
  max-height: 420px;
  overflow-y: auto;
  overflow-x: hidden;

  ::-webkit-scrollbar {
    display: none;
  }
}

:deep(.el-upload-list__item:hover) {
  // background-color: #fafafa;
  background-color: transparent;
}

.file-bar-font-preview {
  min-width: 100px;
  font-size: 48px;
  line-height: 64px;
  color: #000;
  background: transparent;
  padding: 0;
}
</style>