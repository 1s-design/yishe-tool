<template>
  <el-popover placement="auto" width="auto" trigger="click">
    <template #reference>
      <slot></slot>
    </template>
    <div class="container">
      <el-descriptions :column="2" size="small">
        <template #title> 贴纸信息 </template>
        <template #extra> </template>
        <el-descriptions-item label="名称">{{
          stickerInfo.name || "未命名"
        }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          {{ getStickerTypeLabel(stickerInfo.type) || "无" }}
        </el-descriptions-item>
        <el-descriptions-item label="上传者">{{
          stickerInfo.uploader?.account || "未知"
        }}</el-descriptions-item>
        <el-descriptions-item label=""></el-descriptions-item>
        <el-descriptions-item label="上传时间" :span="2">
          {{ stickerInfo.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ stickerInfo.description || "无" }}
        </el-descriptions-item>
        <el-descriptions-item label="关键字" :span="2">
          {{ stickerInfo.keywords || "无" }}
        </el-descriptions-item>

        <!-- 3D 贴纸使用链路已停用，暂不展示“使用该贴纸”。 -->
        <!-- <el-descriptions-item :span="2">
          <el-button style="flex: 1" class="w-full" @click="use" type="primary">
            使用该贴纸
          </el-button>
        </el-descriptions-item> -->
        <el-descriptions-item :span="2" v-if="stickerInfo.type == 'composition'">
          <el-button
            style="flex: 1"
            class="w-full"
            @click="useInCanvasSticker"
            type="primary"
          >
            在贴纸制作中使用
          </el-button>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </el-popover>
</template>
<script setup lang="ts">
// 3D 贴纸使用链路已停用，保留代码方便后续恢复。
// import { currentModelController } from "@/components/design/store";
import { getStickerTypeLabel } from "./index";
import { canvasStickerOptions } from "../canvas";
import { message } from "ant-design-vue";

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
  message.success("引用成功");
}
</script>

<style scoped lang="less">
.container {
  width: 300px;
  height: auto;
}
</style>
