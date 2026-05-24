import { useEffect, useId, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { NavLinkGroup } from '@/lib/nav/groupLinks'
import type { NavLink } from '@/types'
import clsx from 'clsx'

interface NavDropdownProps {
  group: NavLinkGroup
  open: boolean
  onOpen: () => void
  onClose: () => void
  isLinkActive: (href: string) => boolean
  groupActive: boolean
}

function DropdownLink({
  link,
  active,
  onNavigate,
}: {
  link: NavLink
  active: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      to={link.href}
      onClick={onNavigate}
      className={clsx(
        'ios-nav-dropdown-link',
        active && 'ios-nav-dropdown-link-active',
        link.highlight && 'ios-nav-dropdown-link-highlight'
      )}
    >
      <span className="ios-nav-dropdown-link-label">{link.label}</span>
      {link.highlight && (
        <span className="ios-nav-dropdown-link-badge">
          {link.group === 'academy' ? 'New' : 'Live'}
        </span>
      )}
    </Link>
  )
}

export function NavDropdown({
  group,
  open,
  onOpen,
  onClose,
  isLinkActive,
  groupActive,
}: NavDropdownProps) {
  const panelId = useId()
  const rootRef = useRef<HTMLLIElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimer.current = setTimeout(onClose, 120)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) onClose()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, onClose])

  useEffect(() => () => clearCloseTimer(), [])

  return (
    <li
      ref={rootRef}
      className={clsx('ios-nav-dropdown', open && 'ios-nav-dropdown-open')}
      onMouseEnter={() => {
        clearCloseTimer()
        onOpen()
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={clsx(
          'ios-nav-dropdown-trigger',
          (open || groupActive) && 'ios-nav-dropdown-trigger-active'
        )}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
        onClick={() => (open ? onClose() : onOpen())}
      >
        <span>{group.label}</span>
        <svg
          className="ios-nav-dropdown-chevron"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="menu"
            className="ios-nav-dropdown-panel"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
          >
            <p className="ios-nav-dropdown-panel-kicker">{group.label}</p>
            <ul className="ios-nav-dropdown-list">
              {group.links.map((link) => (
                <li key={link.href} role="none">
                  <DropdownLink link={link} active={isLinkActive(link.href)} />
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

interface NavDrawerAccordionProps {
  group: NavLinkGroup
  expanded: boolean
  onToggle: () => void
  isLinkActive: (href: string) => boolean
  onNavigate: () => void
}

export function NavDrawerAccordion({
  group,
  expanded,
  onToggle,
  isLinkActive,
  onNavigate,
}: NavDrawerAccordionProps) {
  const groupActive = group.links.some((l) => isLinkActive(l.href))

  return (
    <div className={clsx('ios-nav-accordion', expanded && 'ios-nav-accordion-open')}>
      <button
        type="button"
        className={clsx('ios-nav-accordion-trigger', groupActive && 'ios-nav-accordion-trigger-active')}
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <span>{group.label}</span>
        <svg className="ios-nav-accordion-chevron" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="ios-nav-accordion-panel"
          >
            <ul className="ios-nav-drawer-list">
              {group.links.map((link, i) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    onClick={onNavigate}
                    className={clsx(
                      'ios-nav-drawer-link ios-nav-link',
                      isLinkActive(link.href) && 'ios-nav-link-active',
                      link.highlight && 'ios-nav-link-highlight'
                    )}
                  >
                    <span className="ios-nav-drawer-index">{String(i + 1).padStart(2, '0')}</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
