import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorState } from '@/shared/components/feedback/states'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  message?: string
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AppErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <ErrorState
            title="Application error"
            message={this.state.message}
            onRetry={() => this.setState({ hasError: false, message: undefined })}
          />
        )
      )
    }
    return this.props.children
  }
}
