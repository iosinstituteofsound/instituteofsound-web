import { SITE_NAME, absoluteUrl, defaultOgImage, pathUrl } from '@/lib/seo/urls'
import type { JsonLdObject } from '@/lib/seo/types'

export function organizationJsonLd(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: absoluteUrl('/'),
    logo: defaultOgImage(),
    description:
      'Underground music magazine — reviews, features, artist profiles, production academy, and studio tools.',
  }
}

export function websiteJsonLd(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: absoluteUrl('/'),
    description:
      'Underground music culture — editorial features, discover artists, playlists, and free production education.',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: pathUrl(item.path),
    })),
  }
}

export function articleJsonLd(input: {
  headline: string
  description: string
  path: string
  image?: string
  author?: string
  section?: string
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    url: pathUrl(input.path),
    image: input.image
      ? [input.image.startsWith('http') ? input.image : absoluteUrl(input.image)]
      : [defaultOgImage()],
    author: input.author
      ? { '@type': 'Person', name: input.author }
      : { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: defaultOgImage() },
    },
    articleSection: input.section,
    mainEntityOfPage: pathUrl(input.path),
  }
}

export function learningResourceJsonLd(input: {
  name: string
  description: string
  path: string
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: input.name,
    description: input.description,
    url: pathUrl(input.path),
    isAccessibleForFree: true,
    learningResourceType: 'Lesson',
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: absoluteUrl('/'),
    },
  }
}

export function courseJsonLd(input: {
  name: string
  description: string
  path: string
  lessonCount: number
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: input.name,
    description: input.description,
    url: pathUrl(input.path),
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: `P${input.lessonCount}L`,
    },
  }
}

export function musicGroupJsonLd(input: {
  name: string
  description: string
  path: string
  image?: string
  genre?: string
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: input.name,
    description: input.description,
    url: pathUrl(input.path),
    image: input.image,
    genre: input.genre,
  }
}

export function webApplicationJsonLd(input: {
  name: string
  description: string
  path: string
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: input.name,
    description: input.description,
    url: pathUrl(input.path),
    applicationCategory: 'MusicApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }
}
