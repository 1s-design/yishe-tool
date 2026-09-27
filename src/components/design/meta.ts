import { message } from '@/common/message';

export const meta = {
    onMainModelLoading: function () {
        message.loading({ content: `正在加载模型...`, key: 'loadingmodel', duration: 0 });
    },
    onMainModelLoaded: function () {
        message.destroy('loadingmodel');
        message.success({ content: '模型加载成功', key: 'loadingmodel', duration: 1 });
    },
    onMainModelLoadedError: function () {
        message.error({ content: '模型加载失败!', key: 'loadingmodel', duration: 1 });
    },


    onStickerBeforeCreate: async function () {
        message.loading({ content: `正在渲染贴纸...`, key: 'renderSticker', duration: 0 });
    },
    onStickerCreated: function () {
        message.success({ content: '贴纸渲染成功', key: 'renderSticker', duration: 1 });
    },


    // 当点击延迟贴纸创建完成
    onClickDelayStickerCreate: function () {
        message.success({ content: '贴纸选择成功,点击模型即可添加贴纸', duration: 3 });
    }
}