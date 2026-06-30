# 示例

## 基础用法

```vue
<SegmentationMask
  src="/images/mask.png"
/>
```

只传 `src` 时，组件会读取掩膜并渲染彩色 mask 图层。

## 叠加底图

```vue
<SegmentationMask
  base-src="/images/base.png"
  src="/images/mask.png"
/>
```

传入 `base-src` 后，组件会把 mask 图层叠加到底图上。

## 指定掩膜尺寸

```vue
<SegmentationMask
  base-src="/images/base.png"
  src="/images/mask.png"
  :width="360"
  :height="360"
/>
```

`width` 和 `height` 表示掩膜渲染尺寸，底图会按掩膜尺寸对齐显示。

## 自动类别

```vue
<SegmentationMask
  src="/images/mask.png"
/>
```

适合应用无法提前知道类别值的场景。组件会扫描掩膜中的灰度值，并自动生成类别颜色。

## 自定义类别

```vue
<script setup lang="ts">
const classes = [
  { value: 0, color: 'transparent', label: '背景' },
  { value: 1, color: 'rgba(255, 77, 79, 0.72)', label: '目标' }
]
</script>

<template>
  <SegmentationMask
    base-src="/images/base.png"
    src="/images/mask.png"
    :classes="classes"
  />
</template>
```

## 透明度滑块

```vue
<script setup lang="ts">
import { ref } from 'vue'

const opacity = ref(0.55)
</script>

<template>
  <input v-model.number="opacity" type="range" min="0" max="1" step="0.05" />

  <SegmentationMask
    base-src="/images/base.png"
    src="/images/mask.png"
    :opacity="opacity"
  />
</template>
```

## 边缘开关和宽度

```vue
<script setup lang="ts">
import { ref } from 'vue'

const showEdge = ref(false)
const edgeWidth = ref(3)
</script>

<template>
  <label>
    <input v-model="showEdge" type="checkbox" />
    显示边缘
  </label>

  <input v-model.number="edgeWidth" type="range" min="1" max="10" step="1" />

  <SegmentationMask
    base-src="/images/base.png"
    src="/images/mask.png"
    :edge="{ visible: showEdge, threshold: 0.5, width: edgeWidth }"
  />
</template>
```

## 自定义加载和错误状态

```vue
<SegmentationMask
  base-src="/images/base.png"
  src="/images/mask.png"
>
  <template #loading>
    正在渲染掩膜...
  </template>

  <template #error="{ source }">
    {{ source }} 图片加载失败
  </template>
</SegmentationMask>
```

## 自定义图例

```vue
<SegmentationMask
  base-src="/images/base.png"
  src="/images/mask.png"
  legend
>
  <template #legend="{ items }">
    <div class="legend">
      <div v-for="item in items" :key="item.value" class="legend-item">
        <span :style="{ backgroundColor: item.color }"></span>
        {{ item.label }}: {{ item.value }}
      </div>
    </div>
  </template>
</SegmentationMask>
```
