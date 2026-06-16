import { cn } from '@/shared/lib/cn'
import { resolveScrollContainerForIds } from '@/shared/lib/get-scroll-parent'
import { scrollToSectionId } from '@/shared/lib/scroll-to-element'
import { useActiveSection } from '@/shared/hooks/use-active-section'
import './sticky-section-nav.css'

export type SectionNavItem = {
  id: string
  label: string
  /** Display index, e.g. 1 → "01". */
  index?: number
  /** Explicit section number label (overrides index). */
  number?: string
}

export type StickySectionNavProps = {
  items: SectionNavItem[]
  /** Sidebar heading, e.g. "On this page". */
  heading?: string
  /** Show section numbers beside labels. */
  showNumbers?: boolean
  /** Accessible name for the navigation landmark. */
  ariaLabel?: string
  /** Pixels subtracted from scroll target (sticky headers). */
  scrollOffset?: number
  /** Scroll animation duration in ms. */
  scrollDuration?: number
  className?: string
  /** Controlled active section id. */
  activeId?: string | null
  /** Disable scroll-spy (e.g. while loading). */
  disabled?: boolean
}

function formatSectionNumber(item: SectionNavItem, position: number) {
  if (item.number) return item.number
  const value = item.index ?? position
  return String(value).padStart(2, '0')
}

export function StickySectionNav({
  items,
  heading = 'On this page',
  showNumbers = true,
  ariaLabel = 'Page sections',
  scrollOffset = 96,
  scrollDuration = 620,
  className,
  activeId: controlledActiveId,
  disabled = false,
}: StickySectionNavProps) {
  const sectionIds = items.map((item) => item.id)
  const { activeId: spyActiveId, lockActive } = useActiveSection(sectionIds, {
    disabled,
    offsetPx: scrollOffset,
  })
  const activeId = controlledActiveId ?? spyActiveId

  if (items.length < 2) return null

  const handleClick = (id: string) => {
    lockActive(id, scrollDuration + 240)
    scrollToSectionId(id, {
      offset: scrollOffset,
      duration: scrollDuration,
      container: resolveScrollContainerForIds(sectionIds),
    })
  }

  return (
    <nav className={cn('sticky-section-nav', className)} aria-label={ariaLabel}>
      {heading ? <p className="sticky-section-nav__heading">{heading}</p> : null}

      <ul className="sticky-section-nav__list">
        {items.map((item, index) => {
          const isActive = activeId === item.id

          return (
            <li key={item.id} className="sticky-section-nav__item">
              <button
                type="button"
                className={cn('sticky-section-nav__link', isActive && 'is-active')}
                onClick={() => handleClick(item.id)}
                aria-current={isActive ? 'location' : undefined}
              >
                <span className="sticky-section-nav__fx" aria-hidden>
                  <span className="sticky-section-nav__ambient" />
                  <span className="sticky-section-nav__sheen" />
                </span>
                <span className="sticky-section-nav__content">
                  {showNumbers ? (
                    <span className="sticky-section-nav__num">
                      {formatSectionNumber(item, index + 1)}
                    </span>
                  ) : null}
                  <span className="sticky-section-nav__label">{item.label}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
