# 概览

`vue-segmentation-mask` 是一个 Vue 3 组件，用于把灰度语义分割掩膜渲染成彩色 Canvas 图层。

它适合在 Vue 应用中预览语义分割标签、模型预测结果、标注结果、遥感切片、点云截图以及其他掩膜数据。

## 它做什么

组件的核心输入是掩膜图，底图是可选的辅助显示：

- `src`：灰度掩膜，像素值代表类别。
- `baseSrc`：可选原始图像，提供后会作为掩膜下方的底图。

例如：

| 像素值 | 含义 |
| --- | --- |
| `0` | 背景 |
| `1` | 类别 1 |
| `2` | 类别 2 |

组件会读取掩膜像素，将灰度值映射成颜色，然后渲染彩色 Canvas 掩膜层。

## 主要能力

| 能力 | 说明 |
| --- | --- |
| 自动类别 | 不传 `classes` 或 `colorMap` 时，自动扫描 `src` 并分配颜色。 |
| 自定义类别 | 使用 `classes` 定义类别值、颜色和图例名称。 |
| 原始色表 | 使用 `colorMap` 进行高级像素级颜色映射。 |
| 边缘渲染 | 从掩膜中检测并绘制类别边界。 |
| 透明度控制 | 使用 `opacity` 控制覆盖层透明度。 |
| 图例 | 需要时可以使用 `legend` 显示内置图例，也可以通过插槽自定义。 |
| 状态插槽 | 支持自定义加载、错误和图例内容。 |

## 基础示例

快速预览时，可以只传掩膜，让组件自动生成颜色：

```vue
<SegmentationMask
  src="/images/mask.png"
/>
```

需要和原图对照时，再传入可选底图：

```vue
<SegmentationMask
  base-src="/images/base.png"
  src="/images/mask.png"
/>
```

正式业务界面中，建议显式传入 `classes`，保证颜色稳定；图例可以在列表外统一管理。

```vue
<SegmentationMask
  base-src="/images/base.png"
  src="/images/mask.png"
  :classes="[
    { value: 0, color: 'transparent', label: '背景' },
    { value: 1, color: 'rgba(255, 77, 79, 0.72)', label: '目标' }
  ]"
/>
```
