<template>
  <div
    v-if="currentHoveringDecalController"
    class="decal-tooltip"
    style="position: fixed; z-index: 1"
    :style="{ top: y + 12 + 'px', left: x + 12 + 'px' }"
  >
    <s1-img
      :src="currentHoveringDecalController.state.src"
      style="width: 100px; height: 100px; border: 1px solid #eee; border-radius: 4px"
    ></s1-img>

    <div
      style="height: 100%; padding: 12px; text-wrap: nowrap; row-gap: 5px; color: #555"
      class="flex flex-col"
    >
      <div>
        <label>添加时间:</label>
        {{ formatDate(currentHoveringDecalController.createTime) }}
      </div>

      <div>
        <label> 图片名称: </label>
        {{ currentHoveringDecalController.state.info?.name || "-" }}
      </div>

      <div class="text-ellipsis" style="max-width: 160px">
        <label> 图片描述: </label>
        <span> {{ currentHoveringDecalController.state.info?.description || "-" }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMouse } from "@vueuse/core";
import { currentModelController, currentHoveringDecalController } from "../../store";
const { x, y, sourceType } = useMouse();
import { useNow, useDateFormat } from "@vueuse/core";

function formatDate(date) {
  const d = useDateFormat(date, "YYYY-MM-DD HH:mm:ss");
  return d.value;
}
</script>

<style lang="less" scoped>
.decal-tooltip {
  display: flex;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  background-color: var(--1s-surface-background);
  border-radius: 8px;
  padding: 8px;

  label {
    display: inline-block;
    width: 48px;
    flex-shrink: 0;
    text-align: justify;
    color: var(--1s-text-color);
    // text-align-last: justify;
  }
}
</style>
