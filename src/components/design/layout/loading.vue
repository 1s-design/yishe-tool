<template>
  <div
    class="design-loading-shell design-loading-shell--fullscreen"
    role="status"
    aria-live="polite"
    aria-label="1s design tool"
  >
    <div class="design-loading-shell__stage">
      <div class="design-loading-shell__text" :style="loadingTextStyle">
        <p>1s design tool</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const loadingTextStyle = {
  '--design-loading-duration': '3s'
}
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
  min-height: 24px;
}

.design-loading-shell__text p {
  position: relative;
  margin: 0;
  color: var(--design-loading-text);
  font-family: "SFMono-Regular", "Cascadia Code", "JetBrains Mono", Consolas, monospace;
  font-size: clamp(16px, 1.6vw, 18.4px);
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.design-loading-shell__text p::after {
  position: absolute;
  left: calc(100% + 0.08em);
  animation: design-loading-dots var(--design-loading-duration) infinite linear;
  color: var(--design-loading-text);
  content: "";
}

@keyframes design-loading-dots {
  0% {
    content: "";
  }

  10% {
    content: ".";
  }

  40% {
    content: "..";
  }

  70% {
    content: "...";
  }

  100% {
    content: "";
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
    min-height: 22.4px;
  }

  .design-loading-shell__text p {
    font-size: 15.2px;
  }
}
</style>
