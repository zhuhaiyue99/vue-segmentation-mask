# 掩膜数据格式

`src` 应该指向一张灰度类别图。

组件会读取每个像素的红色通道作为类别值：

```ts
const classValue = imageData.data[pixelIndex]
```

为了获得最稳定的结果，建议导出 RGB 三个通道相同的掩膜，例如 `rgb(1, 1, 1)`。

## 类别值

每个灰度值代表一个类别。

| 像素值 | 示例含义 |
| --- | --- |
| `0` | 背景 |
| `1` | 建筑物 |
| `2` | 道路 |
| `3` | 水体 |

支持的取值范围是 `0` 到 `255`。

## 背景

自动生成类别时，像素值 `0` 会被视为透明背景：

```ts
{ value: 0, color: 'transparent', label: 'Background' }
```

如果数据中 `0` 是真实类别，请显式传入 `classes`：

```ts
const classes = [
  { value: 0, color: 'rgba(22, 119, 255, 0.5)', label: '类别 0' }
]
```

## 二值掩膜

对于 `0/1` 掩膜：

| 像素值 | 渲染效果 |
| --- | --- |
| `0` | 透明背景 |
| `1` | 自动分配第一个类别颜色 |

对于 `0/255` 掩膜：

| 像素值 | 渲染效果 |
| --- | --- |
| `0` | 透明背景 |
| `255` | 自动生成 `Class 255` 的类别颜色 |

如果需要改名称或颜色：

```ts
const classes = [
  { value: 0, color: 'transparent', label: '背景' },
  { value: 255, color: 'rgba(255, 77, 79, 0.72)', label: '前景' }
]
```

## 使用无损掩膜

建议使用 PNG 或其他无损格式保存掩膜，不建议使用 JPEG。

JPEG 压缩和抗锯齿可能引入很多不需要的中间值：

```text
0, 1, 2, 3, 4, 5, 250, 251, 252...
```

这些值可能会被识别成独立类别。

建议：

- 使用 PNG 保存掩膜。
- 生成掩膜时关闭抗锯齿。
- 缩放掩膜时使用最近邻插值。
- 如果无法调整数据源，显式传入 `classes`。

## 跨域图片

组件会将掩膜绘制到 Canvas，并通过 `getImageData` 读取像素。

如果图片跨域，服务器必须允许 Canvas 读取。示例：

```vue
<SegmentationMask
  base-src="https://cdn.example.com/base.png"
  src="https://cdn.example.com/mask.png"
  cross-origin="anonymous"
/>
```

图片服务器需要返回合适的 CORS 响应头，例如：

```http
Access-Control-Allow-Origin: *
```
