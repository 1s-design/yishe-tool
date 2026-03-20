<template>
  <div class="layout">
    <van-nav-bar>
      <template #title> </template>
      <template #left>
        <div style="column-gap: 12px" class="flex items-center">
          <van-button plain icon="revoke" size="small" @click="back">返回</van-button>

          <van-button
            v-if="!loginStore.isLogin"
            color="linear-gradient(to right, #f00090, #6900ff)"
            size="small"
            @click="login"
          >
            去登录
          </van-button>

          <avatar v-else></avatar>
        </div>
      </template>
      <template #right>
        <van-button
          v-if="isDesign3DEnabled"
          size="small"
          icon="share-o"
          icon-position="right"
          color="linear-gradient(to right, #f00090, #861fed)"
          @click="save"
          >保存并分享</van-button
        >
      </template>
    </van-nav-bar>

    <div
      style="flex: 1"
      :class="isDesign3DEnabled ? 'three-canvas' : 'design-disabled-panel'"
      ref="threeCanvasRef"
    >
      <template v-if="!isDesign3DEnabled">
        <div class="design-disabled-panel__title">3D 设计功能已暂时停用</div>
        <div class="design-disabled-panel__desc">
          当前移动端先关闭服装模型预览与相关操作，避免无用渲染影响体验和性能。
        </div>
      </template>
    </div>

    <van-action-bar v-if="isDesign3DEnabled" style="padding: 4px 12px" class="action-bar">
      <van-action-bar-icon
        @click="showProductPopup = true"
        :dot="!currentOperatingBaseModelInfo"
      >
        <template #default> 服装模型 </template>
        <template #icon>
          <div class="action-bar-icon">
            <van-icon :name="clothIcon" />
          </div>
        </template>
      </van-action-bar-icon>
      <van-action-bar-icon icon="cart-o" @click="showMaterialPopup = true">
        <template #default> 选择材质 </template>
        <template #icon>
          <div class="action-bar-icon">
            <van-icon :name="materialIcon" />
          </div>
        </template>
      </van-action-bar-icon>

      <van-action-bar-icon icon="eye-o" text="服装外观" @click="showColorPopup = true" />

      <van-action-bar-icon
        icon="photo-o"
        text="添加贴纸"
        @click="showStickerPopup = true"
      />

      <van-action-bar-icon icon="upgrade" text="上传图片" @click="toUpload" />
      <van-action-bar-icon icon="shop-o" text="设计作品" />
      <van-action-bar-icon icon="shop-collect-o" text="我的作品" />

      <van-action-bar-icon icon="flower-o" text="创建贴纸" @click="createSticker" />
      <van-action-bar-icon
        icon="bars"
        text="操作贴纸"
        @click="showDecalPopup = true"
        :badge="currentModelController?.decalControllers.length"
      />
    </van-action-bar>
  </div>
  <productPopup v-if="isDesign3DEnabled"></productPopup>
  <stickerPopup v-if="isDesign3DEnabled"></stickerPopup>
  <stickerDetailPopup v-if="isDesign3DEnabled"></stickerDetailPopup>
  <materialPopup v-if="isDesign3DEnabled"></materialPopup>
  <materialDetailPopup v-if="isDesign3DEnabled"></materialDetailPopup>
  <uploadPopup v-if="isDesign3DEnabled"></uploadPopup>
  <decalPopup v-if="isDesign3DEnabled"></decalPopup>
  <uploadImagePopup v-if="isDesign3DEnabled"></uploadImagePopup>
  <decalFloatingBubble v-if="isDesign3DEnabled"></decalFloatingBubble>
  <colorPopup v-if="isDesign3DEnabled"></colorPopup>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { createModelController } from "@/components/design/core/controller";
import { meta } from "./meta.ts";
import {
  showProductPopup,
  showStickerPopup,
  showMaterialPopup,
  showUploadPopup,
  showDecalPopup,
  showUploadImagePopup,
  showColorPopup,
} from "./index.ts";
import clothIcon from "@/icon/mobile/cloth.svg?url";
import materialIcon from "@/icon/mobile/material.svg?url";
import productPopup from "./productPopup.vue";
import stickerPopup from "./stickerPopup.vue";
import stickerDetailPopup from "./stickerDetailPopup.vue";
import materialPopup from "./materialPopup.vue";
import materialDetailPopup from "./materialDetailPopup.vue";
import uploadImagePopup from "./uploadImagePopup.vue";
import uploadPopup from "./uploadPopup.vue";
import decalPopup from "./decalPopup.vue";
import decalFloatingBubble from "./decalFloatingBubble.vue";
import colorPopup from "./colorPopup.vue";
import { currentModelController, currentOperatingBaseModelInfo } from "@/components/design/store";
import { useRouter, useRoute } from "vue-router";
import { showDialog, showToast } from "vant";
import avatar from "@/modules/mobile/components/avatar.vue";
import Utils from "@/common/utils";
import { useLoginStatusStore } from "@/store/stores/login";
import { DESIGN_3D_ENABLED } from "@/components/design/featureFlags";

let router = useRouter();
let route = useRoute();
const loginStore = useLoginStatusStore();
const threeCanvasRef = ref();
const isDesign3DEnabled = DESIGN_3D_ENABLED;

onMounted(() => {
  if (!isDesign3DEnabled) {
    return;
  }

  if (Utils.three.isSupport) {
    const modelController = createModelController({
      meta,
      mode: "mb",
      isMobile: true,
    });
    modelController.render(threeCanvasRef.value);

    // 引用了其他模型
    if (history.state.modelInfo) {
      modelController.useModelInfo(history.state.modelInfo);
    }
  } else {
    showToast("当前设备不支持，请更换设备尝试");
  }
});

function back() {
  router.push("/");
}

function save() {
  if (!loginStore.userInfo?.id) {
    showToast("请先登录后在保存");
    return;
  }
  showUploadPopup.value = true;
}

function toUpload() {
  if (!loginStore.userInfo?.id) {
    showToast("请先登录后在上传");
    return;
  }

  showUploadImagePopup.value = true;
}

function login() {
  router.push({
    name: "Login",
    query: {
      redirect: "design",
    },
  });
}

function createSticker() {
  showDialog({
    title: "提示",
    message: "移动端暂时不支持创建贴纸，可以前往pc端使用全部功能",
    theme: "round-button",
    confirmButtonText: "知道了",
  });
}
</script>

<style scoped lang="less">
.three-canvas {
  background: #eee;
  width: 100vw;
  height: calc(100vh - var(--van-action-bar-height));
  position: fixed;
  top: 0;
}

.design-disabled-panel {
  width: 100vw;
  height: calc(100vh - 46px);
  position: fixed;
  top: 46px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: linear-gradient(180deg, #fafafa 0%, #f1f1f1 100%);
  text-align: center;
}

.design-disabled-panel__title {
  font-size: 18px;
  font-weight: 600;
  color: #222;
}

.design-disabled-panel__desc {
  max-width: 320px;
  line-height: 1.7;
  color: #666;
}

.layout {
  width: 100%;
  height: 100%;
  position: relative;
  user-select: none;
}

.action-bar {
  overflow: auto;
}

.action-bar-icon {
  width: 18px;
  height: 18px;
}
</style>
