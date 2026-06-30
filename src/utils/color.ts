import type { MaskClass, MaskColor, SegmentationMaskLegendItem } from '../types'

const NAMED_COLORS: Record<string, [number, number, number, number]> = {
  transparent: [0, 0, 0, 0],
  black: [0, 0, 0, 255],
  white: [255, 255, 255, 255],
  red: [255, 0, 0, 255],
  green: [0, 128, 0, 255],
  blue: [0, 0, 255, 255],
  yellow: [255, 255, 0, 255],
  cyan: [0, 255, 255, 255],
  magenta: [255, 0, 255, 255]
}

const AUTO_COLOR_ALPHA = 184
const GOLDEN_ANGLE = 137.508
const AUTO_COLOR_SEEDS: Array<[number, number, number]> = [
  [0, 78, 50],
  [210, 78, 50],
  [120, 78, 50],
  [30, 78, 50],
  [285, 78, 50],
  [185, 78, 50],
  [330, 78, 50],
  [55, 78, 50],
  [155, 78, 50],
  [245, 78, 50],
  [90, 78, 50],
  [270, 78, 50],
  [0, 72, 62],
  [210, 72, 62],
  [120, 72, 62],
  [30, 72, 62],
  [285, 72, 62],
  [185, 72, 62],
  [330, 72, 62],
  [55, 72, 62],
  [155, 72, 62],
  [245, 72, 62],
  [90, 72, 62],
  [270, 72, 62]
]

export function createColorMap(classes: MaskClass[] = []): Uint8Array {
  const colorMap = new Uint8Array(256 * 4)

  for (const item of classes) {
    if (!Number.isInteger(item.value) || item.value < 0 || item.value > 255) continue

    const [r, g, b, a] = parseMaskColor(item.color)
    const index = item.value * 4
    colorMap[index] = r
    colorMap[index + 1] = g
    colorMap[index + 2] = b
    colorMap[index + 3] = a
  }

  return colorMap
}

export function createAutoClasses(imageData: ImageData): MaskClass[] {
  const values = new Set<number>()
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    values.add(data[i])
  }

  return Array.from(values)
    .sort((a, b) => a - b)
    .map((value) => {
      if (value === 0) {
        return { value, color: 'transparent', label: 'Background' }
      }

      return {
        value,
        color: createAutoColor(value),
        label: `Class ${value}`
      }
    })
}

export function parseMaskColor(color: MaskColor): [number, number, number, number] {
  if (Array.isArray(color)) {
    return [
      clampByte(color[0]),
      clampByte(color[1]),
      clampByte(color[2]),
      color[3] == null ? 255 : clampByte(color[3])
    ]
  }

  const normalized = color.trim().toLowerCase()
  if (NAMED_COLORS[normalized]) return NAMED_COLORS[normalized]

  const hex = parseHexColor(normalized)
  if (hex) return hex

  const rgb = parseRgbColor(normalized)
  if (rgb) return rgb

  return [0, 0, 0, 0]
}

export function colorToCss(color: MaskColor): string {
  const [r, g, b, a] = parseMaskColor(color)
  return `rgba(${r}, ${g}, ${b}, ${roundAlpha(a / 255)})`
}

export function createLegendItems(classes: MaskClass[] = []): SegmentationMaskLegendItem[] {
  return classes.map((item) => ({
    value: item.value,
    label: item.label ?? String(item.value),
    color: colorToCss(item.color)
  }))
}

function parseHexColor(color: string): [number, number, number, number] | null {
  const value = color.startsWith('#') ? color.slice(1) : color

  if (![3, 4, 6, 8].includes(value.length) || /[^0-9a-f]/i.test(value)) return null

  const expanded = value.length <= 4 ? value.split('').map((item) => item + item).join('') : value
  const r = parseInt(expanded.slice(0, 2), 16)
  const g = parseInt(expanded.slice(2, 4), 16)
  const b = parseInt(expanded.slice(4, 6), 16)
  const a = expanded.length === 8 ? parseInt(expanded.slice(6, 8), 16) : 255

  return [r, g, b, a]
}

function parseRgbColor(color: string): [number, number, number, number] | null {
  const match = color.match(/^rgba?\((.+)\)$/)
  if (!match) return null

  const parts = match[1].split(',').map((item) => item.trim())
  if (parts.length < 3) return null

  const r = clampByte(Number(parts[0]))
  const g = clampByte(Number(parts[1]))
  const b = clampByte(Number(parts[2]))
  const a = parts[3] == null ? 255 : parseAlpha(parts[3])

  return [r, g, b, a]
}

function parseAlpha(value: string): number {
  const alpha = Number(value)
  if (!Number.isFinite(alpha)) return 255
  return alpha <= 1 ? clampByte(alpha * 255) : clampByte(alpha)
}

function createAutoColor(value: number): [number, number, number, number] {
  if (value <= AUTO_COLOR_SEEDS.length) {
    const [hue, saturation, lightness] = AUTO_COLOR_SEEDS[value - 1]
    const [r, g, b] = hslToRgb(hue, saturation / 100, lightness / 100)

    return [r, g, b, AUTO_COLOR_ALPHA]
  }

  const hue = (value * GOLDEN_ANGLE) % 360
  const saturation = 66 + ((value * 11) % 18)
  const lightness = 42 + ((value * 7) % 20)
  const [r, g, b] = hslToRgb(hue, saturation / 100, lightness / 100)

  return [r, g, b, AUTO_COLOR_ALPHA]
}

function hslToRgb(hue: number, saturation: number, lightness: number): [number, number, number] {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const huePrime = hue / 60
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1))
  const match = lightness - chroma / 2
  let r = 0
  let g = 0
  let b = 0

  if (huePrime < 1) {
    r = chroma
    g = x
  } else if (huePrime < 2) {
    r = x
    g = chroma
  } else if (huePrime < 3) {
    g = chroma
    b = x
  } else if (huePrime < 4) {
    g = x
    b = chroma
  } else if (huePrime < 5) {
    r = x
    b = chroma
  } else {
    r = chroma
    b = x
  }

  return [clampByte((r + match) * 255), clampByte((g + match) * 255), clampByte((b + match) * 255)]
}

function clampByte(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round(Math.min(255, Math.max(0, value)))
}

function roundAlpha(value: number): number {
  return Math.round(value * 1000) / 1000
}
