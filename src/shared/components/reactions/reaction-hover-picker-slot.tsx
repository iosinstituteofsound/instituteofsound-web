import type { ReactNode, RefObject } from 'react'
import { ReactionPicker, type ReactionPickerSize } from '@/shared/components/reactions/reaction-picker'
import type { ReactionKind } from '@/shared/lib/reactions/reaction-options'

interface ReactionHoverPickerSlotProps {
  pickerOpen: boolean
  anchorRef: RefObject<HTMLElement | null>
  containerRef?: RefObject<HTMLDivElement | null>
  myReaction?: ReactionKind | null
  disabled?: boolean
  size?: ReactionPickerSize
  onSelect: (kind: ReactionKind) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  children: ReactNode
  className?: string
}

export function ReactionHoverPickerSlot({
  pickerOpen,
  anchorRef,
  containerRef,
  myReaction,
  disabled,
  size = 'default',
  onSelect,
  onMouseEnter,
  onMouseLeave,
  children,
  className,
}: ReactionHoverPickerSlotProps) {
  return (
    <div
      ref={containerRef}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {pickerOpen ? (
        <ReactionPicker
          open={pickerOpen}
          anchorRef={anchorRef}
          myReaction={myReaction}
          disabled={disabled}
          size={size}
          onSelect={onSelect}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      ) : null}
      {children}
    </div>
  )
}
