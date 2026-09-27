<template>
  <div
    class="model-card-viewer"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <img
      v-if="!isHover"
      :src="thumbnailUrl"
      class="display-content image"
      style="border-radius: 50%; object-fit: cover"
      alt=""
    />
    <div v-else class="display-content model">
      <gltf-viewer :src="modelUrl"></gltf-viewer>
    </div>
  </div>
</template>

<script setup>
import gltfViewer from "@/components/model/baseGltfViewer/index.vue";

import { ref } from "vue";
const props = defineProps({
  modelUrl: {
    type: String,
  },
  thumbnailUrl: {
    type: String,
  },
});

const isHover = ref(false);
</script>

<style scoepd lang="less">
.model-card-viewer {
  width: 100%;
  height: 100%;
}
.display-content {
  width: 100%;
  height: 100%;
}
</style>
