import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'

  return {
    plugins: [vue()],
    base: isLib ? undefined : './',
    publicDir: isLib ? false : 'public',
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    build: isLib
      ? {
          outDir: 'dist',
          emptyOutDir: true,
          lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'VueSegmentationMask',
            fileName: 'vue-segmentation-mask',
            cssFileName: 'style'
          },
          rollupOptions: {
            external: ['vue'],
            output: {
              exports: 'named',
              globals: {
                vue: 'Vue'
              }
            }
          }
        }
      : {
          outDir: 'docs/demo',
          emptyOutDir: true
        }
  }
})
