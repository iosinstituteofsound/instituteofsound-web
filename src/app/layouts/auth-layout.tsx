import { Outlet } from 'react-router-dom'
import { env } from '@/shared/config/env'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{env.appName}</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
