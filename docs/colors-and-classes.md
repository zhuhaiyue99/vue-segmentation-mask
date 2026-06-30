# 颜色与类别

## 自动类别

如果没有传 `classes` 和 `colorMap`，组件会扫描 `src` 并自动生成类别。

```vue
<SegmentationMask
  base-src="/images/base.png"
  src="/images/mask.png"
  legend
/>
```

自动规则：

| 掩膜像素值 | 默认行为 |
| --- | --- |
| `0` | 透明背景 |
| 非 `0` | 从内置调色板分配颜色 |

自动类别适合快速预览和数据检查。

## 自定义 classes

正式业务界面建议显式传入 `classes`，这样不同数据集中的颜色和标签能保持稳定。

```ts
const classes = [
  { value: 0, color: 'transparent', label: '背景' },
  { value: 1, color: '#ff4d4fb8', label: '建筑物' },
  { value: 2, color: 'rgba(22, 119, 255, 0.72)', label: '水体' },
  { value: 3, color: [82, 196, 26, 184], label: '植被' }
]
```

## MaskClass

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
```

## value

`value` 是从掩膜图片中读取到的灰度值，必须是 `0` 到 `255` 的整数。

```ts
{ value: 1, color: '#ff4d4f', label: '目标' }
```

这表示红色通道值为 `1` 的像素会使用这个颜色。

## color

支持的颜色格式：

```ts
{ value: 1, color: 'transparent' }
{ value: 1, color: '#ff4d4f' }
{ value: 1, color: '#ff4d4fb8' }
{ value: 1, color: 'rgba(255, 77, 79, 0.72)' }
{ value: 1, color: [255, 77, 79] }
{ value: 1, color: [255, 77, 79, 184] }
```

类别自身的透明度建议写进颜色里：

```ts
{ value: 1, color: 'rgba(255, 77, 79, 0.72)' }
```

组件整体覆盖层透明度由 `opacity` 控制。

## 高级 colorMap

`colorMap` 是底层 RGBA 查找表，长度通常是 `256 * 4`。

```ts
const colorMap = new Uint8Array(256 * 4)
```

每个类别值占 4 个位置：

```text
colorMap[value * 4 + 0] = R
colorMap[value * 4 + 1] = G
colorMap[value * 4 + 2] = B
colorMap[value * 4 + 3] = A
```

颜色来源优先级：

```text
colorMap > classes > 自动 classes
```
