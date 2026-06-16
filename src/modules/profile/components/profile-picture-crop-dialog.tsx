import { useEffect, useRef, useState } from 'react'
import { Clock, Crop, Globe, Loader2, Minus, Move, Plus, X } from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  clampCropTransform,
  getMinCropScale,
  loadImageElement,
  PROFILE_AVATAR_CROP_VIEWPORT,
  renderProfileCropPreview,
  transformToAvatarCrop,
  avatarCropToTransform,
  type ProfileCropTransform,
} from '@/modules/profile/lib/profile-crop-utils'
import type { AvatarCrop } from '@/shared/types/auth.types'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/shared/lib/cn'
import { toast } from '@/shared/components/ui/sonner'

const VIEWPORT = PROFILE_AVATAR_CROP_VIEWPORT

type ProfilePictureCropDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string | null
  initialCrop?: AvatarCrop | null
  onSave: (
    crop: AvatarCrop,
    description: string,
    context: { image: HTMLImageElement; transform: ProfileCropTransform },
  ) => void | Promise<void>
  saving?: boolean
}

function drawPreview(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  transform: ProfileCropTransform,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const clamped = clampCropTransform(
    transform,
    image.naturalWidth,
    image.naturalHeight,
    VIEWPORT,
  )
  renderProfileCropPreview(ctx, image, clamped, VIEWPORT)
  return clamped
}

export function ProfilePictureCropDialog({
  open,
  onOpenChange,
  imageSrc,
  initialCrop,
  onSave,
  saving = false,
}: ProfilePictureCropDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [description, setDescription] = useState('')
  const [transform, setTransform] = useState<ProfileCropTransform>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  })
  const [slider, setSlider] = useState(0)

  useEffect(() => {
    if (!open || !imageSrc) {
      setImage(null)
      setDescription('')
      setSlider(0)
      setLoadError(false)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setLoadError(false)
    setImage(null)

    void loadImageElement(imageSrc)
      .then((img) => {
        if (cancelled) return
        const initial = initialCrop
          ? avatarCropToTransform(initialCrop, img.naturalWidth, img.naturalHeight, VIEWPORT)
          : {
              scale: getMinCropScale(img.naturalWidth, img.naturalHeight, VIEWPORT.circleRadius),
              offsetX: 0,
              offsetY: 0,
            }
        const minScale = getMinCropScale(img.naturalWidth, img.naturalHeight, VIEWPORT.circleRadius)
        const clamped = clampCropTransform(initial, img.naturalWidth, img.naturalHeight, VIEWPORT)
        setImage(img)
        setTransform(clamped)
        const sliderValue = minScale > 0 ? Math.round(((clamped.scale - minScale) / (minScale * 2)) * 100) : 0
        setSlider(Math.max(0, Math.min(100, sliderValue)))
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true)
          setImage(null)
          toast.error('Could not load image. Try another file.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, imageSrc, initialCrop])

  useEffect(() => {
    if (!image || loading || !canvasRef.current) return
    drawPreview(canvasRef.current, image, transform)
  }, [image, loading, transform])

  const applySlider = (value: number) => {
    if (!image) return
    const minScale = getMinCropScale(image.naturalWidth, image.naturalHeight, VIEWPORT.circleRadius)
    const scale = minScale + (value / 100) * (minScale * 2)
    setSlider(value)
    setTransform((prev) =>
      clampCropTransform(
        { ...prev, scale },
        image.naturalWidth,
        image.naturalHeight,
        VIEWPORT,
      ),
    )
  }

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!image) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: transform.offsetX,
      offsetY: transform.offsetY,
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current || !image) return
    const canvas = e.currentTarget
    const scaleX = canvas.width / canvas.clientWidth || 1
    const scaleY = canvas.height / canvas.clientHeight || 1
    const dx = (e.clientX - dragRef.current.x) * scaleX
    const dy = (e.clientY - dragRef.current.y) * scaleY
    setTransform((prev) =>
      clampCropTransform(
        {
          ...prev,
          offsetX: dragRef.current!.offsetX + dx,
          offsetY: dragRef.current!.offsetY + dy,
        },
        image.naturalWidth,
        image.naturalHeight,
        VIEWPORT,
      ),
    )
  }

  const onPointerUp = () => {
    dragRef.current = null
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!image) return
    const step = e.shiftKey ? 10 : 4
    let dx = 0
    let dy = 0
    if (e.key === 'ArrowLeft') dx = step
    if (e.key === 'ArrowRight') dx = -step
    if (e.key === 'ArrowUp') dy = step
    if (e.key === 'ArrowDown') dy = -step
    if (!dx && !dy) return
    e.preventDefault()
    setTransform((prev) =>
      clampCropTransform(
        { ...prev, offsetX: prev.offsetX + dx, offsetY: prev.offsetY + dy },
        image.naturalWidth,
        image.naturalHeight,
        VIEWPORT,
      ),
    )
  }

  const handleSave = async () => {
    if (!image) return
    const clamped = clampCropTransform(
      transform,
      image.naturalWidth,
      image.naturalHeight,
      VIEWPORT,
    )
    const crop = transformToAvatarCrop(clamped, image.naturalWidth, image.naturalHeight, VIEWPORT)
    await onSave(crop, description.trim(), { image, transform: clamped })
  }

  const circleSize = VIEWPORT.circleRadius * 2
  const ready = Boolean(image) && !loading && !loadError

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/60" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-[60] flex max-h-[95vh] w-[min(100vw-1.5rem,520px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-background shadow-2xl outline-none"
          onKeyDown={onKeyDown}
        >
          <div className="relative border-b px-4 py-3 text-center">
            <DialogPrimitive.Title className="text-lg font-bold">
              Choose profile picture
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-muted hover:bg-muted/80">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          <div className="space-y-4 overflow-y-auto p-4">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={2}
              className="resize-none rounded-xl bg-muted/40"
            />

            <div
              className="relative overflow-hidden rounded-xl bg-muted"
              style={{ minHeight: 220 }}
            >
              <div
                className="relative mx-auto w-full"
                style={{ aspectRatio: `${VIEWPORT.width} / ${VIEWPORT.height}` }}
              >
                <canvas
                  ref={canvasRef}
                  width={VIEWPORT.width}
                  height={VIEWPORT.height}
                  className={cn(
                    'absolute inset-0 h-full w-full touch-none',
                    ready ? 'cursor-grab active:cursor-grabbing' : 'opacity-0',
                  )}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                />

                {ready ? (
                  <>
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background: `radial-gradient(circle ${VIEWPORT.circleRadius}px at 50% 50%, transparent ${VIEWPORT.circleRadius}px, rgba(0,0,0,0.55) ${VIEWPORT.circleRadius + 1}px)`,
                      }}
                    />
                    <div
                      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80"
                      style={{ width: circleSize, height: circleSize }}
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-lg bg-black/70 px-3 py-2 text-xs text-white shadow-lg sm:flex">
                      <Move className="h-4 w-4" />
                      Drag or use arrow keys to reposition image
                    </div>
                  </>
                ) : null}

                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : null}

                {loadError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted px-4 text-center text-sm text-muted-foreground">
                    Could not load this image. Please try uploading again.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-3 px-1">
              <Minus className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="range"
                min={0}
                max={100}
                value={slider}
                onChange={(e) => applySlider(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-primary/20 accent-primary"
                disabled={!ready}
              />
              <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-lg font-semibold"
                disabled={!ready}
                onClick={() => {
                  if (!image) return
                  const minScale = getMinCropScale(
                    image.naturalWidth,
                    image.naturalHeight,
                    VIEWPORT.circleRadius,
                  )
                  setTransform({ scale: minScale, offsetX: 0, offsetY: 0 })
                  setSlider(0)
                }}
              >
                <Crop className="h-4 w-4" />
                Crop photo
              </Button>
              <Button type="button" variant="secondary" size="sm" className="rounded-lg font-semibold" disabled>
                <Clock className="h-4 w-4" />
                Make temporary
              </Button>
            </div>

            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3.5 w-3.5" />
              Your profile picture is public
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
            <Button
              type="button"
              variant="ghost"
              className={cn('font-semibold text-primary')}
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="min-w-24 rounded-lg font-semibold"
              disabled={!ready || saving}
              onClick={() => void handleSave()}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
