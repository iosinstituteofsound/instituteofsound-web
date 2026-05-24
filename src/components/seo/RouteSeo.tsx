import { useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { getStaticRouteSeo } from '@/lib/seo/staticRoutes'
import { useSeo } from '@/hooks/useSeo'

/** Applies static route SEO from the pathname (tools, academy, hub pages). */
export function RouteSeo() {
  const { pathname } = useLocation()
  const config = useMemo(() => getStaticRouteSeo(pathname), [pathname])
  useSeo(config)
  return null
}
