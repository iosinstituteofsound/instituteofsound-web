import { useEffect, useState, type ComponentType, type SVGProps } from 'react'
import { isLucideIconName } from '@/shared/data/lucide-icon-catalog'
import { cn } from '@/shared/lib/cn'

type LucideIconComponent = ComponentType<SVGProps<SVGSVGElement>>

const iconCache = new Map<string, LucideIconComponent>()
let lucideModule: typeof import('lucide-react') | null = null

function FallbackIcon(props: SVGProps<SVGSVGElement> = {}) {
  const { className, ...rest } = props
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...rest}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

async function loadLucideIcon(name: string): Promise<LucideIconComponent> {
  const cached = iconCache.get(name)
  if (cached) return cached

  if (!lucideModule) {
    lucideModule = await import('lucide-react')
  }

  const Icon =
    (lucideModule as unknown as Record<string, LucideIconComponent | undefined>)[name] ??
    FallbackIcon
  iconCache.set(name, Icon)
  return Icon
}

type DynamicLucideIconProps = {
  name?: string | null
  className?: string
}

export function DynamicLucideIcon({ name, className }: DynamicLucideIconProps) {
  const [Icon, setIcon] = useState<LucideIconComponent>(() => FallbackIcon)

  useEffect(() => {
    if (!name || !isLucideIconName(name)) {
      setIcon(() => FallbackIcon)
      return
    }

    let cancelled = false
    void loadLucideIcon(name).then((resolved) => {
      if (!cancelled) setIcon(() => resolved)
    })

    return () => {
      cancelled = true
    }
  }, [name])

  return <Icon className={cn('shrink-0', className)} aria-hidden />
}

export { loadLucideIcon }
