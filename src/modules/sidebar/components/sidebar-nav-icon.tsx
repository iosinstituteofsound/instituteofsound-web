import { DynamicLucideIcon } from '@/shared/lib/dynamic-lucide-icon'
import { cn } from '@/shared/lib/cn'

const SIZE_CLASS = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  nav: 'h-6 w-6',
  lg: 'h-9 w-9',
} as const

type SidebarNavIconProps = {
  icon?: string | null
  className?: string
  size?: keyof typeof SIZE_CLASS
}

export function SidebarNavIcon({ icon, className, size = 'md' }: SidebarNavIconProps) {
  return <DynamicLucideIcon name={icon} className={cn(SIZE_CLASS[size], className)} />
}
