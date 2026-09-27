<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2025-05-20 06:50:38
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-08-04 06:36:51
 * @FilePath: /yishe-scripts/Users/jackie/workspace/1s/src/components/design/layout/canvas/officialTemplateModal/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <Dialog v-bind="$attrs" v-model:open="showOfficialTempalteModal">
    <DialogContent class="max-w-[1080px] w-[1080px]">
      <DialogHeader>
        <DialogTitle>模版</DialogTitle>
      </DialogHeader>
      <div style="padding: 1rem">
        <Tabs
          :model-value="activeOfficialStickerTab"
          class="off-template-tab flex gap-4"
          :style="{ height: '480px' }"
          @update:model-value="(v) => { activeOfficialStickerTab = v as string; tabChange(); }"
        >
          <TabsList class="flex flex-col h-full shrink-0 items-stretch justify-start bg-transparent p-0 rounded-none gap-1">
            <TabsTrigger
              v-for="item in officialStickerTemplateOptions"
              :key="item.value"
              :value="item.value"
              class="justify-start text-left"
            >
              {{ item.label }}
            </TabsTrigger>
          </TabsList>
          <TabsContent
            v-for="item in officialStickerTemplateOptions"
            :key="item.value"
            :value="item.value"
            class="mt-0 h-full flex-1 min-w-0 ring-offset-background focus-visible:outline-none"
          >
            <div
              style="height: 480px; width: 100%; overflow: auto; padding: 20px"
              v-infinite-scroll="getList"
              :infinite-scroll-distance="150"
            >
              <div class="grid grid-cols-6">
                <div v-for="item in list" :key="item.url">
                  <div style="margin: 20px">
                    <s1-img
                      :src="item.url"
                      style="width: 100px; height: 100px"
                    ></s1-img>
                  </div>
                </div>
              </div>

              <s1-loadingBottom v-if="loading"></s1-loadingBottom>
              <s1-empty v-if="isEmpty">
                <template #description> 暂无结果 </template>
              </s1-empty>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { showOfficialTempalteModal } from "./index.tsx";
import { ref } from "vue";
import { officialStickerTemplateOptions } from "./index.tsx";
import { getStickerList } from "@/api";
import { usePaging } from "@/hooks/data/paging.ts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const activeOfficialStickerTab = ref(officialStickerTemplateOptions[0].value);

const {
  list,
  getList,
  loading,
  reset,
  firstLoading,
  subsequentLoading,
  isLastPage,
  currentPage,
  totalPage,
  isEmpty,
} = usePaging((params) => {
  return getStickerList({
    ...params,
    pageSize: 20,
    group: activeOfficialStickerTab.value,
  });
});

function tabChange() {
  reset();
  getList();
}
</script>

<style lang="less">
.off-template-tab {
  .ant-tabs-tab {
    padding-right: 20px !important;
  }

  .ant-tabs-tab-btn {
    width: 100%;
    text-align: right;
  }
}
</style>
