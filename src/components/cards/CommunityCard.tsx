import { motion } from 'framer-motion'
import type { CommunityMember } from '@/types'
import { RankBadge } from '@/components/ui/RankBadge'
import { gridItemVariants } from '@/components/ui/AnimatedGrid'
import { IOSImage } from '@/components/ui/IOSImage'

interface CommunityCardProps {
  member: CommunityMember
}

export function CommunityCard({ member }: CommunityCardProps) {
  return (
    <motion.article
      variants={gridItemVariants}
      className="flex items-center gap-4 ios-card p-5"
    >
      <IOSImage
        src={member.avatar}
        alt={member.name}
        width={112}
        height={112}
        crop="fill"
        className="w-14 h-14 rounded-full object-cover border border-border"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-bold truncate">{member.name}</h3>
        <p className="text-muted text-sm">{member.handle}</p>
        <div className="flex items-center gap-3 mt-2">
          <RankBadge rank={member.rank} />
          <span className="text-[10px] text-muted tracking-wider">
            {member.contributions} contributions
          </span>
        </div>
      </div>
    </motion.article>
  )
}
