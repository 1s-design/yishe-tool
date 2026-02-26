<template>
    <div id="basic-canvas-canvas-container" v-if="show" ref="panzoomContainerRef">
        <div ref="panzoomRef" class="panzoom-wrapper">
            <canvass></canvass>
        </div>

        <div class="top-menu-containter">
            <div class="top-menu">
                <div class="control-group">
                    <el-tooltip content="重置到中心" placement="bottom">
                        <el-button circle size="small" @click="resetPanzoom">
                            <el-icon><Aim /></el-icon>
                        </el-button>
                    </el-tooltip>
                    <el-tooltip content="放大" placement="bottom">
                        <el-button circle size="small" @click="zoomIn">
                            <el-icon><ZoomIn /></el-icon>
                        </el-button>
                    </el-tooltip>
                    <el-tooltip content="缩小" placement="bottom">
                        <el-button circle size="small" @click="zoomOut">
                            <el-icon><ZoomOut /></el-icon>
                        </el-button>
                    </el-tooltip>
                </div>

                <div style="flex:1;"></div>
                <div v-if="loading" class="italic font-bold text-indigo-500"> 正在渲染贴纸... </div>

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
import { computed, ref, watch } from 'vue'
import { CanvasController, showMainCanvas } from '@/components/design/layout/canvas/index.tsx'
import { 
    CircleCloseFilled, 
    Aim, 
    ZoomIn, 
    ZoomOut 
} from '@element-plus/icons-vue'
import { menuState, menuItems } from '@/components/design/store.ts';
import panzoom from 'panzoom'
import Utils from '@/common/utils'

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
    return showMainCanvas.value && menuState.value.activeMenu === menuItems.canvas
})

function resetPanzoom() {
    if (panzoomInstance && panzoomRef.value && panzoomContainerRef.value) {
        const containerWidth = panzoomContainerRef.value.clientWidth;
        const containerHeight = panzoomContainerRef.value.clientHeight;
        
        // 我们希望在缩放为 1 的情况下居中
        panzoomInstance.zoomAbs(0, 0, 1);
        
        const elWidth = panzoomRef.value.offsetWidth;
        const elHeight = panzoomRef.value.offsetHeight;
        
        // 计算居中偏移量
        const x = (containerWidth - elWidth) / 2;
        const y = (containerHeight - elHeight) / 2;
        
        panzoomInstance.moveTo(x, y);
    }
}

function zoomIn() {
    if (panzoomInstance && panzoomContainerRef.value) {
        // 以容器中心为缩放原点
        const cx = panzoomContainerRef.value.clientWidth / 2;
        const cy = panzoomContainerRef.value.clientHeight / 2;
        panzoomInstance.smoothZoom(cx, cy, 1.25);
    }
}

function zoomOut() {
    if (panzoomInstance && panzoomContainerRef.value) {
        const cx = panzoomContainerRef.value.clientWidth / 2;
        const cy = panzoomContainerRef.value.clientHeight / 2;
        panzoomInstance.smoothZoom(cx, cy, 0.8);
    }
}

watch(show, async (val) => {
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

    // 等待 DOM 渲染
    await Utils.sleep(50)

    if (panzoomRef.value) {
        if (panzoomInstance) {
            try {
                panzoomInstance.dispose()
            } catch (e) {
                console.warn('Panzoom dispose error:', e)
            }
        }

        // 初始化 panzoom
        panzoomInstance = panzoom(panzoomRef.value, {
            smoothScroll: true,
            maxZoom: 5,
            minZoom: 0.1,
            bounds: true,
            boundsPadding: 0.1,
            zoomSpeed: 0.065, // 调优后的缩放速度，更丝滑
        })
        
        // 初始化后立即居中
        setTimeout(resetPanzoom, 50);
    }
}, {
    immediate: true,
})
</script>
  
<style scoped lang="less">
#basic-canvas-canvas-container {
    width: 100%;
    height: 100%;
    /* 核心修改：移除 flex 居中，完全通过位移控制，防止缩放时坐标跳变 */
    display: block;
    background: #f0f2f5;
    position: relative;
    overflow: hidden;
}

.panzoom-wrapper {
    display: inline-block;
    vertical-align: top;
}

.top-menu-containter {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    z-index: 100;
}

.top-menu {
    display: flex;
    align-items: center;
    height: 50px;
    padding: 0 20px;
    background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(0,0,0,0.05);
}

.control-group {
    display: flex;
    align-items: center;
    background: #fff;
    padding: 2px 8px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    gap: 8px;
}
</style>

  