/**
 * 位图换色：在画布渲染出的像素上做颜色替换，天然覆盖 HTML、图片、字体、图表等所有元素。
 * 匹配用 CIE Lab 色差，边界按色差做软混合，避免锯齿毛边。
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface ReplaceColorOptions {
  from: string | RGB;
  to: string | RGB;
  /** CIE76 色差阈值，0 表示只换完全相同的颜色 */
  tolerance?: number;
  /** 软边宽度（色差单位），默认 tolerance * 0.4 */
  feather?: number;
  /** 保留像素原有明暗，只替换色相/饱和度 */
  preserveLuminance?: boolean;
}

export interface ReplaceColorStats {
  totalPixels: number;
  opaquePixels: number;
  replacedPixels: number;
  softPixels: number;
  ratio: number;
}

export interface PaletteColor {
  hex: string;
  rgb: RGB;
  count: number;
  ratio: number;
  neutral: boolean;
}

const clamp255 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));

export function rgbToHex({ r, g, b }: RGB): string {
  return (
    "#" +
    [r, g, b].map((v) => clamp255(v).toString(16).padStart(2, "0")).join("")
  ).toUpperCase();
}

const NAMED_COLORS: Record<string, RGB> = {
  black: { r: 0, g: 0, b: 0 },
  white: { r: 255, g: 255, b: 255 },
  red: { r: 255, g: 0, b: 0 },
  green: { r: 0, g: 128, b: 0 },
  blue: { r: 0, g: 0, b: 255 },
  yellow: { r: 255, g: 255, b: 0 },
  orange: { r: 255, g: 165, b: 0 },
  purple: { r: 128, g: 0, b: 128 },
  pink: { r: 255, g: 192, b: 203 },
  brown: { r: 165, g: 42, b: 42 },
  gray: { r: 128, g: 128, b: 128 },
  grey: { r: 128, g: 128, b: 128 },
  gold: { r: 255, g: 215, b: 0 },
  navy: { r: 0, g: 0, b: 128 },
};

export function parseColor(input: string | RGB): RGB | null {
  if (input && typeof input === "object") {
    const { r, g, b } = input;
    if ([r, g, b].every((v) => typeof v === "number")) return { r, g, b };
    return null;
  }
  const raw = String(input || "").trim().toLowerCase();
  if (!raw) return null;
  if (NAMED_COLORS[raw]) return NAMED_COLORS[raw];

  const hex = raw.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    const h = hex[1];
    if (h.length === 3 || h.length === 4) {
      return {
        r: parseInt(h[0] + h[0], 16),
        g: parseInt(h[1] + h[1], 16),
        b: parseInt(h[2] + h[2], 16),
      };
    }
    if (h.length === 6 || h.length === 8) {
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
      };
    }
    return null;
  }

  const fn = raw.match(/^rgba?\(([^)]+)\)$/);
  if (fn) {
    const parts = fn[1].split(/[,\s/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const nums = parts.slice(0, 3).map((p) =>
      p.endsWith("%") ? (parseFloat(p) / 100) * 255 : parseFloat(p),
    );
    if (nums.some((n) => !Number.isFinite(n))) return null;
    return { r: nums[0], g: nums[1], b: nums[2] };
  }
  return null;
}

const srgbToLinear = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

const labF = (t: number) =>
  t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;

const labInv = (t: number) => {
  const t3 = t * t * t;
  return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787;
};

export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);
  const x = (rl * 0.4124 + gl * 0.3576 + bl * 0.1805) / 0.95047;
  const y = rl * 0.2126 + gl * 0.7152 + bl * 0.0722;
  const z = (rl * 0.0193 + gl * 0.1192 + bl * 0.9505) / 1.08883;
  const fx = labF(x);
  const fy = labF(y);
  const fz = labF(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function labToRgb(L: number, a: number, b: number): RGB {
  const fy = (L + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;
  const x = labInv(fx) * 0.95047;
  const y = labInv(fy);
  const z = labInv(fz) * 1.08883;

  const rl = x * 3.2406 + y * -1.5372 + z * -0.4986;
  const gl = x * -0.9689 + y * 1.8758 + z * 0.0415;
  const bl = x * 0.0557 + y * -0.204 + z * 1.057;

  const toSrgb = (v: number) => {
    const c = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    return clamp255(c * 255);
  };
  return { r: toSrgb(rl), g: toSrgb(gl), b: toSrgb(bl) };
}

export interface PixelBuffer {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

const LAB_CACHE_LIMIT = 200_000;

export function replaceColor(
  image: PixelBuffer,
  options: ReplaceColorOptions,
): ReplaceColorStats {
  const from = parseColor(options.from);
  const to = parseColor(options.to);
  if (!from || !to) {
    throw new Error("颜色格式无法解析，请使用 #RRGGBB 或 rgb() 格式");
  }
  const tolerance = Math.max(0, options.tolerance ?? 10);
  const feather = Math.max(0, options.feather ?? tolerance * 0.4);
  const preserveLuminance = options.preserveLuminance ?? false;

  const data = image.data;
  const [srcL, srcA, srcB] = rgbToLab(from.r, from.g, from.b);
  const [, dstA, dstB] = rgbToLab(to.r, to.g, to.b);
  const flatTo = { r: to.r, g: to.g, b: to.b };

  // 先用宽松的 RGB 球做筛选，再算精确 Lab 色差，避免对全图做 pow/cbrt
  const prefilter = Math.max(24, tolerance * 5);
  const prefilterSq = prefilter * prefilter;

  const labCache = new Map<number, [number, number, number]>();
  const byL = new Array<RGB | undefined>(256);

  const targetForLab = (L: number): RGB => {
    if (!preserveLuminance) return flatTo;
    const key = L < 0 ? 0 : L > 100 ? 100 : Math.round(L);
    const cached = byL[key];
    if (cached) return cached;
    const rgb = labToRgb(key, dstA, dstB);
    byL[key] = rgb;
    return rgb;
  };

  let totalPixels = 0;
  let opaquePixels = 0;
  let replacedPixels = 0;
  let softPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    totalPixels++;
    const alpha = data[i + 3];
    if (alpha === 0) continue;
    opaquePixels++;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const dr = r - from.r;
    const dg = g - from.g;
    const db = b - from.b;
    const rgbDistSq = dr * dr + dg * dg + db * db;
    if (rgbDistSq > prefilterSq) continue;

    const key = (r << 16) | (g << 8) | b;
    let lab = labCache.get(key);
    if (!lab) {
      lab = rgbToLab(r, g, b);
      if (labCache.size < LAB_CACHE_LIMIT) labCache.set(key, lab);
    }
    const dl = lab[0] - srcL;
    const da = lab[1] - srcA;
    const dbb = lab[2] - srcB;
    const dist = Math.sqrt(dl * dl + da * da + dbb * dbb);
    if (dist > tolerance) continue;

    let mix = 1;
    if (feather > 0 && dist > tolerance - feather) {
      mix = (tolerance - dist) / feather;
      if (mix <= 0) continue;
      softPixels++;
    }
    replacedPixels++;

    const target = targetForLab(lab[0]);
    if (mix >= 1) {
      data[i] = target.r;
      data[i + 1] = target.g;
      data[i + 2] = target.b;
    } else {
      data[i] = r + (target.r - r) * mix;
      data[i + 1] = g + (target.g - g) * mix;
      data[i + 2] = b + (target.b - b) * mix;
    }
  }

  return {
    totalPixels,
    opaquePixels,
    replacedPixels,
    softPixels,
    ratio: opaquePixels ? replacedPixels / opaquePixels : 0,
  };
}

export function extractPalette(
  image: PixelBuffer,
  maxColors = 10,
  minAlpha = 8,
): PaletteColor[] {
  const data = image.data;
  const BINS = 32 * 32 * 32;
  const counts = new Uint32Array(BINS);
  const sumR = new Float64Array(BINS);
  const sumG = new Float64Array(BINS);
  const sumB = new Float64Array(BINS);
  let opaque = 0;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < minAlpha) continue;
    opaque++;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const bin = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    counts[bin]++;
    sumR[bin] += r;
    sumG[bin] += g;
    sumB[bin] += b;
  }
  if (!opaque) return [];

  const bins: { rgb: RGB; count: number }[] = [];
  for (let bin = 0; bin < BINS; bin++) {
    const c = counts[bin];
    if (!c) continue;
    bins.push({
      rgb: { r: sumR[bin] / c, g: sumG[bin] / c, b: sumB[bin] / c },
      count: c,
    });
  }
  bins.sort((x, y) => y.count - x.count);

  const clusters: { rgb: RGB; count: number; lab: [number, number, number] }[] = [];
  for (const bin of bins) {
    const lab = rgbToLab(bin.rgb.r, bin.rgb.g, bin.rgb.b);
    let merged = false;
    for (const cluster of clusters) {
      const dl = lab[0] - cluster.lab[0];
      const da = lab[1] - cluster.lab[1];
      const db = lab[2] - cluster.lab[2];
      if (Math.sqrt(dl * dl + da * da + db * db) < 8) {
        const total = cluster.count + bin.count;
        cluster.rgb = {
          r: (cluster.rgb.r * cluster.count + bin.rgb.r * bin.count) / total,
          g: (cluster.rgb.g * cluster.count + bin.rgb.g * bin.count) / total,
          b: (cluster.rgb.b * cluster.count + bin.rgb.b * bin.count) / total,
        };
        cluster.count = total;
        merged = true;
        break;
      }
    }
    if (!merged && clusters.length < maxColors * 3) {
      clusters.push({ rgb: bin.rgb, count: bin.count, lab });
    }
  }

  clusters.sort((x, y) => y.count - x.count);
  return clusters.slice(0, maxColors).map((c) => {
    const rgb = {
      r: clamp255(c.rgb.r),
      g: clamp255(c.rgb.g),
      b: clamp255(c.rgb.b),
    };
    const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
    const chroma = Math.sqrt(lab[1] * lab[1] + lab[2] * lab[2]);
    return {
      hex: rgbToHex(rgb),
      rgb,
      count: c.count,
      ratio: c.count / opaque,
      neutral: chroma < 8,
    };
  });
}
