import { canvasStickerOptionsOnlyChild } from "../index.tsx";
import { formatSizeOptionToPixelValue } from "../helper.tsx";
import { createFilterDefaultOptions } from "./defaultOptions.tsx";

export enum ImagePrintPreset {
  ORIGINAL = "original",
  STICKER = "sticker",
  VINTAGE = "vintage",
  BLACK_WHITE = "blackWhite",
  RED_STAMP = "redStamp",
  GOLDEN = "golden",
}

export enum ImageFillMode {
  SINGLE = "single",
  TILE = "tile",
}

export const ImagePrintPresetOptions = [
  { label: "原始图片", value: ImagePrintPreset.ORIGINAL },
  { label: "白边贴纸", value: ImagePrintPreset.STICKER },
  { label: "复古颗粒", value: ImagePrintPreset.VINTAGE },
  { label: "黑白印花", value: ImagePrintPreset.BLACK_WHITE },
  { label: "印章红", value: ImagePrintPreset.RED_STAMP },
  { label: "金箔预览", value: ImagePrintPreset.GOLDEN },
];

export const ImageFillModeOptions = [
  { label: "单图展示", value: ImageFillMode.SINGLE },
  { label: "图案平铺", value: ImageFillMode.TILE },
];

export const ImagePatternRepeatOptions = [
  { label: "双向重复", value: "repeat" },
  { label: "横向重复", value: "repeat-x" },
  { label: "纵向重复", value: "repeat-y" },
  { label: "不重复", value: "no-repeat" },
];

const createSize = (value: number, unit: string) => ({
  value,
  unit,
});

const createPureColor = (color: string) => ({
  color,
  type: "pure",
});

export function createImagePrintDefaultOptions(canvasUnit = resolveCanvasUnit()) {
  return {
    preset: ImagePrintPreset.ORIGINAL,
    fillMode: ImageFillMode.SINGLE,
    pattern: {
      repeatMode: "repeat",
      tileWidth: createSize(140, canvasUnit),
      offsetX: createSize(0, canvasUnit),
      offsetY: createSize(0, canvasUnit),
    },
    outline: {
      enabled: false,
      width: createSize(6, canvasUnit),
      color: createPureColor("#ffffff"),
    },
    shadow: {
      enabled: false,
      blur: createSize(12, canvasUnit),
      offsetX: createSize(0, canvasUnit),
      offsetY: createSize(8, canvasUnit),
      color: createPureColor("rgba(15, 23, 42, 0.24)"),
    },
  };
}

export function ensureImagePrintEffectOptions(target: any, canvasUnit = resolveCanvasUnit(target)) {
  if (!target) {
    return createImagePrintDefaultOptions(canvasUnit);
  }

  if (!target.printEffect) {
    target.printEffect = createImagePrintDefaultOptions(canvasUnit);
    return target.printEffect;
  }

  const defaults = createImagePrintDefaultOptions(canvasUnit);
  const effect = target.printEffect;

  effect.preset ??= defaults.preset;
  effect.fillMode ??= defaults.fillMode;

  if (!effect.pattern) {
    effect.pattern = defaults.pattern;
  } else {
    effect.pattern.repeatMode ??= defaults.pattern.repeatMode;
    effect.pattern.tileWidth ??= defaults.pattern.tileWidth;
    effect.pattern.offsetX ??= defaults.pattern.offsetX;
    effect.pattern.offsetY ??= defaults.pattern.offsetY;
  }

  if (!effect.outline) {
    effect.outline = defaults.outline;
  } else {
    effect.outline.enabled ??= defaults.outline.enabled;
    effect.outline.width ??= defaults.outline.width;
    effect.outline.color = normalizeColor(effect.outline.color, defaults.outline.color.color);
  }

  if (!effect.shadow) {
    effect.shadow = defaults.shadow;
  } else {
    effect.shadow.enabled ??= defaults.shadow.enabled;
    effect.shadow.blur ??= defaults.shadow.blur;
    effect.shadow.offsetX ??= defaults.shadow.offsetX;
    effect.shadow.offsetY ??= defaults.shadow.offsetY;
    effect.shadow.color = normalizeColor(effect.shadow.color, defaults.shadow.color.color);
  }

  return effect;
}

export function applyImagePrintPreset(target: any, preset: ImagePrintPreset) {
  if (!target) {
    return;
  }

  const unit = resolveCanvasUnit(target);
  const printEffect = ensureImagePrintEffectOptions(target, unit);
  target.filter = createFilterDefaultOptions(unit);

  printEffect.preset = preset;
  printEffect.outline.enabled = false;
  printEffect.shadow.enabled = false;

  switch (preset) {
    case ImagePrintPreset.STICKER: {
      printEffect.outline.enabled = true;
      printEffect.outline.width = createSize(8, unit);
      printEffect.outline.color = createPureColor("#ffffff");
      printEffect.shadow.enabled = true;
      printEffect.shadow.blur = createSize(14, unit);
      printEffect.shadow.offsetX = createSize(0, unit);
      printEffect.shadow.offsetY = createSize(8, unit);
      printEffect.shadow.color = createPureColor("rgba(15, 23, 42, 0.22)");
      break;
    }
    case ImagePrintPreset.VINTAGE: {
      target.filter.filterBrightness = 98;
      target.filter.filterContrast = 92;
      target.filter.filterSaturate = 78;
      target.filter.filterSepia = 16;
      target.filter.filterOpacity = 94;
      target.filter.filterUrl.filterId = "huichenkeli";
      break;
    }
    case ImagePrintPreset.BLACK_WHITE: {
      target.filter.filterContrast = 124;
      target.filter.filterGrayscale = 100;
      target.filter.filterUrl.filterId = "blackWhite";
      break;
    }
    case ImagePrintPreset.RED_STAMP: {
      target.filter.filterContrast = 128;
      target.filter.filterBrightness = 108;
      target.filter.filterUrl.filterId = "red_stamp";
      break;
    }
    case ImagePrintPreset.GOLDEN: {
      target.filter.filterBrightness = 110;
      target.filter.filterContrast = 112;
      target.filter.filterSaturate = 118;
      target.filter.filterUrl.filterId = "golden";
      break;
    }
    case ImagePrintPreset.ORIGINAL:
    default: {
      break;
    }
  }
}

export function createImagePrintFilter(printEffect: any) {
  if (!printEffect) {
    return "";
  }

  const filterList: string[] = [];

  if (printEffect.outline?.enabled) {
    const outlineWidth = normalizePixelValue(printEffect.outline.width, 0);
    const outlineColor = normalizeColorValue(printEffect.outline.color, "#ffffff");

    if (outlineWidth > 0) {
      const diagonal = Number((outlineWidth * 0.72).toFixed(2));
      const offsets = [
        [outlineWidth, 0],
        [-outlineWidth, 0],
        [0, outlineWidth],
        [0, -outlineWidth],
        [diagonal, diagonal],
        [diagonal, -diagonal],
        [-diagonal, diagonal],
        [-diagonal, -diagonal],
      ];

      offsets.forEach(([x, y]) => {
        filterList.push(`drop-shadow(${x}px ${y}px 0 ${outlineColor})`);
      });
    }
  }

  if (printEffect.shadow?.enabled) {
    const dx = normalizePixelValue(printEffect.shadow.offsetX, 0);
    const dy = normalizePixelValue(printEffect.shadow.offsetY, 8);
    const blur = normalizePixelValue(printEffect.shadow.blur, 12);
    const color = normalizeColorValue(printEffect.shadow.color, "rgba(15, 23, 42, 0.24)");
    filterList.push(`drop-shadow(${dx}px ${dy}px ${blur}px ${color})`);
  }

  return filterList.join(" ");
}

export function createImagePatternStyle(printEffect: any, imageUrl?: string | null) {
  if (!imageUrl || printEffect?.fillMode !== ImageFillMode.TILE) {
    return null;
  }

  const tileWidth = Math.max(1, normalizePixelValue(printEffect.pattern?.tileWidth, 140));
  const offsetX = normalizePixelValue(printEffect.pattern?.offsetX, 0);
  const offsetY = normalizePixelValue(printEffect.pattern?.offsetY, 0);
  const safeImageUrl = JSON.stringify(imageUrl);

  return {
    backgroundImage: `url(${safeImageUrl})`,
    backgroundRepeat: printEffect.pattern?.repeatMode || "repeat",
    backgroundPosition: `${offsetX}px ${offsetY}px`,
    backgroundSize: `${tileWidth}px auto`,
    backgroundColor: "transparent",
  };
}

function resolveCanvasUnit(target?: any) {
  return target?.width?.unit || canvasStickerOptionsOnlyChild.value.width.unit || "px";
}

function normalizePixelValue(size: any, fallback: number) {
  const pixelValue = Number(formatSizeOptionToPixelValue(size));
  if (!Number.isFinite(pixelValue)) {
    return fallback;
  }

  return pixelValue;
}

function normalizeColor(color: any, fallback: string) {
  if (!color || typeof color !== "object") {
    return createPureColor(fallback);
  }

  color.color ??= fallback;
  color.type ??= "pure";
  return color;
}

function normalizeColorValue(color: any, fallback: string) {
  return normalizeColor(color, fallback).color;
}
