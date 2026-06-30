# 安装

## 环境要求

| 依赖 | 版本 |
| --- | --- |
| Vue | `^3.3.0` |
| 浏览器 | 支持 Canvas 2D 的现代浏览器 |

## 安装包

```bash
npm install vue-segmentation-mask
```

使用 pnpm：

```bash
pnpm add vue-segmentation-mask
```

使用 yarn：

```bash
yarn add vue-segmentation-mask
```

## 在组件中引入

```vue
<template>
  <SegmentationMask
    base-src="/images/base.png"
    src="/images/mask.png"
  />
</template>

<script setup lang="ts">
import { SegmentationMask } from 'vue-segmentation-mask'
import 'vue-segmentation-mask/style.css'
</script>
```

## 全局注册

```ts
import { createApp } from 'vue'
import VueSegmentationMask from 'vue-segmentation-mask'
import 'vue-segmentation-mask/style.css'
import App from './App.vue'

createApp(App).use(VueSegmentationMask).mount('#app')
```

全局注册后，可以直接在模板中使用：

```vue
<SegmentationMask
  base-src="/images/base.png"
  src="/images/mask.png"
/>
```

## 样式

组件自带少量样式，用于 Canvas 图层定位、加载状态、错误状态和内置图例。

请在应用中引入一次：

```ts
import 'vue-segmentation-mask/style.css'
```
