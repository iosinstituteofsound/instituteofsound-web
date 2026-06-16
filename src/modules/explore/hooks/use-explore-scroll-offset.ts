import { useEffect, useState } from 'react'

function measureExploreScrollOffset(fallback = 96) {
  if (typeof document === 'undefined') return fallback

  const dashboardHeader = document.querySelector('.dashboard-header')
  if (dashboardHeader) {
    return Math.round(dashboardHeader.getBoundingClientRect().height + 16)
  }

  const publicHeader = document.querySelector('.min-h-screen.bg-background > header')
  if (publicHeader) {
    return Math.round(publicHeader.getBoundingClientRect().height + 16)
  }

  return 24
}

export function useExploreScrollOffset(fallback = 96) {
  const [offset, setOffset] = useState(fallback)

  useEffect(() => {
    const update = () => setOffset(measureExploreScrollOffset(fallback))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [fallback])

  return offset
}
