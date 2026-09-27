<template>
  <Popover>
    <PopoverTrigger as-child>
      <slot></slot>
    </PopoverTrigger>
    <PopoverContent class="w-[300px] p-3" align="start">
      <div class="container">
        <div class="text-xs font-semibold mb-2">贴纸信息</div>
        <div class="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          <div class="text-muted-foreground">名称</div>
          <div>{{ stickerInfo.name || "未命名" }}</div>
          <div class="text-muted-foreground">类型</div>
          <div>{{ getStickerTypeLabel(stickerInfo.type) || "无" }}</div>
          <template v-if="stickerInfo.code">
            <div class="text-muted-foreground">编码</div>
            <div><code class="code-text">{{ stickerInfo.code }}</code></div>
          </template>
          <div class="text-muted-foreground">上传者</div>
          <div>{{ stickerInfo.uploader?.account || "未知" }}</div>
          <div class="text-muted-foreground">上传时间</div>
          <div class="col-span-1">{{ stickerInfo.createTime }}</div>
          <div class="text-muted-foreground">描述</div>
          <div>{{ stickerInfo.description || "无" }}</div>
          <div class="text-muted-foreground">关键字</div>
          <div>{{ stickerInfo.keywords || "无" }}</div>
          <div v-if="stickerInfo.type == 'composition'" class="col-span-2 mt-1">
            <Button class="w-full" size="sm" @click="useInCanvasSticker">
              在贴纸制作中使用
            </Button>
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
<script setup lang="ts">
// 3D 贴纸使用链路已停用，保留代码方便后续恢复。
// import { currentModelController } from "@/components/design/store";
import { getStickerTypeLabel } from "./index";
import { canvasStickerOptions } from "../canvas";
import { message } from '@/common/message';
import { restoreAgentDesignProvenance } from "@/ai/design-provenance";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const props = defineProps({
  stickerInfo: {
    default: {} as any,
  },
});

// function use() {
//   currentModelController.value.addClickDelaySticker({
//     ...props.stickerInfo,
//   });
// }

function useInCanvasSticker() {
  canvasStickerOptions.value = props.stickerInfo.meta.data;
  restoreAgentDesignProvenance(
    canvasStickerOptions.value,
    props.stickerInfo.meta,
  );
  message.success("引用成功");
}
</script>

<style scoped lang="less">
.container {
  width: 300px;
  height: auto;
}

.code-text {
  font-family: 'Courier New', monospace;
  background: var(--1s-control-surface-muted);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--primary));
  letter-spacing: 0.5px;
}
</style>
