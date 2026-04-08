import QRCodeStyling from 'qr-code-styling';
import { ref, watchEffect, watch, onUpdated, onMounted } from 'vue'
import { canvasStickerOptions, canvasStickerOptionsOnlyChild, updateRenderingCanvas } from '../index.tsx'

import { getPositionInfoFromOptions, formatToNativeSizeString, formatSizeOptionToPixelValue, getPaddingRealPixel, getBorderRadiusRealPixel } from '../helper.tsx'
import { defineAsyncComponent, defineComponent } from 'vue';

import { createPositionDefaultOptions ,createBasicDefaultOptions,} from './defaultOptions.tsx';

import { parse } from 'gradient-parser'
import { onCanvasChildSetup,onBeforeReturnRender } from './commonHooks.ts';

import Utils from '@/common/utils'
import { publicAppConfig } from '@/config/public'


export const createDefaultCanvasChildQrcodeOptions = () => {

    const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit

    return {
        // 支持渐变色和普通颜色
        qrCodeColor: {
            color: '#6900ff',
            type: 'pure'
        },
        errorCorrectionLevel: 'H',
        position: createPositionDefaultOptions(canvasUnit),
        padding: {
            top: {
                value: 0,
                unit: canvasUnit
            },
            left: {
                value: 0,
                unit: canvasUnit
            },
            bottom: {
                value: 0,
                unit: canvasUnit
            },
            right: {
                value: 0,
                unit: canvasUnit
            }
        },
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        skewX: 0,
        skewY: 0,
        width: {
            value: 100,
            unit: canvasUnit
        },
        height: {
            value: 100,
            unit: canvasUnit
        },
        qrcodeDotType: 'sequare',
        backgroundColor: {
            color: '#000',
            type: 'pure'
        },
        backgroundUnit: canvasUnit,
        qrcodeContent: publicAppConfig.defaultQrCodeContent,
        borderRadius: {
            leftTop: {
                value: 0,
                unit: canvasUnit,
            },
            rightTop: {
                value: 0,
                unit: canvasUnit,
            },
            rightBottom: {
                value: 0,
                unit: canvasUnit,
            },
            leftBottom: {
                value: 0,
                unit: canvasUnit,
            }
        },
        ...createBasicDefaultOptions()
    }
}


function formatToQrcodeGradient(color) {
    let ast = parse(color)[0]
    // gradient: {
    //     type: 'linear',
    //     rotation: 0,
    //     colorStops: [{ offset: 0, color: 'blue' }, { offset: 1, color: 'red' }]
    // }

    const type = ast.type == 'linear-gradient' ? 'linear' : ast.type == "radial-gradient" ? 'radial' : null

    // 与css表现差异
    const diffDeg = 90

    const rotation = type == 'linear' ? Math.PI * (ast.orientation.value - 90) / 180 : null

    const colorStops = ast.colorStops.map((item) => {
        return {
            offset: item.length.value / 100,
            color: `rgba(${item.value[0]},${item.value[1]},${item.value[2]},${item.value[3]})`
        }
    })

    return {
        type,
        rotation,
        colorStops
    }
}


async function createQrcodeUrl(options) {

    const qrCodeOptions = {
        width: formatSizeOptionToPixelValue(options.width),
        height: formatSizeOptionToPixelValue(options.height),
        type: "svg",
        data: options.qrcodeContent,
        // image: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
        dotsOptions: {
            type: options.qrcodeDotType,
        },
        backgroundOptions: {
            color: 'transparent', // 背景颜色由img设置
        },
        imageOptions: {
            crossOrigin: "anonymous",
            margin: 20
        },
        qrOptions: {
            typeNumber: 0,
            errorCorrectionLevel: options.errorCorrectionLevel,
            mode: 'Byte'
        },
        mode: 'Byte',
    }

    if (options.qrCodeColor) {
        if (options.qrCodeColor.type == 'gradient') {
            qrCodeOptions.dotsOptions.gradient = formatToQrcodeGradient(options.qrCodeColor.color)
        } else {
            qrCodeOptions.dotsOptions.color = options.qrCodeColor.color
        }
    }

    const qrCode = new QRCodeStyling(qrCodeOptions as any);

    const file = await qrCode.getRawData()
    return URL.createObjectURL(file)
}

export const Qrcode = defineComponent({
    props: {
        options: null
    },
    setup(props, ctx) {

        const options = props.options

        const qrcodeUrl = ref()


        const targetElRef = ref()


        onCanvasChildSetup({
            targetEl: targetElRef,
            options: props.options,
            props: props
        })


        watchEffect(() => {
            createQrcodeUrl(props.options).then((url) => {
                qrcodeUrl.value = url
            })
        })

        return () => {

            const {
                containerStyle: _containerStyle,
                style: _style
            } = getPositionInfoFromOptions(props.options.position)

            const containerStyle = {
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                ..._containerStyle
            }


            let padding = getPaddingRealPixel(props.options.padding, {
                width: props.options.width,
                height: props.options.height,
            })

            const borderRadius = getBorderRadiusRealPixel(props.options.borderRadius, {
                width: props.options.width,
                height: props.options.height,
            })

            const style = {
                width: formatToNativeSizeString(props.options.width),
                height: formatToNativeSizeString(props.options.height),
                flexShrink: 0,
                background: props.options.backgroundColor.color,
                zIndex: props.options.zIndex,
                padding,
                borderRadius,
                ..._style,
            }


            onBeforeReturnRender({
                style,
                options: props.options
            })



            return <div style={containerStyle}>
                {qrcodeUrl.value ? <img ref={targetElRef} onLoad={updateRenderingCanvas} style={style} src={qrcodeUrl.value}></img> : null}
            </div>
        }
    }
})

export function createCanvasChildQrcode(options) {
    return <Qrcode options={options} onVnodeUpdated={updateRenderingCanvas} onVnodeMounted={updateRenderingCanvas}></Qrcode>
}




