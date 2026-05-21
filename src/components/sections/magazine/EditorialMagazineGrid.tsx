import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Feature } from '@/types'
import { MagazineSectionHeading } from '@/components/ui/MagazineSectionHeading'

interface EditorialMagazineGridProps {
  features: Feature[]
}

export function EditorialMagazineGrid({ features }: EditorialMagazineGridProps) {
  const [lead, second, third, ...rest] = features

  return (
    <section className="section-padding border-t border-border">
      <div className="max-w-7xl mx-auto">
        <MagazineSectionHeading
          variant="rolling-stone"
          kicker="Long Read"
          title="Features & Culture"
          subtitle="Deep interviews, scene reports, and the ideas behind the music."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {lead && (
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7 group magazine-card-hover"
            >
              <Link to={`/feature/${lead.slug}`} className="block">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={lead.image}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
                <div className="pt-6 border-b border-border pb-8">
                  <span className="text-[11px] tracking-[0.2em] uppercase text-rs-red font-semibold">
                    {lead.category}
                  </span>
                  <h3 className="font-serif text-3xl md:text-5xl font-bold mt-3 leading-tight group-hover:text-rs-red transition-colors">
                    {lead.title}
                  </h3>
                  <p className="text-muted text-base md:text-lg mt-4 leading-relaxed max-w-2xl">
                    {lead.excerpt}
                  </p>
                  <p className="text-sm text-muted mt-4">
                    {lead.author} · {lead.readTime}
                  </p>
                </div>
              </Link>
            </motion.article>
          )}

          <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8">
            {[second, third].filter(Boolean).map((feature) => (
              <motion.article
                key={feature!.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group magazine-card-hover flex gap-4 md:gap-5"
              >
                <Link
                  to={`/feature/${feature!.slug}`}
                  className="flex gap-4 md:gap-5 flex-1"
                >
                  <div className="w-32 md:w-40 shrink-0 aspect-[4/5] overflow-hidden">
                    <img
                      src={feature!.image}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 py-1 border-b border-border">
                    <span className="text-[10px] tracking-widest uppercase text-rs-red">
                      {feature!.category}
                    </span>
                    <h3 className="font-serif text-xl md:text-2xl font-bold mt-2 leading-snug group-hover:text-rs-red transition-colors">
                      {feature!.title}
                    </h3>
                    <p className="text-muted text-sm mt-2 line-clamp-3">
                      {feature!.excerpt}
                    </p>
                    <p className="text-xs text-muted mt-3">
                      {feature!.readTime}
                    </p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>

        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8 pt-8 border-t border-border">
            {rest.map((feature) => (
              <motion.article
                key={feature.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group magazine-card-hover"
              >
                <Link to={`/feature/${feature.slug}`}>
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={feature.image}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="pt-4">
                    <span className="text-[10px] tracking-widest uppercase text-rs-red">
                      {feature.category}
                    </span>
                    <h3 className="font-serif text-xl font-bold mt-2 group-hover:text-rs-red transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted mt-2 line-clamp-2">
                      {feature.excerpt}
                    </p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/features"
            className="inline-block border-b-2 border-rs-red text-rs-red pb-1 text-xs tracking-[0.2em] uppercase font-bold hover:text-signal hover:border-signal transition-colors"
          >
            All Features →
          </Link>
        </div>
      </div>
    </section>
  )
}
