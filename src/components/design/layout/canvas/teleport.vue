<template>
    <div id="basic-canvas-canvas-container" class="png-background" v-if="show" ref="panzoomContainerRef">
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
                <div v-if="loading" class="rendering-indicator">正在渲染贴纸...</div>

                <el-button type="danger" link class="close-button" @click="showMainCanvas = false">
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

// 控制大画布的显示。Three.js 已停用后，主贴纸画布不再跟随左侧菜单切换隐藏。
let show = computed(() => {
    return showMainCanvas.value
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
    z-index: 10;
}

.top-menu {
    display: flex;
    align-items: center;
    height: 42px;
    padding: 0 12px;
    background: linear-gradient(
        180deg,
        var(--1s-elevated-background) 0%,
        var(--1s-surface-background) 100%
    );
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--1s-border-color);
    color: var(--1s-text-color);
}

.control-group {
    display: flex;
    align-items: center;
    background: var(--1s-control-surface-background);
    padding: 2px 6px;
    border-radius: 999px;
    border: 1px solid var(--1s-control-border-color);
    box-shadow: var(--1s-shadow-sm);
    gap: 4px;
}

.control-group :deep(.el-button) {
    width: 24px;
    height: 24px;
    min-height: 24px;
    padding: 0;
    color: var(--1s-text-color-secondary);
    background: transparent;
    border-color: transparent;
}

.control-group :deep(.el-button:hover) {
    color: var(--1s-text-color);
    background: var(--1s-control-hover-background);
}

.control-group :deep(.el-button.is-circle) {
    border-radius: 999px;
}

.rendering-indicator {
    font-size: 10px;
    font-style: italic;
    font-weight: 600;
    color: var(--1s-accent-color);
}

.close-button {
    color: var(--1s-text-color-tertiary);
}

.close-button:hover {
    color: #f87171;
}
</style>

  
