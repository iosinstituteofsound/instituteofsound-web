import { registerMessengerCallHandlers, resetMessengerCall } from '@/modules/messenger/lib/messenger-call-controller'

let initialized = false

export function initMessengerCall(): void {
  if (initialized) return
  initialized = true
  registerMessengerCallHandlers()
}

export function teardownMessengerCall(): void {
  resetMessengerCall()
}
