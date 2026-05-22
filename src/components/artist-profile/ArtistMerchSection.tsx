import { motion } from 'framer-motion'
import type { ArtistMerchItem } from '@/lib/artist-profile/types'
import { CoverArt } from './CoverArt'

const sectionMotion = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
}

export function ArtistMerchSection({ items }: { items: ArtistMerchItem[] }) {
  if (items.length === 0) return null

  return (
    <motion.section id="merch" {...sectionMotion} className="artist-site-section">
      <div className="artist-site-section-head">
        <p className="artist-site-eyebrow">Shop</p>
        <h2 className="artist-site-section-title">Merch & store</h2>
        <p className="artist-site-section-sub">
          Official gear — opens on the artist&apos;s store.
        </p>
      </div>
      <div className="artist-site-merch-grid" role="list">
        {items.map((item, i) => (
          <motion.a
            key={item.id}
            role="listitem"
            href={item.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="artist-site-merch-card group"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
          >
            <div className="artist-site-merch-media">
              <CoverArt src={item.imageUrl} alt={item.title} size="lg" />
              <span className="artist-site-merch-external" aria-hidden>
                ↗
              </span>
            </div>
            <div className="artist-site-merch-copy">
              <h3>{item.title}</h3>
              {item.showPrice && item.priceDisplay && (
                <p className="artist-site-merch-price">{item.priceDisplay}</p>
              )}
            </div>
          </motion.a>
        ))}
      </div>
    </motion.section>
  )
}
