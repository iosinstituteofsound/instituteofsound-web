import type { Transition, Variants } from 'framer-motion'

export const studioSpring: Transition = { type: 'spring', stiffness: 380, damping: 32, mass: 0.85 }

/** Opacity + transform only — never animate filter (causes jank). */
export const studioFade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } },
}

export const studioSlideUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
}
