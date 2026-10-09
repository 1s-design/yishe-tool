<template>
  <div class="designiy-dropdown-menu">
    <slot></slot>
  </div>
</template>
<script setup>
</script>
<style lang="less">
.designiy-dropdown-menu {
  min-width: 196px;
  padding: 3px;
  border: 1px solid var(--1s-dialog-border);
  border-radius: 0;
  background-color: var(--1s-dialog-bg);
  color: var(--1s-dialog-fg);
  box-: none;
}
</style>
