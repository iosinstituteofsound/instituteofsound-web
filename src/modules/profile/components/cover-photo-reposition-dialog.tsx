import { useEffect, useRef, useState } from 'react'
import { Loader2, Minus, Move, Plus, X } from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  COVER_REPOSITION_VIEWPORT,
  clampCoverTransform,
  coverCropToTransform,
  getMinCoverScale,
  loadImageElement,
  renderCoverCropPreview,
  transformToCoverCrop,
  type CoverCropTransform,
} from '@/modules/profile/lib/cover-crop-utils'
import type { CoverCrop } from '@/shared/types/auth.types'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { toast } from '@/shared/components/ui/sonner'

type CoverPhotoRepositionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string | null
  initialCrop?: CoverCrop | null
  onSave: (crop: CoverCrop) => void | Promise<void>
  saving?: boolean
}

function drawPreview(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  transform: CoverCropTransform,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const clamped = clampCoverTransform(
    transform,
    image.naturalWidth,
    image.naturalHeight,
    COVER_REPOSITION_VIEWPORT,
  )
  renderCoverCropPreview(ctx, image, clamped, COVER_REPOSITION_VIEWPORT)
}

export function CoverPhotoRepositionDialog({
  open,
  onOpenChange,
  imageSrc,
  initialCrop,
  onSave,
  saving = false,
}: CoverPhotoRepositionDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [transform, setTransform] = useState<CoverCropTransform>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  })
  const [slider, setSlider] = useState(0)

  useEffect(() => {
    if (!open || !imageSrc) {
      setImage(null)
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
        const minScale = getMinCoverScale(
          img.naturalWidth,
          img.naturalHeight,
          COVER_REPOSITION_VIEWPORT,
        )
        const initial = initialCrop
          ? coverCropToTransform(initialCrop, img.naturalWidth, img.naturalHeight, COVER_REPOSITION_VIEWPORT)
          : { scale: minScale, offsetX: 0, offsetY: 0 }
        const clamped = clampCoverTransform(
          initial,
          img.naturalWidth,
          img.naturalHeight,
          COVER_REPOSITION_VIEWPORT,
        )
        setImage(img)
        setTransform(clamped)
        const sliderValue = Math.round(((clamped.scale - minScale) / (minScale * 2)) * 100)
        setSlider(Math.max(0, Math.min(100, sliderValue)))
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true)
          toast.error('Could not load image')
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
    const minScale = getMinCoverScale(
      image.naturalWidth,
      image.naturalHeight,
      COVER_REPOSITION_VIEWPORT,
    )
    const scale = minScale + (value / 100) * (minScale * 2)
    setSlider(value)
    setTransform((prev) =>
      clampCoverTransform(
        { ...prev, scale },
        image.naturalWidth,
        image.naturalHeight,
        COVER_REPOSITION_VIEWPORT,
      ),
    )
  }

  const handleSave = async () => {
    if (!image) return
    const clamped = clampCoverTransform(
      transform,
      image.naturalWidth,
      image.naturalHeight,
      COVER_REPOSITION_VIEWPORT,
    )
    const crop = transformToCoverCrop(
      clamped,
      image.naturalWidth,
      image.naturalHeight,
      COVER_REPOSITION_VIEWPORT,
    )
    await onSave(crop)
  }

  const ready = Boolean(image) && !loading && !loadError
  const viewport = COVER_REPOSITION_VIEWPORT

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/60" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-[70] flex max-h-[95vh] w-[min(100vw-1.5rem,860px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-background shadow-2xl outline-none">
          <div className="relative border-b px-4 py-3 text-center">
            <DialogPrimitive.Title className="text-lg font-bold">Reposition</DialogPrimitive.Title>
            <DialogPrimitive.Close className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-muted hover:bg-muted/80">
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="space-y-4 overflow-y-auto p-4">
            <div className="relative overflow-hidden rounded-xl bg-muted" style={{ minHeight: 200 }}>
              <div
                className="relative mx-auto w-full"
                style={{ aspectRatio: `${viewport.width} / ${viewport.height}` }}
              >
                <canvas
                  ref={canvasRef}
                  width={viewport.width}
                  height={viewport.height}
                  className={cn(
                    'absolute inset-0 h-full w-full touch-none',
                    ready ? 'cursor-grab active:cursor-grabbing' : 'opacity-0',
                  )}
                  onPointerDown={(e) => {
                    if (!image) return
                    e.currentTarget.setPointerCapture(e.pointerId)
                    dragRef.current = {
                      x: e.clientX,
                      y: e.clientY,
                      offsetX: transform.offsetX,
                      offsetY: transform.offsetY,
                    }
                  }}
                  onPointerMove={(e) => {
                    if (!dragRef.current || !image) return
                    const canvas = e.currentTarget
                    const scaleX = canvas.width / canvas.clientWidth || 1
                    const scaleY = canvas.height / canvas.clientHeight || 1
                    const dx = (e.clientX - dragRef.current.x) * scaleX
                    const dy = (e.clientY - dragRef.current.y) * scaleY
                    setTransform((prev) =>
                      clampCoverTransform(
                        {
                          ...prev,
                          offsetX: dragRef.current!.offsetX + dx,
                          offsetY: dragRef.current!.offsetY + dy,
                        },
                        image.naturalWidth,
                        image.naturalHeight,
                        COVER_REPOSITION_VIEWPORT,
                      ),
                    )
                  }}
                  onPointerUp={() => {
                    dragRef.current = null
                  }}
                />

                {ready ? (
                  <div className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-white/70 ring-inset" />
                ) : null}

                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : null}

                {loadError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted px-4 text-center text-sm text-muted-foreground">
                    Could not load image.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="pointer-events-none flex items-center justify-center gap-2 text-xs text-muted-foreground sm:text-sm">
              <Move className="h-4 w-4" />
              Drag to reposition
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
          </div>

          <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
            <Button type="button" variant="ghost" className="font-semibold text-primary" disabled={saving} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" className="min-w-24 rounded-lg font-semibold" disabled={!ready || saving} onClick={() => void handleSave()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
