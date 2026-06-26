import { Navigate, useLocation } from 'react-router-dom'
import { IllustratorAnalyticsPage } from '@/modules/illustrator/pages/illustrator-analytics-page'
import { IllustratorCanvasPage } from '@/modules/illustrator/pages/illustrator-canvas-page'
import { IllustratorStudioHomePage } from '@/modules/illustrator/pages/illustrator-studio-home-page'

export function IllustratorDashboardPage() {
  const location = useLocation()
  const path = location.pathname

  if (path.includes('/illustrator/profile')) {
    return <Navigate to="/profile/edit" replace />
  }
  if (path.includes('/illustrator/portfolio')) {
    return <Navigate to="/illustrator/canvas" replace />
  }
  if (path.includes('/illustrator/canvas')) return <IllustratorCanvasPage />
  if (path.includes('/illustrator/analytics')) return <IllustratorAnalyticsPage />

  return <IllustratorStudioHomePage />
}
