import { useMemo, useRef, useState } from 'react'
import { ArrowLeft, ImageIcon, Upload, X } from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import type { PhotoAlbum } from '@/modules/profile/lib/profile-photo-library'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

type SelectPhotoTab = 'recent' | 'albums'

type SelectPhotoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  recentPhotos: string[]
  albums: PhotoAlbum[]
  onSelectPhoto: (url: string) => void
  onUploadFile?: (file: File) => void
}

export function SelectPhotoDialog({
  open,
  onOpenChange,
  title = 'Select photo',
  recentPhotos,
  albums,
  onSelectPhoto,
  onUploadFile,
}: SelectPhotoDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<SelectPhotoTab>('recent')
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null)

  const activeAlbum = useMemo(
    () => albums.find((album) => album.id === activeAlbumId) ?? null,
    [albums, activeAlbumId],
  )

  const reset = () => {
    setTab('recent')
    setActiveAlbumId(null)
  }

  const handleClose = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const photosToShow = activeAlbum ? activeAlbum.photos : tab === 'recent' ? recentPhotos : []

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[65] bg-black/60" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-[65] flex max-h-[90vh] w-[min(100vw-1.5rem,680px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-background shadow-2xl">
          <div className="relative border-b px-4 py-3 text-center">
            {activeAlbum ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 h-9 w-9 -translate-y-1/2"
                onClick={() => setActiveAlbumId(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            ) : null}
            <DialogPrimitive.Title className="text-lg font-bold">
              {activeAlbum ? activeAlbum.title : title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-muted hover:bg-muted/80">
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          {!activeAlbum ? (
            <div className="flex border-b px-4">
              {(
                [
                  ['recent', 'Recent photos'],
                  ['albums', 'Photo albums'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    'relative px-4 py-3 text-sm font-semibold transition-colors',
                    tab === id ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {label}
                  {tab === id ? (
                    <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" />
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {onUploadFile && !activeAlbum && tab === 'recent' ? (
              <div className="mb-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 w-full gap-2 rounded-lg font-semibold"
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload photo
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onUploadFile(file)
                    e.target.value = ''
                  }}
                />
              </div>
            ) : null}

            {tab === 'albums' && !activeAlbum ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {albums.map((album) => (
                  <button
                    key={album.id}
                    type="button"
                    onClick={() => setActiveAlbumId(album.id)}
                    className="group space-y-2 text-left"
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                      {album.photos[0] ? (
                        <img src={album.photos[0]} alt="" className="h-full w-full object-cover transition group-hover:brightness-95" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">{album.title}</p>
                      <p className="text-xs text-muted-foreground">{album.photos.length} uploads</p>
                    </div>
                  </button>
                ))}
                {albums.length === 0 ? (
                  <p className="col-span-full py-12 text-center text-sm text-muted-foreground">No albums yet</p>
                ) : null}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                {photosToShow.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => {
                      onSelectPhoto(url)
                      handleClose(false)
                    }}
                    className="aspect-square overflow-hidden rounded-md bg-muted transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
                {photosToShow.length === 0 ? (
                  <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
                    No photos in this album yet
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
