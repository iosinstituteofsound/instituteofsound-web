import { createPortal } from 'react-dom'
import type { CSSProperties, ReactNode, RefObject } from 'react'
import {
  useHeaderPopoverPosition,
  type HeaderPopoverPositionOptions,
} from '@/shared/hooks/use-header-popover-position'
import { useHeaderPopoverDismiss } from '@/shared/hooks/use-header-popover-dismiss'

interface HeaderPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rootRef: RefObject<HTMLDivElement | null>
  triggerRef: RefObject<HTMLButtonElement | null>
  panelRef: RefObject<HTMLDivElement | null>
  panelClassName: string
  ariaLabel: string
  positionOptions?: HeaderPopoverPositionOptions
  onEscape?: () => void
  children: ReactNode
  panelStyle?: CSSProperties
}

export function HeaderPopover({
  open,
  onOpenChange,
  rootRef,
  triggerRef,
  panelRef,
  panelClassName,
  ariaLabel,
  positionOptions,
  onEscape,
  children,
  panelStyle: panelStyleOverride,
}: HeaderPopoverProps) {
  const panelStyle = useHeaderPopoverPosition(open, triggerRef, positionOptions)

  useHeaderPopoverDismiss(open, () => onOpenChange(false), rootRef, panelRef, { onEscape })

  if (!open) return null

  return createPortal(
    <div
      ref={panelRef}
      className={panelClassName}
      style={panelStyleOverride ?? panelStyle}
      role="dialog"
      aria-label={ariaLabel}
    >
      {children}
    </div>,
    document.body,
  )
}
