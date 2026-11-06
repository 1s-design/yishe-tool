import assert from 'node:assert/strict'
import {
  extractPalette,
  labToRgb,
  parseColor,
  replaceColor,
  rgbToHex,
  rgbToLab,
} from '../src/common/color-replace.ts'

let passed = 0
function test(name, fn) {
  const start = Date.now()
  fn()
  passed++
  console.log(`ok ${name} (${Date.now() - start}ms)`)
}

function makeImage(width, height, painter) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const c = painter(x, y)
      data[i] = c.r
      data[i + 1] = c.g
      data[i + 2] = c.b
      data[i + 3] = c.a ?? 255
    }
  }
  return { data, width, height }
}

function pixel(img, x, y) {
  const i = (y * img.width + x) * 4
  return { r: img.data[i], g: img.data[i + 1], b: img.data[i + 2], a: img.data[i + 3] }
}

test('parseColor 覆盖 hex/rgb/命名色', () => {
  assert.deepEqual(parseColor('#f00'), { r: 255, g: 0, b: 0 })
  assert.deepEqual(parseColor('#FF8800'), { r: 255, g: 136, b: 0 })
  assert.deepEqual(parseColor('rgb(1, 2, 3)'), { r: 1, g: 2, b: 3 })
  assert.deepEqual(parseColor('rgba(10,20,30,0.5)'), { r: 10, g: 20, b: 30 })
  assert.deepEqual(parseColor('white'), { r: 255, g: 255, b: 255 })
  assert.equal(parseColor('not-a-color'), null)
  assert.deepEqual(parseColor({ r: 1, g: 2, b: 3 }), { r: 1, g: 2, b: 3 })
})

test('Lab 往返误差小于 1', () => {
  const samples = [
    { r: 255, g: 0, b: 0 },
    { r: 12, g: 200, b: 90 },
    { r: 240, g: 240, b: 240 },
    { r: 30, g: 30, b: 90 },
  ]
  for (const s of samples) {
    const [L, a, b] = rgbToLab(s.r, s.g, s.b)
    const back = labToRgb(L, a, b)
    assert.ok(Math.abs(back.r - s.r) <= 1, `r ${back.r} vs ${s.r}`)
    assert.ok(Math.abs(back.g - s.g) <= 1, `g ${back.g} vs ${s.g}`)
    assert.ok(Math.abs(back.b - s.b) <= 1, `b ${back.b} vs ${s.b}`)
  }
})

test('精确替换纯色，其他颜色不动', () => {
  const img = makeImage(4, 4, (x) => (x < 2 ? { r: 255, g: 0, b: 0 } : { r: 0, g: 128, b: 255 }))
  const stats = replaceColor(img, { from: '#FF0000', to: '#00FF00', tolerance: 0 })
  assert.equal(stats.replacedPixels, 8)
  assert.equal(pixel(img, 0, 0).r, 0)
  assert.equal(pixel(img, 0, 0).g, 255)
  assert.equal(pixel(img, 3, 0).r, 0)
  assert.equal(pixel(img, 3, 0).g, 128)
})

test('容差控制近似色，0 容差不换', () => {
  const near = makeImage(2, 2, () => ({ r: 250, g: 6, b: 4 }))
  const strict = replaceColor({ ...near, data: new Uint8ClampedArray(near.data) }, {
    from: '#FF0000',
    to: '#0000FF',
    tolerance: 0,
  })
  assert.equal(strict.replacedPixels, 0)

  const loose = replaceColor(near, { from: '#FF0000', to: '#0000FF', tolerance: 8 })
  assert.equal(loose.replacedPixels, 4)
  assert.equal(pixel(near, 1, 1).b, 255)
})

test('保留明暗：暗红变暗蓝、亮红变亮蓝', () => {
  const img = makeImage(2, 1, (x) =>
    x === 0 ? { r: 120, g: 0, b: 0 } : { r: 230, g: 60, b: 60 },
  )
  const stats = replaceColor(img, { from: '#C00000', to: '#0000C0', tolerance: 40, preserveLuminance: true })
  assert.equal(stats.replacedPixels, 2)
  const dark = pixel(img, 0, 0)
  const light = pixel(img, 1, 0)
  const lum = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b
  assert.ok(dark.b > 40 && dark.b < 160, `dark blue ${JSON.stringify(dark)}`)
  assert.ok(lum(light) > lum(dark), '亮部换色后仍比暗部亮')
})

test('不保留明暗时统一成目标色', () => {
  const img = makeImage(2, 1, (x) =>
    x === 0 ? { r: 120, g: 0, b: 0 } : { r: 230, g: 60, b: 60 },
  )
  replaceColor(img, {
    from: '#C00000',
    to: '#0000C0',
    tolerance: 40,
    preserveLuminance: false,
    feather: 0,
  })
  assert.deepEqual(pixel(img, 0, 0), { r: 0, g: 0, b: 192, a: 255 })
  assert.deepEqual(pixel(img, 1, 0), { r: 0, g: 0, b: 192, a: 255 })
})

test('透明像素不参与替换且 alpha 原样保留', () => {
  const img = makeImage(2, 1, (x) =>
    x === 0 ? { r: 255, g: 0, b: 0, a: 0 } : { r: 255, g: 0, b: 0, a: 128 },
  )
  const stats = replaceColor(img, { from: '#FF0000', to: '#00FF00', tolerance: 0 })
  assert.equal(stats.replacedPixels, 1)
  assert.deepEqual(pixel(img, 0, 0), { r: 255, g: 0, b: 0, a: 0 })
  assert.deepEqual(pixel(img, 1, 0), { r: 0, g: 255, b: 0, a: 128 })
})

test('软边：远离源色的像素按比例混色而不是生硬切断', () => {
  const img = makeImage(3, 1, (x) => [
    { r: 255, g: 0, b: 0 },
    { r: 255, g: 60, b: 60 },
    { r: 255, g: 120, b: 120 },
  ][x])
  const stats = replaceColor(img, {
    from: '#FF0000',
    to: '#0000FF',
    tolerance: 40,
    feather: 20,
    preserveLuminance: false,
  })
  assert.ok(stats.softPixels >= 1, '存在软边像素')
  const mid = pixel(img, 1, 0)
  assert.ok(mid.r > 0 && mid.r < 255, `软边应保留部分红色，实际 ${JSON.stringify(mid)}`)
  assert.equal(pixel(img, 2, 0).r, 255, '超出容差的像素不变')
})

test('调色板提取按占比排序并标注中性色', () => {
  const img = makeImage(10, 10, (x, y) => {
    if (x < 6) return { r: 220, g: 30, b: 30 }
    if (x < 9) return { r: 20, g: 20, b: 20 }
    return { r: 250, g: 250, b: 250, a: 0 }
  })
  const palette = extractPalette(img, 5)
  assert.equal(palette[0].hex, rgbToHex({ r: 220, g: 30, b: 30 }))
  assert.ok(palette[0].ratio > 0.66 && palette[0].ratio < 0.67)
  assert.equal(palette[0].neutral, false)
  assert.ok(palette.some((c) => c.neutral), '包含中性色')
  assert.ok(palette.every((c) => c.ratio > 0 && c.ratio <= 1))
})

test('2200x2200 画布性能', () => {
  const img = makeImage(2200, 2200, (x, y) => ({
    r: (x * 7 + y * 13) % 256,
    g: (x * 17 + y * 3) % 256,
    b: (x * 5 + y * 11) % 256,
  }))
  const start = Date.now()
  const stats = replaceColor(img, { from: '#FF0000', to: '#00FF00', tolerance: 10 })
  const ms = Date.now() - start
  console.log(`   全画布换色 ${ms}ms，命中 ${(stats.ratio * 100).toFixed(2)}%`)
  assert.ok(ms < 3000, `耗时 ${ms}ms 超出 3s`)
})

console.log(`\n${passed} 个用例全部通过`)
