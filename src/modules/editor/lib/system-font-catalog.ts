/** Common system fonts across macOS, Windows, and Linux — used when Local Font API is unavailable */
export const SYSTEM_FONT_FALLBACK: string[] = [
  'Academy Engraved LET',
  'American Typewriter',
  'Andale Mono',
  'Apple Chancery',
  'Apple Color Emoji',
  'Apple SD Gothic Neo',
  'Apple Symbols',
  'Arial',
  'Arial Black',
  'Arial Hebrew',
  'Arial Narrow',
  'Arial Rounded MT Bold',
  'Avenir',
  'Avenir Next',
  'Avenir Next Condensed',
  'Ayuthaya',
  'Baskerville',
  'Big Caslon',
  'Bodoni 72',
  'Bodoni 72 Oldstyle',
  'Bodoni 72 Smallcaps',
  'Bradley Hand',
  'Brush Script MT',
  'Chalkboard',
  'Chalkboard SE',
  'Chalkduster',
  'Charter',
  'Cochin',
  'Comic Sans MS',
  'Copperplate',
  'Corsiva Hebrew',
  'Courier',
  'Courier New',
  'Damascus',
  'Devanagari Sangam MN',
  'Didot',
  'DIN Alternate',
  'DIN Condensed',
  'Euphemia UCAS',
  'Futura',
  'Galvji',
  'Geeza Pro',
  'Geneva',
  'Georgia',
  'Gill Sans',
  'Grantha Sangam MN',
  'Gujarati Sangam MN',
  'Gurmukhi MN',
  'Gurmukhi Sangam MN',
  'Heiti SC',
  'Heiti TC',
  'Helvetica',
  'Helvetica Neue',
  'Herculanum',
  'Hiragino Kaku Gothic ProN',
  'Hiragino Maru Gothic ProN',
  'Hiragino Mincho ProN',
  'Hiragino Sans',
  'Hoefler Text',
  'Impact',
  'InaiMathi',
  'Iowan Old Style',
  'Kailasa',
  'Kannada Sangam MN',
  'Khmer Sangam MN',
  'Kohinoor Bangla',
  'Kohinoor Devanagari',
  'Kohinoor Gujarati',
  'Kohinoor Telugu',
  'Krungthep',
  'Lao Sangam MN',
  'Lucida Grande',
  'Luminari',
  'Malayalam Sangam MN',
  'Marion',
  'Marker Felt',
  'Menlo',
  'Microsoft Sans Serif',
  'Mishafi',
  'Monaco',
  'Mshtakan',
  'Mukta Mahee',
  'Muna',
  'Myanmar Sangam MN',
  'Nadeem',
  'New Peninim MT',
  'Noteworthy',
  'Noto Nastaliq Urdu',
  'Noto Sans Kannada',
  'Noto Sans Myanmar',
  'Noto Sans Oriya',
  'Optima',
  'Oriya Sangam MN',
  'Palatino',
  'Papyrus',
  'Party LET',
  'Phosphate',
  'PingFang HK',
  'PingFang SC',
  'PingFang TC',
  'Plantagenet Cherokee',
  'PT Mono',
  'PT Sans',
  'PT Serif',
  'Raanana',
  'Rockwell',
  'Sana',
  'Sathu',
  'Savoye LET',
  'Seravek',
  'SignPainter',
  'Silom',
  'Sinhala Sangam MN',
  'Skia',
  'Snell Roundhand',
  'STHeiti',
  'STIX Two Math',
  'STIX Two Text',
  'Sukhumvit Set',
  'Symbol',
  'Tahoma',
  'Tamil Sangam MN',
  'Telugu Sangam MN',
  'Thonburi',
  'Times',
  'Times New Roman',
  'Trattatello',
  'Trebuchet MS',
  'Verdana',
  'Waseem',
  'Webdings',
  'Wingdings',
  'Zapf Dingbats',
  'Zapfino',
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Oswald',
  'Raleway',
  'Merriweather',
  'Playfair Display',
  'Source Sans Pro',
  'Source Serif Pro',
  'Ubuntu',
  'Fira Sans',
  'Fira Code',
  'JetBrains Mono',
  'SF Pro Display',
  'SF Pro Text',
  'SF Mono',
]

interface LocalFontData {
  family: string
}

function sortFamilies(families: string[]): string[] {
  return [...new Set(families.map((f) => f.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  )
}

export async function loadAvailableFontFamilies(): Promise<string[]> {
  if (typeof window !== 'undefined' && 'queryLocalFonts' in window) {
    try {
      const query = (window as Window & { queryLocalFonts: () => Promise<LocalFontData[]> })
        .queryLocalFonts
      const localFonts = await query()
      const families = sortFamilies(localFonts.map((font) => font.family))
      if (families.length > 0) return families
    } catch {
      // Permission denied or unsupported — fall through to catalog
    }
  }
  return sortFamilies(SYSTEM_FONT_FALLBACK)
}

export function toSystemFontId(family: string): string {
  return `system:${family}`
}

export function isSystemFontId(id: string): boolean {
  return id.startsWith('system:')
}

export function systemFontFamilyFromId(id: string): string | null {
  if (!isSystemFontId(id)) return null
  return id.slice(7)
}

export function cssFontFamilyForName(family: string): string {
  return `"${family.replace(/"/g, '\\"')}", sans-serif`
}
