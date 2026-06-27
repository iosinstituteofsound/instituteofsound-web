import { Link } from 'react-router-dom'
import {
  Briefcase,
  Cake,
  GraduationCap,
  Home,
  Link2,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
} from 'lucide-react'
import type { AboutProfile } from '@/modules/profile/types/about-profile.types'
import type { UserDto } from '@/shared/types/auth.types'
import { PanelCard } from '@/shared/components/layout'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/cn'
import { mergeAboutProfile } from '@/modules/profile/components/about/about-ui'

type ProfileIntroSidebarProps = {
  user: UserDto
  editable?: boolean
  onEditSection?: () => void
  onSeeMoreAbout?: () => void
  onSeeAllPhotos?: () => void
}

function SidebarCard({
  title,
  editable,
  onEdit,
  children,
  action,
}: {
  title: string
  editable?: boolean
  onEdit?: () => void
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <PanelCard
      title={title}
      action={
        editable && onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full p-2 hover:bg-muted"
            aria-label={`Edit ${title}`}
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </button>
        ) : null
      }
    >
      {children}
      {action ? <div className="border-t pt-3">{action}</div> : null}
    </PanelCard>
  )
}

function SidebarRow({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 leading-snug">{children}</div>
    </div>
  )
}

function formatWorkLine(entry: NonNullable<AboutProfile['work']>[number]) {
  const dates = [entry.startDate, entry.endDate || 'Present'].filter(Boolean).join(' - ')
  return [entry.position, dates, entry.location].filter(Boolean).join(' · ')
}

export function ProfileIntroSidebar({
  user,
  editable,
  onEditSection,
  onSeeMoreAbout,
  onSeeAllPhotos,
}: ProfileIntroSidebarProps) {
  const about = mergeAboutProfile(user.aboutProfile)
  const personal = about.personalDetails
  const firstLink = about.links?.[0]
  const firstWork = about.work?.[0]
  const firstEducation =
    about.education?.university?.[0] ?? about.education?.secondarySchool?.[0] ?? null
  const photos = [user.avatarUrl, user.coverUrl].filter(Boolean) as string[]

  const hasPersonalDetails =
    personal?.currentLocation ||
    personal?.homeTown ||
    personal?.birthDate ||
    personal?.birthYear

  return (
    <div className="space-y-4">
      {hasPersonalDetails ? (
        <SidebarCard
          title="Intro"
          editable={editable}
          onEdit={onEditSection}
          action={
            onSeeMoreAbout ? (
              <button
                type="button"
                onClick={onSeeMoreAbout}
                className="w-full text-left text-sm font-semibold text-primary hover:underline"
              >
                See more about
              </button>
            ) : null
          }
        >
          {personal?.currentLocation ? (
            <SidebarRow icon={MapPin}>Lives in {personal.currentLocation}</SidebarRow>
          ) : null}
          {personal?.homeTown ? (
            <SidebarRow icon={Home}>From {personal.homeTown}</SidebarRow>
          ) : null}
          {personal?.birthDate || personal?.birthYear ? (
            <SidebarRow icon={Cake}>
              {[personal.birthDate, personal.birthYear].filter(Boolean).join(', ')}
            </SidebarRow>
          ) : null}
        </SidebarCard>
      ) : editable ? (
        <SidebarCard title="Intro" editable={editable} onEdit={onEditSection}>
          <p className="text-sm text-muted-foreground">Add personal details to your intro.</p>
        </SidebarCard>
      ) : null}

      {firstLink || user.linkUrl ? (
        <SidebarCard title="Links" editable={editable} onEdit={onEditSection}>
          <SidebarRow icon={Link2}>
            <a
              href={firstLink?.url ?? user.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="break-all text-primary hover:underline"
            >
              {firstLink?.label || firstLink?.url || user.linkUrl}
            </a>
          </SidebarRow>
        </SidebarCard>
      ) : null}

      {firstWork ? (
        <SidebarCard
          title="Work"
          editable={editable}
          onEdit={onEditSection}
          action={
            (about.work?.length ?? 0) > 1 && onSeeMoreAbout ? (
              <button
                type="button"
                onClick={onSeeMoreAbout}
                className="w-full text-left text-sm font-semibold text-primary hover:underline"
              >
                See more work
              </button>
            ) : null
          }
        >
          <SidebarRow icon={Briefcase}>
            <p className="font-semibold">{firstWork.company}</p>
            <p className="text-muted-foreground">{formatWorkLine(firstWork)}</p>
          </SidebarRow>
        </SidebarCard>
      ) : null}

      {firstEducation ? (
        <SidebarCard
          title="Education"
          editable={editable}
          onEdit={onEditSection}
          action={
            ((about.education?.university?.length ?? 0) +
              (about.education?.secondarySchool?.length ?? 0)) >
              1 && onSeeMoreAbout ? (
              <button
                type="button"
                onClick={onSeeMoreAbout}
                className="w-full text-left text-sm font-semibold text-primary hover:underline"
              >
                See more education
              </button>
            ) : null
          }
        >
          <SidebarRow icon={GraduationCap}>
            <p className="font-semibold">{firstEducation.institution}</p>
            {firstEducation.schoolYear ? (
              <p className="text-muted-foreground">School year {firstEducation.schoolYear}</p>
            ) : null}
          </SidebarRow>
        </SidebarCard>
      ) : null}

      {onSeeMoreAbout ? (
        <Card>
          <CardContent className="p-0">
            <button
              type="button"
              onClick={onSeeMoreAbout}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-muted/50"
            >
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              See more
            </button>
          </CardContent>
        </Card>
      ) : null}

      {editable ? (
        <PanelCard title="Highlights">
          <Button variant="secondary" className="w-full rounded-lg">
            <Plus className="mr-2 h-4 w-4" />
            Add highlights
          </Button>
        </PanelCard>
      ) : null}

      <PanelCard
        title="Photos"
        action={
          onSeeAllPhotos ? (
            <button
              type="button"
              onClick={onSeeAllPhotos}
              className="text-sm font-semibold text-primary hover:underline"
            >
              See all photos
            </button>
          ) : null
        }
      >
        {photos.length ? (
          <div className={cn('grid gap-1', photos.length > 1 ? 'grid-cols-3' : 'grid-cols-1')}>
            {photos.slice(0, 9).map((photo, index) => (
              <div
                key={`${photo}-${index}`}
                className={cn(
                  'overflow-hidden rounded-md bg-muted',
                  index === 0 && photos.length > 1 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square',
                )}
              >
                <img src={photo} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No photos to show.</p>
        )}
      </PanelCard>

      {editable ? (
        <Button asChild variant="secondary" className="w-full">
          <Link to="/profile/edit">Edit profile</Link>
        </Button>
      ) : null}
    </div>
  )
}
