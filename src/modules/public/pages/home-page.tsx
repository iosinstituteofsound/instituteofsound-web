import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { env } from '@/shared/config/env'

export function HomePage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{env.appName}</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Underground music magazine and platform — rebuilt with enterprise-grade architecture.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Button asChild size="lg">
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/auth/login">Sign in</Link>
        </Button>
      </div>
      <div className="mt-16 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Modular</CardTitle>
            <CardDescription>Feature-based architecture</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Domain-driven modules with clean separation of concerns.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Secure</CardTitle>
            <CardDescription>RBAC permission system</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Route, menu, and component-level authorization.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Type-safe</CardTitle>
            <CardDescription>Strict TypeScript + Zod</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            End-to-end type safety from API to UI forms.
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
