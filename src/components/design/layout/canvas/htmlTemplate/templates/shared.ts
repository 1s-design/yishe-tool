import type {
  HtmlTemplateDefinition,
  HtmlTemplateFieldDefinition,
  HtmlTemplateMeta,
} from "../types";

export const defaultFontBinding = {
  id: "",
  name: "",
  url: "",
};

export function createPureColor(color: string) {
  return {
    color,
    type: "pure" as const,
  };
}

export function createPlaceholderImageDataUrl(
  label: string,
  accent = "#0f172a",
  background = "#f8fafc"
) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="720" viewBox="0 0 720 720">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${background}" />
          <stop offset="100%" stop-color="#ffffff" />
        </linearGradient>
      </defs>
      <rect width="720" height="720" rx="72" fill="url(#bg)" />
      <circle cx="360" cy="250" r="120" fill="${accent}" opacity="0.12" />
      <rect x="136" y="398" width="448" height="56" rx="28" fill="${accent}" opacity="0.15" />
      <rect x="200" y="492" width="320" height="32" rx="16" fill="${accent}" opacity="0.12" />
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="${accent}"
        font-size="48"
        font-family="Arial, sans-serif"
      >${label}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function createPlaceholderImageBinding(
  id: string,
  name: string,
  accent = "#0f172a",
  background = "#f8fafc"
) {
  return {
    id,
    name,
    url: createPlaceholderImageDataUrl(name, accent, background),
  };
}

export function createTemplate(
  meta: Omit<HtmlTemplateMeta, "source">,
  bindingFields: HtmlTemplateFieldDefinition[],
  defaultBindings: Record<string, any>,
  htmlContent: string
): HtmlTemplateDefinition {
  return {
    ...meta,
    source: "builtin",
    bindingFields,
    defaultBindings,
    htmlContent,
  };
}

export function cloneTemplateList(list: HtmlTemplateDefinition[]) {
  return list.map((item) =>
    typeof structuredClone === "function"
      ? structuredClone(item)
      : JSON.parse(JSON.stringify(item))
  );
}

export function textField(
  key: string,
  label: string,
  placeholder = "",
  description?: string
): HtmlTemplateFieldDefinition {
  return {
    key,
    label,
    type: "text",
    placeholder,
    description,
  };
}

export function textareaField(
  key: string,
  label: string,
  placeholder = "",
  rows = 3,
  description?: string
): HtmlTemplateFieldDefinition {
  return {
    key,
    label,
    type: "textarea",
    placeholder,
    rows,
    description,
  };
}

export function numberField(
  key: string,
  label: string,
  options: {
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    description?: string;
  } = {}
): HtmlTemplateFieldDefinition {
  return {
    key,
    label,
    type: "number",
    min: options.min,
    max: options.max,
    step: options.step,
    placeholder: options.placeholder,
    description: options.description,
  };
}

export function colorField(
  key: string,
  label: string,
  description?: string
): HtmlTemplateFieldDefinition {
  return {
    key,
    label,
    type: "color",
    description,
  };
}

export function imageField(
  key: string,
  label: string,
  description?: string
): HtmlTemplateFieldDefinition {
  return {
    key,
    label,
    type: "image",
    description,
  };
}

export function fontField(
  key: string,
  label: string,
  description?: string
): HtmlTemplateFieldDefinition {
  return {
    key,
    label,
    type: "font",
    description,
  };
}
