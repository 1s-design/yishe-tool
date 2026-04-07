<template>
  <div class="designiy-dropdown-menu">
    <slot></slot>
  </div>
</template>
<script setup>
</script>
<style lang="less">
.designiy-dropdown-menu {
  box-shadow: var(--1s-shadow-md);
  background-color: var(--1s-elevated-background);
  color: var(--1s-text-color);
  border: 1px solid var(--1s-border-color);
  border-radius: 6px;
  padding: 10px 0;
}
</style>
