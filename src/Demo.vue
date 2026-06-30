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
          legend
        >
          <template #loading> Rendering {{ item.name }}... </template>
          <template #error="{ source }">
            Failed to load {{ source }} image.
          </template>
        </SegmentationMask>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { SegmentationMask } from "./index";

const opacity = ref(0.55);
const showEdge = ref(true);
const edgeWidth = ref(3);

const eighteenClassMask = createDemoMaskDataUrl(18, 512, 512);

const cases = [
  {
    name: "18 Auto Classes",
    size: "auto palette",
    baseSrc: undefined,
    src: eighteenClassMask,
  },
];

function createDemoMaskDataUrl(
  classCount: number,
  width: number,
  height: number,
): string {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) return "";

  canvas.width = width;
  canvas.height = height;
  context.imageSmoothingEnabled = false;

  const imageData = context.createImageData(width, height);
  const data = imageData.data;
  const columns = 6;
  const rows = Math.ceil(classCount / columns);
  const cellWidth = width / columns;
  const cellHeight = height / rows;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const classValue = Math.min(
        classCount - 1,
        Math.min(rows - 1, Math.floor(y / cellHeight)) * columns +
          Math.min(columns - 1, Math.floor(x / cellWidth)),
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
  justify-content: space-between;
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
}
</style>
