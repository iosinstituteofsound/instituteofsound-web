import { motion } from 'framer-motion'
import type { CommunityMember } from '@/types'
import { RankBadge } from '@/components/ui/RankBadge'
import { gridItemVariants } from '@/components/ui/AnimatedGrid'

interface CommunityCardProps {
  member: CommunityMember
}

export function CommunityCard({ member }: CommunityCardProps) {
  return (
    <motion.article
      variants={gridItemVariants}
      className="flex items-center gap-4 metal-card p-5"
    >
      <div
        className="shrink-0 w-14 h-14 overflow-hidden border-2 border-mh-red/30"
        style={{ clipPath: 'polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)' }}
      >
        <img
          src={member.avatar}
          alt={member.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-bold truncate group-hover:text-mh-red transition-colors">
          {member.name}
        </h3>
        <p className="text-muted text-sm">{member.handle}</p>
        <div className="flex items-center gap-3 mt-2">
          <RankBadge rank={member.rank} />
          <span className="text-[10px] text-muted tracking-wider uppercase">
            {member.contributions} contributions
          </span>
        </div>
      </div>
    </motion.article>
  )
}
