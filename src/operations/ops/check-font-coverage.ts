import { registerOperation } from "../registry";
import { getFontById } from "@/api";
import { getFontCmap, getLoadedFontUrl } from "@/ai/font-coverage";

/**
 * 字体字形体检：检查某款字体是否覆盖指定文案的全部汉字。
 * 子集字体（很多书法/装饰字体只带部分字形）缺字时会静默回退成系统字体，
 * 成品出现「一半书法字、一半宋体」，肉眼看得出但常规画布质检发现不了。
 * 选字体前先跑一次，能省掉大量返工。
 */
registerOperation({
  id: "font.checkCoverage",
  name: "字体字形体检",
  description: `检查一款字体是否包含指定文案里的全部汉字（含标点）。

很多书法/装饰字体是子集字体，只带部分字形；缺字时浏览器会静默回退成系统宋体，导致设计稿「一半书法字、一半宋体」，而画布尺寸、居中、文字存在性等常规质检都发现不了。

用法：传入 fontId（可附 fontUrl 免二次查询）与要检查的文案 text，返回缺失字符清单。
建议在选定主文案字体后、canvas.addHtml 之前调用一次；canvas.addHtml 也会自动做这道校验并直接拒绝缺字渲染。`,
  group: "字体",
  params: [
    {
      name: "fontId",
      label: "字体ID",
      type: "string",
      required: true,
      description: "resource.searchFont 返回的字体 id",
    },
    {
      name: "text",
      label: "待检查文案",
      type: "string",
      required: true,
      description: "要渲染的文字，例如「招财进宝」",
    },
    {
      name: "fontUrl",
      label: "字体地址",
      type: "string",
      description: "resource.searchFont 返回的字体 URL，传入可避免再次请求字体详情",
    },
  ],
  async execute(params) {
    const { fontId, text, fontUrl } = params;
    const content = String(text || "");
    if (!content.trim()) {
      return { success: false, message: "text 不能为空" };
    }

    let url = fontUrl || getLoadedFontUrl(fontId);
    let name = "";
    if (!url) {
      try {
        const font: any = await getFontById(fontId);
        url = font?.url;
        name = font?.name || "";
      } catch {}
    }
    if (!url) {
      return { success: false, message: `未找到字体 ${fontId} 的可用地址` };
    }

    const covered = await getFontCmap(url);
    if (!covered) {
      return {
        success: false,
        message: `字体文件解析失败（可能不是有效的 TTF/OTF）：${url.slice(0, 80)}`,
      };
    }

    const cjkChars = Array.from(new Set(content.split(""))).filter((c) =>
      /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uff00-\uffef]/.test(c),
    );
    const missing = cjkChars.filter((c) => !covered.has(c.codePointAt(0)!));

    if (missing.length) {
      return {
        success: true,
        message: `字体「${name || fontId}」缺少 ${missing.length}/${cjkChars.length} 个字形：${missing.join("")}。\n渲染这些字会回退成系统宋体，请换字体或改文案。`,
        data: { fontId, name, complete: false, missing: missing.join(""), checked: cjkChars.length },
      };
    }
    return {
      success: true,
      message: `字体「${name || fontId}」覆盖完整，可以安全用于「${content}」`,
      data: { fontId, name, complete: true, missing: "", checked: cjkChars.length },
    };
  },
});
