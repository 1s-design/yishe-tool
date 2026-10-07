<template>
  <div class="designiy-decal-control">
    <decal-main />
  </div>
</template>
<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { currentOperatingDecalController } from "../../store.ts";
import { debounce } from "../../utils/utils.ts";
import decalMain from './main.vue';


</script>
<style lang="less">
.designiy-decal-control {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
