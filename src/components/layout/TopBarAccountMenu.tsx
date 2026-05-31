import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { homeDashboardPath, roleLabel } from '@/lib/auth/roles'
import { memberHandleFromUser } from '@/lib/community/memberProfileService'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { fetchPublishedArtistMetaForUserId } from '@/lib/artist-profile/networkLink'
import { listManagedArtistsByHandle } from '@/lib/artist-profile/service'

function topBarProfileName(name: string): string {
  const trimmed = name.trim()
  if (trimmed.length <= 30) return trimmed
  return `${trimmed.slice(0, 28)}…`
}

type ManagedPage = {
  profileId: string
  slug: string
  displayName: string
  avatarUrl?: string
}

export function TopBarAccountMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [pages, setPages] = useState<ManagedPage[]>([])
  const [primarySlug, setPrimarySlug] = useState<string | null>(null)

  const loadPages = useCallback(async () => {
    if (!user) return
    const handle = memberHandleFromUser(user)
    const [meta, managed] = await Promise.all([
      fetchPublishedArtistMetaForUserId(user.id),
      listManagedArtistsByHandle(handle),
    ])
    setPrimarySlug(meta?.slug ?? null)
    setPages(
      managed.map((a) => ({
        profileId: a.profileId,
        slug: a.slug,
        displayName: a.displayName,
        avatarUrl: a.avatarUrl,
      })),
    )
  }, [user])

  useEffect(() => {
    if (!open || !user) return
    void loadPages()
  }, [open, user, loadPages])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
    }
  }, [open])

  if (!user) {
    return (
      <Link to="/login" className="v2-topbar-profile v2-topbar-profile--guest ml-0.5">
        <div className="v2-topbar-profile__avatar">?</div>
        <div className="v2-topbar-profile__copy hidden sm:block">
          <p className="v2-topbar-profile__name">Guest</p>
          <p className="v2-topbar-profile__sub">Sign in →</p>
        </div>
      </Link>
    )
  }

  const profileLabel = topBarProfileName(user.name || 'Your desk')
  const networkHandle = memberHandleFromUser(user)
  const dashboardPath = homeDashboardPath(user.role)
  const networkPath = networkProfilePath(networkHandle)
  const pagePath = primarySlug
    ? `/artist/${primarySlug}`
    : user.role === 'artist'
      ? '/artist/dashboard'
      : null

  const close = () => setOpen(false)

  const onLogout = async () => {
    close()
    await logout()
    navigate('/')
  }

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      hint: 'Your desk',
      to: dashboardPath,
      icon: <IconGrid />,
    },
    {
      id: 'network',
      label: 'Network profile',
      hint: `@${networkHandle}`,
      to: networkPath,
      icon: <IconSignal />,
    },
    ...(pagePath
      ? [
          {
            id: 'page',
            label: 'Page',
            hint: primarySlug ? `/${primarySlug}` : 'Your artist page',
            to: pagePath,
            icon: <IconPage />,
          },
        ]
      : []),
    {
      id: 'support',
      label: 'Support',
      hint: 'Help & contact',
      to: '/contact',
      icon: <IconHelp />,
    },
    {
      id: 'report',
      label: 'Report a problem',
      hint: 'Tell the desk',
      to: '/contact?report=1',
      icon: <IconReport />,
    },
  ]

  return (
    <div ref={rootRef} className="v2-account-menu ml-0.5">
      <button
        type="button"
        className={clsx('v2-topbar-profile', open && 'v2-topbar-profile--open')}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="v2-topbar-profile__avatar">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            profileLabel.charAt(0).toUpperCase()
          )}
        </div>
        <div className="v2-topbar-profile__copy hidden sm:block">
          <p className="v2-topbar-profile__name">{profileLabel}</p>
          <p className="v2-topbar-profile__sub">Dashboard</p>
        </div>
        <ChevronIcon className={clsx('v2-topbar-profile__chev hidden sm:block', open && 'is-open')} />
      </button>

      {open && (
        <div id={menuId} className="v2-account-menu__panel" role="menu">
          <div className="v2-account-menu__hero">
            <p className="v2-account-menu__kicker">Signed in as</p>
            <div className="v2-account-menu__identity v2-account-menu__identity--active">
              <span className="v2-account-menu__avatar">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  profileLabel.charAt(0)
                )}
              </span>
              <span className="v2-account-menu__who">
                <strong>{user.name}</strong>
                <span>
                  {roleLabel(user.role)} · @{networkHandle}
                </span>
              </span>
              <span className="v2-account-menu__active-ring" aria-hidden />
            </div>

            {pages.length > 0 && (
              <ul className="v2-account-menu__pages">
                {pages.slice(0, 4).map((page) => (
                  <li key={page.profileId}>
                    <Link
                      to={`/artist/${page.slug}`}
                      className="v2-account-menu__identity"
                      role="menuitem"
                      onClick={close}
                    >
                      <span className="v2-account-menu__avatar v2-account-menu__avatar--page">
                        {page.avatarUrl ? (
                          <img src={page.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          page.displayName.charAt(0)
                        )}
                        <span className="v2-account-menu__switch" aria-hidden>
                          <IconSwitch />
                        </span>
                      </span>
                      <span className="v2-account-menu__who">
                        <strong>{page.displayName}</strong>
                        <span>Artist page</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {pages.length > 4 && (
              <Link
                to="/artist/dashboard"
                className="v2-account-menu__all-pages"
                onClick={close}
              >
                See all pages
              </Link>
            )}
          </div>

          <ul className="v2-account-menu__list">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.to}
                  className="v2-account-menu__item"
                  role="menuitem"
                  onClick={close}
                >
                  <span className="v2-account-menu__item-icon">{item.icon}</span>
                  <span className="v2-account-menu__item-copy">
                    <strong>{item.label}</strong>
                    <span>{item.hint}</span>
                  </span>
                  <ChevronIcon className="v2-account-menu__item-chev" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="v2-account-menu__foot">
            <button type="button" className="v2-account-menu__logout" role="menuitem" onClick={onLogout}>
              <span className="v2-account-menu__item-icon v2-account-menu__item-icon--logout">
                <IconLogout />
              </span>
              <span className="v2-account-menu__item-copy">
                <strong>Log out</strong>
                <span>End session</span>
              </span>
            </button>
            <p className="v2-account-menu__legal">
              <Link to="/privacy" onClick={close}>
                Privacy
              </Link>
              <span aria-hidden>·</span>
              <Link to="/terms" onClick={close}>
                Terms
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
    </svg>
  )
}

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
    </svg>
  )
}

function IconSignal() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" d="M4 18v-3M8 18V9M12 18V5M16 18v-6M20 18v-9" />
    </svg>
  )
}

function IconPage() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path strokeLinecap="round" d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  )
}

function IconHelp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M9.5 9.5a2.5 2.5 0 114.2 1.5c-.8.6-1.2 1.2-1.2 2.2" />
      <circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconReport() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" d="M12 3v2M5 6l1.5 1.5M19 6l-1.5 1.5" />
      <path strokeLinecap="round" d="M6 14c0-3.3 2.7-6 6-6s6 2.7 6 6v4H6v-4z" />
      <path strokeLinecap="round" d="M9 21h6" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" d="M15 12H4M12 8l4 4-4 4" />
      <path strokeLinecap="round" d="M20 4v16" />
    </svg>
  )
}

function IconSwitch() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a4 4 0 100 8 4 4 0 000-8zm-7 18c0-3.3 3.1-6 7-6s7 2.7 7 6H5z" opacity={0.35} />
      <path d="M16 10h5v2h-5v3l-4-4 4-4v3z" />
    </svg>
  )
}
