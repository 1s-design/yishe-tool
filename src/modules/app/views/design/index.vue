<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2024-01-01 14:32:43
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2024-02-05 16:38:46
 * @FilePath: /1s/src/modules/app/views/workspace/index.vue
 * @Description:
 *
 * Copyright (c) 2024 by 1s, All Rights Reserved.
-->
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button size="small" @click="quit">
            <ion-icon slot="end" :icon="logOutOutline"></ion-icon>
            退出
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div
        v-if="isDesign3DEnabled"
        style="width: 100%; height: 100%"
        class="three-canvas"
        ref="threeCanvasRef"
      ></div>
      <div v-else class="design-disabled-panel">
        <div class="design-disabled-panel__title">3D 设计功能已暂时停用</div>
        <div class="design-disabled-panel__desc">
          当前页面先关闭模型渲染与贴花操作，避免继续影响性能和页面行为。
        </div>
      </div>
    </ion-content>
    <ion-footer v-if="isDesign3DEnabled">
      <ion-toolbar>
        <div class="toolbar">
          <ion-button fill="clear" size="small" @click="showSelectModel = true">
            <van-badge>
              <ion-icon slot="icon-only" :icon="iconCloth"></ion-icon>
              <template #content>
                {{ currentOperatingBaseModelInfo ? "已选择" : "未选择" }}
              </template>
            </van-badge>
          </ion-button>

          <ion-button fill="clear" size="small" @click="showSticker = true">
            <ion-icon slot="icon-only" :icon="iconSticker"></ion-icon>
          </ion-button>
          <ion-button fill="clear" size="small" @click="showWorkspace = true">
            <van-badge>
              <ion-icon slot="icon-only" :icon="iconPaper"></ion-icon>
              <template #content>
                {{ currentModelController?.decalControllers.length }}
              </template>
            </van-badge>
          </ion-button>
          <ion-button fill="clear" size="small">
            <ion-icon slot="icon-only" :icon="iconText"></ion-icon>
          </ion-button>
          <ion-button fill="clear" size="small">
            <ion-icon slot="icon-only" :icon="iconHistory"></ion-icon>
          </ion-button>
          <ion-button fill="clear" size="small">
            <ion-icon slot="icon-only" :icon="iconSetting"></ion-icon>
          </ion-button>
          <ion-button fill="clear" size="small">
            <ion-icon slot="icon-only" :icon="iconShare"></ion-icon>
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>
    <select-model v-if="isDesign3DEnabled"></select-model>
    <sticker v-if="isDesign3DEnabled"></sticker>
    <workspace v-if="isDesign3DEnabled"></workspace>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  loadingController,
} from "@ionic/vue";
import { ref, onBeforeMount, onMounted } from "vue";
import { logOutOutline } from "ionicons/icons";
import selectModel from "./layout/selectModel/index.vue";
import sticker from "./layout/sticker/index.vue";
import workspace from "./layout/workspace/index.vue";
import { showSelectModel, showSticker, showWorkspace } from "./store";
import { ModelController } from "@/components/design/core/controller";
import { meta } from "./meta";
import {
  useDesignStore,
  currentOperatingBaseModelInfo,
  currentModelController,
} from "@/components/design/store";
import { useIonRouter } from "@ionic/vue";
import iconCloth from "@/modules/app/assets/icon/cloth.svg?url";
import iconSticker from "@/modules/app/assets/icon/sticker.svg?url";
import iconText from "@/modules/app/assets/icon/text.svg?url";
import iconHistory from "@/modules/app/assets/icon/history.svg?url";
import iconPaper from "@/modules/app/assets/icon/paper.svg?url";
import iconSetting from "@/modules/app/assets/icon/setting.svg?url";
import iconShare from "@/modules/app/assets/icon/share.svg?url";
import { DESIGN_3D_ENABLED } from "@/components/design/featureFlags";

const router = useIonRouter();
const isDesign3DEnabled = DESIGN_3D_ENABLED;

function quit() {
  router.push({
    name: "Workspace",
  });
}

const threeCanvasRef = ref();

onMounted(() => {
  if (!isDesign3DEnabled) {
    return;
  }

  const modelController = new ModelController();
  modelController.meta = meta;
  modelController.mode = "mb";
  modelController.render(threeCanvasRef.value);
});

onBeforeMount(async () => {});
</script>

<style scoped>
* {
  user-select: none;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-around;

  --van-badge-font-size: 10px;

  ion-button {
    --overflow: none;
  }

  ion-icon {
    font-size: 20px;
  }
}

.design-disabled-panel {
  width: 100%;
  height: 100%;
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
</style>
