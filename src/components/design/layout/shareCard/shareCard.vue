<template>
  <div
    ref="targetRef"
    :style="{
      width: width + 'px',
      height: height + 'px',
      padding: width / 108 + 'px',
      borderRadius: width / 72 + 'px',
    }"
    class="share-card-bg"
    style="
      background-image: conic-gradient(
        from 0deg,
        #ff4545,
        #00ff99,
        #006aff,
        #ff0095,
        #ff4545
      );
      user-select: none;
    "
  >
    <div
      style="
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        background-color: rgba(28, 31, 43, 0.99);
      "
      :style="{
        rowGap: width / 20 + 'px',
        padding: `${width / 18}px`,
        backdropFilter: `blur(${width / 2}px)`,
        borderRadius: width / 72 + 'px',
      }"
      class="share-card flex flex-col items-center justify-between"
    >
      <s1-img
        :src="info?.thumbnail?.url"
        :style="{
          width: width / 1.1 + 'px',
          height: width / 1.1 + 'px',
          borderRadius: width / 24 + 'px',
        }"
        style="background: rgba(255, 255, 255, 0.05)"
      ></s1-img>

      <div
        style="color: rgba(255, 255, 255, 0.1); font-family: ins"
        :style="{ fontSize: width / 16 + 'px' }"
      >
        <!-- do something special -->
      </div>

      <!-- <div style="flex: 1"></div> -->

      <div
        class="flex justify-between items-center"
        style="width: 100%"
        :style="{ padding: width / 72 + 'px' }"
      >
        <div>
          <div
            style="color: #fff; font-weight: bold"
            :style="{ fontSize: width / 16 + 'px', width: width / 2 + 'px' }"
            class="text-ellipsis"
          >
            {{ info.name || "无名称" }}
          </div>
          <div
            style="color: rgba(255, 255, 255, 0.6)"
            :style="{ fontSize: width / 36 + 'px', width: width / 2 + 'px' }"
            class="text-ellipsis"
          >
            {{ info.description || "无描述" }}
          </div>
          <div
            style="color: rgba(255, 255, 255, 0.6)"
            :style="{ fontSize: width / 36 + 'px', width: width / 2 + 'px' }"
            class="text-ellipsis"
          >
            {{ info.keywords || "无标签" }}
          </div>
          <div
            style="color: rgba(255, 255, 255, 0.6)"
            :style="{ fontSize: width / 36 + 'px', width: width / 2 + 'px' }"
            class="text-ellipsis"
          >
            创建于 {{ info.createTime }}
          </div>
        </div>
        <div ref="qrcodeRef" style="flex-shrink: 0"></div>
      </div>

      <div
        style="font-weight: bold; color: rgba(255, 255, 255, 0.3); font-family: ins"
        :style="{ fontSize: width / 40 + 'px' }"
      >
        Designed by {{ info?.uploader?.account || "anonymous" }} on {{ shareBrandName }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { publicAppConfig } from "@/config/public";
import { ref, onMounted } from "vue";
import { createCustomModelShareLink } from "./index.ts";
import QRCodeStyling from "qr-code-styling";
import { htmlToPngFile, downloadByFile } from "@/common/transform";

const props = defineProps({
  width: {
    default: 320,
  },
  info: {
    default: null,
  },
});

let height = ref(props.width / 0.618);

const qrcodeRef = ref();

const targetRef = ref();
const shareBrandName = publicAppConfig.shortName;

onMounted(() => {
  let qr = new QRCodeStyling({
    data: createCustomModelShareLink(props.info.id), // web 端和移动端共用一个地址
    width: props.width / 3,
    height: props.width / 3,
    margin: 0,
    dotsOptions: {
      color: "#000000", // 点的颜色
      gradient: {
        type: "linear", // 渐变类型
        rotation: 90,
        colorStops: [
          { offset: 0, color: "#6900ff" }, // 渐变起始颜色
          { offset: 1, color: "#6900ff" }, // 渐变结束颜色
        ],
      },
    },
    backgroundOptions: {
      // 设置背景为透明
      color: "transparent",
    },
  });
  qr.append(qrcodeRef.value);
});

/*
  复制该分享链接
*/
async function download() {
  const file = await htmlToPngFile(targetRef.value, "ecard");
  downloadByFile(file);
}

async function getFile() {
  const file = await htmlToPngFile(targetRef.value, "ecard");
  return file;
}

async function share() {
  let file = await getFile();
  navigator.share({
    files: [file],
    text: props.info.description,
    title: props.info.name,
    url: createCustomModelShareLink(props.info.id),
  });
}

function copylink() {
  navigator.clipboard.writeText(createCustomModelShareLink(props.info.id));
}

defineExpose({
  download: download,
  copylink: copylink,
  getFile: getFile,
  share: share,
});
</script>

<style lang="less"></style>
