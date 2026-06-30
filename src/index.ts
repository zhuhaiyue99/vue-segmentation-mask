import type { App } from 'vue'
import SegmentationMask from './components/SegmentationMask.vue'

export { SegmentationMask }
export * from './types'

export default {
  install(app: App) {
    app.component('SegmentationMask', SegmentationMask)
  }
}
