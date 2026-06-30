# vue-segmentation-mask

Vue 3 语义分割掩膜可视化组件。用 Canvas 将掩膜着色后叠加到底图上。

## 链接

- [在线文档](https://zhuhaiyue99.github.io/vue-segmentation-mask/)
- [在线 Demo](https://zhuhaiyue99.github.io/vue-segmentation-mask/demo/index.html)

## 使用背景

它适合在 Vue 应用中预览语义分割标签、模型预测结果、标注结果、遥感切片、点云截图以及其他掩膜数据。

`vue-segmentation-mask` 的核心输入是 `src`，它表示灰度掩膜图片 URL。`baseSrc` 是可选的：需要和原图对照时传入 `baseSrc`，组件会把掩膜叠加到底图上；只需要批量渲染 mask、做列表预览、QA 检查或结果审核时，可以只传 `src`。

## 安装

```bash
npm install vue-segmentation-mask
```

## 基础用法

```vue
<template>
  <SegmentationMask src="/images/tile-mask.png" />
</template>

<script setup lang="ts">
import { SegmentationMask } from 'vue-segmentation-mask'
import 'vue-segmentation-mask/style.css'
</script>
```

如果没有传 `classes` 或 `colorMap`，组件会扫描 `src` 并自动生成类别颜色。像素值 `0` 会被当作透明背景。

## 叠加底图

```vue
<SegmentationMask
  base-src="/images/tile.png"
  src="/images/tile-mask.png"
  :opacity="0.55"
/>
```

`base-src` 只负责添加背景图。不传 `base-src` 时，组件仍然会正常渲染掩膜。

## 稳定类别颜色

正式业务界面里建议传入 `classes`，这样不同图片之间的类别颜色和标签名称可以保持稳定。

```vue
<template>
  <SegmentationMask
    src="/images/tile-mask.png"
    :classes="classes"
    :width="512"
    :height="512"
  />
</template>

<script setup lang="ts">
import { SegmentationMask } from 'vue-segmentation-mask'
import 'vue-segmentation-mask/style.css'

const classes = [
  { value: 0, color: 'transparent', label: '背景' },
  { value: 1, color: '#ff4d4fb3', label: '建筑' },
  { value: 2, color: 'rgba(22, 119, 255, 0.7)', label: '水体' },
  { value: 3, color: [82, 196, 26, 180], label: '植被' }
]
</script>
```

`color` 支持 CSS 颜色、8 位 hex、`rgba(...)`、`[r, g, b]` 或 `[r, g, b, a]`。类别颜色里的 alpha 可以控制单个类别透明度，`opacity` 则控制整个填充图层的透明度。

## 边缘渲染

边缘默认关闭。需要显示边缘时，显式传入 `edge`：

```vue
<SegmentationMask
  src="/images/tile-mask.png"
  :edge="{ visible: true, threshold: 0.5, width: 3 }"
/>
```

如果只需要简单开启：

```vue
<SegmentationMask src="/images/tile-mask.png" edge />
```

边缘会从 mask 类别边界中生成，并使用欧氏距离场渲染，所以 `width` 会围绕检测到的边界均匀扩张。组件读取 mask 时会使用最近邻采样，避免缩放时把类别值插值成中间灰度。

当 `edge.visible` 为 `false` 时，修改 `edge.width` 或 `edge.threshold` 不会重新加载 mask，也不会重绘填充层。重新显示边缘时，组件会用最新配置重新计算边缘图层。

## 图例

内置图例是可选能力。它适合小型预览，但批量列表、审核页面和业务系统通常更适合在组件外统一管理图例。

```vue
<SegmentationMask
  src="/images/tile-mask.png"
  :classes="classes"
  legend
/>
```

也可以自定义图例插槽：

```vue
<SegmentationMask src="/images/tile-mask.png" :classes="classes" legend>
  <template #legend="{ items }">
    <div v-for="item in items" :key="item.value">
      {{ item.label }}
    </div>
  </template>
</SegmentationMask>
```

## 高级色表

如果你已经有自己的渲染管线，或者需要更高吞吐的像素级映射，可以直接传入 RGBA 色表。

```vue
<SegmentationMask
  src="/images/tile-mask.png"
  :color-map="colorMap"
/>
```

```ts
const colorMap = new Uint8Array(256 * 4)

setColor(0, 0, 0, 0, 0)
setColor(1, 255, 0, 0, 180)
setColor(2, 0, 128, 255, 180)

function setColor(index: number, r: number, g: number, b: number, a: number) {
  colorMap[index * 4] = r
  colorMap[index * 4 + 1] = g
  colorMap[index * 4 + 2] = b
  colorMap[index * 4 + 3] = a
}
```

如果同时传入 `colorMap` 和 `classes`，`colorMap` 优先。

## 插槽

```vue
<SegmentationMask src="/images/tile-mask.png">
  <template #loading>
    正在渲染...
  </template>

  <template #error="{ source }">
    {{ source }} 图片加载失败
  </template>
</SegmentationMask>
```

## 全局注册

```ts
import { createApp } from 'vue'
import VueSegmentationMask from 'vue-segmentation-mask'
import 'vue-segmentation-mask/style.css'

createApp(App).use(VueSegmentationMask).mount('#app')
```

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | `''` | 灰度分割掩膜 URL。 |
| `baseSrc` | `string` | `''` | 可选底图 URL。不传时只渲染 mask。 |
| `classes` | `MaskClass[]` | 自动生成 | 类别到颜色的映射。 |
| `colorMap` | `Uint8Array \| Uint8ClampedArray \| number[]` | 根据 `classes` 生成 | 高级 RGBA 色表。 |
| `width` | `number` | 掩膜自然宽度 | 掩膜渲染宽度，单位像素。传入 `baseSrc` 时，底图会按该宽度对齐。 |
| `height` | `number` | 掩膜自然高度 | 掩膜渲染高度，单位像素。传入 `baseSrc` 时，底图会按该高度对齐。 |
| `opacity` | `number` | `1` | 填充掩膜层透明度，范围 `0` 到 `1`。 |
| `edge` | `boolean \| EdgeOptions` | `false` | 是否渲染边缘，以及边缘配置。 |
| `legend` | `boolean` | `false` | 是否渲染内置图例。 |
| `crossOrigin` | `'' \| 'anonymous' \| 'use-credentials'` | `'anonymous'` | 加载图片时的 CORS 模式。 |
| `alt` | `string` | `'Segmentation image'` | 底图 alt 文本。 |
| `fit` | CSS `object-fit` | `'fill'` | 底图 object-fit 模式。 |

## 类型

```ts
type MaskColor = string | [number, number, number] | [number, number, number, number]

interface MaskClass {
  value: number
  color: MaskColor
  label?: string
}

interface EdgeOptions {
  visible?: boolean // 默认 false
  threshold?: number // 默认 0.5
  width?: number // 默认 1，单位像素
}
```

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `rendered` | `{ width: number; height: number }` | 掩膜渲染完成后触发。 |
| `error` | `{ source: 'base' \| 'mask'; error: unknown }` | 图片加载失败或 Canvas 渲染失败时触发。 |

## 开发

```bash
npm install
npm run dev
npm run build
```
