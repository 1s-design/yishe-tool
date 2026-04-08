

import s1Empty from './empty/index.vue'
import s1Image from './image.vue'
import s1Scrollbar from "@/components/scrollbar/index.vue";
import { loadingBottom } from "@/components/loading/index.tsx";
import svgIcon from './icon/index.vue'
import gltfViewer from './model/gltfViewer/index.vue'
import tagsInput from "@/components/design/components/tagsInput/tagsInput.vue";
import colorPicker from "@/components/design/components/colorPicker/colorPicker.vue";
import baseGltfViewer from "@/components/model/baseGltfViewer/index.vue";
import operateFormItem from "@/components/design/layout/canvas/operate/operateFormItem.vue";
import imageListUploader from './imageListUploader/index.vue'
import pagingBottom from './pagingBottom.vue'

export const s1Plugin = {
    install(app) {
        app.component('s1Empty', s1Empty);
        app.component('s1Image', s1Image);
        app.component('s1Img', s1Image);
        app.component('s1Scrollbar', s1Scrollbar);
        app.component('s1LoadingBottom', loadingBottom);
        app.component('s1Icon', svgIcon)
        app.component('s1GltfViewer', gltfViewer)
        app.component('s1ImageListUploader', imageListUploader)
        app.component('s1TagsInput', tagsInput)
        app.component('ColorPicker', colorPicker)
        app.component('color-picker', colorPicker)
        app.component('OperateFormItem', operateFormItem)
        app.component('operate-form-item', operateFormItem)
        app.component('s1BaseGltfViewer', baseGltfViewer)
        app.component('s1PagingBottom', pagingBottom)
    }
}
