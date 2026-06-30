# 常见问题

## 页面上看不到掩膜

请检查：

1. `src` 是否可以访问。
2. 掩膜图片是否允许被 Canvas 读取，跨域图片需要 CORS。
3. 掩膜像素值是否有对应颜色。
4. `opacity` 是否为 `0`。
5. 类别颜色中的 alpha 是否为 `0`。

快速检查：

```vue
<SegmentationMask
  src="/images/mask.png"
  legend
/>
```

## 自动类别生成了太多 Class

通常是掩膜中存在压缩噪声或抗锯齿像素。

建议：

- 使用 PNG 或其他无损格式保存掩膜。
- 生成掩膜时关闭抗锯齿。
- 缩放掩膜时使用最近邻插值。
- 如果无法改变源数据，显式传入 `classes`。

## 边缘不可见

请检查：

1. `edge` 是否为 `false`。
2. `threshold` 是否过大。
3. 掩膜中是否真的存在类别边界。
4. 类别颜色是否透明。

标准 `0/1` 掩膜可以使用：

```vue
<SegmentationMask :edge="{ visible: true, threshold: 0.5 }" />
```

## 可以单独配置边缘颜色吗？

不可以。边缘颜色跟随类别颜色。

这样可以保持边缘和类别语义一致。

## Canvas 报安全错误

通常是图片跨域，且服务器没有允许 Canvas 读取像素。

```vue
<SegmentationMask
  base-src="https://cdn.example.com/base.png"
  src="https://cdn.example.com/mask.png"
  cross-origin="anonymous"
/>
```

图片服务器需要返回有效的 CORS 响应头，例如：

```http
Access-Control-Allow-Origin: *
```

## 底图和掩膜对不齐

请检查：

1. 底图和掩膜是否表示同一个坐标空间。
2. 是否使用了相同的 `width` 和 `height`。
3. `fit` 是否符合预期。

## 样式没有生效

请在应用中引入样式：

```ts
import 'vue-segmentation-mask/style.css'
```
