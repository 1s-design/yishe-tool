
import { fetchFile } from "@/api";
import { cacheFontFamily, } from "@/components/design/store";
import { filesize } from 'filesize'
const cacheFontFamilyLoadingMap = {
}

import { message } from "ant-design-vue";

// 加载字体


export async function fetchFontFace(info: FontInfo) {

    // var file

    const { url, id, name } = info;


    let file

    // 存在缓存
    if (cacheFontFamily.value[id]) {
        return;
    }

    if (cacheFontFamilyLoadingMap[id]) {
        return
    }

    try {
        cacheFontFamilyLoadingMap[id] = true
        /**
         *  使用加载文件的方式加载可以记住进度
        */
        file = await fetchFile(url);

        // 使用原生方式 字体导出时会失效

        // const font = new FontFace(`font_${id}`, `url(${url})`);

        // const loadedFont = await font.load()

        // document.fonts.add(loadedFont);

    } catch (e) {
        cacheFontFamilyLoadingMap[id] = false
        throw new Error('font load error')
    }



    const fontStyle = document.createElement("style");
    const fontId = `font_${id}`;
    fontStyle.innerHTML = `
                @font-face {
                    font-family: ${fontId};
                    src: url(${URL.createObjectURL(file)}); 
                }
    `;


    document.head.appendChild(fontStyle);
    fontStyle.setAttribute("font_id", fontId);

    cacheFontFamily.value[id] = fontStyle;


    cacheFontFamily.value[id] = true; // 标记该字体为加载过
    cacheFontFamilyLoadingMap[id] = false
}

interface FontInfo {
  url: string;
  id: string;
  name: string;
  size?: number;
}

export async function fetchFontFaceWithMessage(info: FontInfo) {

    const { url, id, name, size } = info;
    try {
        // 存在缓存
        if (cacheFontFamily.value[id]) {
            return;
        }

        if (cacheFontFamilyLoadingMap[id]) {
            return
        }

        message.loading({
            content: `正在加载字体 ${name}`,
            key: `loadfont-${id}`,
            duration: 0,
        });
        await fetchFontFace(info)
    } catch (e) {
        return message.error({
            content: `字体${name}加载失败`,
            key: `loadfont-${id}`,
        })
    }
    message.success({
        content: `字体${name}加载成功`,
        key: `loadfont-${id}`,
    });
}