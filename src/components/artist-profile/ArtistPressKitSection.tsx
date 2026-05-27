import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ArtistProfile } from '@/lib/artist-profile/types'
import { DEFAULT_PRESS_KIT_LABEL } from '@/lib/artist-profile/types'

const sectionMotion = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
}

export function ArtistPressKitSection({ profile }: { profile: ArtistProfile }) {
  const url = profile.pressKitUrl?.trim()
  const label = profile.pressKitLabel?.trim() || DEFAULT_PRESS_KIT_LABEL

  return (
    <motion.section id="press-kit" {...sectionMotion} className="artist-site-section">
      <div className="artist-site-press-kit">
        <div className="artist-site-press-kit-icon" aria-hidden>
          <span>PDF</span>
        </div>
        <div className="artist-site-press-kit-copy">
          <p className="artist-site-eyebrow">For press & booking</p>
          <h2 className="artist-site-section-title">Electronic press kit</h2>
          <p className="artist-site-section-sub">
            {url
              ? `Official ${profile.displayName} EPK — photos, bio, and credits for media use.`
              : `Auto-generated press sheet with bio, network rank, medals, and editorial quotes.`}
          </p>
        </div>
        <div className="artist-site-press-kit-actions">
          <Link
            to={`/artist/${profile.slug}/epk`}
            className="artist-site-btn artist-site-btn-primary artist-site-press-kit-btn"
          >
            View / print IOS EPK →
          </Link>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="artist-site-btn artist-site-btn-ghost artist-site-press-kit-btn"
              download
            >
              {label}
            </a>
          )}
        </div>
      </div>
    </motion.section>
  )
}
