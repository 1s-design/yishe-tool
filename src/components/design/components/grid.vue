<template>
  <div class="grid">
    <div class="grid-row">
      <div class="grid-col" :style="{ width: 100 / column + '%' }" v-for="item in list">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  list: {
    default: [],
  },
  column: {
    default: 2,
  },
  padding: {
    default: 0,
  },
});
</script>

<style>
.grid {
  width: 100%;
  height: 100%;
}

.grid-row {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.grid-col {
  box-sizing: border-box;
}
</style>
