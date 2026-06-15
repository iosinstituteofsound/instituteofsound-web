import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, Camera, Loader2, Settings } from 'lucide-react'
import { uploadMediaFile } from '@/modules/feed/api/media.api'
import { ProfileAvatarMenu } from '@/modules/profile/components/profile-avatar-menu'
import { useUpdateProfile } from '@/modules/profile/hooks/use-profile'
import { Button } from '@/shared/components/ui/button'
import type { UserDto } from '@/shared/types/auth.types'
import { cn } from '@/shared/lib/cn'
import { toast } from '@/shared/components/ui/sonner'

type ProfileCoverSectionProps = {
  user: UserDto
  editable?: boolean
  className?: string
}

export function ProfileCoverSection({ user, editable = true, className }: ProfileCoverSectionProps) {
  const updateProfile = useUpdateProfile()
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [uploadingCover, setUploadingCover] = useState(false)

  const uploadCover = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    setUploadingCover(true)
    try {
      const uploaded = await uploadMediaFile(file, file.name)
      await updateProfile.mutateAsync({ coverUrl: uploaded.absoluteUrl ?? uploaded.url })
      toast.success('Cover photo updated')
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Upload failed'
      toast.error(message)
    } finally {
      setUploadingCover(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border bg-card shadow-sm', className)}>
      <div className="relative h-44 bg-muted sm:h-56 md:h-72">
        {user.coverUrl ? (
          <img src={user.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/25 via-muted to-background" />
        )}

        {editable ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="absolute bottom-3 right-3 h-8 gap-1.5 bg-background/90 px-3 text-xs shadow-md hover:bg-background"
              disabled={uploadingCover || updateProfile.isPending}
              onClick={() => coverInputRef.current?.click()}
            >
              {uploadingCover ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              Edit cover photo
            </Button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void uploadCover(file)
              }}
            />
          </>
        ) : null}
      </div>

      <div className="relative px-4 pb-4 sm:px-6">
        <div className="-mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <ProfileAvatarMenu user={user} editable={editable} />

            <div className="min-w-0 space-y-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{user.name}</h1>
                {user.isVerified ? <BadgeCheck className="h-5 w-5 text-primary" /> : null}
              </div>
              {user.username ? (
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              ) : null}
              {user.bio ? (
                <p className="max-w-xl pt-1 text-sm leading-relaxed text-foreground/90">{user.bio}</p>
              ) : null}
            </div>
          </div>

          {editable ? (
            <div className="flex flex-wrap gap-2 sm:pb-1">
              <Button asChild variant="secondary" size="sm" className="font-semibold">
                <Link to="/profile/edit">Edit profile</Link>
              </Button>
              <Button asChild variant="outline" size="icon" className="h-9 w-9 shrink-0">
                <Link to="/profile/settings" aria-label="Settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
