/**
 * 通过文件头（magic bytes）识别文件真实格式。
 *
 * 素材常见「另存为」场景会出现扩展名与编码不一致的情况（例如文件名是 .jpg，
 * 内部其实是 PNG）。按扩展名把文件交给解码器时，会读到不匹配的文件头并报
 * 「暂不支持该文件格式」。因此上传前统一按真实内容纠正扩展名。
 */

export interface DetectedFileType {
  suffix: string;
  mime: string;
}

const ascii = (header: Uint8Array, start: number, length: number) =>
  String.fromCharCode(...header.subarray(start, start + length));

const signatures: Array<{
  suffix: string;
  mime: string;
  test: (header: Uint8Array) => boolean;
}> = [
  {
    suffix: 'png',
    mime: 'image/png',
    test: (h) => h[0] === 0x89 && h[1] === 0x50 && h[2] === 0x4e && h[3] === 0x47,
  },
  {
    suffix: 'jpg',
    mime: 'image/jpeg',
    test: (h) => h[0] === 0xff && h[1] === 0xd8 && h[2] === 0xff,
  },
  {
    suffix: 'gif',
    mime: 'image/gif',
    test: (h) => ascii(h, 0, 4) === 'GIF8',
  },
  {
    suffix: 'webp',
    mime: 'image/webp',
    test: (h) => ascii(h, 0, 4) === 'RIFF' && ascii(h, 8, 4) === 'WEBP',
  },
  {
    suffix: 'bmp',
    mime: 'image/bmp',
    test: (h) => h[0] === 0x42 && h[1] === 0x4d,
  },
  {
    suffix: 'avif',
    mime: 'image/avif',
    test: (h) => ascii(h, 4, 4) === 'ftyp' && ascii(h, 8, 4) === 'avif',
  },
  {
    suffix: 'heic',
    mime: 'image/heic',
    test: (h) => ascii(h, 4, 4) === 'ftyp' && ['heic', 'heix', 'mif1'].includes(ascii(h, 8, 4)),
  },
  {
    suffix: 'tif',
    mime: 'image/tiff',
    test: (h) => (h[0] === 0x49 && h[1] === 0x49) || (h[0] === 0x4d && h[1] === 0x4d),
  },
  {
    suffix: 'psd',
    mime: 'image/vnd.adobe.photoshop',
    test: (h) => ascii(h, 0, 4) === '8BPS',
  },
  {
    suffix: 'pdf',
    mime: 'application/pdf',
    test: (h) => ascii(h, 0, 4) === '%PDF',
  },
  {
    suffix: 'ttf',
    mime: 'font/ttf',
    test: (h) => h[0] === 0x00 && h[1] === 0x01 && h[2] === 0x00 && h[3] === 0x00,
  },
  {
    suffix: 'otf',
    mime: 'font/otf',
    test: (h) => ascii(h, 0, 4) === 'OTTO',
  },
  {
    suffix: 'woff',
    mime: 'font/woff',
    test: (h) => ascii(h, 0, 4) === 'wOFF',
  },
  {
    suffix: 'woff2',
    mime: 'font/woff2',
    test: (h) => ascii(h, 0, 4) === 'wOF2',
  },
];

/** 统一别名，避免 jpg/jpeg 这类等价后缀被误判为「不一致」 */
const canonicalSuffix = (suffix: string) => {
  const value = (suffix || '').toLowerCase();
  if (value === 'jpeg') return 'jpg';
  if (value === 'tiff') return 'tif';
  return value;
};

export function detectFileType(header: Uint8Array): DetectedFileType | null {
  if (!header || header.length < 4) return null;
  const hit = signatures.find((item) => {
    try {
      return item.test(header);
    } catch {
      return false;
    }
  });
  return hit ? { suffix: hit.suffix, mime: hit.mime } : null;
}

/**
 * 按真实内容纠正文件扩展名。
 * 无法识别或扩展名本就正确时原样返回，不产生额外开销。
 */
export async function normalizeFileByContent(file: File): Promise<File> {
  if (!file || typeof file.slice !== 'function') return file;

  let header: Uint8Array;
  try {
    header = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  } catch {
    return file;
  }

  const detected = detectFileType(header);
  if (!detected) return file;

  const fileName = file.name || '';
  const currentSuffix = canonicalSuffix(fileName.match(/\.([^.\\/]+)$/)?.[1] || '');
  if (currentSuffix === detected.suffix) return file;

  const baseName = fileName.replace(/\.[^.\\/]*$/, '') || 'file';
  return new File([file], `${baseName}.${detected.suffix}`, {
    type: detected.mime,
    lastModified: file.lastModified,
  });
}
