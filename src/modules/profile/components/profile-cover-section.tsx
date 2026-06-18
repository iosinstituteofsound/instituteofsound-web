import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Camera,
  ImageIcon,
  Loader2,
  Move,
  Settings,
  Trash2,
  Upload,
} from 'lucide-react'
import { VerifiedUserName } from '@/shared/components/icons/verified-user-name'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { CoverPhotoRepositionDialog } from '@/modules/profile/components/cover-photo-reposition-dialog'
import { CroppedCover } from '@/modules/profile/components/cropped-cover'
import { ProfileAvatarMenu } from '@/modules/profile/components/profile-avatar-menu'
import { SelectPhotoDialog } from '@/modules/profile/components/select-photo-dialog'
import { useUpdateProfile } from '@/modules/profile/hooks/use-profile'
import {
  addStoredUpload,
  buildPhotoAlbums,
  buildRecentPhotos,
} from '@/modules/profile/lib/profile-photo-library'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import type { CoverCrop, UserDto } from '@/shared/types/auth.types'
import { premiumSurfaceClass } from '@/shared/lib/surface-classes'
import { cn } from '@/shared/lib/cn'
import { toast } from '@/shared/components/ui/sonner'

type ProfileCoverSectionProps = {
  user: UserDto
  editable?: boolean
  className?: string
}

export function ProfileCoverSection({ user, editable = true, className }: ProfileCoverSectionProps) {
  const updateProfile = useUpdateProfile()
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)
  const originalFileRef = useRef<File | null>(null)

  const [selectOpen, setSelectOpen] = useState(false)
  const [repositionOpen, setRepositionOpen] = useState(false)
  const [repositionSrc, setRepositionSrc] = useState<string | null>(null)
  const [repositionCrop, setRepositionCrop] = useState<CoverCrop | null>(null)
  const [saving, setSaving] = useState(false)
  const [extraRecent, setExtraRecent] = useState<string[]>([])

  const recentPhotos = useMemo(
    () => buildRecentPhotos(user, extraRecent),
    [user, extraRecent],
  )
  const albums = useMemo(() => buildPhotoAlbums(user, recentPhotos), [user, recentPhotos])

  const revokeObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }

  useEffect(() => () => revokeObjectUrl(), [])

  const openReposition = (src: string, options?: { crop?: CoverCrop | null; file?: File | null }) => {
    revokeObjectUrl()
    originalFileRef.current = options?.file ?? null
    if (options?.file) {
      const objectUrl = URL.createObjectURL(options.file)
      objectUrlRef.current = objectUrl
      setRepositionSrc(objectUrl)
    } else {
      setRepositionSrc(src)
    }
    setRepositionCrop(options?.crop ?? null)
    setSelectOpen(false)
    setRepositionOpen(true)
  }

  const handleRepositionSave = async (crop: CoverCrop) => {
    setSaving(true)
    try {
      let coverUrl = user.coverUrl ?? ''
      if (originalFileRef.current) {
        const uploaded = await uploadMediaFile(originalFileRef.current, originalFileRef.current.name)
        coverUrl = uploaded.absoluteUrl ?? uploaded.url
      } else if (repositionSrc && !repositionSrc.startsWith('blob:')) {
        coverUrl = repositionSrc
      } else if (!coverUrl) {
        throw new Error('No cover image selected')
      }

      await updateProfile.mutateAsync({ coverUrl, coverCrop: crop })
      addStoredUpload(user.id, coverUrl)
      setExtraRecent((prev) => [coverUrl, ...prev.filter((u) => u !== coverUrl)])
      toast.success('Cover photo updated')
      setRepositionOpen(false)
      revokeObjectUrl()
      originalFileRef.current = null
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to save cover photo'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveCover = async () => {
    try {
      await updateProfile.mutateAsync({ coverUrl: null, coverCrop: null })
      toast.success('Cover photo removed')
    } catch {
      toast.error('Failed to remove cover photo')
    }
  }

  return (
    <div
      className={cn(
        premiumSurfaceClass,
        'relative overflow-hidden shadow-[0_24px_64px_-28px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.07]',
        className,
      )}
    >
      <div className="relative min-h-[18rem] sm:min-h-[22rem] md:min-h-[26rem]">
        <CroppedCover
          src={user.coverUrl}
          crop={user.coverCrop}
          className="absolute inset-0 h-full w-full"
          heightClass="h-full"
        />

        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.55)_38%,rgba(0,0,0,0.15)_68%,transparent_100%),radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.28)_100%)]"
          aria-hidden
        />

        {editable ? (
          <div className="absolute right-3 top-3 z-20 sm:right-5 sm:top-5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-8 gap-1.5 border border-white/15 bg-black/45 px-3 text-xs font-medium text-white/95 shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all hover:border-white/25 hover:bg-black/60"
                  disabled={saving || updateProfile.isPending}
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                  Edit cover photo
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50 w-52 rounded-xl p-1.5">
                <DropdownMenuItem
                  className="gap-3 rounded-lg py-2.5"
                  onClick={() => setSelectOpen(true)}
                >
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  Choose cover photo
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-3 rounded-lg py-2.5"
                  onClick={() => uploadInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  Upload photo
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-3 rounded-lg py-2.5"
                  disabled={!user.coverUrl}
                  onClick={() => user.coverUrl && openReposition(user.coverUrl, { crop: user.coverCrop })}
                >
                  <Move className="h-4 w-4 text-muted-foreground" />
                  Reposition
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-3 rounded-lg py-2.5 text-destructive focus:text-destructive"
                  disabled={!user.coverUrl}
                  onClick={() => void handleRemoveCover()}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}

        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              if (!file.type.startsWith('image/')) {
                toast.error('Please choose an image file')
                return
              }
              openReposition('', { file })
            }
            e.target.value = ''
          }}
        />

        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-5 pt-10 sm:px-7 sm:pb-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
              <div className="shrink-0">
                <ProfileAvatarMenu
                  user={user}
                  editable={editable}
                  avatarClassName="border-[3px] border-white shadow-[0_10px_40px_rgba(0,0,0,0.55)] ring-2 ring-black/30 transition-transform hover:scale-[1.02]"
                />
              </div>

              <div className="min-w-0 space-y-1.5 pb-0.5">
                <div className="flex flex-wrap items-center gap-1">
                  <h1 className="text-[1.65rem] font-bold tracking-[-0.02em] text-white antialiased drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)] sm:text-[2rem]">
                    <VerifiedUserName name={user.name} isVerified={user.isVerified} />
                  </h1>
                </div>
                {user.username ? (
                  <p className="text-[13px] font-medium tracking-wide text-white/65">@{user.username}</p>
                ) : null}
                {user.bio ? (
                  <p className="max-w-xl pt-0.5 text-[15px] leading-relaxed text-white/85 drop-shadow-[0_1px_10px_rgba(0,0,0,0.7)]">
                    {user.bio}
                  </p>
                ) : null}
              </div>
            </div>

            {editable ? (
              <div className="flex flex-wrap gap-2.5 sm:pb-0.5">
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="h-9 rounded-lg border border-white/20 bg-white/12 px-4 text-[13px] font-semibold text-white shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/20"
                >
                  <Link to="/profile/edit">Edit profile</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-lg border border-white/20 bg-white/10 text-white shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/18"
                >
                  <Link to="/profile/settings" aria-label="Settings">
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <SelectPhotoDialog
        open={selectOpen}
        onOpenChange={setSelectOpen}
        title="Select photo"
        recentPhotos={recentPhotos}
        albums={albums}
        onSelectPhoto={(url) =>
          openReposition(url, {
            crop: url === user.coverUrl ? user.coverCrop : null,
          })
        }
        onUploadFile={(file) => openReposition('', { file })}
      />

      <CoverPhotoRepositionDialog
        open={repositionOpen}
        onOpenChange={(next) => {
          setRepositionOpen(next)
          if (!next) {
            setRepositionSrc(null)
            setRepositionCrop(null)
            revokeObjectUrl()
            originalFileRef.current = null
          }
        }}
        imageSrc={repositionSrc}
        initialCrop={repositionCrop}
        saving={saving}
        onSave={handleRepositionSave}
      />
    </div>
  )
}
