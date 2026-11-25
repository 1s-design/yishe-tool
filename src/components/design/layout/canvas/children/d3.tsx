import * as d3 from 'd3'
import { computed, defineComponent, nextTick, onMounted, ref, watch } from 'vue'
import { canvasStickerOptionsOnlyChild, updateRenderingCanvas } from '../index.tsx'
import {
    createFilterFromOptions,
    createTransformString,
    formatToNativeSizeString,
    getPositionInfoFromOptions,
} from '../helper.tsx'
import {
    createBasicDefaultOptions,
    createFilterDefaultOptions,
    createPositionDefaultOptions,
    createTransformDefaultOptions,
} from './defaultOptions.tsx'
import { onBeforeReturnRender, onCanvasChildSetup, useCanvasChildSlotSize } from './commonHooks.ts'

const DEFAULT_CODE = `const data = [30, 86, 168, 281, 303, 365];
const svg = d3.select(container)
  .append('svg')
  .attr('width', width)
  .attr('height', height);
const pad = 40;
const maxVal = d3.max(data) || 1;
const barW = (width - pad * 2) / data.length;
svg.selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr('x', (d, i) => pad + i * barW + 8)
  .attr('y', (d) => height - pad - (d / maxVal) * (height - pad * 2))
  .attr('width', Math.max(8, barW - 16))
  .attr('height', (d) => (d / maxVal) * (height - pad * 2))
  .attr('rx', 6)
  .attr('fill', '#2563eb');`

export const createDefaultCanvasChildD3Options = () => {
    const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit

    return {
        type: 'd3',
        code: DEFAULT_CODE,
        width: {
            value: 100,
            unit: 'vw',
        },
        height: {
            value: 100,
            unit: 'vh',
        },
        backgroundColor: {
            type: 'pure',
            color: 'transparent',
        },
        position: createPositionDefaultOptions(canvasUnit),
        filter: createFilterDefaultOptions(canvasUnit),
        zIndex: 0,
        ...createBasicDefaultOptions(),
        transform: createTransformDefaultOptions(canvasUnit),
    }
}

export function createCanvasChildD3(options) {
    return <D3Child options={options} onVnodeUpdated={updateRenderingCanvas} onVnodeMounted={updateRenderingCanvas}></D3Child>
}

export const D3Child = defineComponent({
    props: {
        options: null,
    },
    setup(props) {
        const targetRef = ref<HTMLElement>()
        const containerRef = ref<HTMLElement>()
        const errorMessage = ref('')

        onCanvasChildSetup({
            targetEl: targetRef,
            options: props.options,
            props,
        })

        const code = computed(() => String(props.options?.code || ''))

        function renderD3() {
            if (!containerRef.value) return

            containerRef.value.innerHTML = ''

            const codeText = code.value
            if (!codeText) {
                errorMessage.value = '请输入 D3.js 代码'
                updateRenderingCanvas()
                return
            }

            try {
                errorMessage.value = ''

                const width = slotSize.value.width || containerRef.value.clientWidth || 400
                const height = slotSize.value.height || containerRef.value.clientHeight || 300

                const sandboxFunction = new Function(
                    'd3',
                    'container',
                    'width',
                    'height',
                    codeText
                )

                sandboxFunction(d3, containerRef.value, width, height)
            } catch (error: any) {
                containerRef.value.innerHTML = ''
                errorMessage.value = error?.message || 'D3.js 代码执行失败'
            } finally {
                updateRenderingCanvas()
            }
        }

        const { slotSize } = useCanvasChildSlotSize(targetRef, props.options, () => {
            nextTick(renderD3)
        })

        onMounted(() => {
            nextTick(renderD3)
        })

        watch(
            [code],
            () => {
                nextTick(renderD3)
            },
            {
                deep: true,
            },
        )

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
                background: props.options.backgroundColor?.color || 'transparent',
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
                <div ref={targetRef} style={style}>
                    <style>{`
                        .canvas-d3-child__error {
                            color: #c45656;
                            font-size: 14px;
                            line-height: 1.4;
                            padding: 12px;
                            background: rgba(255, 245, 245, 0.92);
                            border: 1px solid rgba(196, 86, 86, 0.35);
                            border-radius: 4px;
                            white-space: pre-wrap;
                            max-width: 100%;
                            max-height: 100%;
                            overflow: hidden;
                            box-sizing: border-box;
                        }
                    `}</style>
                    {
                        errorMessage.value
                            ? <div class="canvas-d3-child__error">{errorMessage.value}</div>
                            : <div
                                ref={containerRef}
                                class="canvas-d3-child"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    overflow: 'hidden',
                                }}
                            ></div>
                    }
                </div>
            </div>
        }
    },
})
