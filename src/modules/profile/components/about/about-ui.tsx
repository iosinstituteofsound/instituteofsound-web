import {
  Briefcase,
  Building2,
  Cake,
  Folder,
  Globe,
  GraduationCap,
  Heart,
  Link2,
  Lock,
  MapPin,
  Music,
  Pencil,
  Phone,
  Users,
} from 'lucide-react'
import type { AboutProfile, ProfileVisibility } from '@/modules/profile/types/about-profile.types'
import { EmptyState } from '@/shared/components/feedback/states'
import { ListRow } from '@/shared/components/layout/list-row'
import { IconButton } from '@/shared/components/ui/icon-button'
import { cn } from '@/shared/lib/cn'

export function VisibilityIcon({ visibility }: { visibility?: ProfileVisibility }) {
  if (visibility === 'private') return <Lock className="h-4 w-4 text-muted-foreground" />
  if (visibility === 'friends') return <Users className="h-4 w-4 text-muted-foreground" />
  return <Globe className="h-4 w-4 text-muted-foreground" />
}

export function AboutFieldRow({
  icon: Icon,
  label,
  value,
  subLabel,
  visibility,
  onEdit,
  editable,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label?: string
  value?: string | null
  subLabel?: string
  visibility?: ProfileVisibility
  onEdit?: () => void
  editable?: boolean
}) {
  if (!value) return null

  return (
    <ListRow className="items-start border-0 px-0 py-3 shadow-none">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {Icon ? <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" /> : null}
        <div className="min-w-0">
          <p className="text-sm font-medium">{value}</p>
          {subLabel ? <p className="text-xs text-muted-foreground">{subLabel}</p> : null}
          {label && !subLabel ? <p className="text-xs text-muted-foreground">{label}</p> : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <VisibilityIcon visibility={visibility} />
        {editable && onEdit ? (
          <IconButton
            variant="ghost"
            size="sm"
            shape="circle"
            onClick={onEdit}
            aria-label={`Edit ${label ?? value}`}
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </IconButton>
        ) : null}
      </div>
    </ListRow>
  )
}

export function AboutSectionHeader({
  title,
  description,
  onEdit,
  editable,
}: {
  title: string
  description?: string
  onEdit?: () => void
  editable?: boolean
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {editable && onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full p-2 hover:bg-muted"
          aria-label={`Edit ${title}`}
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </button>
      ) : null}
    </div>
  )
}

export function AboutEmptyHint({
  message,
  actionLabel,
  onAction,
}: {
  message: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <EmptyState
      variant="dashed"
      title=""
      description={message}
      action={
        actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {actionLabel}
          </button>
        ) : undefined
      }
    />
  )
}

export function AboutListItem({
  icon: Icon,
  primary,
  secondary,
  visibility,
  onEdit,
  editable,
}: {
  icon?: React.ComponentType<{ className?: string }>
  primary: string
  secondary?: string
  visibility?: ProfileVisibility
  onEdit?: () => void
  editable?: boolean
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3 border-b py-4 last:border-b-0')}>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {Icon ? <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" /> : null}
        <div className="min-w-0">
          <p className="text-sm font-medium">{primary}</p>
          {secondary ? <p className="mt-1 text-xs text-muted-foreground">{secondary}</p> : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <VisibilityIcon visibility={visibility} />
        {editable && onEdit ? (
          <button type="button" onClick={onEdit} className="rounded-full p-2 hover:bg-muted">
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

export const ABOUT_ICONS = {
  folder: Folder,
  mapPin: MapPin,
  building: Building2,
  graduation: GraduationCap,
  briefcase: Briefcase,
  link: Link2,
  cake: Cake,
  heart: Heart,
  music: Music,
  phone: Phone,
}

export function mergeAboutProfile(about?: AboutProfile | null): AboutProfile {
  return about ?? {}
}
