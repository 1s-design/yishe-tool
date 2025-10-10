import { defineComponent, onUpdated, ref, watch } from 'vue'
import { canvasStickerOptions, currentCanvasControllerInstance, showMainCanvas } from '@/components/design/layout/canvas'
import { createFilterFromOptions, formatSizeOptionToPixelValue, } from '../helper'
import { createFilterDefaultOptions } from './defaultOptions.tsx'
import { SvgFilterComponent, SvgFilterStyleComponent } from './svgFilter/index.tsx'
import { updateRenderingCanvas } from '../index.tsx'
import { SvgClipPathComponent } from '@/components/design/layout/canvas/children/svg/clipPath/index.tsx'

import { onBeforeReturnRender, onCanvasChildSetup } from './commonHooks.ts'


/*
    用于辅助观察的网格背景
*/
export function createPngBackgroundStyle(scale = 1, cellWidth = 10) {
    /* 模拟png背景 */
    var size = cellWidth / scale
    return {
        background: '#fff!important',
        backgroundImage: `linear-gradient(45deg, #eee 25%, transparent 0, transparent 75%, #eee 0), linear-gradient(45deg, #eee 25%, transparent 0, transparent 75%, #eee 0)!important`,
        backgroundPosition: `0 0, ${size}px ${size}px!important`,
        backgroundSize: `${2 * size}px ${2 * size}px!important`,
    }
}

// 这是默认始终存在的画布元素 ，有且只有一个，他会与所有其他子元素同级显示，但实际上它是包含所有子元素的
export function createDefaultCanvasChildcanvasStickerOptions() {
    return {
        id: 'this_is_canvas_id',
        type: 'canvas',
        width:{
            unit:'px',
            value:2000
        },
        height:{
            unit:'px',
            value:2000
        },
        undeletable: true, // 不可删除
        filter: createFilterDefaultOptions('px'),
        backgroundColor: {
            color: 'rgba(0,0,0,0)'
        },
        clipPath: null,
    }
}



export const Canvas = defineComponent({
    props: {
        options: null,
        maxDisplaySize: {
            // 最大显示尺寸
            default: 320
        }
    },
    setup(props, ctx) {

        onUpdated(updateRenderingCanvas)

        const targetElRef = ref()

        onCanvasChildSetup({
            targetEl: targetElRef,
            options: props.options,
            props: props,
            ignoreEvent: true // 忽略
        })

        return () => {

            let canvasChild = canvasStickerOptions.value.children.find((item) => {
                return item.type == 'canvas'
            })


            const pxWidth = formatSizeOptionToPixelValue(canvasChild.width)
            const pxHeight = formatSizeOptionToPixelValue(canvasChild.height)

            const transformValue = (showMainCanvas.value) ? .5 : (props.maxDisplaySize / Math.max(pxWidth, pxHeight))

            let pngBackground = createPngBackgroundStyle(transformValue)

            // 画布的辅助背景
            const containerStyle: any = {
                width:canvasChild.width.value + canvasChild.width.unit,
                height:canvasChild.height.value + canvasChild.height.unit,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                transform: `scale(${transformValue}, ${transformValue})`,
                flexShrink: 0,
                position: "relative",
                ...pngBackground,
                // background: canvasStickerOptions.value.supportBackgroundColor.color
            }

            // 画布真实元素背景
            let style: any = {
                flexShrink: 0,
                width:canvasChild.width.value + canvasChild.width.unit,
                height:canvasChild.height.value + canvasChild.height.unit,
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 0,
                filter: createFilterFromOptions(props.options.filter),
                background: props.options.backgroundColor.color,
            }

            /**
             * canvas 画布仅作为隐藏的存在
            */
            const canvasStyle: any = {
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 99,
                display: 'none',
            }

            onBeforeReturnRender({
                style,
                options: props.options
            })

            return <div id="this_is_canvas_container_id" style={containerStyle} >
                {/* 转换的元素 */}
                <div id={currentCanvasControllerInstance.value?.rawId} style={style} ref={targetElRef}>
                    {/* svg过滤器 */}
                    <SvgFilterComponent></SvgFilterComponent>
                    {/* <SvgFilterStyleComponent></SvgFilterStyleComponent> */}

                    {/* 裁剪 */}
                    <SvgClipPathComponent></SvgClipPathComponent>

                    {/* 这里把所有的元素放在svg中,但是有一个问题，文字无法显示颜色和字体 ，直接放在div中貌似也没啥问题，也不知道当时为啥放这里了 */}
                    {/* <svg style="width:100%;height:100%;">
                        <foreignObject style="width:100%;height:100%;">
                            {ctx.slots.default()}
                        </foreignObject>
                    </svg> */}
                    
                    <div>
                     {ctx.slots.default()}
                    </div>

                </div>
                {/* 真实的画布 */}
                <canvas id={currentCanvasControllerInstance.value?.canvasId} style={canvasStyle} width={pxWidth} height={pxHeight}></canvas>

            </div>
        }
    }
})