import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { env } from '@/shared/config/env'

function routeErrorMessage(error: unknown) {
  if (isRouteErrorResponse(error)) {
    return typeof error.data === 'string' ? error.data : error.statusText
  }
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return undefined
}

export function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold">403</h1>
      <p className="text-muted-foreground">You do not have permission to access this page.</p>
      <Button asChild>
        <Link to="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Button asChild>
        <Link to="/">Go Home</Link>
      </Button>
    </div>
  )
}

export function ErrorPage() {
  const error = useRouteError()
  const details = routeErrorMessage(error)

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-4xl font-bold">500</h1>
      <p className="text-muted-foreground">Something went wrong. Please try again later.</p>
      {env.isDev && details ? (
        <pre className="max-w-xl overflow-x-auto rounded-lg border bg-muted/40 p-4 text-left text-xs text-destructive">
          {details}
        </pre>
      ) : null}
      <Button asChild>
        <Link to="/">Go Home</Link>
      </Button>
    </div>
  )
}
