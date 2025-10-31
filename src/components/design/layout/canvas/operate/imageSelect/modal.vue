<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2025-05-20 06:50:38
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-06-04 20:52:46
 * @FilePath: /1s/src/components/design/layout/canvas/operate/imageSelect/modal.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <a-modal
    v-bind="$attrs"
    width="960px"
    style="min-width: 960px"
    title="选择基础图片"
    :footer="null"
    :destroyOnClose="true"
  >
    <div class="model">
      <s1-scrollbar>
        <div v-infinite-scroll="getList" :infinite-scroll-distance="150">
          <el-row style="row-gap: 4px; padding: 20px">
            <el-col :span="24 / column" v-for="item in list" align="center">
              <div @click="useAsCanvasImage(item)">
                <s1-image class="img" :src="item?.url"> </s1-image>
              </div>
            </el-col>
          </el-row>
          <loadingBottom v-if="loading"></loadingBottom>
        </div>
      </s1-scrollbar>
    </div>
  </a-modal>
</template>

<script setup lang="tsx">
import { ref, onBeforeMount, watch } from "vue";
import { Search, ArrowRightBold, Operation, ArrowRight } from "@element-plus/icons-vue";
import { getStickerList } from "@/api";
import { usePaging } from "@/hooks/data/paging.ts";
import desimage from "@/components/image.vue";
import { showImageSelectModal } from "./index.tsx";
import { currentModelController, viewDisplayController } from "@/components/design/store";
import { initDraggableElement } from "@/components/design/utils/draggable";
import { imgToFile, createImgObjectURL, imgToBase64 } from "@/common/transform/index";

import { useLoadingOptions } from "@/components/loading/index.tsx";

import { loadingBottom } from "@/components/loading/index.tsx";
import { currentOperatingCanvasChild } from "@/components/design/layout/canvas/index.tsx";
import Utils from "@/common/utils";

// 列表展示几列
const column = ref(8);

const loadingOptions = useLoadingOptions({});

const emits = defineEmits(["close"]);

/*
    作为当前
*/
function useAsCanvasImage(item) {
  currentOperatingCanvasChild.value.imageInfo = item;

  emits("close");
}

const { list, getList, loading, reset, firstLoading, subsequentLoading } = usePaging(
  (params) => {
    return getStickerList({
      ...params,
      pageSize: 20,
      type: "image,texture",
    });
  },
  {
    immediate: false,
  }
);

watch(showImageSelectModal, (val) => {
  if (val) {
    getList();
  }
});
</script>

<style scoped lang="less">
.model {
  // width: 920px;
  height: 500px;
}

.img {
  width: 100px !important;
  height: 100px !important;
  background: #f1f1f1;
}
</style>
