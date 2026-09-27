<template>
    <div
      v-bind="$attrs"
      ref="elScrollbarRef"
      class="overflow-auto"
      style="width:100%;height:100%;"
      @scroll="scroll({ scrollTop: ($event.target as HTMLElement).scrollTop, scrollLeft: ($event.target as HTMLElement).scrollLeft })"
    >
        <slot></slot>
    </div>
</template>
    
<script setup lang='ts'>

import { useLocalStorage } from '@vueuse/core';
import { onActivated, onDeactivated, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
    id:{
        default:''
    }
})

const local:any = useLocalStorage(`_1s_scrollbar_${props.id}`,{})

function scroll(e) {
    // const { scrollTop, scrollLeft } = e
    if(props.id){
        local.value = e
    }
}


const elScrollbarRef = ref()


onActivated(() => {
    if(props.id){
        // 兼容原 el-scrollbar 实例的 setScrollTop 与原生元素的 scrollTop
        const el = elScrollbarRef.value
        if (el?.setScrollTop) {
            el.setScrollTop(local.value.scrollTop)
        } else if (el) {
            el.scrollTop = local.value.scrollTop
        }
    }
})

onDeactivated(() => {
})
</script>
    
<style></style>
