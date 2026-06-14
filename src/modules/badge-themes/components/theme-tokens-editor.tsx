import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { ThemeColorField } from '@/modules/badge-themes/components/theme-color-field'
import {
  COLOR_GROUPS,
  cloneThemeTokens,
  formatColorLabel,
  getThemeTokenFieldId,
  type SemanticColorKey,
  type ThemeMode,
  type ThemeTokens,
} from '@/shared/design-tokens/theme-tokens'

interface ThemeTokensEditorProps {
  value: ThemeTokens
  onChange: (tokens: ThemeTokens) => void
  mode: ThemeMode
  onModeChange: (mode: ThemeMode) => void
  focusedToken?: SemanticColorKey | null
}

export function ThemeTokensEditor({
  value,
  onChange,
  mode,
  onModeChange,
  focusedToken = null,
}: ThemeTokensEditorProps) {
  const updateColor = (mode: ThemeMode, key: SemanticColorKey, color: string) => {
    const next = cloneThemeTokens(value)
    next.colors[mode][key] = color
    onChange(next)
  }

  return (
    <Tabs value={mode} onValueChange={(next) => onModeChange(next as ThemeMode)} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="light">Light mode</TabsTrigger>
        <TabsTrigger value="dark">Dark mode</TabsTrigger>
      </TabsList>

      {(['light', 'dark'] as ThemeMode[]).map((tabMode) => (
        <TabsContent key={tabMode} value={tabMode} className="mt-4 space-y-5">
          {COLOR_GROUPS.map((group) => (
            <div key={`${tabMode}-${group.label}`} className="space-y-3 rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{group.label}</p>
                <p className="text-xs text-muted-foreground">{group.description}</p>
              </div>
              <div className="space-y-3">
                {group.keys.map((key) => (
                  <ThemeColorField
                    key={`${tabMode}-${key}`}
                    id={getThemeTokenFieldId(tabMode, key)}
                    label={formatColorLabel(key)}
                    value={value.colors[tabMode][key]}
                    onChange={(color) => updateColor(tabMode, key, color)}
                    highlighted={focusedToken === key && mode === tabMode}
                  />
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  )
}
