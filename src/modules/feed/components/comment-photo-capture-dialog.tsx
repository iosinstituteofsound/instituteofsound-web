import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Camera, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { toast } from '@/shared/components/ui/sonner'

interface CommentPhotoCaptureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapture: (file: File) => void
  onAccessDenied?: () => void
}

async function requestCameraStream(): Promise<MediaStream> {
  const attempts: MediaStreamConstraints[] = [
    { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
    { video: { facingMode: { ideal: 'user' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
    { video: true, audio: false },
  ]

  let lastError: unknown
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError ?? new Error('Could not access camera')
}

export function CommentPhotoCaptureDialog({
  open,
  onOpenChange,
  onCapture,
  onAccessDenied,
}: CommentPhotoCaptureDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!open) {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setReady(false)
      return
    }

    let cancelled = false

    void requestCameraStream()
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          void video.play().catch(() => {})
        }
        setReady(true)
      })
      .catch(() => {
        toast.error('Could not access camera. Choose a photo from your device instead.')
        onOpenChange(false)
        onAccessDenied?.()
      })

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [open, onAccessDenied, onOpenChange])

  const handleCapture = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth || !video.videoHeight) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')
    if (!context) return

    context.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        onCapture(new File([blob], `comment-photo-${Date.now()}.jpg`, { type: 'image/jpeg' }))
        onOpenChange(false)
      },
      'image/jpeg',
      0.92,
    )
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[120] bg-black/70" data-comment-photo-capture />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-[121] w-[min(100vw-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-background shadow-xl" data-comment-photo-capture>
          <div className="flex items-center justify-between border-b px-4 py-3">
            <DialogPrimitive.Title className="text-base font-semibold">Take photo</DialogPrimitive.Title>
            <DialogPrimitive.Close className="rounded-full p-1 text-muted-foreground hover:bg-muted" aria-label="Close">
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <div className="flex justify-center p-4">
            <Button type="button" className="gap-2 rounded-full px-6" disabled={!ready} onClick={handleCapture}>
              <Camera className="h-4 w-4" />
              Capture
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
