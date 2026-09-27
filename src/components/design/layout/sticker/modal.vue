<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2025-05-20 06:50:38
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-06-02 20:00:24
 * @FilePath: /1s/src/components/design/layout/sticker/modal.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="model">
    <scrollbar>
      <div v-infinite-scroll="getList" :infinite-scroll-distance="150">
        <div class="flex flex-wrap gap-y-4 p-5">
          <div
            v-for="item in list"
            :key="item.id"
            class="flex flex-col items-center"
            :style="{ width: `${100 / column}%` }"
          >
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <div>
                  <s1-image class="img" padding="5%" :src="item.url"> </s1-image>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem
                  v-if="item.type == 'image'"
                  @select="useAsCanvasImage(item)"
                >
                  使用该图片作为当前背景元素
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <loadingBottom v-if="loading"></loadingBottom>
      </div>
    </scrollbar>
  </div>
</template>

<script setup lang="tsx">
import { ref, onBeforeMount } from "vue";
import { getStickerList } from "@/api";
import { usePaging } from "@/hooks/data/paging.ts";
import desimage from "@/components/image.vue";
import stickerPopover from "./stickerPopover.vue";
import { viewDisplayController } from "@/components/design/store";
import { initDraggableElement } from "@/components/design/utils/draggable";
import { imgToFile, createImgObjectURL, imgToBase64 } from "@/common/transform/index";
import tags from "./tags.vue";
import { useLoadingOptions } from "@/components/loading/index.tsx";
import scrollbar from "@/components/scrollbar/index.vue";
import { stickerQueryParams, stickerLabelMap, StickerType } from "./index.tsx";
import { loadingBottom } from "@/components/loading/index.tsx";
import { currentOperatingCanvasChild } from "@/components/design/layout/canvas/index.tsx";
import Utils from "@/common/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// 列表展示几列
const column = ref(8);

const loadingOptions = useLoadingOptions({});

/*
    作为当前
*/
function useAsCanvasImage(item) {
  if (currentOperatingCanvasChild.value.type != "image") {
    throw "当前操作的不是图片元素";
  }
  currentOperatingCanvasChild.value.imageInfo = item;
  viewDisplayController.value.showStickerModal = false;
}

const { list, getList, loading, reset, firstLoading, subsequentLoading } = usePaging(
  (params) => {
    return getStickerList({
      ...params,
      pageSize: 20,
      ...stickerQueryParams.value,
    });
  },
  {
    forEach(item) {
      item.url = Utils.formatUrl(item.url);
    },
  }
);
</script>

<style scoped lang="less">
.model {
  width: 920px;
  height: 500px;
}

.img {
  width: 100px;
  height: 100px;
  background: var(--1s-control-surface-muted);
}
</style>
