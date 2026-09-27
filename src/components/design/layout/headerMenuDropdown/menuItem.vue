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
import { ref,onMounted ,inject,watch} from "vue";

const showChildren = ref(false);

function itemClick() {
  showChildren.value = !showChildren.value;
}



onMounted(() => {
  document.body.addEventListener("click", (e) => {
    showChildren.value = false;
  });
});

</script>
<style lang="less">
.designiy-dropdown-menu-item {
  position: relative;

}

.designiy-dropdown-menu-item-main {
  min-width:180px;
  padding: 7px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  cursor: pointer;
  column-gap: 5px;
  &:hover{
    background: var(--1s-control-surface-muted);
  }
}

.designiy-dropdown-menu-item-title{
  text-wrap: nowrap;
}

.designiy-dropdown-menu-item-children {
  position: absolute;
  top: 0;
  left: calc(100% + 5px);
}

.designiy-dropdown-menu-item-icon {
  width: 12px;
  height: 12px;
  svg {
    width: 12px;
    height: 12px;
  }
}

.designiy-dropdown-menu-item-arrow {

  width: 12px;
  height: 12px;
  svg {
    width: 12px;
    height: 12px;
  }
}
</style>
