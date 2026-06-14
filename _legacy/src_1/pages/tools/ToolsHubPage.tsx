import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PHASE_1_TOOLS,
  PHASE_2_TOOLS,
  PHASE_3_TOOLS,
  TOOL_HUB_STATS,
  type ToolDefinition,
} from '@/lib/tools/registry'
import { ToolIcon } from '@/components/tools/ToolIcon'

function ToolBentoGrid({ tools, offset }: { tools: ToolDefinition[]; offset: number }) {
  return (
    <div className="ios-tools-bento">
      {tools.map((tool, i) => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (offset + i) * 0.05, duration: 0.4 }}
        >
          <Link to={tool.path} className="ios-tools-bento-card">
            <div className="ios-tools-bento-card-top">
              <div className="ios-tools-bento-icon">
                <ToolIcon id={tool.id} />
              </div>
              <span className="ios-tools-bento-code">{tool.code}</span>
            </div>
            <h2 className="ios-tools-bento-title">{tool.title}</h2>
            <p className="ios-tools-bento-tagline">{tool.tagline}</p>
            <div className="ios-tools-bento-foot">
              <span className="ios-tools-bento-stat">
                <strong>{tool.stat.value}</strong> {tool.stat.label}
              </span>
              <span className="ios-tools-bento-open">Launch →</span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

export default function ToolsHubPage() {
  return (
    <div className="ios-tools-hub">
      <div className="ios-tools-hub-inner">
        <header className="ios-tools-hub-hero">
          <p className="ios-tools-hub-kicker">Creator Toolkit · Phases 1–3</p>
          <h1 className="ios-tools-hub-title">Studio tools, zero friction</h1>
          <p className="ios-tools-hub-sub">
            Browser-native workstations — prompts, theory, Web Audio analysis, and more. No AI bills,
            no login.
          </p>
        </header>

        <div className="ios-tools-stats-row">
          {TOOL_HUB_STATS.map((s) => (
            <div key={s.label} className="ios-tools-stat-card">
              <span className="ios-tools-stat-card-value">{s.value}</span>
              <span className="ios-tools-stat-card-label">{s.label}</span>
            </div>
          ))}
        </div>

        <p className="ios-tools-section-label">Phase 1 · Creative</p>
        <ToolBentoGrid tools={PHASE_1_TOOLS} offset={0} />

        <p className="ios-tools-section-label mt-12">Phase 2 · Audio lab</p>
        <ToolBentoGrid tools={PHASE_2_TOOLS} offset={PHASE_1_TOOLS.length} />

        <p className="ios-tools-section-label mt-12">Phase 3 · Theory + writing</p>
        <ToolBentoGrid
          tools={PHASE_3_TOOLS}
          offset={PHASE_1_TOOLS.length + PHASE_2_TOOLS.length}
        />

        <p className="text-xs text-muted mt-12 max-w-lg leading-relaxed">
          Phase 4 adds cover templates, profile share cards, and optional AI tools with fair-use
          limits.
        </p>
      </div>
    </div>
  )
}
