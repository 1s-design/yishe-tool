import { registerOperation } from "../registry";
import { validateAndFixHtml } from "@/ai/overflow-validator";
import {
  prepareHtmlArtworkOptions,
  updateExistingHtmlArtwork,
  getDirectExternalResourceError,
  getCanvasTypographyContext,
} from "./add-child";
import { isRecentImageUrl, getRecentImageUrls, addRecentImageUrls } from "@/ai/services/resource";
import { checkHtmlGlyphCoverage } from "@/ai/font-coverage";

registerOperation({
  id: "canvas.addHtml",
  name: "创建 HTML 设计",
  description:
    "用 HTML/CSS 创建设计作品（最常用工具）。一个 htmlContent 包含完整画面：背景、装饰、文字、图片位等。再次调用会自动替换已有 HTML 作品。",
  group: "画布",
  params: [
    {
      name: "htmlContent",
      label: "HTML 代码",
      type: "string",
      required: true,
      placeholder: '<div style="...">...</div>',
      description: [
        "完整的 HTML/CSS 代码，元素默认填满画布（width:100%;height:100%）。",
        "",
        "【响应式字号】HTML 已自动注入 --type-hero/title/primary/subtitle/body/caption/micro。按文字作用直接使用 font-size:var(--type-xxx)，不要重新定义这些变量。",
        "用户要求展示的重要信息最低使用 body；caption/micro 只用于非关键信息。font-size 禁止 px、pt、rem、vw、vh，遗留绝对字号会自动转为相对值并保证通用可读下限。",
        "主视觉只用于一个最重要的信息，主标题最多两个；长文或书法主体使用 primaryText，普通说明才使用 body/caption。中间布局容器不要设置 font-size，避免嵌套 em 重复放大。",
        "",
        "【常用模式】",
        "居中文字: display:flex;align-items:center;justify-content:center;",
        "渐变背景: background:linear-gradient(135deg,#667eea,#764ba2);",
        "卡片: background:#fff;border-radius:0.5em;padding:2em;box-shadow:0 0.25em 1em rgba(0,0,0,0.1);",
        "叠加: position:absolute;inset:0; 配合父元素 position:relative;",
        "",
        "【资源绑定】图片/字体必须通过 htmlBindings 传入，HTML 中用 {{image.key.url}} / {{font.key.family}} 引用，禁止直接写外部 URL。",
        "",
        "【禁止】纯黑 #000000、纯白 #ffffff、<script> 标签、外部图片链接",
      ].join("\n"),
    },
    {
      name: "htmlBindings",
      label: "资源绑定与配置",
      type: "object",
      description: [
        "绑定图片、字体资源及内置嵌入组件的初始化配置。格式：",
        '图片：{ "image": { "photo": { "id":"xxx", "url":"https://...", "name":"名称" } } }',
        '字体：{ "font": { "title": { "id":"xxx", "url":"https://...", "name":"字体名" } } }',
        '组件：{ "echart": { "myChart": { "option": { "title": { "text": "销量" }, ... } } } }',
        "HTML 中用 {{image.photo.url}}、{{font.title.family}} 和 {{echart.myChart}} 引用。",
      ].join("\n"),
    },
    {
      name: "htmlTemplateFields",
      label: "模板字段",
      type: "array",
      description: "定义模板中可被用户替换的字段（type: font/image/text/color/number）",
    },
    {
      name: "htmlTemplateDefaultBindings",
      label: "模板默认绑定",
      type: "object",
      description: "模板字段的默认值",
    },
    {
      name: "htmlTemplateMeta",
      label: "模板元信息",
      type: "object",
      description: "模板的元数据",
    },
    {
      name: "allowMultipleHtml",
      label: "允许多个 HTML",
      type: "boolean",
      default: false,
      description: "默认 false：再次调用会替换已有 HTML 作品。设为 true 可叠加多个 HTML 层。",
    },
  ],
  async execute(params, ctx) {
    let {
      htmlContent,
      htmlBindings,
      htmlTemplateFields,
      htmlTemplateDefaultBindings,
      htmlTemplateMeta,
      allowMultipleHtml,
    } = params;

    // 溢出检测和自动修复（带画布尺寸：字号按画布封顶，避免文字撑出画布）
    const canvasSize = (() => {
      try {
        return ctx?.getCanvasSize?.() || null;
      } catch {
        return null;
      }
    })();
    const typographyCtx = getCanvasTypographyContext(ctx);
    const validation = validateAndFixHtml(htmlContent, {
      canvasWidth: Number(canvasSize?.width) || undefined,
      canvasHeight: Number(canvasSize?.height) || undefined,
      baseFontSize: Number(typographyCtx?.baseFontSize) || undefined,
    });
    if (validation.wasFixed) {
      console.log(
        '[addHtml] 自动修复溢出问题:',
        validation.issues.length,
        '个问题',
        '画布',
        canvasSize?.width,
        'x',
        canvasSize?.height,
      );
    }
    htmlContent = validation.fixed;

    // 校验：图片绑定中是否有重复 URL 或重复 ID
    if (htmlBindings) {
      let bindings: any = htmlBindings;
      if (typeof bindings === 'string') {
        try { bindings = JSON.parse(bindings); } catch {}
      }
      const imageBindings = bindings?.image;
      if (imageBindings && typeof imageBindings === 'object') {
        const entries = Object.entries(imageBindings);
        if (entries.length > 1) {
          const urlToKeys = new Map<string, string[]>();
          const idToKeys = new Map<string, string[]>();
          for (const [key, val] of entries) {
            const v = val as any;
            if (v?.url) {
              if (!urlToKeys.has(v.url)) urlToKeys.set(v.url, []);
              urlToKeys.get(v.url)!.push(key);
            }
            if (v?.id) {
              if (!idToKeys.has(v.id)) idToKeys.set(v.id, []);
              idToKeys.get(v.id)!.push(key);
            }
          }
          const urlDups = Array.from(urlToKeys.entries()).filter(([, keys]) => keys.length > 1);
          const idDups = Array.from(idToKeys.entries()).filter(([, keys]) => keys.length > 1);
          if (urlDups.length > 0 || idDups.length > 0) {
            const lines: string[] = [];
            if (urlDups.length > 0) {
              lines.push('以下绑定使用了相同的图片 URL：');
              urlDups.forEach(([url, keys]) => lines.push(`  ${keys.join(', ')} → 同一张图`));
            }
            if (idDups.length > 0) {
              lines.push('以下绑定使用了相同的图片 ID：');
              idDups.forEach(([id, keys]) => lines.push(`  ${keys.join(', ')} → 同一张图 (id: ${id.slice(0, 8)}...)`));
            }
            return {
              success: false,
              message: `【图片重复】检测到多个绑定指向同一张图片！\n${lines.join('\n')}\n\n你需要：\n1. 搜索多张不同的图片（resource.searchImage，返回多条结果）\n2. 每张图片绑定为不同的 key\n3. 每个 key 必须使用不同的 id 和不同的 url\n\n禁止用同一张图片的 background-position 裁切冒充多张！`,
              data: { rejected: true, reason: 'duplicate_image_bindings' },
            };
          }
        }
      }
    }

    // 校验：图片绑定中的 URL 是否来自真实搜索结果
    if (htmlBindings) {
      let bindings: any = htmlBindings;
      if (typeof bindings === 'string') {
        try { bindings = JSON.parse(bindings); } catch {}
      }
      const imageBindings = bindings?.image;
      if (imageBindings && typeof imageBindings === 'object') {
        // 不只看「是否来自本次搜索结果」：用户自备素材、素材库里的历史资源都不在搜索结果里，
        // 会被误判成 AI 编造。这里改为「来源校验 + 存在性校验」：
        // 白名单命中直接放行，否则发一个 1 字节的 Range 请求确认真实可访问（CDN 已放开 CORS）。
        const unknown: Array<{ key: string; url: string }> = [];
        for (const [key, val] of Object.entries(imageBindings)) {
          const url = (val as any)?.url;
          if (url && !isRecentImageUrl(url)) unknown.push({ key, url });
        }
        if (unknown.length > 0) {
          const reachable: string[] = [];
          await Promise.all(
            unknown.map(async ({ url }) => {
              try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 6000);
                const resp = await fetch(url, {
                  method: 'GET',
                  headers: { Range: 'bytes=0-0' },
                  signal: controller.signal,
                });
                clearTimeout(timer);
                if (resp.ok || resp.status === 206) reachable.push(url);
              } catch {}
            }),
          );
          if (reachable.length > 0) addRecentImageUrls(reachable);
          const fakeUrls = unknown
            .filter(({ url }) => !reachable.includes(url))
            .map(({ key, url }) => `  ${key} → ${url.slice(0, 60)}...`);
          if (fakeUrls.length > 0) {
            const recentUrls = getRecentImageUrls();
            const hint = recentUrls.length > 0
              ? `\n以下是最近确认可用的真实图片 URL（请直接使用）：\n${recentUrls.slice(0, 6).map((u, i) => `  ${i + 1}. ${u.slice(0, 80)}...`).join('\n')}`
              : '\n请先用 resource.searchImage 搜索图片，然后使用返回的真实 url。';
            return {
              success: false,
              message: `【无效图片 URL】以下绑定的图片地址无法访问（既不在搜索结果中，也拉取不到内容）：\n${fakeUrls.join('\n')}${hint}\n\n请使用 resource.searchImage 返回的真实 url，或素材库里可访问的图片地址，禁止编造 URL！`,
              data: { rejected: true, reason: 'fake_image_urls' },
            };
          }
        }
      }
    }

    // 校验：主文案引用的字体是否真的包含这些汉字。
    // 子集字体缺字时会静默回退成系统宋体，成品出现「一半书法字、一半宋体」，
    // 而尺寸/居中/文字存在性等常规质检全部通过，属于最难发现的隐性缺陷。
    if (htmlContent) {
      let bindingsForFont: any = htmlBindings;
      if (typeof bindingsForFont === 'string') {
        try { bindingsForFont = JSON.parse(bindingsForFont); } catch {}
      }
      const fontBindings = bindingsForFont?.font;
      const fontUrlMap: Record<string, { url: string; name?: string }> = {};
      const bindingFontMap: Record<string, { id: string; url: string; name?: string }> = {};
      if (fontBindings && typeof fontBindings === 'object') {
        for (const [key, val] of Object.entries(fontBindings)) {
          const v: any = val;
          if (v?.id && v?.url) {
            fontUrlMap[v.id] = { url: v.url, name: v.name };
            bindingFontMap[key] = { id: v.id, url: v.url, name: v.name };
          }
        }
      }
      const glyphIssues = await checkHtmlGlyphCoverage(htmlContent, fontUrlMap, bindingFontMap);
      if (glyphIssues.length > 0) {
        const detail = glyphIssues
          .map((i: any) => `  「${i.fontName || i.fontFamily}」缺少字形：${i.missing}（用于「${i.text.slice(0, 12)}」）`)
          .join('\n');
        return {
          success: false,
          message: `【字体缺字】以下字体不包含文案里的部分汉字，继续渲染会静默回退成系统宋体，导致书法字与宋体混排：\n${detail}\n\n请换一款字库覆盖完整的字体（用 resource.searchFont 重新检索），或改掉缺字的文案。`,
          data: { rejected: true, reason: 'font_glyph_missing', issues: glyphIssues },
        };
      }
    }

    const options: Record<string, any> = { htmlContent };
    if (htmlBindings !== undefined) options.htmlBindings = htmlBindings;
    if (htmlTemplateFields !== undefined) options.htmlTemplateFields = htmlTemplateFields;
    if (htmlTemplateDefaultBindings !== undefined) options.htmlTemplateDefaultBindings = htmlTemplateDefaultBindings;
    if (htmlTemplateMeta !== undefined) options.htmlTemplateMeta = htmlTemplateMeta;

    // 尝试替换已有 HTML 作品
    if (!allowMultipleHtml) {
      const replaceResult = updateExistingHtmlArtwork(ctx, options);
      if (replaceResult) {
        if (replaceResult.rejected) {
          return {
            success: false,
            message: replaceResult.message || "请提交完整 htmlContent。",
            data: { id: replaceResult.id, rejected: true },
          };
        }
        // 替换成功
        const totalElements = ctx
          .getCanvasChildren()
          .filter((c: any) => c.type !== "canvas").length;
        return {
          success: true,
          message: `已更新 HTML 设计 (id: ${replaceResult.id})，当前画布共 ${totalElements} 个元素。`,
          data: { id: replaceResult.id, type: "html", totalElements, replaced: true },
        };
      }
    }

    // 新增 HTML 元素
    const prepared = prepareHtmlArtworkOptions(
      options,
      undefined,
      getCanvasTypographyContext(ctx),
    );
    const directError = getDirectExternalResourceError(prepared);
    if (directError) {
      return { success: false, message: directError, data: { rejected: true, reason: "direct_external_resource_url" } };
    }

    const id = ctx.addCanvasChild("html", prepared);
    const totalElements = ctx.getCanvasChildren().filter((c: any) => c.type !== "canvas").length;
    return {
      success: true,
      message: `已创建 HTML 设计 (id: ${id})，当前画布共 ${totalElements} 个元素。如需优化，请传入完整 htmlContent 替换。`,
      data: { id, type: "html", totalElements, replaced: false },
    };
  },
});
