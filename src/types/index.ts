export type ImageCrossOrigin = '' | 'anonymous' | 'use-credentials'
export type MaskColor = string | [number, number, number] | [number, number, number, number]

export interface MaskClass {
  value: number
  color: MaskColor
  label?: string
}

export interface EdgeOptions {
  visible?: boolean
  threshold?: number
  width?: number
}

export interface SegmentationMaskLegendItem {
  value: number
  label: string
  color: string
}

export interface SegmentationMaskProps {
  baseSrc?: string
  src?: string
  classes?: MaskClass[]
  colorMap?: Uint8Array | Uint8ClampedArray | number[]
  width?: number
  height?: number
  opacity?: number
  edge?: boolean | EdgeOptions
  legend?: boolean
  crossOrigin?: ImageCrossOrigin
  alt?: string
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
}

export interface SegmentationMaskRenderEvent {
  width: number
  height: number
}

export interface SegmentationMaskErrorEvent {
  source: 'base' | 'mask'
  error: unknown
}
