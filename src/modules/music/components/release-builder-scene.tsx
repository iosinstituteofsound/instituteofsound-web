import type { ReactNode } from 'react'
import '@/modules/music/styles/release-builder.css'

interface ReleaseBuilderSceneProps {
  children: ReactNode
}

export function ReleaseBuilderScene({ children }: ReleaseBuilderSceneProps) {
  return (
    <div className="rbl-scene">
      <div className="rbl-scene__backdrop" aria-hidden />
      <div className="rbl-scene__content">{children}</div>
    </div>
  )
}
