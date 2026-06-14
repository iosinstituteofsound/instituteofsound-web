import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Signal } from '@/types'
import { gridItemVariants } from '@/components/ui/AnimatedGrid'

interface SignalCardProps {
  signal: Signal
}

export function SignalCard({ signal }: SignalCardProps) {
  return (
    <motion.article
      variants={gridItemVariants}
      className="group ios-card p-6 relative overflow-hidden"
    >
      <Link to={`/signals#${signal.slug}`} className="block">
        {signal.encrypted && (
          <span className="absolute top-4 right-4 metal-badge metal-badge-live">Encrypted</span>
        )}
        <span className="text-[10px] tracking-[0.25em] text-crimson uppercase">
          {signal.category}
        </span>
        <h3 className="font-display text-xl font-extrabold mt-3 group-hover:text-mh-red transition-colors uppercase">
          {signal.title}
        </h3>
        <p className="text-muted text-sm mt-3 leading-relaxed">{signal.excerpt}</p>
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
          <span className="text-[10px] tracking-widest text-muted uppercase">
            {signal.timestamp}
          </span>
          <span className="text-xs text-mh-red opacity-0 group-hover:opacity-100 transition-opacity ios-link-arrow">
            Decrypt
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
