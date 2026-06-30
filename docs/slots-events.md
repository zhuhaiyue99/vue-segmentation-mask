# 插槽与事件

## loading

`loading` 插槽会在掩膜图片加载和渲染期间显示。

```vue
<SegmentationMask base-src="/images/base.png" src="/images/mask.png">
  <template #loading>
    正在渲染...
  </template>
</SegmentationMask>
```

默认内容：

```text
Loading...
```

## error

`error` 插槽会在底图、掩膜或 Canvas 渲染失败时显示。

```vue
<SegmentationMask base-src="/images/base.png" src="/images/mask.png">
  <template #error="{ source, error }">
    {{ source }} 图片加载失败
  </template>
</SegmentationMask>
```

slot 参数：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `source` | `'base' \| 'mask'` | 错误来源。 |
| `error` | `unknown` | 原始错误对象。 |

## legend

开启 `legend` 后可以自定义图例：

```vue
<SegmentationMask base-src="/images/base.png" src="/images/mask.png" legend>
  <template #legend="{ items }">
    <ul>
      <li v-for="item in items" :key="item.value">
        <span :style="{ backgroundColor: item.color }"></span>
        {{ item.label }}
      </li>
    </ul>
  </template>
</SegmentationMask>
```

## rendered

掩膜渲染完成后触发。

```vue
<SegmentationMask
  base-src="/images/base.png"
  src="/images/mask.png"
  @rendered="handleRendered"
/>
```

## error event

图片加载失败或 Canvas 读取失败时触发。

```vue
<SegmentationMask
  base-src="/images/base.png"
  src="/images/mask.png"
  @error="handleError"
/>
```
