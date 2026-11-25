import { ref, watch, onMounted, defineComponent } from 'vue'
import { canvasStickerOptionsOnlyChild, updateRenderingCanvas } from '../../index.tsx'
import { getPositionInfoFromOptions, formatSizeOptionToPixelValue } from '../../helper.tsx'
import { createPositionDefaultOptions, createBasicDefaultOptions } from '../defaultOptions.tsx'
import { onCanvasChildSetup, onBeforeReturnRender } from '../commonHooks.ts'
import JsBarcode from 'jsbarcode'
import { message } from '@/common/message'
import { useDebounceFn } from '@vueuse/core'

export const createDefaultCanvasChildBarcodeOptions = () => {
    const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit
    return {
        type: 'barcode',
        barcodeContent: '123456789012',
        barcodeFormat: 'CODE128',
        position: createPositionDefaultOptions(canvasUnit),
        lineColor: {
            color: '#111827',
            type: 'pure'
        },
        background: {
            color: '#ffffff',
            type: 'pure'
        },
        displayValue: true,
        barWidth: 3,
        barHeight: 140,
        margin: {
            top: { value: 12, unit: 'px' },
            left: { value: 16, unit: 'px' },
            bottom: { value: 12, unit: 'px' },
            right: { value: 16, unit: 'px' }
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
        ...createBasicDefaultOptions()
    }
}

export const Barcode = defineComponent({
    props: {
        options: null
    },
    setup(props) {
        const targetElRef = ref<HTMLCanvasElement>()

        onCanvasChildSetup({
            targetEl: targetElRef,
            options: props.options,
            props: props
        })

        function _initBarcode() {
            if (!targetElRef.value || !props.options.barcodeContent) return
            try {
                const rawBarWidth = Number(props.options.barWidth)
                const rawBarHeight = Number(props.options.barHeight)
                JsBarcode(targetElRef.value, String(props.options.barcodeContent), {
                    format: props.options.barcodeFormat || 'CODE128',
                    lineColor: props.options.lineColor?.color || '#111827',
                    width: rawBarWidth > 0 && rawBarWidth <= 12 ? rawBarWidth : 3,
                    height: rawBarHeight > 0 && rawBarHeight <= 600 ? rawBarHeight : 140,
                    displayValue: props.options.displayValue !== false,
                    fontSize: 20,
                    background: props.options.background?.color || '#ffffff',
                    marginTop: Number(formatSizeOptionToPixelValue(props.options.margin?.top)) || 12,
                    marginRight: Number(formatSizeOptionToPixelValue(props.options.margin?.right)) || 16,
                    marginBottom: Number(formatSizeOptionToPixelValue(props.options.margin?.bottom)) || 12,
                    marginLeft: Number(formatSizeOptionToPixelValue(props.options.margin?.left)) || 16,
                })
                updateRenderingCanvas()
            } catch (e: any) {
                message.error('条形码生成错误 :' + (e?.message || '未知错误'))
            }
        }

        const initBarcode = useDebounceFn(_initBarcode, 60)

        onMounted(initBarcode)
        watch(props, initBarcode, { deep: true })

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

            const style: any = {
                maxWidth: '92%',
                maxHeight: '92%',
                objectFit: 'contain',
                flexShrink: 0,
                zIndex: props.options.zIndex,
                ..._style,
            }

            onBeforeReturnRender({
                style,
                options: props.options
            })

            return <div style={containerStyle}>
                <canvas style={style} ref={targetElRef}></canvas>
            </div>
        }
    }
})

export function createCanvasChildBarcode(options) {
    return <Barcode options={options} onVnodeUpdated={updateRenderingCanvas} onVnodeMounted={updateRenderingCanvas}></Barcode>
}
