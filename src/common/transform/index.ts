
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from "html-to-image";


export async function imgToBase64(img) {
    img.setAttribute('crossorigin', 'anonymous');
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.height = img.naturalHeight;
    canvas.width = img.naturalWidth;
    // canvas.height = img.height;
    // canvas.width = img.width;

    ctx.drawImage(img, 0, 0);
    var base64 = canvas.toDataURL('image/png')

    return base64;
}


export async function imgToFile(img) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // 设置canvas的宽高
    canvas.width = img.width;
    canvas.height = img.height;

    // 将图片绘制到canvas上
    context.drawImage(img, 0, 0);


    return new Promise((resolve) => {
        // 将canvas转换为Blob
        canvas.toBlob(function (blob) {
            // 创建File对象
            const file = new File([blob], 'image.png', { type: 'image/png' });

            return resolve(file)
        }, 'image/png');
    })
}


export const createImgObjectURL = async (img) => {
    return URL.createObjectURL(await imgToFile(img) as Blob)
}


export const canvasToBase64 = (canvas) => canvas.toDataURL("image/png")

/*
 下载base64为文件
  ?response-content-type=application/octet-stream'
*/



export async function downloadByFile(file) {
    let a = document.createElement('a')
    a.href = URL.createObjectURL(file)
    a.download = file.name
    a.click()
}


export function getSvgTextContentByUrl(svgUrl) {
    return fetch(svgUrl)
        .then(response => response.text()) // 获取SVG文本
        .then(svgText => {
            return svgText
        })
        .catch(error => {
            console.error("获取SVG文本内容时出错:", error);
        });
}

export function svgToBase64(svg) {

    if (typeof svg == 'string') {
        svg = svg
    }

    if (svg instanceof SVGElement) {
        svg = new XMLSerializer().serializeToString(svg)
    }

    if (svg.__v_isVNode) {

    }

    var base64 = btoa(encodeURIComponent(svg));
    return `data:image/svg+xml;base64,${base64}`;
}

import { base64ToSvgFile, base64ToPngFile, base64ToFile } from './base64ToFile'
import { waitImage } from "..";


/* svg元素或字符串转文件格式 */
export function svgToFile(svg) {
    const svgBase64 = svgToBase64(svg)
    const file = base64ToSvgFile(svgBase64)
    return file
}


/* svg元素或字符串转png文件 */
export async function svgToPngFile(svg) {
    /*
        svg线渲染到img上，在添加到canvas，然后导出png文件
    */
    const svgBase64 = svgToBase64(svg)
    let img = document.createElement('img')
    // img.style.display = 'none'
    document.body.appendChild(img)
    img.src = svgBase64

    return new Promise((resolve) => {
        img.onload = () => {
            document.body.removeChild(img)
            return resolve(imgToFile(img))
        }
    })
}


/*
 元素转png文件
*/
export async function htmlToPngFile(html, name = '') {
    const b6 = await toPng(html)
    return base64ToPngFile(b6, name)
}



export const canvasToFile = (canvas: HTMLCanvasElement, name = 'canvas.png'): Promise<File> => {
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(new File([blob], name, { type: 'image/png' }));
        }, 'image/png');
    });
}

export const imageDataToFile = (imageData) => {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;

    const ctx = canvas.getContext('2d');

    ctx.putImageData(imageData, 0, 0);

    const dataURL = canvas.toDataURL('image/png');

    return base64ToPngFile(dataURL)
}



export const svgStringToUrl = (svg: string) => {
    const encodedSvg = encodeURIComponent(svg);
    return `data:image/svg+xml;,${encodedSvg}`;
}

import { transformSvgPathToPngDataUrl } from './svgPathToPng'

class Transform {
    imgToBase64 = imgToBase64

    imgToFile = imgToFile

    createImgObjectURL = createImgObjectURL


    // svg 字符串 转为可预览的路径
    svgStringToUrl = svgStringToUrl

    base64ToPngFile = base64ToPngFile

    transformSvgPathToPngDataUrl = transformSvgPathToPngDataUrl

    imageDataToFile = imageDataToFile

    canvasToFile = canvasToFile
}





export default new Transform()