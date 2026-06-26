import { Search, SlidersHorizontal } from 'lucide-react'
import { ASSET_SECTIONS, ASSET_TABS } from '@/modules/illustrator/components/studio/studio-data'
import { StudioGlass } from '@/modules/illustrator/components/studio/studio-glass'
import type { AssetTabId } from '@/modules/illustrator/components/studio/studio-types'

type StudioAssetLibraryProps = {
  activeTab: AssetTabId
  onTabChange: (tab: AssetTabId) => void
}

const VISIBLE_SECTIONS = ASSET_SECTIONS.slice(0, 3)

export function StudioAssetLibrary({ activeTab, onTabChange }: StudioAssetLibraryProps) {
  return (
    <StudioGlass className="mas-assets">
      <div className="mas-assets__tabs">
        {ASSET_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`mas-assets__tab${activeTab === tab ? ' mas-assets__tab--active' : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <label className="mas-assets__search">
        <Search size={15} strokeWidth={1.75} aria-hidden />
        <span>Search {activeTab}…</span>
        <SlidersHorizontal size={14} strokeWidth={1.75} className="ml-auto opacity-60" aria-hidden />
      </label>

      <div className="mas-assets__body">
        {VISIBLE_SECTIONS.map((section) => (
          <section key={section} className="mas-assets__section">
            <div className="mas-assets__section-head">
              <span>{section}</span>
              <span>View all</span>
            </div>
            <div className="mas-assets__grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <button
                  key={`${section}-${i}`}
                  type="button"
                  className="mas-asset-card"
                  aria-label={`${section} item ${i + 1}`}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </StudioGlass>
  )
}
