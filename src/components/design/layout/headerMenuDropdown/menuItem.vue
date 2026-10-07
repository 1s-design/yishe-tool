<template>
  <div class="designiy-dropdown-menu-item" @click.stop="itemClick">
    <div class="designiy-dropdown-menu-item-main">
      <div class="designiy-dropdown-menu-item-icon">
        <slot name="icon"></slot>
      </div>
      <div class="designiy-dropdown-menu-item-title">
        <slot name="title"></slot>
      </div>

      <div style="flex: 1"></div>
      <div class="designiy-dropdown-menu-item-suffix">
        <slot name="suffix"></slot>
      </div>
      <div class="designiy-dropdown-menu-item-arrow">
        <icon-right-arrow  v-if="$slots.children"> </icon-right-arrow>
      </div>
    </div>

    <div
      v-if="$slots.children && showChildren"
      class="designiy-dropdown-menu-item-children"
    >
      <slot name="children"> </slot>
    </div>
  </div>
</template>
<script setup>
import iconRightArrow from "@/icon/rightArrow.svg?component";
import { ref, onMounted, onBeforeUnmount } from "vue";

const showChildren = ref(false);

function itemClick() {
  showChildren.value = !showChildren.value;
}



function closeChildren() {
  showChildren.value = false;
}

onMounted(() => document.body.addEventListener("click", closeChildren));
onBeforeUnmount(() => document.body.removeEventListener("click", closeChildren));

</script>
<style lang="less">
.designiy-dropdown-menu-item {
  position: relative;

}

.designiy-dropdown-menu-item-main {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 190px;
  height: var(--1s-control-h-md);
  padding: 0 7px;
  border-radius: var(--1s-control-radius-sm);
  color: var(--1s-text-color);
  font-size: var(--1s-control-font-md);
  cursor: pointer;
  transition: var(--1s-control-transition);

  &:hover {
    background: var(--1s-state-hover);
  }
}

.designiy-dropdown-menu-item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.designiy-dropdown-menu-item-children {
  position: absolute;
  top: 0;
  left: calc(100% + 5px);
}

.designiy-dropdown-menu-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 13px;
  height: 13px;
  color: var(--1s-text-color-secondary);

  svg {
    width: 13px;
    height: 13px;
  }
}

.designiy-dropdown-menu-item-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  color: var(--1s-text-color-tertiary);

  svg {
    width: 12px;
    height: 12px;
  }
}
</style>
