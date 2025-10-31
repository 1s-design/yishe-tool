import { ref, computed, shallowRef, nextTick, watch, defineAsyncComponent, defineComponent, shallowReactive } from 'vue'
import { toPng, toJpeg, toBlob, toPixelData, toSvg, toCanvas,getFontEmbedCSS } from "html-to-image";
import { htmlToPngFile, downloadByFile } from '@/common/transform'
import { useDebounceFn } from '@vueuse/core'
import { waitImage } from '@/common'
import { createCanvasChildSvg } from './children/svg/svg.tsx'

import { createCanvasChildText, createDefaultCanvasChildTextOptions } from './children/text/text.tsx'
import { createCanvasChildBackground, createDefaultCanvasChildBackgroundOptions } from './children/background/index.tsx'
import { createDefaultCanvasChildQrcodeOptions, createCanvasChildQrcode, } from './children/qrcode.tsx'
import {
    createDefaultCanvasChildSvgRectOptions,
    createCanvasChildRect,
    createCanvasChildEllipse,
    createDefaultCanvasChildSvgEllipseOptions
} from './children/svg/svg.tsx'
import {
    createCanvasChildImage,
    createDefaultCanvasChildImageOptions
} from './children/image.tsx'
import { formatSizeOptionToPixelValue } from './helper.tsx';


import { createCanvasChildRawCanvas, createDefaultCanvasChildRawCanvasOptions } from './children/rawCanvas.tsx'

import { createDefaultCanvasChildcanvasStickerOptions } from './children/canvas'

import { Canvas } from './children/canvas.tsx'
import { createFilterDefaultOptions } from './children/defaultOptions.tsx'

import Utils from '@/common/utils'

import { currentModelController } from '@/components/design/store'

import { imageDataToFile } from '@/common/transform'
import { defineCanvasChild } from './children/define.tsx';

import { currentFocusingStickerId, ChildViewHelperComponent } from '@/components/design/layout/canvas/components/childViewHelper/index'


import { PngIcoConverter } from "/public/lib/png2icojs"; // 导入库




/*
    画布参数
*/


export var canvasStickerOptions = ref({
    unit: 'px', // 这个单位还是要保留，当作整个部分的单位
    showCanvasRealSize: false,
    supportBackgroundColor: {
        type: 'pure',
        color: 'rgba(0,0,0,0)'
    },
    svgFilter: {
        // 正在操作的自定义的滤镜元素， 只存在一个
        children: [],

        // 内置的滤镜
        // builtInSvgFilters: [],
    },
    children: [
        // 默认会存在一个画布元素
        createDefaultCanvasChildcanvasStickerOptions()
    ],
})


export const canvasStickerOptionsOnlyChild = computed(() => {
    return canvasStickerOptions.value.children.find((c) => c.type == 'canvas')
})



// 获取子元素最高层级的元素，而不是获取该层级 ， 有多个返回第一个
export function getCanvasTopZIndexChild() {
    let children = canvasStickerOptions.value.children

    const maxIndex = Math.max(...children.map((item: any) => item.zIndex).filter(Boolean));
    let maxChild: any = children.find((item: any) => item.zIndex == maxIndex);

    return maxChild
}

export function getCanvasChildTopZIndex() {
    return getCanvasTopZIndexChild()?.zIndex || 0
}

/**
 * 这里会默认的留一个画布元素
*/

// 定义所有出现的类型
export const CanvasChildType = {
    canvas: 'canvas', // 画布
}

export const canvasChildLabelMap = {
    [CanvasChildType.canvas]: '画布',
}

export const canvasChildDefaultOptionsMap = {
    [CanvasChildType.canvas]: null,
}

export const canvasChildRenderMap = {
    [CanvasChildType.canvas]: null,
}

import backgroundLayout from './operateLayout/background.vue'
import canvasLayout from './operateLayout/canvas.vue'
import textLayout from './operateLayout/text.vue'
import imageLayout from './operateLayout/image.vue'
// import rawCanvasLayout from './operateLayout/rawCanvas.vue'
import qrcodeLayout from './operateLayout/qrcode.vue'
import rectLayout from './operateLayout/rect.vue'
import ellipseLayout from './operateLayout/ellipse.vue'
import barcodeLayout from './operateLayout/barcode.vue'
import htmlLayout from './operateLayout/html.vue'

import { createCanvasChildBarcode, createDefaultCanvasChildBarcodeOptions } from './children/barcode/index.tsx';
import { createCanvasChildHtml, createDefaultCanvasChildHtmlOptions } from './children/html.tsx';


export const CanvasChildOperationComponentMap = {
    [CanvasChildType.canvas]: canvasLayout
}


// 文字
defineCanvasChild({
    typeName: 'text',
    typeKey: 'text',
    label: '文字',
    defaultOptionsCreator: createDefaultCanvasChildTextOptions,
    renderer: createCanvasChildText,
    operationLayout: textLayout
})

defineCanvasChild({
    typeName: 'background',
    typeKey: 'background',
    label: '背景',
    defaultOptionsCreator: createDefaultCanvasChildBackgroundOptions,
    renderer: createCanvasChildBackground,
    operationLayout: backgroundLayout
})

defineCanvasChild({
    typeName: 'image',
    typeKey: 'image',
    label: '图片',
    defaultOptionsCreator: createDefaultCanvasChildImageOptions,
    renderer: createCanvasChildImage,
    operationLayout: imageLayout
})


defineCanvasChild({
    typeName: 'ellipse',
    typeKey: 'ellipse',
    label: '圆和椭圆',
    defaultOptionsCreator: createDefaultCanvasChildSvgEllipseOptions,
    renderer: createCanvasChildEllipse,
    operationLayout: ellipseLayout
})


defineCanvasChild({
    typeName: 'rect',
    typeKey: 'rect',
    label: '矩形',
    defaultOptionsCreator: createDefaultCanvasChildSvgRectOptions,
    renderer: createCanvasChildRect,
    operationLayout: rectLayout
})

defineCanvasChild({
    typeName: 'qrcode',
    typeKey: 'qrcode',
    label: '二维码',
    defaultOptionsCreator: createDefaultCanvasChildQrcodeOptions,
    renderer: createCanvasChildQrcode,
    operationLayout: qrcodeLayout
})


defineCanvasChild({
    typeName: 'barcode',
    typeKey: 'barcode',
    label: '条形码',
    defaultOptionsCreator: createDefaultCanvasChildBarcodeOptions,
    renderer: createCanvasChildBarcode,
    operationLayout: barcodeLayout
})

defineCanvasChild({
    typeName: 'html',
    typeKey: 'html',
    label: 'HTML代码',
    defaultOptionsCreator: createDefaultCanvasChildHtmlOptions,
    renderer: createCanvasChildHtml,
    operationLayout: htmlLayout
})

/*
    是否展示主画布
*/
export var showMainCanvas = ref(true)

export function addCanvasChild(options) {
    options = {
        ...canvasChildDefaultOptionsMap[options.type].call(null),
        ...options,
        id: '_' + String(new Date().getTime()), // 这里要兼容 选择器规范
    }

    canvasStickerOptions.value.children.push(options)
    currentOperatingCanvasChildId.value = options.id
}



// 当前正在操作的元素id
export var currentOperatingCanvasChildId = ref('this_is_canvas_id')

export const currentOperatingCanvasChild: any = computed(() => {
    let child = canvasStickerOptions.value.children.find((c) => c.id == currentOperatingCanvasChildId.value)

    if (!child) {
        currentOperatingCanvasChildId.value = canvasStickerOptions.value.children[0].id
        return canvasStickerOptions.value.children[0]
    }
    return child
})


/**
 * @todo 增加最近删除功能
*/
export function removeCavnasChild(id) {
    let child = canvasStickerOptions.value.children.find(child => child.id == id)
    let index = canvasStickerOptions.value.children.indexOf(child)
    canvasStickerOptions.value.children.splice(index, 1)
    currentFocusingStickerId.value = null
}



export const currentCanvasControllerInstance = shallowRef(null)


export function updateRenderingCanvas() {
    currentCanvasControllerInstance.value?.updateRenderingCanvas()
}

function createCanvasChild(options) {
    if (!canvasChildRenderMap[options.type]) {
        return
    }
    return canvasChildRenderMap[options.type]?.call(null, options)
}



export const renderingLoading = ref(false)

// 二维的画布控制器

export class CanvasController {

    target = null

    constructor(params) {
        currentCanvasControllerInstance.value = this

        // 先不自动控制
        // this.updateRenderingCanvas = useDebounceFn(this.updateRenderingCanvas, 666).bind(this)
        this.maxDisplaySize = params.max
    }

    // 保存最近的画布base64 格式
    base64 = null

    maxDisplaySize = null

    loading = ref(false)

    async toPngFile() {
        const file = await htmlToPngFile(this.el)
        return file
    }

    async downloadTrimmedPng() {
        const imageData = this.ctx.getImageData(0, 0, this.canvasEl.width, this.canvasEl.height);
        const trimmed = Utils.trimImageData(imageData)
        downloadByFile(imageDataToFile(trimmed))
    }

    async downloadPng() {
        await this.activeUpdateRenderingCanvas()
        const imageData = this.ctx.getImageData(0, 0, this.canvasEl.width, this.canvasEl.height);
        downloadByFile(imageDataToFile(imageData))
    }

    async downloadIco() {
        const imageData = this.ctx.getImageData(0, 0, this.canvasEl.width, this.canvasEl.height);
        let file = imageDataToFile(imageData)

        // 使用 PNG2ICOjs 转换为 ICO 格式
        const converter = new PngIcoConverter();
        const resultBlob = await converter.convertToBlobAsync([{ png: file }]);

        // 创建下载链接
        const url = URL.createObjectURL(resultBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'favicon.ico';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    canvasId = 'canvas-render-helper-el'

    rawId = 'this_is_canvas_id'

    get el() {
        return document.querySelector('#' + this.rawId) as any
    }


    get canvasEl() {
        return document.querySelector('#' + this?.canvasId) as any
    }


    get ctx() {
        if (!this.canvasEl) {
            return null
        }
        return this.canvasEl.getContext('2d')
    }

    getBase64() {
        return this.canvasEl.toDataURL('image/png')
    }


    async getPalette() {
        return Utils.color.getPalette(this.getBase64())
    }

    // 需要组件渲染后再更新
    async updateRenderingCanvas() {

        this.shouldUpdateCanvasSticker.value = true

        return

        this.loading.value = true
        renderingLoading.value = true

        this.debouncedUpdateJob()
    }


    // 是否应该更新贴纸 
    shouldUpdateCanvasSticker = ref(true)

    // 主动触发更新贴纸
    async activeUpdateRenderingCanvas() {
        this.loading.value = true
        renderingLoading.value = true
        this.debouncedUpdateJob()
        // await this.updateRenderingCanvasJob()
    }

    debouncedUpdateJob = useDebounceFn(this.updateRenderingCanvasJob.bind(this),11)

    async updateRenderingCanvasJob() {

        if (!this.el) {
            console.log('miss canvas el')
            this.loading.value = false
            renderingLoading.value = false
            return
        }

        async function update() {

            console.time('updateRenderingCanvas')

            try {
                // this.base64 = await toPng(this.el)


                // const fontEmbedCSS = await getFontEmbedCSS(this.el);

                let _canvas = await toCanvas(this.el, {})

                console.log('toCanvas')

                // let svg = await toSvg(this.el,{})

                // let img = document.createElement('img')
                // img.src = svg
                // img.width = 100
                // img.height = 100 
                // img.style.position= 'fixed'
                // img.style.top= '0'
                // img.style.left= '0'
                // document.body.appendChild(img)

                // document.body.appendChild(_canvas)

                this.base64 = _canvas.toDataURL('image/png')

                let width = Number(formatSizeOptionToPixelValue(canvasStickerOptionsOnlyChild.value.width))
                let height = Number(formatSizeOptionToPixelValue(canvasStickerOptionsOnlyChild.value.height))

                // let _ctx = _canvas.getContext('2d')
                // const imageData = _ctx.getImageData(0, 0, width, height);
                // this.ctx.putImageData(imageData, 0, 0);

                this.clearCanvas()

                this.ctx.drawImage(_canvas, 0, 0, _canvas.width, _canvas.height, 0, 0, width, height);

            
                this.loading.value = false
                renderingLoading.value = false

                this.shouldUpdateCanvasSticker.value = false

                console.timeEnd('updateRenderingCanvas')
            } catch (e) {
                throw Error('元素转换失败', e.message)
            }
        }


        try {
            await update.call(this)
            console.warn('画布渲染成功')
        } catch (e) {
            console.error('画布渲染：存在丢失的元素')
            this.loading.value = false
            renderingLoading.value = false
        }
    }


    clearCanvas() {
        if (!this.canvasEl) {
            return
        }
        this.canvasEl.width = this.canvasEl?.width
    }


    // 画布元素是否在加载中
    pending = ref(false)

    getRender() {

        // 改为异步组件
        function render() {

            const children = canvasStickerOptions.value.children.map((childOptions) => {
                return createCanvasChild(childOptions)
            })

            this.updateRenderingCanvas()

            return <Canvas options={canvasStickerOptions.value.children.find((item) => item.type == 'canvas')}>
                {children}
            </Canvas>
        }

        return render.bind(this)
    }
}

