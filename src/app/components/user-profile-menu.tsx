import { Link } from 'react-router-dom'
import { ListMusic, LogOut, Monitor, Moon, Sun, UserRound } from 'lucide-react'
import { UserIdentityBadges } from '@/app/components/user-header-identity'
import { useLogout, useMe } from '@/modules/auth/hooks/use-auth'
import { useEnsureAvatarThumbnail } from '@/modules/profile/hooks/use-ensure-avatar-thumbnail'
import { CroppedAvatar } from '@/modules/profile/components/cropped-avatar'
import { getUserAvatarDisplay } from '@/shared/lib/user-avatar'
import { getProfilePath } from '@/modules/profile/config/profile-menu'
import { useTheme } from '@/shared/hooks/use-theme'
import type { ThemeMode } from '@/app/stores/theme-store'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { VerifiedUserName } from '@/shared/components/icons/verified-user-name'
import { cn } from '@/shared/lib/cn'
import '@/styles/user-profile-menu.css'

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
  useEnsureAvatarThumbnail(me?.user)
  const logout = useLogout()
  const { mode, setMode } = useTheme()

  const user = me?.user
  const authorization = me?.authorization
  const assignedRoles = authorization?.assignedRoles ?? authorization?.roles ?? []
  const activeRoleId = authorization?.activeRoleId
  const activeRole =
    assignedRoles.find((role) => role.id === activeRoleId) ?? assignedRoles[0]
  const profilePath = getProfilePath(activeRole?.slug)
  const avatarDisplay = getUserAvatarDisplay(user ?? {})

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="profile-menu-trigger">
          <CroppedAvatar
            src={avatarDisplay.src}
            alt={user?.name ?? 'User'}
            crop={avatarDisplay.crop}
            fallback={getInitials(user?.name)}
            className="h-8 w-8 rounded-full"
            size={32}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="profile-menu z-50 p-0 shadow-none"
      >
        <div className="profile-menu__glow" aria-hidden />
        <div className="profile-menu__inner">
          <div className="profile-menu__header">
            <div className="profile-menu__avatar-ring">
              <CroppedAvatar
                src={avatarDisplay.src}
                alt=""
                crop={avatarDisplay.crop}
                fallback={getInitials(user?.name)}
                className="profile-menu__avatar h-10 w-10"
                size={40}
              />
            </div>
            <div className="profile-menu__identity">
              <VerifiedUserName
                name={user?.name ?? 'User'}
                isVerified={user?.isVerified}
                className="profile-menu__name"
                nameClassName="truncate"
              />
              <p className="profile-menu__email">{user?.email ?? ''}</p>
            </div>
          </div>

          <UserIdentityBadges variant="menu" className="profile-menu__badges" />

          <div className="profile-menu__divider" role="separator" />

          <DropdownMenuItem asChild className="profile-menu__item">
            <Link to={profilePath} className="flex w-full items-center gap-2.5">
              <span className="profile-menu__item-icon">
                <UserRound className="h-4 w-4" />
              </span>
              Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="profile-menu__item">
            <Link to="/library/playlists" className="flex w-full items-center gap-2.5">
              <span className="profile-menu__item-icon">
                <ListMusic className="h-4 w-4" />
              </span>
              My Playlists
            </Link>
          </DropdownMenuItem>

          <div className="profile-menu__divider" role="separator" />

          <div>
            <p className="profile-menu__section-label">Appearance</p>
            <div className="profile-menu__theme" role="group" aria-label="Theme">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  className="profile-menu__theme-btn"
                  data-active={mode === value}
                  aria-pressed={mode === value}
                  onClick={() => setMode(value)}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="profile-menu__divider" role="separator" />

          <DropdownMenuItem
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className={cn('profile-menu__item profile-menu__signout')}
          >
            <span className="profile-menu__item-icon">
              <LogOut className="h-4 w-4" />
            </span>
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
