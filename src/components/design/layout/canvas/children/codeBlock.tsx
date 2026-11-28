import { computed, defineComponent, nextTick, ref, watch } from 'vue'
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

let shikiLoader: Promise<typeof import('shiki')> | null = null

export const CODE_BLOCK_LANGUAGES = [
    'text',
    'ts',
    'js',
    'tsx',
    'jsx',
    'vue',
    'html',
    'css',
    'scss',
    'json',
    'python',
    'go',
    'rust',
    'java',
    'c',
    'cpp',
    'csharp',
    'php',
    'ruby',
    'swift',
    'kotlin',
    'shell',
    'sql',
    'markdown',
    'yaml',
]

export const CODE_BLOCK_THEMES = [
    'github-dark',
    'github-light',
    'vitesse-dark',
    'vitesse-light',
    'material-theme-palenight',
    'nord',
    'dracula',
    'one-dark-pro',
    'min-light',
    'min-dark',
]

export const createDefaultCanvasChildCodeBlockOptions = () => {
    const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit

    return {
        type: 'codeBlock',
        source: `function greet(name: string) {
  return \`Hello, \${name}!\`
}

console.log(greet('Shiki'))`,
        language: 'ts',
        theme: 'github-dark',
        filename: 'example.ts',
        showHeader: true,
        showLineNumbers: true,
        wrap: false,
        fontSize: {
            value: 42,
            unit: 'px',
        },
        fontFamilyInfo: null,
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
        lineHeight: 1.55,
        padding: {
            value: 40,
            unit: 'px',
        },
        borderRadius: {
            value: 24,
            unit: 'px',
        },
        backgroundColor: {
            type: 'pure',
            color: '#24292e',
        },
        width: {
            value: 100,
            unit: 'vw',
        },
        height: {
            value: 100,
            unit: 'vh',
        },
        config: {},
        position: createPositionDefaultOptions(canvasUnit),
        filter: createFilterDefaultOptions(canvasUnit),
        zIndex: 0,
        ...createBasicDefaultOptions(),
        transform: createTransformDefaultOptions(canvasUnit),
    }
}

export function createCanvasChildCodeBlock(options) {
    return <CodeBlockChild options={options} onVnodeUpdated={updateRenderingCanvas} onVnodeMounted={updateRenderingCanvas}></CodeBlockChild>
}

export const CodeBlockChild = defineComponent({
    props: {
        options: null,
    },
    setup(props) {
        const targetRef = ref<HTMLElement>()
        const html = ref('')
        const errorMessage = ref('')
        let renderToken = 0

        onCanvasChildSetup({
            targetEl: targetRef,
            options: props.options,
            props,
        })

        const source = computed(() => String(props.options?.source || ''))
        const language = computed(() => String(props.options?.language || 'text'))
        const theme = computed(() => String(props.options?.theme || 'github-dark'))

        async function renderCode() {
            const token = ++renderToken

            try {
                errorMessage.value = ''
                const shiki = await loadShiki()
                const nextHtml = await shiki.codeToHtml(source.value || ' ', {
                    lang: language.value || 'text',
                    theme: theme.value || 'github-dark',
                    ...safeShikiConfig(props.options?.config),
                })
                if (token !== renderToken) return
                html.value = nextHtml
            } catch (error: any) {
                if (token !== renderToken) return
                html.value = ''
                errorMessage.value = error?.message || '代码高亮失败'
            } finally {
                if (token === renderToken) {
                    await nextTick()
                    updateRenderingCanvas()
                }
            }
        }

        watch(
            () => [
                source.value,
                language.value,
                theme.value,
                props.options?.config,
            ],
            renderCode,
            {
                immediate: true,
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

            const codeFontFamily = getCodeFontFamily(props.options)
            const style: any = {
                flexShrink: 0,
                width: '100%',
                height: '100%',
                transform: createTransformString(props.options.transform),
                filter: createFilterFromOptions(props.options.filter),
                zIndex: props.options.zIndex,
                background: props.options.backgroundColor?.color || '#24292e',
                borderRadius: formatToNativeSizeString(props.options.borderRadius),
                fontSize: formatToNativeSizeString(props.options.fontSize),
                fontFamily: codeFontFamily,
                '--canvas-code-font-family': codeFontFamily,
                '--canvas-code-line-height': props.options.lineHeight || 1.55,
                '--canvas-code-padding': formatToNativeSizeString(props.options.padding),
                overflow: 'hidden',
                boxSizing: 'border-box',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: 'none',
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
                        'canvas-code-block-child': true,
                        'canvas-code-block-child--line-numbers': Boolean(props.options.showLineNumbers),
                        'canvas-code-block-child--wrap': Boolean(props.options.wrap),
                    }}
                    style={style}
                    data-code-engine="shiki"
                >
                    <style>{`
                        .canvas-code-block-child__header {
                            height: 2.45em;
                            display: flex;
                            align-items: center;
                            gap: 0.55em;
                            padding: 0 1em;
                            color: rgba(255, 255, 255, 0.72);
                            background: rgba(0, 0, 0, 0.18);
                            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                            box-sizing: border-box;
                            flex-shrink: 0;
                        }
                        .canvas-code-block-child__dot {
                            width: 0.48em;
                            height: 0.48em;
                            border-radius: 50%;
                            flex: 0 0 auto;
                        }
                        .canvas-code-block-child__filename {
                            min-width: 0;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            font-size: 0.42em;
                            line-height: 1;
                            margin-left: 0.25em;
                        }
                        .canvas-code-block-child__body {
                            flex: 1;
                            min-height: 0;
                            overflow: hidden;
                        }
                        .canvas-code-block-child .shiki {
                            width: 100%;
                            height: 100%;
                            margin: 0;
                            padding: var(--canvas-code-padding);
                            background: transparent !important;
                            box-sizing: border-box;
                            overflow: hidden;
                            font-family: var(--canvas-code-font-family) !important;
                            font-size: 1em;
                            line-height: var(--canvas-code-line-height);
                            white-space: pre;
                        }
                        .canvas-code-block-child .shiki code,
                        .canvas-code-block-child .shiki span {
                            font-family: inherit !important;
                        }
                        .canvas-code-block-child .shiki code {
                            counter-reset: line;
                            display: block;
                            min-width: max-content;
                        }
                        .canvas-code-block-child .line {
                            display: block;
                            min-height: calc(1em * var(--canvas-code-line-height));
                        }
                        .canvas-code-block-child--line-numbers .line {
                            counter-increment: line;
                        }
                        .canvas-code-block-child--line-numbers .line::before {
                            content: counter(line);
                            display: inline-block;
                            width: 2.4em;
                            margin-right: 1.15em;
                            color: rgba(148, 163, 184, 0.72);
                            text-align: right;
                            user-select: none;
                        }
                        .canvas-code-block-child--wrap .shiki,
                        .canvas-code-block-child--wrap .shiki code,
                        .canvas-code-block-child--wrap .line {
                            white-space: pre-wrap;
                            word-break: break-word;
                            min-width: 0;
                        }
                        .canvas-code-block-child__error {
                            color: #c45656;
                            font-size: 0.34em;
                            line-height: 1.4;
                            padding: 1em;
                            background: rgba(255, 245, 245, 0.92);
                            border: 1px solid rgba(196, 86, 86, 0.35);
                            border-radius: 4px;
                            margin: 1em;
                            white-space: pre-wrap;
                        }
                    `}</style>
                    {props.options.showHeader ? <div class="canvas-code-block-child__header">
                        <span class="canvas-code-block-child__dot" style={{ background: '#ff5f57' }}></span>
                        <span class="canvas-code-block-child__dot" style={{ background: '#ffbd2e' }}></span>
                        <span class="canvas-code-block-child__dot" style={{ background: '#28c840' }}></span>
                        <span class="canvas-code-block-child__filename">{props.options.filename || language.value}</span>
                    </div> : null}
                    <div class="canvas-code-block-child__body">
                        {errorMessage.value
                            ? <div class="canvas-code-block-child__error">{errorMessage.value}</div>
                            : <div innerHTML={html.value}></div>}
                    </div>
                </div>
            </div>
        }
    },
})

function safeShikiConfig(config: any) {
    if (!config || typeof config !== 'object' || Array.isArray(config)) return {}
    const { lang: _lang, theme: _theme, ...rest } = config
    return rest
}

function loadShiki() {
    if (!shikiLoader) {
        shikiLoader = import('shiki')
    }
    return shikiLoader
}

function getCodeFontFamily(options: any) {
    if (options?.fontFamilyInfo?.id) return `font_${options.fontFamilyInfo.id}`
    return options?.fontFamily || 'Consolas, Monaco, "Courier New", monospace'
}
