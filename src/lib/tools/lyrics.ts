export interface LineAnalysis {
  lineNumber: number
  text: string
  syllables: number
  endWord: string
  rhymeKey: string
}

export interface LyricsAnalysis {
  lines: LineAnalysis[]
  totalSyllables: number
  avgSyllables: number
  rhymeGroups: { key: string; lines: number[] }[]
  structureHint: string
}

function rhymeKey(word: string): string {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (w.length < 2) return w
  const tail = w.slice(-3)
  const vowelTail = w.match(/[aeiouy]+[^aeiouy]*$/)?.[0] ?? tail
  return vowelTail.slice(-4) || tail
}

function countWordSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 0
  if (w.length <= 2) return 1
  const groups = w.match(/[aeiouy]+/g)
  if (!groups) return 1
  let count = groups.length
  if (w.endsWith('e') && !w.endsWith('le') && count > 1) count -= 1
  if (w.endsWith('le') && w.length > 2) count += 0
  return Math.max(1, count)
}

function countLineSyllables(line: string): number {
  const words = line.trim().split(/\s+/).filter(Boolean)
  return words.reduce((sum, w) => sum + countWordSyllables(w), 0)
}

function lastWord(line: string): string {
  const words = line.trim().split(/\s+/).filter(Boolean)
  return words[words.length - 1] ?? ''
}

function detectStructure(lines: string[]): string {
  const nonEmpty = lines.filter((l) => l.trim())
  if (nonEmpty.length === 0) return 'Paste lyrics to detect structure.'
  const blankRuns = lines.reduce<number[]>((acc, l, i) => {
    if (!l.trim() && (i === 0 || lines[i - 1]?.trim())) acc.push(i)
    return acc
  }, [])
  if (blankRuns.length >= 2) {
    return `~${blankRuns.length + 1} sections detected (blank lines as breaks). Typical: verse / chorus / bridge.`
  }
  if (nonEmpty.length >= 8) {
    return `${nonEmpty.length} lines — try grouping every 4 lines as verse/chorus blocks.`
  }
  return `${nonEmpty.length} line(s) — add blank lines between sections for clearer structure.`
}

export function analyzeLyrics(text: string): LyricsAnalysis {
  const rawLines = text.split('\n')
  const lines: LineAnalysis[] = []
  let totalSyllables = 0
  let counted = 0

  rawLines.forEach((text, i) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const syllables = countLineSyllables(trimmed)
    const endWord = lastWord(trimmed)
    lines.push({
      lineNumber: i + 1,
      text: trimmed,
      syllables,
      endWord,
      rhymeKey: rhymeKey(endWord),
    })
    totalSyllables += syllables
    counted += 1
  })

  const keyMap = new Map<string, number[]>()
  lines.forEach((l) => {
    if (!l.rhymeKey || l.rhymeKey.length < 2) return
    const arr = keyMap.get(l.rhymeKey) ?? []
    arr.push(l.lineNumber)
    keyMap.set(l.rhymeKey, arr)
  })

  const rhymeGroups = [...keyMap.entries()]
    .filter(([, nums]) => nums.length >= 2)
    .map(([key, lineNums]) => ({ key, lines: lineNums }))
    .sort((a, b) => b.lines.length - a.lines.length)

  return {
    lines,
    totalSyllables,
    avgSyllables: counted ? Math.round((totalSyllables / counted) * 10) / 10 : 0,
    rhymeGroups,
    structureHint: detectStructure(rawLines),
  }
}

export function formatLyricsExport(a: LyricsAnalysis): string {
  const body = a.lines
    .map((l) => `L${l.lineNumber} (${l.syllables} syl) · ends "${l.endWord}" — ${l.text}`)
    .join('\n')
  const rhymes =
    a.rhymeGroups.length > 0
      ? a.rhymeGroups.map((g) => `Rhyme ·${g.key}· → lines ${g.lines.join(', ')}`).join('\n')
      : 'No obvious end-rhyme groups (2+ lines).'
  return [
    `Lines: ${a.lines.length} · Total syllables: ${a.totalSyllables} · Avg: ${a.avgSyllables}/line`,
    a.structureHint,
    '',
    rhymes,
    '',
    body,
  ].join('\n')
}
