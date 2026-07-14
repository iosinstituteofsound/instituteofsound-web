import { useMutation } from '@tanstack/react-query'
import { createTicket } from '@/modules/support/api/support.api'
import type { CreateTicketInput } from '@/modules/support/types/support.types'

export function useCreateTicket() {
  return useMutation({
    mutationFn: (input: CreateTicketInput) => createTicket(input),
  })
}
