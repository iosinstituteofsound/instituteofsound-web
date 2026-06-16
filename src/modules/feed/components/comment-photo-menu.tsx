import { useRef, useState } from 'react'
import { Camera, Upload } from 'lucide-react'
import { CommentPhotoCaptureDialog } from '@/modules/feed/components/comment-photo-capture-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { toast } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/cn'

interface CommentPhotoMenuProps {
  disabled?: boolean
  portalContainer?: HTMLElement | null
  triggerClassName?: string
  onPhotoSelected: (file: File) => void
}

function isMobileDevice() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

export function CommentPhotoMenu({
  disabled = false,
  portalContainer = null,
  triggerClassName,
  onPhotoSelected,
}: CommentPhotoMenuProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [captureOpen, setCaptureOpen] = useState(false)
  const inDialog = Boolean(portalContainer)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    onPhotoSelected(file)
  }

  const handleTakePhoto = () => {
    if (isMobileDevice()) {
      cameraInputRef.current?.click()
      return
    }
    setCaptureOpen(true)
  }

  return (
    <>
      <DropdownMenu modal={!inDialog}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn('feed-comment-composer__tool', triggerClassName)}
            disabled={disabled}
            aria-label="Add photo"
          >
            <Camera className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          portalContainer={portalContainer}
          className={cn('min-w-[11rem] rounded-xl p-1.5', inDialog ? 'z-[110]' : 'z-50')}
        >
          <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg px-3 py-2" onClick={handleTakePhoto}>
            <Camera className="h-4 w-4" />
            Take photo
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer gap-2 rounded-lg px-3 py-2"
            onClick={() => uploadInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Upload photo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Upload photo"
        onChange={(event) => {
          handleFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        aria-label="Take photo"
        onChange={(event) => {
          handleFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />

      <CommentPhotoCaptureDialog
        open={captureOpen}
        onOpenChange={setCaptureOpen}
        onCapture={handleFile}
      />
    </>
  )
}
