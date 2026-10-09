import { registerOperation } from "../../registry";

void ({
  id: "canvas.addImage",
  name: "添加图片",
  description: [
    "添加单张图片到画布。URL 来自 resource.searchImage 的搜索结果。",
    "默认居中并填满画布。",
    "【多图拼贴请用 canvas.addChild + HTML Grid】",
    "这个工具只适合添加单张图片，多图组合请用 canvas.addChild 的 html 类型。",
  ].join(" "),
  group: "添加元素",
  params: [
    {
      name: "imageUrl",
      label: "图片地址",
      type: "string",
      required: true,
      placeholder: "resource.searchImage 返回的 url",
      description: "图片 URL，来自 resource.searchImage 搜索结果中的 url 字段",
    },
    {
      name: "objectFit",
      label: "适配方式",
      type: "select",
      default: "cover",
      options: [
        { label: "裁剪填充（cover）", value: "cover" },
        { label: "保持比例（contain）", value: "contain" },
        { label: "拉伸（fill）", value: "fill" },
        { label: "原始大小（none）", value: "none" },
      ],
      description:
        "图片适配方式。cover=裁剪填满（最常用），contain=完整显示可能有留白",
    },
    {
      name: "width",
      label: "宽度",
      type: "number",
      default: 100,
      min: 1,
      max: 10000,
      description: "宽度百分比，100=满画布宽。50=半宽。通常不需要改。",
    },
    {
      name: "height",
      label: "高度",
      type: "number",
      default: 100,
      min: 1,
      max: 10000,
      description: "高度百分比，100=满画布高。50=半高。通常不需要改。",
    },
    {
      name: "rotateZ",
      label: "旋转角度",
      type: "number",
      default: 0,
      min: -360,
      max: 360,
      description: "旋转角度（度）",
    },
    {
      name: "center",
      label: "居中",
      type: "boolean",
      default: true,
      description: "是否在画布中居中",
    },
  ],
  execute(params, ctx) {
    const { imageUrl, objectFit, width, height, rotateZ, center } = params;

    const extraOptions: Record<string, any> = {};

    extraOptions.imageInfo = { url: imageUrl };

    if (objectFit !== undefined) extraOptions.objectFit = objectFit;
    if (width !== undefined) extraOptions.width = { value: width, unit: "vw" };
    if (height !== undefined)
      extraOptions.height = { value: height, unit: "vh" };

    if (rotateZ !== undefined) {
      extraOptions.transform = { rotateZ };
    }

    if (center !== undefined) {
      extraOptions.position = {
        center,
        verticalCenter: center,
        horizontalCenter: center,
        top: { value: 0, unit: "px" },
        left: { value: 0, unit: "px" },
        bottom: { value: 0, unit: "px" },
        right: { value: 0, unit: "px" },
      };
    }

    const id = ctx.addCanvasChild("image", extraOptions);
    return {
      success: true,
      message: `已添加图片 (id: ${id})，URL: ${imageUrl.slice(0, 60)}...。用 element.setStyle 可通过 id 调整位置和大小。`,
      data: { id, type: "image" },
    };
  },
});
