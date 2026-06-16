import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minus,
  Plus,
  Search,
  X,
} from 'lucide-react'
import { getUserAvatarThumbnailUrl } from '@/shared/lib/user-avatar'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import type { UserDto } from '@/shared/types/auth.types'

function getInitials(name?: string) {
  if (!name?.trim()) return 'U'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

type ProfilePictureViewerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserDto
  imageUrl: string
  editable?: boolean
}

export function ProfilePictureViewer({
  open,
  onOpenChange,
  user,
  imageUrl,
  editable = true,
}: ProfilePictureViewerProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onOpenChange])

  if (!open) return null

  const updatedLabel = new Date(user.createdAt).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#0a0a0a] text-white">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-white hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          <span className="hidden text-sm font-semibold sm:inline">Profile picture</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-white hover:bg-white/10"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-white hover:bg-white/10"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden h-9 w-9 rounded-full text-white hover:bg-white/10 sm:inline-flex"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden h-9 w-9 rounded-full text-white hover:bg-white/10 sm:inline-flex"
            aria-label="Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black p-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 sm:left-4"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <img
            src={imageUrl}
            alt={`${user.name}'s profile picture`}
            className="max-h-full max-w-full object-contain"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 sm:right-4 lg:hidden"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <aside className="flex w-full shrink-0 flex-col border-t border-white/10 bg-[#0a0a0a] lg:w-[360px] lg:border-l lg:border-t-0">
          <div className="border-b border-white/10 p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                {getUserAvatarThumbnailUrl(user) ? (
                  <AvatarImage src={getUserAvatarThumbnailUrl(user)} alt={user.name} />
                ) : null}
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">{user.name}</p>
                <p className="text-xs text-white/60">Profile picture · {updatedLabel}</p>
              </div>
            </div>
            {editable ? (
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="mt-3 w-full bg-white/10 font-semibold text-white hover:bg-white/15"
              >
                <Link to="/profile/edit" onClick={() => onOpenChange(false)}>
                  Edit
                </Link>
              </Button>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-sm text-white/50">
            <p>Profile picture</p>
          </div>
        </aside>
      </div>
    </div>,
    document.body,
  )
}
