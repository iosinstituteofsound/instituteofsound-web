import type { BreadcrumbItem } from '@/shared/components/navigation/app-breadcrumb'

export const illustratorBreadcrumbs = {
  canvas: (): BreadcrumbItem[] => [
    { label: 'Studio', href: '/illustrator' },
    { label: 'Canvas' },
  ],
  analytics: (): BreadcrumbItem[] => [
    { label: 'Studio', href: '/illustrator' },
    { label: 'Artwork analytics' },
  ],
}
