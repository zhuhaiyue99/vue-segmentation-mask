<template>
  <div
    class="vsm-root"
    :style="rootStyle"
  >
    <img
      v-if="!!resolvedBaseSrc"
      class="vsm-base"
      :src="resolvedBaseSrc"
      :alt="alt"
      :style="imageStyle"
      @error="handleBaseError"
    />
    <canvas ref="fillCanvas" class="vsm-canvas" />
    <canvas v-show="resolvedShowEdge" ref="edgeCanvas" class="vsm-canvas" />
    <div v-if="loading" class="vsm-state">
      <slot name="loading">Loading...</slot>
    </div>
    <div v-else-if="lastError" class="vsm-state vsm-state--error">
      <slot name="error" :error="lastError.error" :source="lastError.source">Failed to render mask.</slot>
    </div>
    <div v-if="legend && legendItems.length" class="vsm-legend">
      <slot name="legend" :items="legendItems">
        <div v-for="item in legendItems" :key="item.value" class="vsm-legend__item">
          <span class="vsm-legend__swatch" :style="{ backgroundColor: item.color }"></span>
          <span class="vsm-legend__label">{{ item.label }}</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { createAutoClasses, createColorMap, createLegendItems } from '../utils/color'
import { createEdgeDistanceMap } from '../utils/edge'
import { loadImage } from '../utils/image'
import type {
  EdgeOptions,
  MaskClass,
  SegmentationMaskErrorEvent,
  SegmentationMaskRenderEvent
} from '../types'

defineOptions({
  name: 'SegmentationMask'
})

const props = withDefaults(
  defineProps<{
    baseSrc?: string
    src?: string
    classes?: MaskClass[]
    colorMap?: Uint8Array | Uint8ClampedArray | number[]
    width?: number
    height?: number
    opacity?: number
    edge?: boolean | EdgeOptions
    legend?: boolean
    crossOrigin?: '' | 'anonymous' | 'use-credentials'
    alt?: string
    fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  }>(),
  {
    opacity: undefined,
    edge: undefined,
    legend: false,
    crossOrigin: 'anonymous',
    alt: 'Segmentation image',
    fit: 'fill'
  }
)

const emit = defineEmits<{
  rendered: [SegmentationMaskRenderEvent]
  error: [SegmentationMaskErrorEvent]
}>()

const fillCanvas = ref<HTMLCanvasElement>()
const edgeCanvas = ref<HTMLCanvasElement>()
const maskNaturalWidth = ref(0)
const maskNaturalHeight = ref(0)
const loading = ref(false)
const lastError = ref<SegmentationMaskErrorEvent>()
const autoClasses = ref<MaskClass[]>([])
let renderToken = 0
let currentMaskImageData: ImageData | undefined

const resolvedBaseSrc = computed(() => props.baseSrc ?? '')
const resolvedSrc = computed(() => props.src ?? '')
const resolvedEdgeOptions = computed<EdgeOptions>(() => {
  if (typeof props.edge === 'object') return props.edge
  return {
    visible: props.edge ?? false
  }
})
const resolvedShowEdge = computed(() => resolvedEdgeOptions.value.visible ?? false)
const resolvedEdgeThreshold = computed(() => resolvedEdgeOptions.value.threshold ?? 0.5)
const resolvedEdgeWidth = computed(() => Math.max(1, Math.round(resolvedEdgeOptions.value.width ?? 1)))
const resolvedOpacity = computed(() => clamp(props.opacity ?? 1, 0, 1))
const resolvedClasses = computed(() => props.classes ?? autoClasses.value)
const resolvedColorMap = computed(() => props.colorMap ?? createColorMap(resolvedClasses.value))
const legendItems = computed(() => createLegendItems(resolvedClasses.value))

const renderWidth = computed(() => props.width ?? maskNaturalWidth.value)
const renderHeight = computed(() => props.height ?? maskNaturalHeight.value)

const rootStyle = computed(() => ({
  width: renderWidth.value ? `${renderWidth.value}px` : undefined,
  height: renderHeight.value ? `${renderHeight.value}px` : undefined
}))

const imageStyle = computed(() => ({
  width: renderWidth.value ? `${renderWidth.value}px` : undefined,
  height: renderHeight.value ? `${renderHeight.value}px` : undefined,
  objectFit: props.fit
}))

const handleBaseError = () => {
  lastError.value = {
    source: 'base',
    error: new Error(`Failed to load image: ${resolvedBaseSrc.value}`)
  }
  emit('error', lastError.value)
}

const render = async () => {
  const src = resolvedSrc.value
  const fill = fillCanvas.value
  const edge = edgeCanvas.value
  const token = (renderToken += 1)

  if (!src || !fill || !edge) return

  loading.value = true
  lastError.value = undefined

  try {
    const maskImage = await loadImage(src, props.crossOrigin)
    if (token !== renderToken) return

    const naturalWidth = maskImage.naturalWidth || maskImage.width
    const naturalHeight = maskImage.naturalHeight || maskImage.height
    const width = props.width ?? naturalWidth
    const height = props.height ?? naturalHeight
    if (!width || !height) return

    maskNaturalWidth.value ||= naturalWidth
    maskNaturalHeight.value ||= naturalHeight

    const imageData = readMaskImage(maskImage, width, height)
    currentMaskImageData = imageData
    if (!props.classes && !props.colorMap) {
      autoClasses.value = createAutoClasses(imageData)
    }

    paintFillCanvas(fill, imageData)
    paintCachedEdgeCanvas()

    emit('rendered', { width, height })
  } catch (error) {
    currentMaskImageData = undefined
    clearCanvas(fill)
    clearCanvas(edge)
    lastError.value = { source: 'mask', error }
    emit('error', lastError.value)
  } finally {
    if (token === renderToken) {
      loading.value = false
    }
  }
}

const readMaskImage = (image: HTMLImageElement, width: number, height: number): ImageData => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas 2D context is not available.')
  }

  canvas.width = width
  canvas.height = height
  context.imageSmoothingEnabled = false
  context.drawImage(image, 0, 0, width, height)

  return context.getImageData(0, 0, width, height)
}

const paintFillCanvas = (canvas: HTMLCanvasElement, imageData: ImageData) => {
  const output = new ImageData(imageData.width, imageData.height)
  const source = imageData.data
  const data = output.data

  for (let i = 0; i < source.length; i += 4) {
    applyColorMap(data, i, source[i], resolvedColorMap.value)
  }

  drawImageData(canvas, output)
  canvas.style.opacity = String(resolvedOpacity.value)
}

const paintEdgeCanvas = (canvas: HTMLCanvasElement, sourceImageData: ImageData) => {
  const imageData = new ImageData(sourceImageData.width, sourceImageData.height)
  const data = imageData.data
  const edgeWidth = resolvedEdgeWidth.value
  const edgeRadius = edgeWidth / 2
  const maxSquaredDistance = edgeRadius * edgeRadius
  const edgeDistanceMap = createEdgeDistanceMap(sourceImageData, resolvedEdgeThreshold.value)

  for (let i = 0; i < edgeDistanceMap.squaredDistances.length; i += 1) {
    if (edgeDistanceMap.squaredDistances[i] <= maxSquaredDistance) {
      applyColorMap(data, i * 4, edgeDistanceMap.grayValues[i], resolvedColorMap.value)
    }
  }

  drawImageData(canvas, imageData)
}

const paintCachedEdgeCanvas = () => {
  const edge = edgeCanvas.value
  if (!edge) return

  if (!resolvedShowEdge.value || !currentMaskImageData) {
    clearCanvas(edge)
    return
  }

  paintEdgeCanvas(edge, currentMaskImageData)
}

const applyColorMap = (
  data: Uint8ClampedArray,
  pixelIndex: number,
  grayValue: number,
  colorMap: Uint8Array | Uint8ClampedArray | number[]
) => {
  const colorIndex = grayValue * 4
  data[pixelIndex] = colorMap[colorIndex] ?? 0
  data[pixelIndex + 1] = colorMap[colorIndex + 1] ?? 0
  data[pixelIndex + 2] = colorMap[colorIndex + 2] ?? 0
  data[pixelIndex + 3] = colorMap[colorIndex + 3] ?? 0
}

const drawImageData = (canvas: HTMLCanvasElement, imageData: ImageData) => {
  canvas.width = imageData.width
  canvas.height = imageData.height
  canvas.style.width = `${imageData.width}px`
  canvas.style.height = `${imageData.height}px`
  canvas.getContext('2d')?.putImageData(imageData, 0, 0)
}

const clearCanvas = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d')
  context?.clearRect(0, 0, canvas.width, canvas.height)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

watch(
  [
    resolvedSrc,
    renderWidth,
    renderHeight,
    () => props.classes,
    () => props.colorMap,
    () => props.crossOrigin
  ],
  () => {
    void nextTick(render)
  },
  { immediate: true }
)

watch(resolvedOpacity, (opacity) => {
  if (fillCanvas.value) {
    fillCanvas.value.style.opacity = String(opacity)
  }
})

watch(resolvedShowEdge, () => {
  paintCachedEdgeCanvas()
})

watch([resolvedEdgeThreshold, resolvedEdgeWidth], () => {
  if (resolvedShowEdge.value) {
    paintCachedEdgeCanvas()
  }
})

onMounted(() => {
  void render()
})
</script>

<style>
.vsm-root {
  position: relative;
  display: inline-block;
  overflow: hidden;
  line-height: 0;
}

.vsm-base {
  display: block;
}

.vsm-canvas {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
}

.vsm-state {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 12px;
  background: rgb(255 255 255 / 72%);
  color: #334155;
  font-size: 14px;
  line-height: 1.4;
  text-align: center;
}

.vsm-state--error {
  color: #b42318;
}

.vsm-legend {
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: grid;
  gap: 4px;
  max-width: calc(100% - 16px);
  padding: 6px 8px;
  background: rgb(248 250 252 / 56%);
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  border: 1px solid rgb(255 255 255 / 34%);
  box-shadow: 0 10px 24px rgb(15 23 42 / 12%);
  color: #1f2937;
  font-size: 12px;
  line-height: 1.2;
}

.vsm-legend__item {
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr);
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.vsm-legend__swatch {
  width: 12px;
  height: 12px;
  border: 1px solid rgb(0 0 0 / 18%);
}

.vsm-legend__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
