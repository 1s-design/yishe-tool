import { updateRenderingCanvas, canvasStickerOptionsOnlyChild } from "../index.tsx"
import { getPositionInfoFromOptions, formatToNativeSizeString, createFilterFromOptions, createTransformString } from '../helper.tsx'
import { computed, defineComponent, onMounted, ref, watch } from "vue"
import { createBasicDefaultOptions, createFilterDefaultOptions, createPositionDefaultOptions, createTransformDefaultOptions } from "./defaultOptions.tsx"
import { useDebounceFn } from "@vueuse/core"
import { onBeforeReturnRender, onCanvasChildSetup, useCanvasChildSlotSize } from "./commonHooks.ts"

export const createDefaultCanvasChildRawCanvasOptions = () => {
    const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit

    return {
        type: 'rawCanvas',
        position: createPositionDefaultOptions(canvasUnit),
        width: {
            value: 100,
            unit: 'vw',
        },
        height: {
            value: 100,
            unit: 'vh',
        },
        filter: createFilterDefaultOptions(canvasUnit),
        zIndex: 0,
        ...createBasicDefaultOptions(),
        transform: createTransformDefaultOptions(canvasUnit),
        drawConfig: {
            type: 'waves',
            version: 1,
        },
    }
}

export function createCanvasChildRawCanvas(options) {
    return <RawCanvas options={options} onVnodeUpdated={updateRenderingCanvas} onVnodeMounted={updateRenderingCanvas}></RawCanvas>
}

export const RawCanvas = defineComponent({
    props: {
        options: null
    },
    setup(props) {
        const canvasRef = ref<HTMLCanvasElement>()
        const canvasCtx = computed(() => canvasRef.value?.getContext('2d'))

        onCanvasChildSetup({
            targetEl: canvasRef,
            options: props.options,
            props,
        })

        const paint = useDebounceFn(function paint() {
            const context = canvasCtx.value
            if (!context) return

            const { width, height } = canvasPixelSize.value
            const canvas = context.canvas
            if (canvas.width !== width) canvas.width = width
            if (canvas.height !== height) canvas.height = height

            drawRawCanvas({
                canvas,
                context,
                options: props.options,
            })

            updateRenderingCanvas()
        }, 60)

        const { slotSize: canvasPixelSize } = useCanvasChildSlotSize(canvasRef, props.options, () => {
            paint()
        })

        onMounted(paint)
        watch(() => props.options, paint, { deep: true })

        return () => {
            const {
                containerStyle: _containerStyle,
                style: _style
            } = getPositionInfoFromOptions(props.options.position)

            const containerStyle: any = {
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                ..._containerStyle
            }

            const style: any = {
                flexShrink: 0,
                transform: createTransformString(props.options.transform),
                width: formatToNativeSizeString(props.options.width),
                height: formatToNativeSizeString(props.options.height),
                filter: createFilterFromOptions(props.options.filter),
                zIndex: props.options.zIndex,
                display: 'block',
                ..._style,
            }

            onBeforeReturnRender({
                style,
                options: props.options
            })

            return <div style={containerStyle}>
                <canvas
                    ref={canvasRef}
                    style={style}
                    width={canvasPixelSize.value.width}
                    height={canvasPixelSize.value.height}
                    data-raw-canvas-type={props.options.drawConfig?.type || 'waves'}
                ></canvas>
            </div>
        }
    }
})

export function drawRawCanvas(payload: {
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    options: any,
}) {
    const { canvas, context, options } = payload
    const w = canvas.width
    const h = canvas.height
    context.clearRect(0, 0, w, h)

    const cfg = options?.drawConfig || {}

    // 支持自定义 2D Canvas 绘制脚本（drawConfig.code）
    if (typeof cfg.code === 'string' && cfg.code.trim()) {
        try {
            const fn = new Function('ctx', 'canvas', 'width', 'height', cfg.code)
            fn(context, canvas, w, h)
            return
        } catch (err) {
            console.warn('RawCanvas custom code failed:', err)
        }
    }

    const drawType = cfg.type || 'waves'
    const primary = cfg.color || '#2563eb'
    const secondary = cfg.secondaryColor || '#06b6d4'

    if (drawType === 'grid') {
        const step = Math.max(16, Number(cfg.step) || 40)
        context.strokeStyle = cfg.strokeColor || 'rgba(37, 99, 235, 0.22)'
        context.lineWidth = 1
        for (let x = 0; x <= w; x += step) {
            context.beginPath(); context.moveTo(x, 0); context.lineTo(x, h); context.stroke()
        }
        for (let y = 0; y <= h; y += step) {
            context.beginPath(); context.moveTo(0, y); context.lineTo(w, y); context.stroke()
        }
        return
    }

    if (drawType === 'rings') {
        const cx = w / 2
        const cy = h / 2
        const maxR = Math.min(w, h) * 0.44
        const count = Math.max(3, Number(cfg.count) || 8)
        for (let i = 1; i <= count; i++) {
            context.beginPath()
            context.arc(cx, cy, (maxR * i) / count, 0, Math.PI * 2)
            context.strokeStyle = i % 2 === 0 ? primary : secondary
            context.globalAlpha = 0.25 + (0.65 * (count - i)) / count
            context.lineWidth = 3
            context.stroke()
        }
        context.globalAlpha = 1
        return
    }

    // 默认程序化几何波浪纹理（waves / empty 均渲染可视化结果而非空白）
    const bg = context.createLinearGradient(0, 0, w, h)
    bg.addColorStop(0, '#0f172a')
    bg.addColorStop(1, '#1e293b')
    context.fillStyle = bg
    context.fillRect(0, 0, w, h)

    const layers = 6
    for (let l = 0; l < layers; l++) {
        context.beginPath()
        const baseY = h * (0.28 + l * 0.11)
        const amp = Math.max(18, h * (0.04 + l * 0.008))
        const freq = (Math.PI * 2 * (1.5 + l * 0.35)) / Math.max(1, w)
        context.moveTo(0, h)
        for (let x = 0; x <= w; x += 8) {
            const y = baseY + Math.sin(x * freq + l * 1.1) * amp
            context.lineTo(x, y)
        }
        context.lineTo(w, h)
        context.closePath()
        context.fillStyle = l % 2 === 0 ? primary : secondary
        context.globalAlpha = 0.16 + l * 0.06
        context.fill()
    }
    context.globalAlpha = 1
}
