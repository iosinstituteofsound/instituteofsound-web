import { Award, ChevronDown, Shield } from 'lucide-react'
import { useMe } from '@/modules/auth/hooks/use-auth'
import { useSetActiveRole } from '@/modules/auth/hooks/use-active-role'
import { useMyTheme } from '@/shared/hooks/use-badge-theme'
import { cn } from '@/shared/lib/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'

interface UserIdentityBadgesProps {
  compact?: boolean
  variant?: 'default' | 'menu'
  className?: string
}

function IdentityChip({
  icon: Icon,
  label,
  title,
  variant = 'role',
  compact,
  menu,
}: {
  icon: typeof Shield
  label: string
  title: string
  variant?: 'role' | 'badge'
  compact?: boolean
  menu?: boolean
}) {
  const chip = (
    <span
      className={cn(
        menu
          ? cn(
              'profile-menu-badge',
              variant === 'role' ? 'profile-menu-badge--role' : 'profile-menu-badge--badge',
            )
          : cn(
              'inline-flex max-w-[160px] items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm',
              variant === 'role'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-accent bg-accent text-accent-foreground',
              compact && 'max-w-[120px] px-2',
            ),
      )}
    >
      <Icon className={cn('shrink-0', menu ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5')} />
      <span className="truncate">{label}</span>
    </span>
  )

  if (compact && !menu) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{chip}</TooltipTrigger>
        <TooltipContent>{title}</TooltipContent>
      </Tooltip>
    )
  }

  return chip
}

export function UserIdentityBadges({
  compact = false,
  variant = 'default',
  className,
}: UserIdentityBadgesProps) {
  const { data: me } = useMe()
  const { data: themeState } = useMyTheme()
  const setActiveRole = useSetActiveRole()
  const menu = variant === 'menu'

  const authorization = me?.authorization
  const assignedRoles = authorization?.assignedRoles ?? authorization?.roles ?? []
  const activeRoleId = authorization?.activeRoleId
  const activeRole =
    assignedRoles.find((role) => role.id === activeRoleId) ?? assignedRoles[0] ?? authorization?.roles[0]
  const badge = themeState?.source === 'badge' ? themeState.badge : null

  if (!activeRole && !badge) return null

  return (
    <div className={cn(menu ? 'profile-menu-badges' : 'flex items-center gap-2', className)}>
      {activeRole ? (
        assignedRoles.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  menu
                    ? 'profile-menu-badge profile-menu-badge--role profile-menu-role-menu'
                    : cn(
                        'inline-flex max-w-[180px] items-center gap-1 rounded-full border border-primary bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        compact && 'max-w-[130px] px-2',
                      ),
                )}
                aria-label="Switch active role"
              >
                <Shield className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{activeRole.name}</span>
                <ChevronDown className={cn('shrink-0 opacity-70', menu ? 'ml-auto h-3.5 w-3.5' : 'h-3 w-3')} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="profile-menu-panel w-52 p-1 shadow-none">
              <DropdownMenuRadioGroup
                value={activeRoleId ?? activeRole.id}
                onValueChange={(roleId) => setActiveRole.mutate(roleId)}
              >
                {assignedRoles.map((role) => (
                  <DropdownMenuRadioItem key={role.id} value={role.id} disabled={setActiveRole.isPending}>
                    {role.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <IdentityChip
            icon={Shield}
            label={activeRole.name}
            title={`Role: ${activeRole.name}`}
            variant="role"
            compact={compact}
            menu={menu}
          />
        )
      ) : null}

      {badge ? (
        <IdentityChip
          icon={Award}
          label={badge.name}
          title={`Badge: ${badge.name}`}
          variant="badge"
          compact={compact}
          menu={menu}
        />
      ) : null}
    </div>
  )
}
