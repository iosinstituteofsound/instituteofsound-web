'use client'

import type { LucideIcon } from 'lucide-react'
import {
  Disc3,
  HeartHandshake,
  MoreHorizontal,
  ShoppingBag,
  UserRound,
  UserSquare2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ArtistProfileDto, ReleaseDto } from '@/modules/explore/types/explore.types'
import {
  releaseBuyMenuLabel,
  releaseStreamPlatform,
} from '@/modules/explore/lib/release-meta'
import { setComposeDraft } from '@/modules/feed/lib/compose-draft'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { toast } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/cn'

type ReleaseOptionsMenuProps = {
  release: ReleaseDto
  artist?: ArtistProfileDto
  triggerClassName?: string
}

function ReleaseMenuOption({
  icon: Icon,
  title,
  subtitle,
  disabled,
  onClick,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <DropdownMenuItem
      disabled={disabled}
      className="cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 focus:bg-accent"
      onClick={onClick}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 text-left">
        <p className="text-[15px] font-semibold leading-snug">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </DropdownMenuItem>
  )
}

function releasePageUrl(releaseId: string) {
  const origin = window.location.origin.replace(/\/+$/, '')
  return `${origin}/explore/releases/${releaseId}`
}

function releaseShareLine(release: ReleaseDto) {
  const artist = release.artistName ? ` — ${release.artistName}` : ''
  return `"${release.title}"${artist}`
}

export function ReleaseOptionsMenu({ release, artist, triggerClassName }: ReleaseOptionsMenuProps) {
  const navigate = useNavigate()
  const artistName = artist?.displayName ?? release.artistName ?? 'this artist'
  const platform = releaseStreamPlatform(release.streamUrl)
  const pageUrl = releasePageUrl(release.id)

  const visitArtist = () => {
    if (!artist) {
      toast.message('Artist profile is not available yet')
      return
    }
    navigate(`/profile/${artist.userId}`)
  }

  const supportArtist = () => {
    if (release.streamUrl) {
      window.open(release.streamUrl, '_blank', 'noopener,noreferrer')
      return
    }
    toast.message(`Support links for ${artistName} are coming soon`)
  }

  const buyRelease = () => {
    if (release.streamUrl && platform === 'Bandcamp') {
      window.open(release.streamUrl, '_blank', 'noopener,noreferrer')
      return
    }
    toast.message('Purchase link coming soon on IOS Wire')
  }

  const openComposer = (body: string) => {
    setComposeDraft({ body, initialType: 'music' })
    navigate('/feed')
    toast.success('Composer opened — finish your post on your profile')
  }

  const shareToProfile = () => {
    openComposer(`Sharing on my profile: ${releaseShareLine(release)}\n${pageUrl}`)
  }

  const postAsSpinOrDrop = () => {
    openComposer(`Spin or drop: ${releaseShareLine(release)}\n${pageUrl}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn('explore-release-hero__btn explore-release-hero__btn--icon', triggerClassName)}
          aria-label="Release options"
        >
          <MoreHorizontal size={16} strokeWidth={2} aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(100vw-2rem,22rem)] rounded-xl p-1.5 shadow-lg"
      >
        <ReleaseMenuOption
          icon={UserRound}
          title="Visit this artist"
          subtitle={`Open ${artistName}'s studio profile.`}
          disabled={!artist}
          onClick={visitArtist}
        />
        <ReleaseMenuOption
          icon={HeartHandshake}
          title="Support this artist"
          subtitle={
            release.streamUrl
              ? `Listen on ${platform} and support their work.`
              : 'Stream and support links coming soon.'
          }
          onClick={supportArtist}
        />
        <DropdownMenuSeparator />
        <ReleaseMenuOption
          icon={ShoppingBag}
          title={releaseBuyMenuLabel(release.type)}
          subtitle="Own the release directly from the artist."
          onClick={buyRelease}
        />
        <ReleaseMenuOption
          icon={UserSquare2}
          title="Share to profile"
          subtitle="Post this release on your profile feed."
          onClick={shareToProfile}
        />
        <ReleaseMenuOption
          icon={Disc3}
          title="Post as spin or drop"
          subtitle="Share this release as a spin or drop on your feed."
          onClick={postAsSpinOrDrop}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
