<template>
  <Dialog v-bind="$attrs" v-model:open="showScreenshotDrawer">
    <DialogContent
      class="fixed right-0 top-0 left-auto translate-x-0 translate-y-0 h-[100vh] max-h-[100vh] w-[400px] max-w-[90vw] rounded-none gap-0 p-0 overflow-hidden flex flex-col data-[state=open]:slide-in-from-right"
    >
      <DialogHeader class="px-5 py-3 border-b border-border">
        <DialogTitle>模型截图</DialogTitle>
      </DialogHeader>
      <div class="flex-1 overflow-auto min-h-0 p-5">
        <div class="screenshot-drawer" v-if="screenshots.length">
          <div v-for="item in screenshots" class="screenshot-drawer-item">
            <s1-image :src="item.base64" style="width: 100px; height: 100px"></s1-image>
            <div>截取于: {{ Utils.time.timeago(item.createdTime) }}</div>

            <div style="flex: 1"></div>

            <div class="flex items-center gap-1">
              <Button variant="outline" size="sm" class="text-primary border-primary/40 hover:bg-primary/10 hover:text-primary" @click="download(item)">
                下载当前图片
              </Button>
              <Button variant="outline" size="sm" class="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive" @click="remove(item)">
                移除
              </Button>
            </div>
          </div>
        </div>
        <s1-empty v-else>暂无截图</s1-empty>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { showScreenshotDrawer, screenshots } from "@/components/design/store";
import Utils from "@/common/utils";
import { saveAs } from "file-saver";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
function remove(item) {
  let ind = screenshots.value.indexOf(item);
  screenshots.value.splice(ind, 1);
}

async function download(item) {
  let file = Utils.transform.base64ToPngFile(item.base64);
  saveAs(file);
}
</script>

<style lang="less" scoped>
.screenshot-drawer {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  row-gap: 12px;
}

.screenshot-drawer-item {
  display: flex;
  align-items: center;
  column-gap: 12px;
}
</style>
