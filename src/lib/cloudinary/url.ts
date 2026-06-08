import { getSiteHost } from '@/lib/auth/siteUrl'
import { getCloudinaryCloudName } from './config'

const CLOUDINARY_HOST = 'res.cloudinary.com'

export interface CloudinaryTransformOptions {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'limit' | 'scale'
  quality?: 'auto' | 'auto:good' | 'auto:best' | number
  format?: 'auto' | 'webp' | 'avif' | 'jpg'
}

export function isCloudinaryUrl(url: string): boolean {
  return url.includes(CLOUDINARY_HOST)
}

function buildTransformString(options: CloudinaryTransformOptions): string {
  const parts: string[] = [`f_${options.format ?? 'auto'}`, `q_${options.quality ?? 'auto'}`]

  if (options.width) parts.push(`w_${options.width}`)
  if (options.height) parts.push(`h_${options.height}`)
  if (options.width && options.height) {
    parts.push(`c_${options.crop ?? 'fill'}`)
  } else if (options.width) {
    parts.push('c_limit')
  }
  parts.push('dpr_auto')

  return parts.join(',')
}

/**
 * Remove existing transform segment after /upload/ (e.g. f_auto,q_auto,w_800).
 * Do NOT strip folder names like ios/artists/... — those have no commas.
 */
function cloudinaryAssetPathAfterUpload(rest: string): string {
  let path = rest.replace(/^v\d+\//, '')
  const slash = path.indexOf('/')
  if (slash === -1) {
    return path.includes(',') ? '' : path
  }
  const first = path.slice(0, slash)
  if (first.includes(',')) {
    return path.slice(slash + 1)
  }
  return path
}

/** Fast CDN URL — auto format/quality, responsive width */
export function cloudinaryUrl(src: string, options: CloudinaryTransformOptions = {}): string {
  if (!src?.trim()) return ''

  const transforms = buildTransformString(options)

  if (isCloudinaryUrl(src)) {
    const marker = '/upload/'
    const idx = src.indexOf(marker)
    if (idx === -1) return src
    const base = src.slice(0, idx + marker.length)
    const rest = src.slice(idx + marker.length)
    const assetPath = cloudinaryAssetPathAfterUpload(rest)
    if (!assetPath) return src
    return `${base}${transforms}/${assetPath}`
  }

  const cloudName = getCloudinaryCloudName()
  if (cloudName && (src.startsWith('http://') || src.startsWith('https://'))) {
    try {
      const host = new URL(src).hostname.replace(/^www\./, '')
      if (host === getSiteHost()) return src
    } catch {
      /* invalid URL */
    }
    const encoded = encodeURIComponent(src)
    return `https://${CLOUDINARY_HOST}/${cloudName}/image/fetch/${transforms}/${encoded}`
  }

  return src
}

/** Responsive srcSet widths for sharp, fast loads */
export function cloudinarySrcSet(
  src: string,
  widths: number[],
  options: Omit<CloudinaryTransformOptions, 'width'> = {}
): string {
  return widths
    .map((w) => `${cloudinaryUrl(src, { ...options, width: w })} ${w}w`)
    .join(', ')
}
