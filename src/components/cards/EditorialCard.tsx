import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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
      className={`group relative overflow-hidden ios-card ${
        featured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      <Link to={`/feature/${feature.slug}`} className="block h-full">
        <div className={`relative overflow-hidden ${featured ? 'aspect-[16/10]' : 'aspect-[16/9]'}`}>
          <img
            src={feature.image}
            alt={feature.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />
        </div>
        <div className={`p-6 ${featured ? 'md:p-10' : ''}`}>
          <span className="ios-kicker !text-[0.6rem]">{feature.category}</span>
          <h3
            className={`font-display font-extrabold mt-3 group-hover:text-mh-red transition-colors uppercase ${
              featured ? 'text-3xl md:text-5xl' : 'text-xl md:text-2xl'
            }`}
          >
            {feature.title}
          </h3>
          <p className="text-muted mt-3 line-clamp-2">{feature.excerpt}</p>
          <div className="flex gap-4 mt-4 text-xs text-muted">
            <span>{feature.author}</span>
            <span>·</span>
            <span>{feature.readTime}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
