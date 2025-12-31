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

// 保存 panzoom 实例以便清理
let panzoomInstance: any = null

// 控制大画布的显示，只有在大画布显示且当前菜单是 canvas 时才显示
let show = computed(() => {
    // 必须同时满足：显示大画布 + 当前菜单是 canvas
    const shouldShow = showMainCanvas.value && menuState.value.activeMenu === menuItems.canvas
    return shouldShow
})

watch(show, async (val) => {
    // 如果不显示，清理 panzoom 实例
    if (!val) {
        if (panzoomInstance) {
            try {
                panzoomInstance.dispose()
            } catch (e) {
                console.warn('Panzoom dispose error:', e)
            }
            panzoomInstance = null
        }
        return
    }

    // 显示时初始化 panzoom
    await Utils.sleep(333)

    if (panzoomRef.value) {
        // 清理之前的实例（双重保险）
        if (panzoomInstance) {
            try {
                panzoomInstance.dispose()
            } catch (e) {
                console.warn('Panzoom dispose error:', e)
            }
        }

        // 初始化 panzoom（用于拖拽和缩放）
        panzoomInstance = panzoom(panzoomRef.value, {
            smoothScroll: false,
            maxZoom: 1,
            minZoom: .01,
        })
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
  