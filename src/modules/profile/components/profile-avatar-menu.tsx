import { useState } from 'react'
import { ImageIcon, UserRound } from 'lucide-react'
import { ChooseProfilePictureDialog } from '@/modules/profile/components/choose-profile-picture-dialog'
import { CroppedAvatarFrame } from '@/modules/profile/components/cropped-avatar'
import { ProfilePictureViewer } from '@/modules/profile/components/profile-picture-viewer'
import { useUpdateProfile } from '@/modules/profile/hooks/use-profile'
import { addStoredUpload } from '@/modules/profile/lib/profile-photo-library'
import type { ProfileAvatarSelection } from '@/modules/profile/types/profile.types'
import { getUserAvatarDisplay, getUserAvatarFullUrl } from '@/shared/lib/user-avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import type { UserDto } from '@/shared/types/auth.types'
import { cn } from '@/shared/lib/cn'

function getInitials(name?: string) {
  if (!name?.trim()) return 'U'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

type ProfileAvatarMenuProps = {
  user: UserDto
  editable?: boolean
  className?: string
  avatarClassName?: string
}

export function ProfileAvatarMenu({
  user,
  editable = true,
  className,
  avatarClassName,
}: ProfileAvatarMenuProps) {
  const updateProfile = useUpdateProfile()
  const [viewerOpen, setViewerOpen] = useState(false)
  const [chooseOpen, setChooseOpen] = useState(false)
  const [recentUrls, setRecentUrls] = useState<string[]>([])

  const handleSelect = async ({ avatarUrl, avatarThumbnailUrl, avatarCrop }: ProfileAvatarSelection) => {
    await updateProfile.mutateAsync({ avatarUrl, avatarThumbnailUrl, avatarCrop })
    addStoredUpload(user.id, avatarUrl)
    setRecentUrls((prev) => [avatarUrl, ...prev.filter((u) => u !== avatarUrl)].slice(0, 12))
  }

  const avatarSize = 144
  const avatarDisplay = getUserAvatarDisplay(user)
  const fullAvatarUrl = getUserAvatarFullUrl(user)

  const avatar = (
    <CroppedAvatarFrame
      src={avatarDisplay.src}
      alt={user.name}
      crop={avatarDisplay.crop}
      size={avatarSize}
      className={cn(
        'h-36 w-36 border-4 border-card shadow-lg',
        editable &&
          'cursor-pointer ring-offset-2 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        avatarClassName,
      )}
    >
      {!avatarDisplay.src ? (
        <span className="flex h-full w-full items-center justify-center bg-muted text-2xl font-medium text-muted-foreground">
          {getInitials(user.name)}
        </span>
      ) : null}
    </CroppedAvatarFrame>
  )

  if (!editable) {
    return (
      <div className={className}>
        <button
          type="button"
          className="rounded-full"
          disabled={!fullAvatarUrl}
          onClick={() => fullAvatarUrl && setViewerOpen(true)}
        >
          {avatar}
        </button>
        {fullAvatarUrl ? (
          <ProfilePictureViewer
            open={viewerOpen}
            onOpenChange={setViewerOpen}
            user={user}
            imageUrl={fullAvatarUrl}
            editable={false}
          />
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn('relative w-fit', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="rounded-full outline-none"
            aria-label="Profile picture options"
          >
            {avatar}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="bottom"
          sideOffset={8}
          className="w-56 rounded-xl p-1.5 shadow-lg"
        >
          <DropdownMenuItem
            className="gap-3 rounded-lg py-2.5 text-[15px] font-medium"
            disabled={!fullAvatarUrl}
            onClick={() => setViewerOpen(true)}
          >
            <UserRound className="h-5 w-5 text-muted-foreground" />
            See profile picture
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-3 rounded-lg py-2.5 text-[15px] font-medium"
            onClick={() => setChooseOpen(true)}
          >
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            Choose profile picture
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {fullAvatarUrl ? (
        <ProfilePictureViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          user={user}
          imageUrl={fullAvatarUrl}
          editable={editable}
        />
      ) : null}

      <ChooseProfilePictureDialog
        open={chooseOpen}
        onOpenChange={setChooseOpen}
        currentUrl={user.avatarUrl}
        currentCrop={user.avatarCrop}
        recentUrls={recentUrls}
        onSelect={handleSelect}
      />
    </div>
  )
}
