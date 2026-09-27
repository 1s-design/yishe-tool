<template>
  <div
    class="design-loading-shell design-loading-shell--fullscreen"
    role="status"
    aria-live="polite"
    :aria-label="loadingLabel"
  >
    <div class="design-loading-shell__stage">
      <div class="design-loading-shell__text" :style="loadingTextStyle">
        <p>{{ loadingText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { publicAppConfig } from "@/config/public";

const loadingTextStyle = {
  '--design-loading-duration': '3s'
}

const loadingText = `${publicAppConfig.shortName}...`;
const loadingLabel = `${publicAppConfig.shortName} loading`;
</script>

<style scoped>
.design-loading-shell {
  --design-loading-bg: #0f1115;
  --design-loading-text: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100%;
  padding: 24px;
  background: var(--design-loading-bg);
  color: var(--design-loading-text);
  box-sizing: border-box;
}

.design-loading-shell--fullscreen {
  position: absolute;
  inset: 0;
  z-index: 999999;
}

.design-loading-shell__stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(100%, 320px);
  text-align: center;
}

.design-loading-shell__text {
  display: flex;
  align-items: center;
  min-height: 1.5rem;
}

.design-loading-shell__text p {
  --design-loading-duration: 3s;

  position: relative;
  margin: 0;
  color: var(--design-loading-text);
  font-family: Arial, Helvetica, sans-serif;
  font-size: clamp(0.85rem, 1.3vw, 1.1rem);
  font-weight: 800;
  font-style: italic;
  letter-spacing: 0.04em;
  line-height: 1.2;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 30%, #000 70%, transparent 100%);
  mask-image: linear-gradient(90deg, transparent 0%, #000 30%, #000 70%, transparent 100%);
  -webkit-mask-size: 250% 100%;
  mask-size: 250% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  animation: design-loading-mask var(--design-loading-duration) linear infinite;
}

@keyframes design-loading-mask {
  0% {
    -webkit-mask-position: 150% 0;
    mask-position: 150% 0;
  }

  100% {
    -webkit-mask-position: -150% 0;
    mask-position: -150% 0;
  }
}

@media (max-width: 640px) {
  .design-loading-shell {
    padding: 20px;
  }

  .design-loading-shell__stage {
    width: min(100%, 280px);
    gap: 6px;
  }

  .design-loading-shell__text {
    min-height: 1.4rem;
  }

  .design-loading-shell__text p {
    font-size: 0.95rem;
  }
}
</style>
