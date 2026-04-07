<template>
  <div class="design-loading-shell" role="status" aria-live="polite" aria-label="1s design tool 正在加载">
    <div class="design-loading-shell__stage">
      <div class="design-loading-shell__label">1S DESIGN TOOL</div>
      <div class="design-loading-shell__text">
        <p>Loading workspace</p>
      </div>
      <div class="design-loading-shell__caption">正在初始化设计工作区</div>
    </div>
  </div>
</template>

<style scoped>
.design-loading-shell {
  position: absolute;
  inset: 0;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--1s-loading-mask, rgba(243, 246, 251, 0.92));
  box-sizing: border-box;
}

.design-loading-shell__stage {
  display: flex;
  width: min(100%, 320px);
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.design-loading-shell__label {
  color: var(--1s-loading-label, #6b7280);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.14em;
  line-height: 1.2;
}

.design-loading-shell__text {
  display: flex;
  align-items: center;
  min-height: 1.5rem;
}

.design-loading-shell__text p {
  position: relative;
  margin: 0;
  color: var(--1s-text-color, #18202c);
  font-family: "SFMono-Regular", "Cascadia Code", "JetBrains Mono", Consolas, monospace;
  font-size: clamp(1rem, 1.4vw, 1.1rem);
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.design-loading-shell__text p::after {
  position: absolute;
  left: calc(100% + 0.08em);
  color: var(--1s-text-color, #18202c);
  content: "";
  animation: design-loading-dots 2.2s infinite linear;
}

.design-loading-shell__caption {
  color: var(--1s-loading-caption, #7c8695);
  font-size: 10px;
  line-height: 1.4;
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

  .design-loading-shell__text p {
    font-size: 0.95rem;
  }
}
</style>
