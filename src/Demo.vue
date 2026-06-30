<template>
  <main class="demo">
    <section class="demo__header">
      <div>
        <h1>vue-segmentation-mask</h1>
        <p>Segmentation mask rendering demo</p>
      </div>
      <div class="demo__controls">
        <label>
          Opacity
          <input
            v-model.number="opacity"
            min="0"
            max="1"
            step="0.05"
            type="range"
          />
        </label>
        <label>
          Edge
          <input v-model="showEdge" type="checkbox" />
        </label>
        <label>
          Width
          <input
            v-model.number="edgeWidth"
            min="1"
            max="10"
            step="1"
            type="range"
          />
          <span>{{ edgeWidth }}</span>
        </label>
      </div>
    </section>

    <section class="demo__grid">
      <article v-for="item in cases" :key="item.name" class="demo__case">
        <header>
          <h2>{{ item.name }}</h2>
          <span>{{ item.size }}</span>
        </header>
        <SegmentationMask
          :base-src="item.baseSrc"
          :src="item.src"
          :opacity="opacity"
          :edge="{ visible: showEdge, threshold: 0.5, width: edgeWidth }"
        >
          <template #loading> Rendering {{ item.name }}... </template>
          <template #error="{ source }">
            Failed to load {{ source }} image.
          </template>
        </SegmentationMask>
      </article>
    </section>

    <section class="demo__manual">
      <header>
        <div>
          <h2>手动上传</h2>
          <p>可只选择掩膜图片，底图可选，点击按钮渲染掩膜。</p>
        </div>
        <button type="button" :disabled="!canRenderUpload" @click="renderUpload">
          渲染掩膜
        </button>
      </header>

      <div class="demo__upload-controls">
        <label class="demo__upload-field">
          <span>底图图片</span>
          <input accept="image/*" type="file" @change="onBaseFileChange" />
        </label>

        <label class="demo__upload-field">
          <span>掩膜图片</span>
          <input accept="image/*" type="file" @change="onMaskFileChange" />
        </label>
      </div>

      <article v-if="renderedMaskSrc" class="demo__case demo__manual-preview">
        <header>
          <h2>上传预览</h2>
          <span>{{ renderedBaseSrc ? "base + mask" : "mask only" }}</span>
        </header>
        <SegmentationMask
          :base-src="renderedBaseSrc"
          :src="renderedMaskSrc"
          :opacity="opacity"
          :edge="{ visible: showEdge, threshold: 0.5, width: edgeWidth }"
          legend
          cross-origin=""
        >
          <template #loading> 正在渲染上传的掩膜... </template>
          <template #error="{ source }">
            上传的 {{ source }} 图片渲染失败。
          </template>
        </SegmentationMask>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { SegmentationMask } from "./index";

const opacity = ref(0.55);
const showEdge = ref(true);
const edgeWidth = ref(10);
const baseUploadSrc = ref("");
const maskUploadSrc = ref("");
const renderedBaseSrc = ref("");
const renderedMaskSrc = ref("");
const baseFileName = ref("");
const maskFileName = ref("");
const canRenderUpload = ref(false);

const eighteenClassMask = createDemoMaskDataUrl(18, 6, 56);

const cases = [
  {
    name: "18 Auto Classes",
    size: "18 square tiles",
    baseSrc: undefined,
    src: eighteenClassMask,
  },
];

function onBaseFileChange(event: Event): void {
  const file = getSelectedImageFile(event);
  updateUploadSrc(baseUploadSrc, file);
  baseFileName.value = file?.name ?? "";
  updateCanRenderUpload();
}

function onMaskFileChange(event: Event): void {
  const file = getSelectedImageFile(event);
  updateUploadSrc(maskUploadSrc, file);
  maskFileName.value = file?.name ?? "";
  updateCanRenderUpload();
}

function renderUpload(): void {
  if (!canRenderUpload.value) return;

  renderedBaseSrc.value = baseUploadSrc.value;
  renderedMaskSrc.value = maskUploadSrc.value;
}

function getSelectedImageFile(event: Event): File | undefined {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  return file?.type.startsWith("image/") ? file : undefined;
}

function updateUploadSrc(target: typeof baseUploadSrc, file?: File): void {
  revokeUnusedObjectUrl(target.value);
  target.value = file ? URL.createObjectURL(file) : "";
}

function revokeUnusedObjectUrl(url: string): void {
  if (!url || url === renderedBaseSrc.value || url === renderedMaskSrc.value) {
    return;
  }

  URL.revokeObjectURL(url);
}

function updateCanRenderUpload(): void {
  canRenderUpload.value = Boolean(maskUploadSrc.value);
}

function createDemoMaskDataUrl(
  classCount: number,
  columns: number,
  cellSize: number,
): string {
  const rows = Math.ceil(classCount / columns);
  const width = columns * cellSize;
  const height = rows * cellSize;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) return "";

  canvas.width = width;
  canvas.height = height;
  context.imageSmoothingEnabled = false;

  const imageData = context.createImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const classValue = Math.min(
        classCount - 1,
        Math.min(rows - 1, Math.floor(y / cellSize)) * columns +
          Math.min(columns - 1, Math.floor(x / cellSize)),
      );

      data[index] = classValue;
      data[index + 1] = classValue;
      data[index + 2] = classValue;
      data[index + 3] = 255;
    }
  }

  context.putImageData(imageData, 0, 0);

  return canvas.toDataURL("image/png");
}

onBeforeUnmount(() => {
  new Set([
    baseUploadSrc.value,
    maskUploadSrc.value,
    renderedBaseSrc.value,
    renderedMaskSrc.value,
  ]).forEach((url) => {
    if (url) URL.revokeObjectURL(url);
  });
});
</script>

<style>
body {
  margin: 0;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  background: #f5f7fb;
  color: #17202a;
}

.demo {
  width: min(100% - 48px, 1060px);
  margin: 0 auto;
  padding: 32px 0;
}

.demo__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.demo__header h1,
.demo__header p,
.demo__case h2 {
  margin: 0;
}

.demo__header h1 {
  font-size: 28px;
  line-height: 1.15;
}

.demo__header p {
  margin-top: 6px;
  color: #526170;
}

.demo__controls {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #344454;
  font-size: 14px;
}

.demo__controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.demo__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.demo__case {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.demo__case header {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.demo__case h2 {
  font-size: 18px;
  line-height: 1.2;
}

.demo__case span {
  color: #607080;
  font-size: 13px;
}

.demo__manual {
  display: grid;
  gap: 16px;
  margin-top: 28px;
  padding-top: 28px;
  border-top: 1px solid #dce3ea;
}

.demo__manual > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.demo__manual h2,
.demo__manual p {
  margin: 0;
}

.demo__manual h2 {
  font-size: 18px;
  line-height: 1.2;
}

.demo__manual p {
  margin-top: 6px;
  color: #607080;
  font-size: 14px;
}

.demo__manual button {
  border: 0;
  border-radius: 6px;
  background: #176d63;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  padding: 9px 16px;
  white-space: nowrap;
}

.demo__manual button:disabled {
  background: #aeb8c2;
  cursor: not-allowed;
}

.demo__upload-controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.demo__upload-field {
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 14px;
  border: 1px solid #dce3ea;
  border-radius: 8px;
  background: #fff;
}

.demo__upload-field span {
  color: #344454;
  font-size: 14px;
  font-weight: 600;
}

.demo__upload-field input {
  width: 100%;
}

.demo__upload-field small {
  overflow: hidden;
  color: #607080;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.demo__manual-preview {
  max-width: 512px;
}

@media (max-width: 820px) {
  .demo {
    width: min(100% - 28px, 420px);
    padding: 20px 0;
  }

  .demo__header {
    align-items: start;
    flex-direction: column;
  }

  .demo__grid {
    grid-template-columns: 1fr;
  }

  .demo__manual > header,
  .demo__upload-controls {
    grid-template-columns: 1fr;
  }

  .demo__manual > header {
    align-items: start;
    flex-direction: column;
  }
}
</style>
