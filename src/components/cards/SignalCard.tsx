import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MetalBadge } from '@/components/ui/MetalBadge'
import type { Signal } from '@/types'
import { gridItemVariants } from '@/components/ui/AnimatedGrid'

interface SignalCardProps {
  signal: Signal
}

export function SignalCard({ signal }: SignalCardProps) {
  return (
    <motion.article
      variants={gridItemVariants}
      className="group metal-card p-6 relative overflow-hidden"
    >
      <Link to={`/signals#${signal.slug}`} className="block">
        {signal.encrypted && (
          <span className="absolute top-4 right-4">
            <MetalBadge variant="dark">Encrypted</MetalBadge>
          </span>
        )}
        <MetalBadge variant="crimson" className="mb-3">
          {signal.category}
        </MetalBadge>
        <h3 className="font-metal text-2xl text-signal group-hover:text-mh-red transition-colors">
          {signal.title}
        </h3>
        <p className="text-muted text-sm mt-3 leading-relaxed">{signal.excerpt}</p>
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/80">
          <span className="text-[10px] tracking-[0.25em] text-muted uppercase">
            {signal.timestamp}
          </span>
          <span className="text-[10px] tracking-[0.3em] text-mh-red uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">
            Decrypt →
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
