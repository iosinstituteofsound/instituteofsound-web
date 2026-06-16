import { useEffect, useRef, useState } from 'react'
import { ImageIcon, Pencil, Plus, X } from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { ProfilePictureCropDialog } from '@/modules/profile/components/profile-picture-crop-dialog'
import { useUpdateProfile } from '@/modules/profile/hooks/use-profile'
import {
  exportProfileCropBlob,
  PROFILE_AVATAR_CROP_VIEWPORT,
  type ProfileCropTransform,
} from '@/modules/profile/lib/profile-crop-utils'
import type { ProfileAvatarSelection } from '@/modules/profile/types/profile.types'
import type { AvatarCrop } from '@/shared/types/auth.types'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { toast } from '@/shared/components/ui/sonner'

type ChooseProfilePictureDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUrl?: string
  currentCrop?: AvatarCrop | null
  recentUrls?: string[]
  onSelect: (selection: ProfileAvatarSelection) => void | Promise<void>
}

function PhotoGrid({
  title,
  photos,
  selectedUrl,
  onSelect,
  showSeeMore,
}: {
  title: string
  photos: string[]
  selectedUrl?: string
  onSelect: (url: string) => void
  showSeeMore?: boolean
}) {
  if (photos.length === 0) return null

  return (
    <section className="space-y-2">
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
        {photos.slice(0, 6).map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => onSelect(url)}
            className={cn(
              'aspect-square overflow-hidden rounded-md bg-muted transition ring-offset-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary',
              selectedUrl === url && 'ring-2 ring-primary',
            )}
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {showSeeMore && photos.length > 6 ? (
        <Button type="button" variant="secondary" className="mt-1 h-9 w-full rounded-lg font-semibold">
          See more
        </Button>
      ) : null}
    </section>
  )
}

export function ChooseProfilePictureDialog({
  open,
  onOpenChange,
  currentUrl,
  currentCrop,
  recentUrls = [],
  onSelect,
}: ChooseProfilePictureDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)
  const originalFileRef = useRef<File | null>(null)
  const updateProfile = useUpdateProfile()
  const [cropOpen, setCropOpen] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [cropInitialCrop, setCropInitialCrop] = useState<AvatarCrop | null>(null)
  const [savingCrop, setSavingCrop] = useState(false)

  const uploads = [...new Set([currentUrl, ...recentUrls].filter(Boolean))] as string[]
  const suggested = uploads.slice(0, 6)

  const revokeObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }

  useEffect(() => {
    if (!open) {
      setCropOpen(false)
      setCropImageSrc(null)
      setCropInitialCrop(null)
      originalFileRef.current = null
      revokeObjectUrl()
    }
  }, [open])

  const openCropEditor = (src: string, options?: { isObjectUrl?: boolean; initialCrop?: AvatarCrop | null }) => {
    if (!options?.isObjectUrl) {
      revokeObjectUrl()
      originalFileRef.current = null
    }
    setCropInitialCrop(options?.initialCrop ?? null)
    setCropImageSrc(src)
    setCropOpen(true)
  }

  const handleFileSelected = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    revokeObjectUrl()
    originalFileRef.current = file
    const objectUrl = URL.createObjectURL(file)
    objectUrlRef.current = objectUrl
    if (inputRef.current) inputRef.current.value = ''
    openCropEditor(objectUrl, { isObjectUrl: true, initialCrop: null })
  }

  const handleCropSave = async (
    crop: AvatarCrop,
    _description: string,
    context: { image: HTMLImageElement; transform: ProfileCropTransform },
  ) => {
    setSavingCrop(true)
    try {
      let avatarUrl = cropImageSrc ?? ''
      if (originalFileRef.current) {
        const uploaded = await uploadMediaFile(originalFileRef.current, originalFileRef.current.name)
        avatarUrl = uploaded.absoluteUrl ?? uploaded.url
      } else if (!avatarUrl) {
        throw new Error('No image selected')
      }

      const thumbnailBlob = await exportProfileCropBlob(
        context.image,
        context.transform,
        PROFILE_AVATAR_CROP_VIEWPORT,
      )
      const uploadedThumbnail = await uploadMediaFile(
        thumbnailBlob,
        `avatar-thumb-${Date.now()}.jpg`,
      )
      const avatarThumbnailUrl = uploadedThumbnail.absoluteUrl ?? uploadedThumbnail.url
      await onSelect({ avatarUrl, avatarCrop: crop, avatarThumbnailUrl })
      toast.success('Profile picture updated')
      setCropOpen(false)
      onOpenChange(false)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to save profile picture'
      toast.error(message)
    } finally {
      setSavingCrop(false)
    }
  }

  return (
    <>
      <DialogPrimitive.Root open={open && !cropOpen} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[min(100vw-2rem,680px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-background shadow-2xl">
            <div className="relative border-b px-4 py-3 text-center">
              <DialogPrimitive.Title className="text-lg font-bold">
                Choose profile picture
              </DialogPrimitive.Title>
              <DialogPrimitive.Close className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-muted hover:bg-muted/80">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </div>

            <div className="space-y-5 overflow-y-auto p-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  className="h-10 flex-1 gap-2 rounded-lg bg-primary/10 font-semibold text-primary hover:bg-primary/15"
                  disabled={updateProfile.isPending || savingCrop}
                  onClick={() => inputRef.current?.click()}
                >
                  <Plus className="h-4 w-4" />
                  Upload photo
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-lg"
                  onClick={() => inputRef.current?.click()}
                  aria-label="Upload photo"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelected(file)
                  }}
                />
              </div>

              {suggested.length > 0 ? (
                <PhotoGrid
                  title="Suggested photos"
                  photos={suggested}
                  selectedUrl={currentUrl}
                  onSelect={(url) =>
                    openCropEditor(url, {
                      initialCrop: url === currentUrl ? currentCrop : null,
                    })
                  }
                  showSeeMore
                />
              ) : null}

              {uploads.length > 0 ? (
                <PhotoGrid
                  title="Uploads"
                  photos={uploads}
                  selectedUrl={currentUrl}
                  onSelect={(url) =>
                    openCropEditor(url, {
                      initialCrop: url === currentUrl ? currentCrop : null,
                    })
                  }
                  showSeeMore
                />
              ) : (
                <section className="space-y-2">
                  <h3 className="text-[15px] font-semibold">Uploads</h3>
                  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-muted-foreground">
                    <ImageIcon className="h-8 w-8 opacity-50" />
                    <p className="text-sm">No photos uploaded yet</p>
                  </div>
                </section>
              )}

              {currentUrl ? (
                <PhotoGrid
                  title="Profile pictures"
                  photos={[currentUrl]}
                  selectedUrl={currentUrl}
                  onSelect={(url) => openCropEditor(url, { initialCrop: currentCrop })}
                />
              ) : null}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <ProfilePictureCropDialog
        open={cropOpen}
        onOpenChange={(next) => {
          setCropOpen(next)
          if (!next) {
            setCropImageSrc(null)
            setCropInitialCrop(null)
            originalFileRef.current = null
            revokeObjectUrl()
          }
        }}
        imageSrc={cropImageSrc}
        initialCrop={cropInitialCrop}
        saving={savingCrop}
        onSave={handleCropSave}
      />
    </>
  )
}
