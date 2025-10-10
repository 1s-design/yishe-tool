<template>
    <div id="basic-canvas-canvas-container" v-if="show" ref="panzoomContainerRef">
        <div ref="panzoomRef">
            <canvass></canvass>
        </div>

        <div class="top-menu-containter">
            <div class="top-menu">


                <!-- <a-button type="primary" loading ghost size="small"/> -->

                <div style="flex:1;"></div>
                <div v-if="loading" class="italic font-bold"> 正在渲染贴纸... </div>

                <el-button type="danger" link @click="showMainCanvas = false">
                    <el-icon size="20">
                        <CircleCloseFilled></CircleCloseFilled>
                    </el-icon>
                </el-button>
            </div>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import { CanvasController, showMainCanvas, canvasStickerOptions } from '@/components/design/layout/canvas/index.tsx'
import { useLoadingOptions } from "@/components/loading/index.tsx";
import { Delete, Plus, DeleteFilled, CircleCloseFilled, Link, CirclePlusFilled, FullScreen } from '@element-plus/icons-vue'
import { showCanvasLayout, menuState, menuItems } from '@/components/design/store.ts';
import panzoom from 'panzoom'
import Utils from '@/common/utils'
import {FolderOpenOutlined} from '@ant-design/icons-vue'

const panzoomRef = ref()

const panzoomContainerRef = ref()

let canvasController = new CanvasController({
    max: 320
});

const loading = computed(() => {
    return canvasController.loading.value;
});

let canvass = canvasController.getRender();

let show = computed(() => {
    return showMainCanvas.value && menuState.value.activeMenu === menuItems.canvas
})

watch(show, async (val) => {

    await Utils.sleep(33)

    if (val && panzoomRef.value) {
        const pz = panzoom(panzoomRef.value, {
            smoothScroll: false,
            maxZoom: 1,
            minZoom: .01,
        })
        
        // 设置初始缩放后，立即居中画布
        nextTick(() => {
    
        })

        // // 当缩放尺寸过小，会导致子元素不显示
        // const panzoom = Panzoom(panzoomRef.value, {
        //     maxScale: 5
        // })
        // panzoomRef.value.parentElement.addEventListener('wheel', panzoom.zoomWithWheel)

    }
}, {
    immediate: true,
})



</script>
  
<style scoped lang="less">
#basic-canvas-canvas-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eee;
    position: relative;
    overflow: hidden;
}

.top-menu-containter {
    position: absolute;
    right: 0;
    width: 100%;
    top: 0;
    display:flex;
    justify-content: center;
}

.top-menu {
    // background-color: #fff;
    // border-radius: 6px;
    // box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 12px;
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 480px;
    height: 40px;
    column-gap: 2rem;
    margin: 1rem;
    padding: 0 1rem;
}
</style>
  