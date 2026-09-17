<template>
  <div id="basic-canvas" class="basic-canvas png-background">
    <canvas-teleport ref="teleportRef"></canvas-teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import canvasTeleport from '@/components/design/layout/canvas/teleport.vue'
import { useLoadingOptions } from "@/components/loading/index.tsx";

const teleportRef = ref()
</script>

<style scoped>
#basic-canvas {
  width: 100%;
  height: 100%;
}

.basic-canvas {
  width: 100%;
  height: 100%;
}


</style>
