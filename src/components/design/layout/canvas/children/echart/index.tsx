import * as echarts from 'echarts'
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { canvasStickerOptionsOnlyChild, updateRenderingCanvas } from '../../index.tsx'
import {
    createBasicDefaultOptions,
    createFilterDefaultOptions,
    createPositionDefaultOptions,
    createTransformDefaultOptions,
} from '../defaultOptions.tsx'
import {
    createFilterFromOptions,
    createTransformString,
    formatSizeOptionToPixelValue,
    formatToNativeSizeString,
    getPositionInfoFromOptions,
} from '../../helper.tsx'
import { onBeforeReturnRender, onCanvasChildSetup, useCanvasChildSlotSize } from '../commonHooks.ts'

const DEFAULT_ECHART_OPTION = {}
const STATIC_ECHART_OPTION = {
    animation: false,
    animationDuration: 0,
    animationDurationUpdate: 0,
    animationEasing: 'linear',
    animationEasingUpdate: 'linear',
    stateAnimation: {
        duration: 0,
    },
}

export const createDefaultEchartEngineOptions = () => {
    return {
        renderer: 'canvas',
        theme: '',
        option: cloneOption(DEFAULT_ECHART_OPTION),
    }
}

export const createDefaultCanvasChildEchartOptions = () => {
    const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit

    return {
        type: 'echart',
        width: {
            value: 100,
            unit: 'vw',
        },
        height: {
            value: 100,
            unit: 'vh',
        },
        position: createPositionDefaultOptions(canvasUnit),
        filter: createFilterDefaultOptions(canvasUnit),
        zIndex: 0,
        ...createBasicDefaultOptions(),
        transform: createTransformDefaultOptions(canvasUnit),
        echart: {
            version: 1,
            engine: 'echarts',
            engines: {
                echarts: createDefaultEchartEngineOptions(),
            },
        },
    }
}

export function createCanvasChildEchart(options) {
    return <EchartChild options={options} onVnodeUpdated={updateRenderingCanvas} onVnodeMounted={updateRenderingCanvas}></EchartChild>
}

export const EchartChild = defineComponent({
    props: {
        options: null,
    },
    setup(props) {
        const targetRef = ref<HTMLDivElement>()
        const renderError = ref('')
        let chart: echarts.ECharts | null = null

        onCanvasChildSetup({
            targetEl: targetRef,
            options: props.options,
            props,
        })

        const { slotSize: pixelSize } = useCanvasChildSlotSize(targetRef, props.options)

        function getEngineOptions() {
            ensureEchartOptions(props.options)
            return props.options.echart.engines.echarts
        }

        function ensureChart() {
            const el = targetRef.value
            if (!el) {
                return null
            }

            const engineOptions = getEngineOptions()
            const renderer = engineOptions.renderer === 'svg' ? 'svg' : 'canvas'
            const theme = engineOptions.theme || undefined
            if (!chart || chart.getDom() !== el) {
                chart?.dispose()
                chart = echarts.init(el, theme, {
                    renderer,
                    width: pixelSize.value.width,
                    height: pixelSize.value.height,
                })
            }
            return chart
        }

        const renderChart = useDebounceFn(async () => {
            await nextTick()
            const instance = ensureChart()
            if (!instance) {
                return
            }

            const engineOptions = getEngineOptions()
            try {
                renderError.value = ''
                instance.resize({
                    width: pixelSize.value.width,
                    height: pixelSize.value.height,
                })
                instance.clear()
                instance.setOption(toStaticEchartOption(engineOptions.option || {}), true)
                updateRenderingCanvas()
            } catch (error: any) {
                renderError.value = error?.message || 'ECharts 配置渲染失败'
                console.warn('ECharts render failed:', error)
            }
        }, 120)

        onMounted(renderChart)
        watch(() => props.options, renderChart, { deep: true })
        watch(pixelSize, renderChart)

        onBeforeUnmount(() => {
            chart?.dispose()
            chart = null
        })

        return () => {
            const {
                containerStyle: _containerStyle,
                style: _style,
            } = getPositionInfoFromOptions(props.options.position)

            const containerStyle: any = {
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                ..._containerStyle,
            }

            const style: any = {
                flexShrink: 0,
                width: formatToNativeSizeString(props.options.width),
                height: formatToNativeSizeString(props.options.height),
                transform: createTransformString(props.options.transform),
                filter: createFilterFromOptions(props.options.filter),
                zIndex: props.options.zIndex,
                overflow: 'hidden',
                position: 'relative',
                pointerEvents: 'none',
                ..._style,
            }

            onBeforeReturnRender({
                style,
                options: props.options,
            })

            return <div style={containerStyle}>
                <div
                    ref={targetRef}
                    style={style}
                    data-echart-engine={props.options?.echart?.engine || 'echarts'}
                ></div>
                {isEmptyOption(getEngineOptions().option) && !renderError.value ? <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    fontSize: '13px',
                    pointerEvents: 'none',
                    zIndex: Number(props.options.zIndex || 0) + 1,
                }}>编辑 ECharts 配置</div> : null}
                {renderError.value ? <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px',
                    background: 'rgba(255,245,245,0.88)',
                    color: '#c45656',
                    fontSize: '12px',
                    textAlign: 'center',
                    zIndex: Number(props.options.zIndex || 0) + 1,
                    pointerEvents: 'none',
                }}>{renderError.value}</div> : null}
            </div>
        }
    },
})

function isEmptyOption(option: any) {
    return !option || typeof option !== 'object' || Object.keys(option).length === 0
}

export function ensureEchartOptions(target: any) {
    if (!target.echart) {
        target.echart = {
            version: 1,
            engine: 'echarts',
            engines: {},
        }
    }
    if (!target.echart.engines) {
        target.echart.engines = {}
    }
    if (!target.echart.engines.echarts) {
        target.echart.engines.echarts = createDefaultEchartEngineOptions()
    }
    if (!target.echart.engines.echarts.option || typeof target.echart.engines.echarts.option !== 'object') {
        target.echart.engines.echarts.option = cloneOption(DEFAULT_ECHART_OPTION)
    }
    if (!target.echart.engines.echarts.renderer) {
        target.echart.engines.echarts.renderer = 'canvas'
    }
    return target.echart.engines.echarts
}

export function cloneOption<T>(value: T, seen = new WeakMap<object, any>()): T {
    if (value === null || typeof value !== 'object') {
        return value
    }

    if (typeof value === 'function') {
        return value
    }

    if (value instanceof Date) {
        return new Date(value.getTime()) as T
    }

    if (seen.has(value as object)) {
        return seen.get(value as object)
    }

    if (Array.isArray(value)) {
        const result: any[] = []
        seen.set(value, result)
        value.forEach((item) => {
            result.push(cloneOption(item, seen))
        })
        return result as T
    }

    const proto = Object.getPrototypeOf(value)
    if (proto && proto !== Object.prototype) {
        return value
    }

    const result: Record<string, any> = {}
    seen.set(value as object, result)
    Object.keys(value as Record<string, any>).forEach((key) => {
        result[key] = cloneOption((value as Record<string, any>)[key], seen)
    })
    return result as T
}

export function toStaticEchartOption(option: Record<string, any>) {
    const cloned = cloneOption(option || {})
    return {
        ...cloned,
        ...STATIC_ECHART_OPTION,
    }
}
