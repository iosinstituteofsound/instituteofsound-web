import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Artist } from '@/types'
import { MagazineSectionHeading } from '@/components/ui/MagazineSectionHeading'

interface BandSpotlightSectionProps {
  artists: Artist[]
}

export function BandSpotlightSection({ artists }: BandSpotlightSectionProps) {
  const bands = artists.filter((a) => a.featured).slice(0, 4)

  return (
    <section className="section-padding bg-mh-black border-t-4 border-mh-red metal-section section-perf">
      <div className="max-w-7xl mx-auto">
        <MagazineSectionHeading
          variant="metal-hammer"
          kicker="Band Report"
          title="Bands On The Rise"
          subtitle="The artists defining underground, experimental, and heavy culture right now."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {bands.map((band, i) => (
            <motion.article
              key={band.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group relative overflow-hidden bg-void border border-border mh-card-hover magazine-card-hover"
            >
              <Link to={`/artist/${band.slug}`} className="grid md:grid-cols-[1.1fr_1fr]">
                <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[280px] overflow-hidden">
                  <img
                    src={band.image}
                    alt={band.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent md:bg-gradient-to-r" />
                  {band.onTour && (
                    <span className="absolute top-4 left-4 bg-mh-red text-white text-[10px] tracking-[0.2em] uppercase px-2 py-1 font-bold">
                      On Tour
                    </span>
                  )}
                </div>

                <div className="p-6 md:p-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-border">
                  <span className="text-[10px] tracking-widest uppercase text-mh-red font-bold">
                    {band.genre}
                  </span>
                  <h3 className="font-display text-3xl md:text-4xl font-extrabold uppercase mt-2 group-hover:text-mh-red transition-colors">
                    {band.name}
                  </h3>
                  {band.newAlbum && (
                    <p className="text-sm text-signal/80 mt-2 font-medium">
                      New: <span className="text-mh-red">{band.newAlbum}</span>
                    </p>
                  )}
                  <p className="text-muted text-sm mt-3 line-clamp-2">{band.description}</p>
                  {band.label && (
                    <span className="text-[10px] tracking-widest text-muted uppercase mt-4">
                      {band.label}
                    </span>
                  )}
                  <span className="mt-5 text-xs tracking-widest uppercase font-bold text-mh-red group-hover:underline">
                    Full Band Profile →
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/discover"
            className="inline-block border-2 border-mh-red text-mh-red px-8 py-3 text-xs tracking-[0.2em] uppercase font-bold hover:bg-mh-red hover:text-white transition-colors"
          >
            All Bands →
          </Link>
        </div>
      </div>
    </section>
  )
}
