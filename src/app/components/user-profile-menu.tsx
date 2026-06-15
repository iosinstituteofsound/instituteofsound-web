import { Link } from 'react-router-dom'
import { LogOut, Monitor, Moon, Sun, UserRound } from 'lucide-react'
import { UserIdentityBadges } from '@/app/components/user-header-identity'
import { useLogout, useMe } from '@/modules/auth/hooks/use-auth'
import { CroppedAvatar } from '@/modules/profile/components/cropped-avatar'
import { getProfilePath } from '@/modules/profile/config/profile-menu'
import { useTheme } from '@/shared/hooks/use-theme'
import type { ThemeMode } from '@/app/stores/theme-store'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

function getInitials(name?: string) {
  if (!name?.trim()) return 'U'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part.charAt(0).toUpperCase()).join('')
}

const themeOptions: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function UserProfileMenu() {
  const { data: me } = useMe()
  const logout = useLogout()
  const { mode, setMode } = useTheme()

  const user = me?.user
  const activeRoleId = me?.authorization.activeRoleId
  const activeRole = me?.authorization.roles.find((role) => role.id === activeRoleId)
  const profilePath = getProfilePath(activeRole?.slug)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full px-0">
          <CroppedAvatar
            src={user?.avatarUrl}
            alt={user?.name ?? 'User'}
            crop={user?.avatarCrop}
            fallback={getInitials(user?.name)}
            className="h-8 w-8"
            size={32}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="space-y-1">
              <p className="truncate text-sm font-medium leading-none">{user?.name ?? 'User'}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email ?? ''}</p>
            </div>
            <UserIdentityBadges />
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={profilePath}>
            <UserRound className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sun className="h-4 w-4" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={mode} onValueChange={(value) => setMode(value as ThemeMode)}>
              {themeOptions.map(({ value, label }) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
