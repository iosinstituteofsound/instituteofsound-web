import type { ReactNode } from 'react'
import { Card, CardContent } from '@/shared/components/ui/card'

type ProfileTabEmptyProps = {
  message: string
  action?: ReactNode
}

export function ProfileTabEmpty({ message, action }: ProfileTabEmptyProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center text-sm text-muted-foreground">
        <p>{message}</p>
        {action}
      </CardContent>
    </Card>
  )
}
