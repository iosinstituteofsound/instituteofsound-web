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
      className="group border border-border p-6 bg-surface/50 card-hover relative overflow-hidden"
    >
      <Link to={`/signals#${signal.slug}`} className="block">
        {signal.encrypted && (
          <span className="absolute top-4 right-4 text-[10px] tracking-widest text-neon/60 uppercase">
            [encrypted]
          </span>
        )}
        <span className="text-[10px] tracking-[0.25em] text-crimson uppercase">
          {signal.category}
        </span>
        <h3 className="font-display text-xl font-bold mt-3 group-hover:text-neon transition-colors">
          {signal.title}
        </h3>
        <p className="text-muted text-sm mt-3 leading-relaxed">{signal.excerpt}</p>
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
          <span className="text-[10px] tracking-widest text-muted uppercase">
            {signal.timestamp}
          </span>
          <span className="text-xs text-neon opacity-0 group-hover:opacity-100 transition-opacity">
            DECRYPT →
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
