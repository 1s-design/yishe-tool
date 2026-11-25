import katex from 'katex'
import 'katex/dist/katex.min.css'
import 'katex/contrib/mhchem/mhchem.js'
import { computed, defineComponent, ref } from 'vue'
import { fetchFontFaceWithMessage } from '@/components/design/layout/canvas/operate/fontFamily/index.ts'
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
import { onBeforeReturnRender, onCanvasChildSetup } from './commonHooks.ts'

export const createDefaultCanvasChildMathOptions = () => {
    const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit

    return {
        type: 'math',
        formula: String.raw`E = mc^2`,
        displayMode: true,
        throwOnError: false,
        strict: 'warn',
        trust: false,
        fontSize: {
            value: 180,
            unit: 'px',
        },
        fontColor: {
            type: 'pure',
            color: '#111111',
        },
        fontFamilyInfo: null,
        fontFamily: '',
        backgroundColor: {
            type: 'pure',
            color: 'transparent',
        },
        textAlign: 'center',
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
    }
}

export function createCanvasChildMath(options) {
    return <MathChild options={options} onVnodeUpdated={updateRenderingCanvas} onVnodeMounted={updateRenderingCanvas}></MathChild>
}

export const MathChild = defineComponent({
    props: {
        options: null,
    },
    setup(props) {
        const targetRef = ref<HTMLElement>()

        onCanvasChildSetup({
            targetEl: targetRef,
            options: props.options,
            props,
        })

        const renderedHtml = computed(() => {
            try {
                return katex.renderToString(String(props.options?.formula || ''), {
                    displayMode: props.options?.displayMode ?? true,
                    throwOnError: props.options?.throwOnError ?? false,
                    strict: props.options?.strict ?? 'warn',
                    trust: props.options?.trust ?? false,
                    output: 'html',
                })
            } catch (error: any) {
                const message = error?.message || '公式渲染失败'
                return `<span class="canvas-math-child__error">${escapeHtml(message)}</span>`
            }
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
                color: props.options.fontColor?.color || '#111111',
                background: props.options.backgroundColor?.color || 'transparent',
                fontSize: typeof props.options.fontSize === 'number'
                    ? `${props.options.fontSize}px`
                    : formatToNativeSizeString(props.options.fontSize),
                fontFamily: getMathFontFamily(props.options),
                '--canvas-math-font-family': getMathFontFamily(props.options),
                display: 'flex',
                alignItems: 'center',
                justifyContent: toJustifyContent(props.options.textAlign),
                textAlign: props.options.textAlign || 'center',
                overflow: 'hidden',
                boxSizing: 'border-box',
                position: 'relative',
                padding: 0,
                ..._style,
            }

            if (props.options.fontFamilyInfo?.url) {
                fetchFontFaceWithMessage(props.options.fontFamilyInfo)
            }

            onBeforeReturnRender({
                style,
                options: props.options,
            })

            return <div style={containerStyle}>
                <div
                    ref={targetRef}
                    class={{
                        'canvas-math-child': true,
                        'canvas-math-child--custom-font': Boolean(getMathFontFamily(props.options)),
                    }}
                    style={style}
                    data-math-engine="katex"
                >
                    <style>{`
                        .canvas-math-child .katex {
                            font-size: 1em;
                            color: inherit;
                            line-height: 1.2;
                        }
                        .canvas-math-child .katex-display {
                            margin: 0;
                            color: inherit;
                            width: 100%;
                        }
                        .canvas-math-child.canvas-math-child--custom-font .katex,
                        .canvas-math-child.canvas-math-child--custom-font .katex * {
                            font-family: var(--canvas-math-font-family) !important;
                        }
                        .canvas-math-child__error {
                            color: #c45656;
                            font-size: 0.18em;
                            line-height: 1.4;
                            padding: 0.6em;
                            background: rgba(255, 245, 245, 0.9);
                            border: 1px solid rgba(196, 86, 86, 0.35);
                            border-radius: 4px;
                        }
                    `}</style>
                    <div
                        class="canvas-math-child__content"
                        style={{
                            width: '100%',
                            maxWidth: '100%',
                        }}
                        innerHTML={renderedHtml.value}
                    ></div>
                </div>
            </div>
        }
    },
})

function toJustifyContent(textAlign: string) {
    if (textAlign === 'left') return 'flex-start'
    if (textAlign === 'right') return 'flex-end'
    return 'center'
}

function getMathFontFamily(options: any) {
    if (options?.fontFamilyInfo?.id) return `font_${options.fontFamilyInfo.id}`
    return options?.fontFamily || ''
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}
