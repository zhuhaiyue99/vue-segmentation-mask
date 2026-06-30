# 边缘渲染

## 开启边缘

边缘默认关闭。需要显示边缘时，显式传入 `edge` 配置。

```vue
<SegmentationMask
  base-src="/images/base.png"
  src="/images/mask.png"
  edge
/>
```

显式配置：

```vue
<SegmentationMask
  base-src="/images/base.png"
  src="/images/mask.png"
  :edge="{ visible: true, threshold: 0.5, width: 3 }"
/>
```

## EdgeOptions

```ts
interface EdgeOptions {
  visible?: boolean
  threshold?: number
  width?: number
}
```

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `visible` | `false` | 是否渲染边缘。 |
| `threshold` | `0.5` | 相邻像素灰度差达到该值时，认为是边缘。 |
| `width` | `1` | 边缘宽度，单位是像素。 |

## 渲染算法

组件先根据掩膜灰度值生成 1 像素类别边界，再计算每个像素到最近边界的欧氏距离。距离小于等于 `width / 2` 的像素会被渲染为边缘。

这个方式可以让横线、竖线、斜线和拐角处的边缘宽度更均匀，不会像方块膨胀那样在不同方向上出现明显粗细差异。

读取掩膜时会关闭 Canvas 平滑缩放，避免分割类别值在缩放时被插值成中间灰度。

## threshold

组件会比较当前像素和上下左右相邻像素的灰度值。

```ts
Math.abs(currentGray - neighborGray) >= threshold
```

对于 `0/1` 掩膜，默认的 `0.5` 可以检测到边界；对于 `0/255` 掩膜也同样适用。

## 动态调整

`visible`、`threshold` 和 `width` 都可以响应式调整。

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

当 `visible` 为 `false` 时，修改 `width` 或 `threshold` 不会重新加载掩膜，也不会重绘填充层。重新显示边缘时，组件会使用最新的配置重新计算边缘层。

## 边缘颜色

边缘颜色不能单独配置，它会跟随类别颜色。

- 类别 `1` 的边缘使用类别 `1` 的颜色。
- 类别 `2` 的边缘使用类别 `2` 的颜色。

这样可以保证边缘渲染和类别语义一致。
