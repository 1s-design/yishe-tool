import { onUpdated, onMounted, onBeforeUnmount, watch, ref, shallowRef, shallowReactive } from 'vue'
import Utils from '@/common/utils'
import { createTransformString, formatSizeOptionToPixelValue } from '../helper'
/**
 * @description 用于所有子元素的渲染辅助方法
*/

/**
 * 监听子组件所在的 HTML 槽位（.s1-child-placeholder）或外层容器的实际像素尺寸。
 * 当子组件通过 reparentCanvasChildren() 挂载进模板变量槽位时，自动读取槽位真实宽高，
 * 并在 s1-child-resize 或 ResizeObserver 变化时通知组件重新布局/重绘，避免按全局画布 100vw/100vh 溢出裁切。
 */
export function useCanvasChildSlotSize(
    targetElRef: { value: HTMLElement | SVGElement | undefined | null },
    options: any,
    onSizeChange?: (size: { width: number; height: number }) => void,
) {
    const getFallbackSize = () => ({
        width: Math.max(1, Math.round(Number(formatSizeOptionToPixelValue(options?.width)) || 400)),
        height: Math.max(1, Math.round(Number(formatSizeOptionToPixelValue(options?.height)) || 300)),
    })

    const slotSize = ref(getFallbackSize())
    let resizeObserver: ResizeObserver | null = null
    let boundRenderNode: HTMLElement | null = null

    function measure(): { width: number; height: number } {
        const el = targetElRef.value as HTMLElement | null
        if (el) {
            const placeholder = el.closest?.('.s1-child-placeholder') as HTMLElement | null
            if (placeholder && placeholder.clientWidth > 0 && placeholder.clientHeight > 0) {
                return {
                    width: Math.max(1, Math.round(placeholder.clientWidth)),
                    height: Math.max(1, Math.round(placeholder.clientHeight)),
                }
            }
            const rect = el.getBoundingClientRect?.()
            if (rect && rect.width > 0 && rect.height > 0) {
                return {
                    width: Math.max(1, Math.round(rect.width)),
                    height: Math.max(1, Math.round(rect.height)),
                }
            }
        }
        return getFallbackSize()
    }

    function updateSize(next?: { width?: number; height?: number }) {
        const measured = next && next.width && next.height
            ? { width: Math.max(1, Math.round(next.width)), height: Math.max(1, Math.round(next.height)) }
            : measure()
        if (measured.width !== slotSize.value.width || measured.height !== slotSize.value.height) {
            slotSize.value = measured
            onSizeChange?.(measured)
        }
    }

    const handleSlotResizeEvent = (e: Event) => {
        const detail = (e as CustomEvent)?.detail
        if (detail && detail.width > 0 && detail.height > 0) {
            updateSize({ width: detail.width, height: detail.height })
        } else {
            updateSize()
        }
    }

    function bindObservers() {
        const el = targetElRef.value as HTMLElement | null
        if (!el) return

        const renderNode = el.closest?.('[id^="s1-child-render-"]') as HTMLElement | null
        if (renderNode && renderNode !== boundRenderNode) {
            if (boundRenderNode) {
                boundRenderNode.removeEventListener('s1-child-resize', handleSlotResizeEvent)
            }
            boundRenderNode = renderNode
            boundRenderNode.addEventListener('s1-child-resize', handleSlotResizeEvent)
        }

        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver?.disconnect()
            resizeObserver = new ResizeObserver(() => {
                updateSize()
            })
            const observeTarget = (el.closest?.('.s1-child-placeholder') as HTMLElement | null) || el.parentElement || el
            resizeObserver.observe(observeTarget)
        }

        updateSize()
    }

    onMounted(() => {
        bindObservers()
    })

    watch(() => targetElRef.value, () => {
        bindObservers()
    })

    onBeforeUnmount(() => {
        resizeObserver?.disconnect()
        resizeObserver = null
        if (boundRenderNode) {
            boundRenderNode.removeEventListener('s1-child-resize', handleSlotResizeEvent)
            boundRenderNode = null
        }
    })

    return {
        slotSize,
        refreshSlotSize: () => updateSize(),
    }
}


/**
 * 在每个元素返回渲染node 时调用
*/
export function onBeforeReturnRender(paylaod) {
    processClipPath(paylaod)
    processTransform(paylaod)
}



/**
 * @method 处理当前元素的交互事件
*/

// 记录画布元素对应的 dom 元素 
const canvasChildDOMMap = shallowReactive({

})

const CLICK_DISTANCE_THRESHOLD = 4

function processBasicElEvent(payload) {
    let { targetEl, options } = payload;

    watch(targetEl, (el) => {
        if (!el) {
            return
        }

        if (el._EventsReady) {
            return
        }

        el.style.cursor = 'pointer'

        el.id = options.id

        canvasChildDOMMap[options.id] = el

        let startX = 0
        let startY = 0

        el.addEventListener('mousedown', (e) => {
            startX = e.clientX
            startY = e.clientY
        }, true)

        el.addEventListener('mouseup', (e) => {
            const dx = e.clientX - startX
            const dy = e.clientY - startY
            // 只有在点击（没有移动）时才选择元素
            if (Math.abs(dx) < CLICK_DISTANCE_THRESHOLD && Math.abs(dy) < CLICK_DISTANCE_THRESHOLD) {
                currentOperatingCanvasChildId.value = options.id
            }
        }, true)

        el._EventsReady = true
    })
}

/**
 * 组件初始化时触发
*/
export function onCanvasChildSetup(payload) {
    processCalcComputedSize(payload)
    processBasicElEvent(payload)
}


/***
 * @description 计算尺寸
*/

function processCalcComputedSize(payload) {
    const { targetEl, options, props } = payload
    function setTargetSize() {

        if(!targetEl.value){
            return
        }

        props.options.targetComputedWidth = Utils.getComputedWidth(targetEl.value)
        props.options.targetComputedHeight = Utils.getComputedHeight(targetEl.value)
    }

    onUpdated(setTargetSize)
    onMounted(setTargetSize)
}


/**
 * 处理裁剪路径
*/

import { getClipPathCircleByPercentPosition, getClipPathEllipseByPercentPosition } from '@/components/design/layout/canvas/operate/clipPath/dragger.tsx'
import { currentOperatingCanvasChildId } from '..';
function processClipPath(payload) {
    let { style, options } = payload

    if (!options.clipPath) {
        return
    }


    if (options.clipPath.type == 'css') {
        style.clipPath = options.clipPath.cssValue
    }

    if (options.clipPath.type == 'url') {
        style.clipPath = `url(#${options.clipPath.url})`
    }

    // 自定义的裁剪
    if (options.clipPath.type == 'customCircle') {

    }

    if (options.clipPath.type == 'customEllipse') {
        style.clipPath = getClipPathEllipseByPercentPosition(options.clipPath)
    }

    if (options.clipPath.type == 'customCircle') {
        style.clipPath = getClipPathCircleByPercentPosition(options.clipPath)

    }
}


/**
 * @description 处理元素变形
*/



function processTransform(payload) {
    const { options, style } = payload
    style.transform = createTransformString(options.transform)
}