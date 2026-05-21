import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SectionHeading } from '@/components/ui/SectionHeading'

const archiveLinks = [
  { label: 'All Artists', href: '/discover', code: 'ARC-001' },
  { label: 'Playlist Vault', href: '/playlists', code: 'ARC-002' },
  { label: 'Signal Feed', href: '/signals', code: 'ARC-003' },
  { label: 'Editorial Archive', href: '/features', code: 'ARC-004' },
  { label: 'Community Network', href: '/community', code: 'ARC-005' },
  { label: 'Submission Portal', href: '/submissions', code: 'ARC-006' },
]

export default function ArchivePage() {
  return (
    <div className="section-padding pt-32 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <SectionHeading
          label="Classified Access"
          title="The Archive"
          subtitle="We are not a blog. We are the future headquarters of underground music culture."
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="border border-border p-8 md:p-12 mb-12 font-mono text-sm text-muted leading-relaxed"
        >
          <p className="text-signal mb-4">MANIFESTO // IOS-2026</p>
          <p>
            Institute of Sound exists at the intersection of Rolling Stone editorial
            gravity, Boiler Room immediacy, and cyberpunk archive mystique. We document
            underground, alternative, cinematic, and experimental music scenes before
            they surface. This is a movement — not a magazine template.
          </p>
        </motion.div>

        <ul className="space-y-2">
          {archiveLinks.map((link, i) => (
            <motion.li
              key={link.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={link.href}
                className="flex items-center justify-between border border-border px-6 py-5 hover:border-neon hover:bg-surface/50 transition-all group"
              >
                <span className="font-display text-lg group-hover:text-neon transition-colors">
                  {link.label}
                </span>
                <span className="text-[10px] tracking-widest text-muted">{link.code}</span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  )
}
