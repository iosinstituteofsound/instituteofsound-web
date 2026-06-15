import { Outlet } from 'react-router-dom'
import { env } from '@/shared/config/env'

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.18),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[min(100%,36rem)] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-[400px] space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <img
            src="/pwa/icon-master.svg"
            alt=""
            className="h-14 w-14 rounded-2xl shadow-lg ring-1 ring-border/60"
          />
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{env.appName}</h1>
            <p className="text-sm text-muted-foreground">Underground music culture, one login away.</p>
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  )
}
