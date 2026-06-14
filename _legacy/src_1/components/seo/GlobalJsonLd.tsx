import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonLd'

const GLOBAL_JSON_LD = [organizationJsonLd(), websiteJsonLd()]

/** Site-wide JSON-LD — present on every page load (crawlers + rich results). */
export function GlobalJsonLd() {
  return (
    <>
      {GLOBAL_JSON_LD.map((data, index) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={`global-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </>
  )
}
