import { motion } from 'framer-motion'
import type { ArtistLineupEntry } from '@/lib/artist-profile/types'
import { groupLineupByType } from '@/lib/artist-profile/lineup'

const sectionMotion = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
}

export function ArtistLineupSection({ entries }: { entries: ArtistLineupEntry[] }) {
  const groups = groupLineupByType(entries)
  if (groups.length === 0) return null

  return (
    <motion.section id="lineup" {...sectionMotion} className="artist-site-section">
      <div className="artist-site-section-head">
        <p className="artist-site-eyebrow">The unit</p>
        <h2 className="artist-site-section-title">Lineup & credits</h2>
        <p className="artist-site-section-sub">
          Who makes the sound — members, guests, and behind-the-scenes credits.
        </p>
      </div>
      <div className="artist-site-lineup">
        {groups.map((group, gi) => (
          <div key={group.type} className="artist-site-lineup-group">
            <h3 className="artist-site-lineup-group-title">{group.label}</h3>
            <ul className="artist-site-lineup-list" role="list">
              {group.items.map((entry, i) => (
                <motion.li
                  key={entry.id}
                  role="listitem"
                  className="artist-site-lineup-row"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: gi * 0.04 + i * 0.03, duration: 0.45 }}
                >
                  <span className="artist-site-lineup-name">{entry.name}</span>
                  <span className="artist-site-lineup-role">{entry.role}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
