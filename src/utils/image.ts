import type { ImageCrossOrigin } from '../types'

export function loadImage(src: string, crossOrigin: ImageCrossOrigin = 'anonymous'): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    if (crossOrigin !== undefined) {
      image.crossOrigin = crossOrigin
    }

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    image.src = src
  })
}
