export type HtmlTemplateFieldType =
  | "text"
  | "textarea"
  | "number"
  | "color"
  | "image"
  | "font";

export type HtmlTemplateSource = "builtin" | "local" | "remote";
export type HtmlTemplateDifficulty = "simple" | "intermediate" | "advanced";
export type HtmlTemplatePrintStyle =
  | "cutout"
  | "all-over"
  | "poster"
  | "packaging"
  | "label"
  | "info-card"
  | "marketing"
  | "pattern";

export const HTML_TEMPLATE_DIFFICULTY_LABEL_MAP: Record<HtmlTemplateDifficulty, string> = {
  simple: "简单",
  intermediate: "进阶",
  advanced: "高级",
};

export const HTML_TEMPLATE_PRINT_STYLE_LABEL_MAP: Record<HtmlTemplatePrintStyle, string> = {
  "cutout": "抠图 / 贴纸",
  "all-over": "全幅印花",
  "poster": "海报 / 排版",
  "packaging": "包装 / 插卡",
  "label": "标签 / 辅料",
  "info-card": "信息 / 说明卡",
  "marketing": "营销 / 展示",
  "pattern": "纹样 / 底纹",
};

export interface HtmlTemplateFieldDefinition {
  key: string;
  label: string;
  type: HtmlTemplateFieldType;
  placeholder?: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
}

export interface HtmlTemplateMeta {
  id: string;
  name: string;
  category: string;
  description?: string;
  tags?: string[];
  source?: HtmlTemplateSource;
  difficulty?: HtmlTemplateDifficulty;
  sceneDescription?: string;
  suitableProducts?: string[];
  printStyle?: HtmlTemplatePrintStyle;
  sortOrder?: number;
}

export interface HtmlTemplateDefinition extends HtmlTemplateMeta {
  htmlContent: string;
  bindingFields: HtmlTemplateFieldDefinition[];
  defaultBindings?: Record<string, any>;
}
