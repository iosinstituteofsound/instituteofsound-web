import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/cn'

interface PanelCardProps {
  title: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function PanelCard({ title, action, children, className, contentClassName }: PanelCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent className={cn('pt-0', contentClassName)}>{children}</CardContent>
    </Card>
  )
}
