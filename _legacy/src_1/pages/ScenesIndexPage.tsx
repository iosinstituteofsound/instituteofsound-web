import { Link } from 'react-router-dom'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PageManifestoLine } from '@/components/ui/PageManifestoLine'
import { HubQuickLinks } from '@/components/ui/HubQuickLinks'
import { HubPageFooter } from '@/components/ui/HubPageFooter'
import { SCENE_CITIES, SCENE_GENRES } from '@/lib/discovery/sceneRegistry'
import { useSeo } from '@/hooks/useSeo'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'

const WAVE_ONE = new Set(['delhi', 'mumbai', 'bangalore', 'kolkata'])

export default function ScenesIndexPage() {
  useSeo({
    title: 'India Scenes',
    description:
      'Discover underground music by city and taste tribe — human-ranked spins, premieres, and crews. India-first scene density.',
    canonicalPath: '/scenes',
    jsonLd: breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Scenes', path: '/scenes' },
    ]),
  })

  return (
    <div className="section-padding pt-32 pb-20">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          label="Discovery"
          title="India scenes"
          subtitle="Local density before global noise. Pick a city and taste tribe — ranked by weekly dB and real premieres, not algorithms."
          titleAs="h1"
        />

        <HubQuickLinks className="mb-8" activePath="/scenes" />

        <PageManifestoLine className="mb-12">
          Discovered by people. Not machines.
        </PageManifestoLine>

        <div className="scenes-index-grid">
          {SCENE_CITIES.map((city) => (
            <section key={city.slug} className="scenes-index-city ios-card">
              <h2 className="font-display text-2xl font-bold">{city.label}</h2>
              {WAVE_ONE.has(city.slug) && (
                <p className="text-[10px] uppercase tracking-widest text-mh-red mt-1">Wave 1 hub</p>
              )}
              <ul className="scenes-index-genres mt-4">
                {SCENE_GENRES.map((genre) => (
                  <li key={genre.slug}>
                    <Link to={`/scenes/${city.slug}/${genre.slug}`} className="scenes-index-link">
                      {genre.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <HubPageFooter />
      </div>
    </div>
  )
}
