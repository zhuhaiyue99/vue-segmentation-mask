export interface EdgeDistanceMap {
  width: number
  height: number
  squaredDistances: Float64Array
  grayValues: Uint8ClampedArray
}

const INF = 1e20

export function createEdgeDistanceMap(imageData: ImageData, threshold = 0.5): EdgeDistanceMap {
  const { width, height, data } = imageData
  const pixelCount = width * height
  const boundaryMask = new Uint8Array(pixelCount)
  const boundaryGrayValues = new Uint8ClampedArray(pixelCount)
  const columnDistances = new Float64Array(pixelCount)
  const columnSeedY = new Int32Array(pixelCount)

  columnDistances.fill(INF)
  columnSeedY.fill(-1)

  const f = new Float64Array(Math.max(width, height))
  const distances = new Float64Array(Math.max(width, height))
  const indices = new Int32Array(Math.max(width, height))

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x
      if (isBoundaryPixel(data, width, height, x, y, threshold)) {
        boundaryMask[index] = 1
        boundaryGrayValues[index] = data[index * 4]
      }
    }
  }

  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      f[y] = boundaryMask[y * width + x] ? 0 : INF
    }

    distanceTransform1D(f, height, distances, indices)

    for (let y = 0; y < height; y += 1) {
      const index = y * width + x
      columnDistances[index] = distances[y]
      columnSeedY[index] = indices[y]
    }
  }

  const squaredDistances = new Float64Array(pixelCount)
  const grayValues = new Uint8ClampedArray(pixelCount)

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * width

    for (let x = 0; x < width; x += 1) {
      f[x] = columnDistances[rowOffset + x]
    }

    distanceTransform1D(f, width, distances, indices)

    for (let x = 0; x < width; x += 1) {
      const index = rowOffset + x
      const seedX = indices[x]
      squaredDistances[index] = distances[x]

      if (seedX >= 0) {
        const seedY = columnSeedY[rowOffset + seedX]
        grayValues[index] = boundaryGrayValues[seedY * width + seedX]
      }
    }
  }

  return {
    width,
    height,
    squaredDistances,
    grayValues
  }
}

const isBoundaryPixel = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  threshold: number
): boolean => {
  const index = (y * width + x) * 4
  const currentGray = data[index]

  if (x > 0 && Math.abs(currentGray - data[index - 4]) >= threshold) {
    return true
  }

  if (x < width - 1 && Math.abs(currentGray - data[index + 4]) >= threshold) {
    return true
  }

  if (y > 0 && Math.abs(currentGray - data[index - width * 4]) >= threshold) {
    return true
  }

  if (y < height - 1 && Math.abs(currentGray - data[index + width * 4]) >= threshold) {
    return true
  }

  return false
}

const distanceTransform1D = (
  source: Float64Array,
  length: number,
  distances: Float64Array,
  indices: Int32Array
) => {
  const locations = new Int32Array(length)
  const boundaries = new Float64Array(length + 1)
  let candidateCount = -1

  for (let q = 0; q < length; q += 1) {
    if (!Number.isFinite(source[q]) || source[q] >= INF) continue

    if (candidateCount < 0) {
      candidateCount = 0
      locations[0] = q
      boundaries[0] = -Infinity
      boundaries[1] = Infinity
      continue
    }

    let intersection = getIntersection(source, q, locations[candidateCount])

    while (candidateCount >= 0 && intersection <= boundaries[candidateCount]) {
      candidateCount -= 1
      intersection = candidateCount >= 0 ? getIntersection(source, q, locations[candidateCount]) : -Infinity
    }

    candidateCount += 1
    locations[candidateCount] = q
    boundaries[candidateCount] = intersection
    boundaries[candidateCount + 1] = Infinity
  }

  if (candidateCount < 0) {
    for (let q = 0; q < length; q += 1) {
      distances[q] = INF
      indices[q] = -1
    }
    return
  }

  let candidateIndex = 0
  for (let q = 0; q < length; q += 1) {
    while (boundaries[candidateIndex + 1] < q) {
      candidateIndex += 1
    }

    const nearest = locations[candidateIndex]
    const delta = q - nearest
    distances[q] = delta * delta + source[nearest]
    indices[q] = nearest
  }
}

const getIntersection = (source: Float64Array, q: number, p: number): number =>
  (source[q] + q * q - (source[p] + p * p)) / (2 * q - 2 * p)
