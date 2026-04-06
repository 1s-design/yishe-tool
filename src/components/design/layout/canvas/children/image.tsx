import { canvasStickerOptions, canvasStickerOptionsOnlyChild, currentCanvasControllerInstance, updateRenderingCanvas } from "../index.tsx"
import { getPositionInfoFromOptions, formatToNativeSizeString, createFilterFromOptions, createTransformString } from '../helper.tsx'
import { computed, defineComponent, onUpdated, ref, watch } from "vue"
import { createFilterDefaultOptions, createPositionDefaultOptions, createTransformDefaultOptions } from "./defaultOptions.tsx"
import Utils from '@/common/utils'
import { onCanvasChildSetup, onBeforeReturnRender } from "./commonHooks.ts"
import { asyncComputed } from '@vueuse/core'
import {
    createImagePatternStyle,
    createImagePrintDefaultOptions,
    createImagePrintFilter,
    ensureImagePrintEffectOptions,
    ImageFillMode,
} from "./imagePrint.ts"
export const createDefaultCanvasChildImageOptions = () => {

    const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit

    return {
        type: 'image',
        position: createPositionDefaultOptions(canvasUnit),
        width: {
            value: 100,
            unit: 'vw',
        },
        height: {
            value: 100,
            unit: 'vh',
        },
        transform: createTransformDefaultOptions(canvasUnit),
        imageInfo: null,
        objectFit: 'contain',
        filter: createFilterDefaultOptions(canvasUnit),
        printEffect: createImagePrintDefaultOptions(canvasUnit),
        zIndex: 0,
    }
}



export function createCanvasChildImage(options) {
    return <Image options={options} onVnodeUpdated={updateRenderingCanvas} onVnodeMounted={updateRenderingCanvas}></Image>
}



export const Image = defineComponent({
    props: {
        options: null
    },
    setup(props, ctx) {


        const targetElRef = ref()


        onCanvasChildSetup({
            targetEl: targetElRef,
            options: props.options,
            props: props
        })

        

        /**
         * @ 这里如果使用的是svg图片，需要转换成
        */

        const imgUrl = asyncComputed( async () => {

            if(!props.options.imageInfo){
                return null
            }


            // this bug is fake
            // let url = props.options.imageInfo.url

            // if(url.endsWith('.svg')){
            //     let png = await Utils.transform.transformSvgPathToPngDataUrl(url,1000,1000)
            //     return png
            // }

            return props.options.imageInfo ? props.options.imageInfo.url : null
        })


        // 图片是否加载失败
        let loadError = ref(false)

        let loading = ref(true)

        watch(imgUrl, (nextUrl) => {
            loadError.value = false
            loading.value = Boolean(nextUrl)
        }, {
            immediate: true
        })

        function onLoad() {
            loadError.value = false
            loading.value = false
        }

        function onError() {
            loadError.value = true
            loading.value = false
        }




        return () => {
            const printEffect = ensureImagePrintEffectOptions(props.options)

            const {
                containerStyle: _containerStyle,
                style: _style
            } = getPositionInfoFromOptions(props.options.position)


            var containerStyle: any = {
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                ..._containerStyle
            }


            var style: any = {
                flexShrink: 0,
                transform: createTransformString(props.options.transform),
                width: formatToNativeSizeString(props.options.width),
                height: formatToNativeSizeString(props.options.height),
                objectFit: props.options.objectFit,
                filter: [
                    createFilterFromOptions(props.options.filter),
                    createImagePrintFilter(printEffect),
                ].filter(Boolean).join(' '),
                zIndex: props.options.zIndex,
                ..._style,
            }

            const usePatternMode = printEffect.fillMode === ImageFillMode.TILE
            const patternStyle = createImagePatternStyle(printEffect, imgUrl.value)


            const imgDiaplay = computed(() => {
                if (loading.value || loadError.value || !imgUrl.value) {
                    return 'none'
                }
            })

            onBeforeReturnRender({
                style,
                options: props.options
            })




            return <div style={containerStyle}>
                {!imgUrl.value && '未选择图片'}
                {(imgUrl.value && loading.value) && '图片加载中...'}
                {loadError.value && '图片加载失败'}
                {usePatternMode && imgUrl.value &&
                    <img onLoad={onLoad} onError={onError} src={imgUrl.value} style={{ display: 'none' }}></img>
                }
                {!usePatternMode && <img ref={targetElRef} onLoad={onLoad} onError={onError} src={imgUrl.value} style={{ ...style, display: imgDiaplay.value }}></img>}
                {(usePatternMode && imgUrl.value && !loading.value && !loadError.value) &&
                    <div ref={targetElRef} style={{ ...style, ...(patternStyle || {}) }}></div>
                }
            </div>
        }
    }
})


