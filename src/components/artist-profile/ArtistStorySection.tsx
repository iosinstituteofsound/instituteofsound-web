import { motion } from 'framer-motion'
import type { ArtistBioTimelineEntry, ArtistProfile } from '@/lib/artist-profile/types'

const sectionMotion = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
}

export function hasArtistStory(
  profile: ArtistProfile,
  bioTimeline: ArtistBioTimelineEntry[]
): boolean {
  return (
    !!profile.bio?.trim() ||
    profile.influenceTags.length > 0 ||
    bioTimeline.length > 0
  )
}

export function ArtistStorySection({
  profile,
  bioTimeline,
}: {
  profile: ArtistProfile
  bioTimeline: ArtistBioTimelineEntry[]
}) {
  if (!hasArtistStory(profile, bioTimeline)) return null

  const influences = profile.influenceTags

  return (
    <motion.section id="about" {...sectionMotion} className="artist-site-section">
      <div className="artist-site-story">
        <p className="artist-site-eyebrow">The story</p>
        {profile.tagline && (
          <blockquote className="artist-site-story-quote font-serif">{profile.tagline}</blockquote>
        )}

        {profile.bio?.trim() && (
          <div className="artist-site-story-body">
            <p className="whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {influences.length > 0 && (
          <div className="artist-site-influences">
            <p className="artist-site-influences-label">Influences & sonic DNA</p>
            <ul className="artist-site-influence-tags" role="list">
              {influences.map((tag) => (
                <li key={tag} role="listitem">
                  <span className="artist-site-influence-tag">{tag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {bioTimeline.length > 0 && (
          <div className="artist-site-timeline">
            <p className="artist-site-timeline-label">Timeline</p>
            <ol className="artist-site-timeline-list">
              {bioTimeline.map((entry, i) => (
                <motion.li
                  key={entry.id}
                  className="artist-site-timeline-item"
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.45 }}
                >
                  <span className="artist-site-timeline-year">{entry.year}</span>
                  <div className="artist-site-timeline-copy">
                    <h3>{entry.title}</h3>
                    {entry.description && <p>{entry.description}</p>}
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </motion.section>
  )
}
