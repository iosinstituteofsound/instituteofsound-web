import type { ReactNode } from 'react'
import { EmptyState } from '@/shared/components/feedback/states'

type ProfileTabEmptyProps = {
  message: string
  action?: ReactNode
}

export function ProfileTabEmpty({ message, action }: ProfileTabEmptyProps) {
  return <EmptyState variant="card" title="" description={message} action={action} />
}
