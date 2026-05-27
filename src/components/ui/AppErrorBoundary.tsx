import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/** Prevents a blank white screen when a child throws during render */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App render error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[var(--color-void)]">
          <p className="text-[10px] tracking-[0.25em] uppercase text-mh-red font-bold">
            Something broke
          </p>
          <h1 className="font-display text-2xl font-bold uppercase mt-3 max-w-md">
            Page failed to load
          </h1>
          <p className="text-sm text-muted mt-3 max-w-md">{this.state.error.message}</p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <button
              type="button"
              className="ios-btn ios-btn-primary !text-xs"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
            <Link to="/" className="ios-btn ios-btn-secondary !text-xs">
              Home
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
