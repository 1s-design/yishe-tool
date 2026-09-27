<template>
  <div class="content">
    <div class="list" v-infinite-scroll="getList" :infinite-scroll-distance="150">
      <div
        class="model-grid"
        :style="{ gridTemplateColumns: `repeat(${column}, minmax(0, 1fr))` }"
      >
        <div v-for="item in list" class="text-center">
          <div class="item">
            <div class="preview">
              <gltf-viewer :model="item.meta.modelInfo"></gltf-viewer>
            </div>
            <Popover>
              <PopoverTrigger as-child>
                <div class="bar">
                  <div class="title text-ellipsis">{{ item.name || "......" }}</div>
                  <ArrowRight class="item-arrow h-[1em] w-[1em]" />
                </div>
              </PopoverTrigger>
              <PopoverContent side="right" class="w-auto">
                <popover></popover>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="tsx">
import { ref, onBeforeMount } from "vue";
import { ArrowRight } from "lucide-vue-next";
import { getCustomModelList } from "@/api";
import { usePaging } from "@/hooks/data/paging.ts";
import desimage from "@/components/image.vue";
import popover from "./popover.vue";
import gltfViewer from "@/components/model/gltfViewer/index.vue";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

const { list, getList } = usePaging((params) => {
  return getCustomModelList({
    ...params,
    pageSize: 10,
  });
});

// 列表展示几列
const column = ref(2);
</script>
<style lang="less" scoped>
@item-width: 40px;
.content {
  width: 260px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.list {
  width: 100%;
  flex: 1;
  overflow: auto;
  padding: 1em;
}

.model-grid {
  display: grid;
  gap: 1em 8px;
}

.item {
  width: auto;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 0.5em;
}

.preview {
  width: 100%;
  height: 10em;
  background: #eee;
}

.title {
  width: 100%;
  text-align: left;
}

.bar {
  width: 100%;
  font-size: 1em;
  color: #555;
  display: flex;
  justify-content: space-between;
  align-items: center;
  column-gap: 1em;
  &:hover {
    color: var(--1s-text-color);
    cursor: pointer;
  }

  .item-arrow {
    height: 1em;
    line-height: 1em;
  }
}
</style>
