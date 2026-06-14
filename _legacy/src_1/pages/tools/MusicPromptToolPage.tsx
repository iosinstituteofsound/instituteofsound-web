import { useMemo, useState } from 'react'
import { ToolShell, ToolWorkspace } from '@/components/tools/ToolShell'
import { CopyOutput } from '@/components/tools/CopyOutput'
import {
  ToolNumberField,
  ToolSelectField,
  ToolTextAreaField,
} from '@/components/tools/ToolSelectField'
import {
  buildMusicPrompt,
  DEFAULT_PROMPT_GENRE,
  getGenreOption,
  PROMPT_GENRE_CATEGORIES,
  PROMPT_KEYS,
  PROMPT_MOODS,
  suggestedBpmForGenre,
  type MusicPromptInput,
  type PromptMood,
  type PromptVocal,
} from '@/lib/tools/musicPrompt'

const defaultInput: MusicPromptInput = {
  genre: DEFAULT_PROMPT_GENRE,
  mood: 'cinematic',
  bpm: suggestedBpmForGenre(DEFAULT_PROMPT_GENRE),
  key: 'E minor',
  vocal: 'mixed',
  era: 'modern',
  extra: '',
}

export default function MusicPromptToolPage() {
  const [input, setInput] = useState<MusicPromptInput>(defaultInput)

  const output = useMemo(() => buildMusicPrompt(input), [input])
  const genreCount = PROMPT_GENRE_CATEGORIES.reduce((n, c) => n + c.genres.length, 0)
  const genreLabel = getGenreOption(input.genre)?.label ?? input.genre

  const onGenreChange = (genre: string) => {
    setInput((s) => ({
      ...s,
      genre,
      bpm: suggestedBpmForGenre(genre),
    }))
  }

  return (
    <ToolShell
      toolId="music-prompt"
      title="Music Prompt Builder"
      subtitle="70+ genres in 11 categories — live Suno / Udio prompt preview."
    >
      <ToolWorkspace
        outputLabel="Prompt preview"
        controls={
          <div className="ios-tools-fields">
            <div className="ios-tools-field">
              <label htmlFor="genre">Genre</label>
              <select
                id="genre"
                value={input.genre}
                onChange={(e) => onGenreChange(e.target.value)}
                className="ios-input w-full text-sm"
              >
                {PROMPT_GENRE_CATEGORIES.map((cat) => (
                  <optgroup key={cat.id} label={cat.label}>
                    {cat.genres.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="ios-tools-field-hint">
                {genreCount} genres · BPM auto-updates on change
              </p>
            </div>

            <ToolSelectField
              id="mood"
              label="Mood"
              value={input.mood}
              onChange={(v) => setInput((s) => ({ ...s, mood: v as PromptMood }))}
              options={PROMPT_MOODS.map(([value, label]) => ({ value, label }))}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <ToolNumberField
                id="bpm"
                label="BPM"
                min={40}
                max={260}
                value={input.bpm}
                onChange={(bpm) => setInput((s) => ({ ...s, bpm }))}
              />
              <ToolSelectField
                id="key"
                label="Key"
                value={input.key}
                onChange={(v) => setInput((s) => ({ ...s, key: v }))}
                options={PROMPT_KEYS.map((k) => ({ value: k, label: k }))}
              />
            </div>

            <ToolSelectField
              id="vocal"
              label="Vocals"
              value={input.vocal}
              onChange={(v) => setInput((s) => ({ ...s, vocal: v as PromptVocal }))}
              options={[
                { value: 'instrumental', label: 'Instrumental' },
                { value: 'clean', label: 'Clean sung' },
                { value: 'rap', label: 'Rap' },
                { value: 'harmonies', label: 'Harmonies' },
                { value: 'harsh_screams', label: 'Harsh screams' },
                { value: 'mixed', label: 'Mixed clean + harsh' },
                { value: 'ethereal', label: 'Ethereal' },
                { value: 'spoken', label: 'Spoken / fragments' },
              ]}
            />

            <ToolSelectField
              id="era"
              label="Production era"
              value={input.era}
              onChange={(v) => setInput((s) => ({ ...s, era: v as MusicPromptInput['era'] }))}
              options={[
                { value: 'modern', label: 'Modern' },
                { value: '00s', label: '2000s' },
                { value: '90s', label: '1990s' },
                { value: 'vintage', label: 'Vintage analog' },
              ]}
            />

            <ToolTextAreaField
              id="extra"
              label="Extra notes"
              value={input.extra}
              onChange={(extra) => setInput((s) => ({ ...s, extra }))}
              placeholder="e.g. female vocal, no autotune, live drums only"
            />
          </div>
        }
        output={
          <>
            <div className="ios-tools-tag-row">
              <span className="ios-tools-tag ios-tools-tag-accent">{genreLabel}</span>
              <span className="ios-tools-tag">{input.bpm} BPM</span>
              <span className="ios-tools-tag">{input.key}</span>
              <span className="ios-tools-tag">{input.vocal.replace(/_/g, ' ')}</span>
            </div>
            <CopyOutput value={output} label="Copy prompt for Suno / Udio" />
          </>
        }
      />
    </ToolShell>
  )
}
