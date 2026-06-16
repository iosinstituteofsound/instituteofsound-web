import { createPortal } from 'react-dom'
import { ArrowUp } from 'lucide-react'
import { useScrollToTop } from '@/shared/hooks/use-scroll-to-top'
import { cn } from '@/shared/lib/cn'
import type { RefObject } from 'react'
import './scroll-to-top-button.css'

export type ScrollToTopButtonProps = {
  /** Pass the scrollable container ref (e.g. dashboard `<main>`). Omit to use window scroll. */
  containerRef?: RefObject<HTMLElement | null>
  /** Show button after scrolling this many pixels */
  threshold?: number
  /** Scroll animation duration in ms */
  duration?: number
  className?: string
  /** Accessible label */
  label?: string
}

export function ScrollToTopButton({
  containerRef,
  threshold = 320,
  duration = 420,
  className,
  label = 'Scroll to top',
}: ScrollToTopButtonProps) {
  const { visible, launching, scrollToTop } = useScrollToTop({
    containerRef,
    threshold,
    duration,
  })

  if (typeof document === 'undefined') return null

  return createPortal(
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={scrollToTop}
      className={cn(
        'scroll-to-top-button',
        visible ? 'scroll-to-top-button--visible' : 'scroll-to-top-button--hidden',
        launching && 'scroll-to-top-button--launching',
        className,
      )}
    >
      <ArrowUp className="scroll-to-top-button__icon h-5 w-5" strokeWidth={2.5} aria-hidden />
    </button>,
    document.body,
  )
}
