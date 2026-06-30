# 快速上手

## 最小用法

只传 `src` 就可以渲染掩膜。

```vue
<template>
  <SegmentationMask src="/images/mask.png" />
</template>

<script setup lang="ts">
import { SegmentationMask } from 'vue-segmentation-mask'
import 'vue-segmentation-mask/style.css'
</script>
```

组件会加载掩膜图，读取灰度类别值，然后渲染彩色 Canvas 掩膜层。如果没有传 `classes` 或 `colorMap`，组件会自动生成类别颜色。

## 叠加底图

`base-src` 是可选底图。传入后，掩膜会叠加到底图上。

```vue
<SegmentationMask
  base-src="/images/base.png"
  src="/images/mask.png"
/>
```

## 掩膜尺寸

`width` 和 `height` 是掩膜渲染尺寸，单位是像素。

```vue
<SegmentationMask
  src="/images/mask.png"
  :width="360"
  :height="360"
/>
```

如果不传，组件会使用掩膜图片的自然尺寸。传入 `base-src` 时，底图会按掩膜尺寸对齐显示。

## 类别颜色

正式业务界面建议传入 `classes`，保证不同图片之间的颜色稳定。

```vue
<SegmentationMask
  src="/images/mask.png"
  :classes="classes"
/>
```

```ts
const classes = [
  { value: 0, color: 'transparent', label: '背景' },
  { value: 1, color: 'rgba(255, 77, 79, 0.72)', label: '目标' }
]
```

## 下一步

- 查看 [示例](examples.md) 了解透明度、边缘、插槽和图例等常见用法。
- 查看 [接口参考](api.md) 了解完整 Props、事件和插槽。
- 查看 [掩膜数据格式](mask-format.md) 了解 mask 图片的像素值约定。
