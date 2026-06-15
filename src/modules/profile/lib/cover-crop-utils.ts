import type { CSSProperties } from 'react'
import { loadImageElement } from '@/modules/profile/lib/profile-crop-utils'
import type { CoverCrop } from '@/shared/types/auth.types'

export type CoverCropTransform = {
  scale: number
  offsetX: number
  offsetY: number
}

export type CoverCropViewport = {
  width: number
  height: number
}

export const COVER_REPOSITION_VIEWPORT: CoverCropViewport = {
  width: 820,
  height: 312,
}

export function getMinCoverScale(
  imageWidth: number,
  imageHeight: number,
  viewport: CoverCropViewport,
): number {
  return Math.max(viewport.width / imageWidth, viewport.height / imageHeight)
}

export function clampCoverTransform(
  transform: CoverCropTransform,
  imageWidth: number,
  imageHeight: number,
  viewport: CoverCropViewport,
): CoverCropTransform {
  const minScale = getMinCoverScale(imageWidth, imageHeight, viewport)
  const scale = Math.min(Math.max(transform.scale, minScale), minScale * 3)
  const displayW = imageWidth * scale
  const displayH = imageHeight * scale
  const maxOffsetX = Math.max(0, (displayW - viewport.width) / 2)
  const maxOffsetY = Math.max(0, (displayH - viewport.height) / 2)

  return {
    scale,
    offsetX: Math.min(Math.max(transform.offsetX, -maxOffsetX), maxOffsetX),
    offsetY: Math.min(Math.max(transform.offsetY, -maxOffsetY), maxOffsetY),
  }
}

export function renderCoverCropPreview(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  transform: CoverCropTransform,
  viewport: CoverCropViewport,
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

export function transformToCoverCrop(
  transform: CoverCropTransform,
  imageWidth: number,
  imageHeight: number,
  viewport: CoverCropViewport,
): CoverCrop {
  const { width, height } = viewport
  const displayW = imageWidth * transform.scale
  const displayH = imageHeight * transform.scale
  const imgLeft = width / 2 + transform.offsetX - displayW / 2
  const imgTop = height / 2 + transform.offsetY - displayH / 2
  const centerX = (width / 2 - imgLeft) / displayW
  const centerY = (height / 2 - imgTop) / displayH
  const minScale = getMinCoverScale(imageWidth, imageHeight, viewport)
  const z = transform.scale / minScale
  return { x: centerX, y: centerY, z }
}

export function coverCropToTransform(
  crop: CoverCrop,
  imageWidth: number,
  imageHeight: number,
  viewport: CoverCropViewport,
): CoverCropTransform {
  const minScale = getMinCoverScale(imageWidth, imageHeight, viewport)
  const scale = minScale * crop.z
  const displayW = imageWidth * scale
  const displayH = imageHeight * scale
  return {
    scale,
    offsetX: displayW * (0.5 - crop.x),
    offsetY: displayH * (0.5 - crop.y),
  }
}

export function getCoverImageStyle(
  _src: string,
  crop: CoverCrop | null | undefined,
  containerWidth: number,
  containerHeight: number,
  dims: { w: number; h: number } | null,
): CSSProperties | undefined {
  if (!crop || !dims) return undefined
  const minScale = Math.max(containerWidth / dims.w, containerHeight / dims.h)
  const scale = minScale * crop.z
  const imgW = dims.w * scale
  const imgH = dims.h * scale
  return {
    width: imgW,
    height: imgH,
    maxWidth: 'none',
    position: 'absolute',
    left: containerWidth / 2 - crop.x * imgW,
    top: containerHeight / 2 - crop.y * imgH,
  }
}

export { loadImageElement }
