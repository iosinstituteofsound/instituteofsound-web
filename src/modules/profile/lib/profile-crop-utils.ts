export const PROFILE_CROP_OUTPUT_SIZE = 512

export type ProfileCropTransform = {
  scale: number
  offsetX: number
  offsetY: number
}

export type ProfileCropViewport = {
  width: number
  height: number
  circleRadius: number
}

export function getMinCropScale(
  imageWidth: number,
  imageHeight: number,
  circleRadius: number,
): number {
  const diameter = circleRadius * 2
  return Math.max(diameter / imageWidth, diameter / imageHeight)
}

export function clampCropTransform(
  transform: ProfileCropTransform,
  imageWidth: number,
  imageHeight: number,
  viewport: ProfileCropViewport,
): ProfileCropTransform {
  const minScale = getMinCropScale(imageWidth, imageHeight, viewport.circleRadius)
  const scale = Math.min(Math.max(transform.scale, minScale), minScale * 3)
  const displayW = imageWidth * scale
  const displayH = imageHeight * scale
  const maxOffsetX = Math.max(0, (displayW - viewport.circleRadius * 2) / 2)
  const maxOffsetY = Math.max(0, (displayH - viewport.circleRadius * 2) / 2)

  return {
    scale,
    offsetX: Math.min(Math.max(transform.offsetX, -maxOffsetX), maxOffsetX),
    offsetY: Math.min(Math.max(transform.offsetY, -maxOffsetY), maxOffsetY),
  }
}

export function renderProfileCropPreview(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  transform: ProfileCropTransform,
  viewport: ProfileCropViewport,
) {
  const { width, height } = viewport
  const centerX = width / 2
  const centerY = height / 2
  const displayW = image.naturalWidth * transform.scale
  const displayH = image.naturalHeight * transform.scale
  const imgLeft = centerX + transform.offsetX - displayW / 2
  const imgTop = centerY + transform.offsetY - displayH / 2

  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(image, imgLeft, imgTop, displayW, displayH)
}

export function renderProfileCrop(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  transform: ProfileCropTransform,
  viewport: ProfileCropViewport,
  outputSize: number,
) {
  const { width, height, circleRadius } = viewport
  const centerX = width / 2
  const centerY = height / 2
  const displayW = image.naturalWidth * transform.scale
  const displayH = image.naturalHeight * transform.scale
  const imgLeft = centerX + transform.offsetX - displayW / 2
  const imgTop = centerY + transform.offsetY - displayH / 2

  ctx.clearRect(0, 0, outputSize, outputSize)
  ctx.save()
  ctx.beginPath()
  ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
  ctx.clip()

  const map = outputSize / (circleRadius * 2)
  ctx.drawImage(
    image,
    imgLeft * map,
    imgTop * map,
    displayW * map,
    displayH * map,
  )
  ctx.restore()
}

export async function exportProfileCropBlob(
  image: HTMLImageElement,
  transform: ProfileCropTransform,
  viewport: ProfileCropViewport,
  outputSize = PROFILE_CROP_OUTPUT_SIZE,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = outputSize
  canvas.height = outputSize
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  renderProfileCrop(ctx, image, transform, viewport, outputSize)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to export image'))),
      'image/jpeg',
      0.92,
    )
  })
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const isLocal = src.startsWith('blob:') || src.startsWith('data:')
    if (!isLocal) {
      img.crossOrigin = 'anonymous'
    }

    img.onload = () => {
      void img.decode().then(() => resolve(img)).catch(() => resolve(img))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

export type AvatarCrop = {
  x: number
  y: number
  r: number
}

export function transformToAvatarCrop(
  transform: ProfileCropTransform,
  imageWidth: number,
  imageHeight: number,
  viewport: ProfileCropViewport,
): AvatarCrop {
  const { width, height, circleRadius } = viewport
  const displayW = imageWidth * transform.scale
  const displayH = imageHeight * transform.scale
  const imgLeft = width / 2 + transform.offsetX - displayW / 2
  const imgTop = height / 2 + transform.offsetY - displayH / 2
  const centerX = (width / 2 - imgLeft) / displayW
  const centerY = (height / 2 - imgTop) / displayH
  const radiusNatural = circleRadius / transform.scale
  const r = radiusNatural / Math.min(imageWidth, imageHeight)
  return { x: centerX, y: centerY, r }
}

export function avatarCropToTransform(
  crop: AvatarCrop,
  imageWidth: number,
  imageHeight: number,
  viewport: ProfileCropViewport,
): ProfileCropTransform {
  const radiusNatural = crop.r * Math.min(imageWidth, imageHeight)
  const scale = viewport.circleRadius / radiusNatural
  const displayW = imageWidth * scale
  const displayH = imageHeight * scale
  return {
    scale,
    offsetX: displayW * (0.5 - crop.x),
    offsetY: displayH * (0.5 - crop.y),
  }
}
