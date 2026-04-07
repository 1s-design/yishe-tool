<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2025-05-20 06:50:38
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-07-22 19:51:34
 * @FilePath: /1s/src/components/design/layout/project/sticker/stickerDetailModal.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <a-modal
    v-model:open="show"
    :footer="null"
    :centered="true"
    :destroyOnClose="true"
    @close="close"
    width="980px"
    wrap-class-name="project-detail-modal"
  >
    <div class="flex">
      <s1-img
        :src="detailInfo.url"
        class="sticker-detail-image"
        @load="imgLoad"
      >
      </s1-img>
      <div class="sticker-detail-side flex flex-col">
        <h1 class="sticker-detail-title">{{ detailInfo.name }}</h1>
        <h6 class="sticker-detail-text">{{ detailInfo.description }}</h6>
        <h6 class="sticker-detail-text">{{ detailInfo.keywords }}</h6>
        <h6 class="sticker-detail-text sticker-detail-time">{{ detailInfo.updateTime }}</h6>
        <div class="color-palette flex">
          <div
            v-for="color in colors"
            :key="color"
            class="sticker-detail-color"
            :style="{ background: color }"
            @click="copyColor(color)"
            :title="'点击复制 ' + color"
          ></div>
        </div>
      </div>
    </div>
  </a-modal>
</template>
<script setup lang="ts">
import { useStickerDetailModal } from "./stickerModal.ts";
import { ref } from "vue";
import Utils from "@/common/utils";
import { message } from "ant-design-vue";

const { show, detailInfo } = useStickerDetailModal();

const palette = ref();

const colors = ref([]);

function close() {
  colors.value = [];
}

// 复制颜色到剪贴板并提示
function copyColor(color: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(color).then(() => {
      message.success("已复制: " + color);
    });
  } else {
    // fallback
    const input = document.createElement('input');
    input.value = color;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    message.success("已复制: " + color);
  }
}

// 图片加载完成
async function imgLoad(img) {
  img.crossOrigin = "Anonymous";
  let _palette = (await Utils.color.getPalette(img)) as Array<[number, number, number]>;

  colors.value = _palette.map((rgb) => {
    return `rgba(${rgb.join(",")})`;
  });

  palette.value = _palette;
}
</script>

<style lang="less" scoped>
.sticker-detail-image {
  width: 480px;
  height: 480px;
  flex-shrink: 0;
  border-radius: 10px;
  border: 1px solid var(--1s-control-border-color);
  background: var(--1s-control-surface-muted);
}

.sticker-detail-side {
  padding: 24px;
  row-gap: 12px;
  color: var(--project-text-primary, var(--1s-text-color));
}

.sticker-detail-title {
  color: var(--project-text-primary, var(--1s-text-color));
}

.sticker-detail-text {
  color: var(--project-text-secondary, var(--1s-text-color-secondary));
  line-height: 1.6;
}

.sticker-detail-time {
  color: var(--project-text-tertiary, var(--1s-text-color-tertiary));
}

.color-palette {
  column-gap: 12px;
  flex-wrap: wrap;
  row-gap: 12px;
}

.sticker-detail-color {
  width: 24px;
  height: 24px;
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid var(--1s-control-border-color);
  box-shadow: var(--1s-shadow-sm);
}
</style>
