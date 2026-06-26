import type { ReactElement } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'

type StudioIconTooltipProps = {
  label: string
  shortcut?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  children: ReactElement
}

export function StudioIconTooltip({ label, shortcut, side = 'right', children }: StudioIconTooltipProps) {
  return (
    <Tooltip delayDuration={120}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={10} className="mas-tooltip">
        <span>{label}</span>
        {shortcut ? <kbd className="mas-tooltip__key">{shortcut}</kbd> : null}
      </TooltipContent>
    </Tooltip>
  )
}
