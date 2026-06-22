import type { BreadcrumbItem } from '@/shared/components/navigation/app-breadcrumb'

export const artistReleaseBreadcrumbs = {
  releases: (): BreadcrumbItem[] => [
    { label: 'Studio', href: '/artist' },
    { label: 'Releases' },
  ],
  newRelease: (): BreadcrumbItem[] => [
    { label: 'Studio', href: '/artist' },
    { label: 'Releases', href: '/artist/releases' },
    { label: 'New Release' },
  ],
  editRelease: (title: string): BreadcrumbItem[] => [
    { label: 'Studio', href: '/artist' },
    { label: 'Releases', href: '/artist/releases' },
    { label: title },
  ],
}
