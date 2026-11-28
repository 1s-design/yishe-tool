import QRCodeStyling from 'qr-code-styling';
import { ref, watchEffect, onBeforeUnmount, defineComponent } from 'vue'
import { canvasStickerOptionsOnlyChild, updateRenderingCanvas } from '../index.tsx'

import { getPositionInfoFromOptions, getPaddingRealPixel, getBorderRadiusRealPixel } from '../helper.tsx'
import { createPositionDefaultOptions, createBasicDefaultOptions } from './defaultOptions.tsx';
import { parse } from 'gradient-parser'
import { onCanvasChildSetup, onBeforeReturnRender, useCanvasChildSlotSize } from './commonHooks.ts';
import { publicAppConfig } from '@/config/public'


export const createDefaultCanvasChildQrcodeOptions = () => {
    const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit

    return {
        // 支持渐变色和普通颜色
        qrCodeColor: {
            color: '#111827',
            type: 'pure'
        },
        errorCorrectionLevel: 'H',
        position: createPositionDefaultOptions(canvasUnit),
        padding: {
            top: { value: 0, unit: canvasUnit },
            left: { value: 0, unit: canvasUnit },
            bottom: { value: 0, unit: canvasUnit },
            right: { value: 0, unit: canvasUnit }
        },
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        skewX: 0,
        skewY: 0,
        width: { value: 100, unit: 'vw' },
        height: { value: 100, unit: 'vh' },
        qrcodeDotType: 'square',
        backgroundColor: {
            color: 'transparent',
            type: 'pure'
        },
        backgroundUnit: canvasUnit,
        qrcodeContent: publicAppConfig.defaultQrCodeContent,
        borderRadius: {
            leftTop: { value: 0, unit: canvasUnit },
            rightTop: { value: 0, unit: canvasUnit },
            rightBottom: { value: 0, unit: canvasUnit },
            leftBottom: { value: 0, unit: canvasUnit }
        },
        ...createBasicDefaultOptions()
    }
}


function formatToQrcodeGradient(color) {
    let ast = parse(color)[0]
    const type = ast.type == 'linear-gradient' ? 'linear' : ast.type == "radial-gradient" ? 'radial' : null
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


async function createQrcodeUrl(options, renderSize = 512) {
    const safeSize = Math.max(128, Math.min(1024, Math.round(renderSize || 512)))
    const dotType = options.qrcodeDotType === 'sequare' ? 'square' : (options.qrcodeDotType || 'square')

    const qrCodeOptions: any = {
        width: safeSize,
        height: safeSize,
        type: "svg",
        data: options.qrcodeContent || publicAppConfig.defaultQrCodeContent,
        dotsOptions: {
            type: dotType,
        },
        backgroundOptions: {
            color: 'transparent',
        },
        imageOptions: {
            crossOrigin: "anonymous",
            margin: 20
        },
        qrOptions: {
            typeNumber: 0,
            errorCorrectionLevel: options.errorCorrectionLevel || 'H',
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

    const qrCode = new QRCodeStyling(qrCodeOptions);
    const file = await qrCode.getRawData('png')
    if (!file) return ''
    return await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(String(reader.result || ''))
        reader.onerror = () => resolve(URL.createObjectURL(file as Blob))
        reader.readAsDataURL(file as Blob)
    })
}

export const Qrcode = defineComponent({
    props: {
        options: null
    },
    setup(props) {
        const qrcodeUrl = ref('')
        const targetElRef = ref()
        let prevObjectUrl = ''

        onCanvasChildSetup({
            targetEl: targetElRef,
            options: props.options,
            props: props
        })

        const { slotSize } = useCanvasChildSlotSize(targetElRef, props.options)

        watchEffect(() => {
            const side = Math.min(slotSize.value.width || 512, slotSize.value.height || 512)
            createQrcodeUrl(props.options, side).then((url) => {
                if (prevObjectUrl && prevObjectUrl !== url) {
                    URL.revokeObjectURL(prevObjectUrl)
                }
                prevObjectUrl = url
                qrcodeUrl.value = url
            })
        })

        onBeforeUnmount(() => {
            if (prevObjectUrl) {
                URL.revokeObjectURL(prevObjectUrl)
                prevObjectUrl = ''
            }
        })

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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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

            const style: any = {
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                flexShrink: 0,
                background: props.options.backgroundColor?.color || 'transparent',
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
