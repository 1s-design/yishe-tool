


function sleep(ms) {
    return new Promise((resolve, reject) => {
        return setTimeout(() => {
            resolve(void 0)
        }, ms);
    })
}


const CM2PX: number = (function () {
    var el = document.createElement('input');
    var body = document.body;
    el.setAttribute("style", "width:1cm !important;height:1cm !important;border-width:0px !important;padding:0px !important;margin:0px !important;");
    el.id = "id_" + new Date().getTime();
    el.type = "hidden";
    body.appendChild(el);
    var targetEle = document.getElementById(el.id);
    return Number(window.getComputedStyle(targetEle).width.match(/^\d+\.?\d*/)[0]);
}());


const isPromise = (val) => {
    return val.catch && val.then;
};


interface UrlOptions {
    nocache: boolean;
}
export function formatUrl(url, options: UrlOptions = {
    nocache: false
}) {
    if (!url) {
        return
    }



    url = url.trim();
    url = url.startsWith('http') ? url : 'https://' + url

    if (options.nocache) {
        url += '?' + new Date().getTime()
    }

    return url;
}




/*
    去除imageData的多余空白
*/
function trimImageData(imageData): ImageData {
    const { width, height, data } = imageData;

    if (!width || !height || width <= 0 || height <= 0) {
        return imageData;
    }

    let minX = width, minY = height, maxX = 0, maxY = 0;
    let hasContent = false;

    // 查找边界
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const alpha = data[index + 3];

            if (alpha !== 0) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
                hasContent = true;
            }
        }
    }

    if (!hasContent) {
        return new ImageData(1, 1);
    }

    // 计算新的尺寸
    const trimmedWidth = maxX - minX + 1;
    const trimmedHeight = maxY - minY + 1;

    // 创建新的 ImageData
    const trimmedData = new ImageData(trimmedWidth, trimmedHeight);

    // 复制相关像素数据
    for (let y = 0; y < trimmedHeight; y++) {
        for (let x = 0; x < trimmedWidth; x++) {
            const sourceIndex = ((minY + y) * width + (minX + x)) * 4;
            const targetIndex = (y * trimmedWidth + x) * 4;

            trimmedData.data[targetIndex] = data[sourceIndex];
            trimmedData.data[targetIndex + 1] = data[sourceIndex + 1];
            trimmedData.data[targetIndex + 2] = data[sourceIndex + 2];
            trimmedData.data[targetIndex + 3] = data[sourceIndex + 3];
        }
    }

    return trimmedData;
}


function isEmptyObject(val) {
    return typeof val === 'object' && JSON.stringify(val) == '{}'
}


function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}



function isMobile() {
    const mobile = ['iphone', 'ipad', 'android', 'blackberry', 'nokia', 'opera mini', 'windows mobile'];
    for (var i in mobile) {
        if (navigator.userAgent.toLowerCase().indexOf(mobile[i]) > 0 || navigator.maxTouchPoints > 1) {
            return true;
        }
    }
    return false;
}

import constModule from './const.ts'

import { deepUnref } from './vue'

import transform from './transform/index'
import logger from './logger'
import { Type } from './type'
import { Encrypt } from './encrypt.ts'
import { Color } from './color.ts'
import time from './time.ts'
import { Random } from './random.ts';

import three from './three.ts'

import { Format } from './format.ts'

class Utils {

    // 获取非透明部分的边界
    findImageDataBounds(imageData: ImageData) {
        const { width, height, data } = imageData;
        if (!width || !height || width <= 0 || height <= 0) {
            return null;
        }

        let minX = width, minY = height, maxX = 0, maxY = 0;
        let hasContent = false;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const alpha = data[index + 3];

                if (alpha !== 0) {
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                    hasContent = true;
                }
            }
        }

        if (!hasContent) {
            return null;
        }

        return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
    }

    // 更加高效和内存友好的裁切方式
    trimCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
        if (!canvas || canvas.width <= 0 || canvas.height <= 0) {
            return canvas;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return canvas;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const bounds = this.findImageDataBounds(imageData);

        if (!bounds) {
            // 如果是空的，返回 1x1 透明画布
            const emptyCanvas = document.createElement('canvas');
            emptyCanvas.width = 1;
            emptyCanvas.height = 1;
            return emptyCanvas;
        }

        const trimmedCanvas = document.createElement('canvas');
        trimmedCanvas.width = bounds.width;
        trimmedCanvas.height = bounds.height;
        const trimmedCtx = trimmedCanvas.getContext('2d');

        if (trimmedCtx) {
            trimmedCtx.drawImage(
                canvas,
                bounds.minX, bounds.minY, bounds.width, bounds.height,
                0, 0, bounds.width, bounds.height
            );
        }

        return trimmedCanvas;
    }

    constructor() {

    }

    isMobile = isMobile()

    // 加密相关
    encrypt = new Encrypt()

    color = new Color()

    IN2CM = 2.539999918

    CM2PX = CM2PX //  1厘米等于多少像素

    sleep = sleep

    formatUrl = formatUrl

    isPromise = isPromise

    isEmptyObject = isEmptyObject

    // 单位转换
    pxToCM(px) {
        return px / this.CM2PX
    }

    pxToMM(px) {
        return px / this.CM2PX * 10
    }

    pxToIn(px) {
        return px / this.CM2PX / this.IN2CM
    }


    getComputedWidth(el) {
        return Number(window.getComputedStyle(el).width.split('px')[0])
    }

    getComputedHeight(el) {
        return Number(window.getComputedStyle(el).height.split('px')[0])
    }


    // 去除imageData的空白
    trimImageData = trimImageData



    // 深层解构
    deepUnref = deepUnref


    // 对象深拷贝
    clone = clone

    // 日志打印
    logger = logger

    type = new Type()

    transform = transform

    time = time

    // 常量相关
    const = constModule

    three = new three()

    random = new Random()

    format = new Format()
}


let utils = new Utils()

window.utils = utils

export default utils
