# 接口参考

## 引入

```ts
import { SegmentationMask } from 'vue-segmentation-mask'
import 'vue-segmentation-mask/style.css'
```

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | `''` | 灰度分割掩膜 URL。 |
| `baseSrc` | `string` | `''` | 可选底图 URL。不传时只渲染掩膜。 |
| `classes` | `MaskClass[]` | 自动生成 | 类别到颜色的映射。 |
| `colorMap` | `Uint8Array \| Uint8ClampedArray \| number[]` | 根据 `classes` 生成 | 高级 RGBA 色表，优先级高于 `classes`。 |
| `width` | `number` | 掩膜自然宽度 | 掩膜渲染宽度，单位像素。传入 `baseSrc` 时，底图会按该宽度对齐。 |
| `height` | `number` | 掩膜自然高度 | 掩膜渲染高度，单位像素。传入 `baseSrc` 时，底图会按该高度对齐。 |
| `opacity` | `number` | `1` | 掩膜填充层整体透明度，范围 `0` 到 `1`。 |
| `edge` | `boolean \| EdgeOptions` | `false` | 边缘渲染开关或配置。 |
| `legend` | `boolean` | `false` | 是否显示内置图例。 |
| `crossOrigin` | `'' \| 'anonymous' \| 'use-credentials'` | `'anonymous'` | 加载掩膜图片时的 CORS 模式。 |
| `alt` | `string` | `'Segmentation image'` | 底图 alt 文本。 |
| `fit` | CSS `object-fit` | `'fill'` | 底图 object-fit 模式。 |

## 类型

```ts
type MaskColor =
  | string
  | [number, number, number]
  | [number, number, number, number]

interface MaskClass {
  value: number
  color: MaskColor
  label?: string
}

interface EdgeOptions {
  visible?: boolean
  threshold?: number
  width?: number
}
```

## EdgeOptions

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `visible` | `false` | 是否渲染边缘。 |
| `threshold` | `0.5` | 相邻像素灰度差达到该值时，认为是类别边界。 |
| `width` | `1` | 边缘宽度，单位是像素。组件使用欧氏距离场让边缘围绕边界均匀扩张。 |

当 `visible` 为 `false` 时，修改 `width` 或 `threshold` 不会重新加载掩膜，也不会重绘填充层；重新显示边缘时会使用最新配置计算边缘层。

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `rendered` | `{ width: number; height: number }` | 掩膜渲染完成后触发。 |
| `error` | `{ source: 'base' \| 'mask'; error: unknown }` | 图片加载失败或 Canvas 读取失败时触发。 |

## Slots

| Slot | 参数 | 说明 |
| --- | --- | --- |
| `loading` | 无 | 掩膜加载和渲染期间显示。 |
| `error` | `{ source, error }` | 渲染失败时显示。 |
| `legend` | `{ items }` | 自定义图例。 |

## CSS 类名

| 类名 | 说明 |
| --- | --- |
| `.vsm-root` | 根元素。 |
| `.vsm-base` | 底图 img 元素。 |
| `.vsm-canvas` | fill 和 edge Canvas 图层。 |
| `.vsm-state` | loading/error 状态层。 |
| `.vsm-legend` | 内置图例容器。 |
