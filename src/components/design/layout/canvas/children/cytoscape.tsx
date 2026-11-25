import cytoscape from 'cytoscape'
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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

export const createDefaultCanvasChildCytoscapeOptions = () => {
    const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit

    return {
        type: 'cytoscape',
        elements: [
            { data: { id: 'A', label: '开始' } },
            { data: { id: 'B', label: '处理' } },
            { data: { id: 'C', label: '结束' } },
            { data: { source: 'A', target: 'B' } },
            { data: { source: 'B', target: 'C' } },
        ],
        layout: 'circle',
        style: {
            nodeColor: '#4A90D9',
            nodeBorderColor: '#2C6FAC',
            edgeColor: '#666666',
            labelColor: '#ffffff',
        },
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

export function createCanvasChildCytoscape(options) {
    return <CytoscapeChild options={options} onVnodeUpdated={updateRenderingCanvas} onVnodeMounted={updateRenderingCanvas}></CytoscapeChild>
}

export const CytoscapeChild = defineComponent({
    props: {
        options: null,
    },
    setup(props) {
        const targetRef = ref<HTMLElement>()
        const containerRef = ref<HTMLElement>()
        const errorMessage = ref('')
        let cyInstance: any = null

        onCanvasChildSetup({
            targetEl: targetRef,
            options: props.options,
            props,
        })

        const elements = computed(() => props.options?.elements || [])
        const rawLayout = computed(() => props.options?.layout)
        const layoutName = computed(() => {
            const val = rawLayout.value
            if (val && typeof val === 'object' && val.name) {
                return String(val.name)
            }
            if (typeof val === 'string' && val.trim()) {
                return val.trim()
            }
            return 'circle'
        })
        const styleConfig = computed(() => props.options?.style || {})

        function renderCytoscape() {
            if (!containerRef.value) return

            if (cyInstance) {
                cyInstance.destroy()
                cyInstance = null
            }

            if (elements.value.length === 0) {
                containerRef.value.innerHTML = ''
                errorMessage.value = '请输入节点和边数据'
                updateRenderingCanvas()
                return
            }

            try {
                errorMessage.value = ''

                const nodeColor = styleConfig.value.nodeColor || '#4A90D9'
                const nodeBorderColor = styleConfig.value.nodeBorderColor || '#2C6FAC'
                const edgeColor = styleConfig.value.edgeColor || '#666666'
                const labelColor = styleConfig.value.labelColor || '#ffffff'
                const extraLayout = rawLayout.value && typeof rawLayout.value === 'object' ? rawLayout.value : {}

                cyInstance = cytoscape({
                    container: containerRef.value,
                    elements: JSON.parse(JSON.stringify(elements.value)),
                    layout: {
                        ...getLayoutOptions(),
                        ...extraLayout,
                        name: layoutName.value,
                    },
                    style: [
                        {
                            selector: 'node',
                            style: {
                                'background-color': nodeColor,
                                'border-color': nodeBorderColor,
                                'border-width': 2,
                                'label': 'data(label)',
                                'color': labelColor,
                                'text-valign': 'center',
                                'text-halign': 'center',
                                'font-size': '14px',
                                'font-weight': '600',
                                'width': 64,
                                'height': 64,
                            },
                        },
                        {
                            selector: 'edge',
                            style: {
                                'width': 2.5,
                                'line-color': edgeColor,
                                'target-arrow-color': edgeColor,
                                'target-arrow-shape': 'triangle',
                                'curve-style': 'bezier',
                            },
                        },
                    ],
                    userZoomingEnabled: false,
                    userPanningEnabled: false,
                    boxSelectionEnabled: false,
                    autoungrabify: true,
                })
                cyInstance.resize()
                cyInstance.fit(undefined, 32)
            } catch (error: any) {
                containerRef.value.innerHTML = ''
                errorMessage.value = error?.message || 'Cytoscape 渲染失败'
            } finally {
                updateRenderingCanvas()
            }
        }

        function getLayoutOptions() {
            const name = layoutName.value
            if (name === 'preset') {
                const nodes = elements.value.filter((el: any) => el.data && !el.data.source)
                const positions: any = {}
                nodes.forEach((node: any, index: number) => {
                    if (!node.position) {
                        positions[node.data.id] = {
                            x: 80 + (index % 5) * 140,
                            y: 80 + Math.floor(index / 5) * 120,
                        }
                    }
                })
                return { positions }
            }
            if (name === 'breadthfirst') {
                return { directed: true }
            }
            return {}
        }

        useCanvasChildSlotSize(targetRef, props.options, () => {
            nextTick(renderCytoscape)
        })

        onMounted(() => {
            nextTick(renderCytoscape)
        })

        onBeforeUnmount(() => {
            if (cyInstance) {
                cyInstance.destroy()
                cyInstance = null
            }
        })

        watch(
            [elements, rawLayout, styleConfig],
            () => {
                nextTick(renderCytoscape)
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
                        .canvas-cytoscape-child__error {
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
                            ? <div class="canvas-cytoscape-child__error">{errorMessage.value}</div>
                            : <div
                                ref={containerRef}
                                class="canvas-cytoscape-child"
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
