import type { ReactElement } from 'react'
import { cn } from '@/shared/lib/cn'

/** Eight unique cosmic motifs — one per explore section gap, no repeats */
export type ExploreDividerVariant =
  | 'gateway'
  | 'saturn'
  | 'seal'
  | 'lunar'
  | 'aurora'
  | 'nova'
  | 'eclipse'
  | 'nexus'

interface ExploreSectionDividerProps {
  variant: ExploreDividerVariant
  className?: string
}

function MotifGateway() {
  return (
    <svg className="explore-div__svg explore-div__svg--gateway" viewBox="0 0 48 42" aria-hidden>
      <ellipse className="explore-div__gateway-glow" cx="24" cy="24" rx="13" ry="11" />
      <path
        className="explore-div__gateway-arch explore-div__gateway-arch--outer"
        d="M7 37 L7 18 A17 17 0 0 1 41 18 L41 37"
        fill="none"
      />
      <path
        className="explore-div__gateway-arch explore-div__gateway-arch--inner"
        d="M13 37 L13 21 A11 11 0 0 1 35 21 L35 37"
        fill="none"
      />
      <path className="explore-div__gateway-keystone" d="M22 9 L24 5 L26 9 L24 13 Z" />
      <line className="explore-div__gateway-pillar" x1="7" y1="37" x2="7" y2="32" />
      <line className="explore-div__gateway-pillar" x1="41" y1="37" x2="41" y2="32" />
      <line className="explore-div__gateway-sill" x1="7" y1="37" x2="41" y2="37" />
      <circle className="explore-div__gateway-star explore-div__gateway-star--a" cx="17" cy="23" r="1.2" />
      <circle className="explore-div__gateway-star explore-div__gateway-star--b" cx="31" cy="21" r="1.4" />
      <circle className="explore-div__gateway-star explore-div__gateway-star--c" cx="24" cy="29" r="1" />
      <circle className="explore-div__gateway-star explore-div__gateway-star--d" cx="27" cy="25" r="0.85" />
      <circle className="explore-div__gateway-core" cx="24" cy="23" r="2.3" />
    </svg>
  )
}

function MotifSaturn() {
  return (
    <svg className="explore-div__svg explore-div__svg--saturn" viewBox="0 0 44 36" aria-hidden>
      <ellipse className="explore-div__saturn-ring" cx="22" cy="20" rx="18" ry="5.5" />
      <ellipse className="explore-div__saturn-ring-back" cx="22" cy="20" rx="18" ry="5.5" />
      <circle className="explore-div__saturn-body" cx="22" cy="18" r="9" />
      <path className="explore-div__saturn-shade" d="M16 14 A9 9 0 0 0 16 22 A9 9 0 0 0 22 27 A9 9 0 0 0 28 18 Z" />
    </svg>
  )
}

function MotifSeal() {
  return (
    <svg className="explore-div__svg explore-div__svg--seal" viewBox="0 0 44 44" aria-hidden>
      <circle className="explore-div__seal-aura" cx="22" cy="20" r="17" fill="none" />
      <circle className="explore-div__seal-ring" cx="22" cy="20" r="14" fill="none" />
      <circle className="explore-div__seal-body" cx="22" cy="20" r="10.5" />
      <circle className="explore-div__seal-groove explore-div__seal-groove--outer" cx="22" cy="20" r="7.5" fill="none" />
      <circle className="explore-div__seal-groove explore-div__seal-groove--inner" cx="22" cy="20" r="4.5" fill="none" />
      <circle className="explore-div__seal-core" cx="22" cy="20" r="2" />
      <path className="explore-div__seal-ribbon" d="M15 28 L22 36 L29 28" />
      <path className="explore-div__seal-ribbon-fold" d="M22 28 L22 36" />
    </svg>
  )
}

function MotifLunar() {
  return (
    <svg className="explore-div__svg explore-div__svg--lunar" viewBox="0 0 64 24" aria-hidden>
      <circle className="explore-div__lunar-orbit" cx="32" cy="12" r="10" fill="none" />
      {/* waxing crescent */}
      <circle className="explore-div__lunar-moon" cx="10" cy="12" r="6" />
      <circle cx="13" cy="12" r="5.5" fill="var(--background)" opacity="0.92" />
      {/* half */}
      <path className="explore-div__lunar-moon explore-div__lunar-moon--half" d="M28 6 v12 a6 6 0 0 0 0 -12 z" />
      <circle className="explore-div__lunar-moon explore-div__lunar-moon--full" cx="50" cy="12" r="6" />
    </svg>
  )
}

function MotifAurora() {
  return (
    <svg className="explore-div__svg explore-div__svg--aurora" viewBox="0 0 52 32" aria-hidden>
      <path className="explore-div__aurora explore-div__aurora--a" d="M6 26 C14 8, 22 8, 30 22 S46 24, 48 14" />
      <path className="explore-div__aurora explore-div__aurora--b" d="M4 28 C16 12, 26 14, 38 24 S50 18, 50 10" />
      <path className="explore-div__aurora explore-div__aurora--c" d="M8 24 C18 16, 28 18, 42 26" />
    </svg>
  )
}

function MotifNova() {
  return (
    <svg className="explore-div__svg explore-div__svg--nova" viewBox="0 0 44 44" aria-hidden>
      <g className="explore-div__nova-rays">
        <line x1="22" y1="22" x2="22" y2="5" />
        <line x1="22" y1="22" x2="22" y2="39" />
        <line x1="22" y1="22" x2="5" y2="22" />
        <line x1="22" y1="22" x2="39" y2="22" />
        <line x1="22" y1="22" x2="10" y2="10" />
        <line x1="22" y1="22" x2="34" y2="10" />
        <line x1="22" y1="22" x2="10" y2="34" />
        <line x1="22" y1="22" x2="34" y2="34" />
      </g>
      <circle className="explore-div__nova-ring explore-div__nova-ring--1" cx="22" cy="22" r="7" fill="none" />
      <circle className="explore-div__nova-ring explore-div__nova-ring--2" cx="22" cy="22" r="12" fill="none" />
      <circle className="explore-div__nova-ring explore-div__nova-ring--3" cx="22" cy="22" r="17" fill="none" />
      <circle className="explore-div__nova-flare" cx="22" cy="22" r="6.5" />
      <circle className="explore-div__nova-core" cx="22" cy="22" r="2.8" />
    </svg>
  )
}

function MotifEclipse() {
  return (
    <div className="explore-div__eclipse">
      <span className="explore-div__eclipse-sun" />
      <span className="explore-div__eclipse-moon" />
      <span className="explore-div__eclipse-corona" />
    </div>
  )
}

function MotifNexus() {
  return (
    <svg className="explore-div__svg explore-div__svg--nexus" viewBox="0 0 52 36" aria-hidden>
      <circle className="explore-div__nexus-orbit" cx="26" cy="18" r="14" fill="none" />
      <g className="explore-div__nexus-links">
        <line x1="26" y1="18" x2="10" y2="8" />
        <line x1="26" y1="18" x2="42" y2="7" />
        <line x1="26" y1="18" x2="8" y2="24" />
        <line x1="26" y1="18" x2="44" y2="26" />
        <line x1="26" y1="18" x2="26" y2="32" />
      </g>
      <circle className="explore-div__nexus-node explore-div__nexus-node--a" cx="10" cy="8" r="2.2" />
      <circle className="explore-div__nexus-node explore-div__nexus-node--b" cx="42" cy="7" r="1.8" />
      <circle className="explore-div__nexus-node explore-div__nexus-node--c" cx="8" cy="24" r="2" />
      <circle className="explore-div__nexus-node explore-div__nexus-node--d" cx="44" cy="26" r="1.7" />
      <circle className="explore-div__nexus-node explore-div__nexus-node--e" cx="26" cy="32" r="1.6" />
      <circle className="explore-div__nexus-hub" cx="26" cy="18" r="5.5" />
      <circle className="explore-div__nexus-core" cx="26" cy="18" r="2.2" />
    </svg>
  )
}

const MOTIFS: Record<ExploreDividerVariant, () => ReactElement> = {
  gateway: MotifGateway,
  saturn: MotifSaturn,
  seal: MotifSeal,
  lunar: MotifLunar,
  aurora: MotifAurora,
  nova: MotifNova,
  eclipse: MotifEclipse,
  nexus: MotifNexus,
}

export function ExploreSectionDivider({ variant, className }: ExploreSectionDividerProps) {
  const Motif = MOTIFS[variant]

  return (
    <div className={cn('explore-div', `explore-div--${variant}`, className)} aria-hidden>
      <div className="explore-div__cosmos" />
      <div className="explore-div__inner">
        <span className="explore-div__line explore-div__line--left" />
        <div className="explore-div__core">
          <Motif />
        </div>
        <span className="explore-div__line explore-div__line--right" />
      </div>
    </div>
  )
}
