<template>
  <div
    class="s1-empty flex items-center justify-center"
    :class="{ full: full }"
    :style="{ minHeight: minHeight, minWidth: minWidth }"
  >
    <div class="s1-empty-inner" v-bind="$attrs">
      <img class="s1-empty-image" :src="image" width="82" height="82" alt="" />
      <div class="s1-empty-description">
        <slot name="description"></slot>
      </div>
      <div class="s1-empty-bottom">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const image = "/components/empty.svg";

const props = defineProps({
  full: {
    default: true,
  },
  minHeight: {
    default: null,
  },
  minWidth: {
    default: null,
  },
});
</script>

<style lang="less">
.s1-empty {
  font-size: 10px;
  color: #ccc;

  .s1-empty-inner {
    padding: 12px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .s1-empty-image {
    width: 82px;
    height: 82px;
  }

  .s1-empty-description {
    margin-top: 6px;
    color: #ccc;
    text-align: center;
  }

  .s1-empty-bottom {
    margin-top: 8px;
  }
}

.s1-empty.full {
  width: 100%;
  height: 100%;
}
</style>
