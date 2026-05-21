import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MetalBadge } from '@/components/ui/MetalBadge'
import type { Feature } from '@/types'

interface EditorialCardProps {
  feature: Feature
  featured?: boolean
}

export function EditorialCard({ feature, featured = false }: EditorialCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`group metal-card overflow-hidden magazine-card-hover ${
        featured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      <Link to={`/feature/${feature.slug}`} className="block h-full">
        <div className={`relative overflow-hidden metal-card-frame ${featured ? 'aspect-[16/10]' : 'aspect-[16/9]'}`}>
          <img
            src={feature.image}
            alt={feature.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
          <div className="absolute top-4 left-4">
            <MetalBadge variant={featured ? 'live' : 'red'}>{feature.category}</MetalBadge>
          </div>
        </div>
        <div className={`p-6 border-t border-border/60 ${featured ? 'md:p-10' : ''}`}>
          <h3
            className={`font-metal text-signal group-hover:text-mh-red transition-colors ${
              featured ? 'text-3xl md:text-5xl' : 'text-2xl md:text-3xl'
            }`}
          >
            {feature.title}
          </h3>
          <p className="text-muted mt-3 line-clamp-2 leading-relaxed">{feature.excerpt}</p>
          <div className="flex gap-4 mt-4 text-[10px] tracking-widest uppercase text-muted">
            <span>{feature.author}</span>
            <span className="text-mh-red">†</span>
            <span>{feature.readTime}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
