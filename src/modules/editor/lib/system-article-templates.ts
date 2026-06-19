import type { Data } from '@measured/puck'
import { extractTitleFromPuck } from '@/modules/editor/lib/puck-to-html'

const DEMO_SESSION_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

function demoImg(seed: string, w: number, h: number) {
  return `https://picsum.photos/seed/ios-template-${seed}/${w}/${h}`
}

function demoSessionTracks(title: string) {
  return [
    {
      id: 'demo-1',
      title,
      artistName: 'IOS Editorial',
      durationSec: 372,
      streamUrl: DEMO_SESSION_AUDIO,
    },
    {
      id: 'demo-2',
      title: 'Session take 02',
      artistName: 'IOS Editorial',
      durationSec: 248,
      streamUrl: DEMO_SESSION_AUDIO,
    },
    {
      id: 'demo-3',
      title: 'Warehouse mixdown',
      artistName: 'IOS Editorial',
      durationSec: 310,
      streamUrl: DEMO_SESSION_AUDIO,
    },
  ]
}

function demoAudioBlock(trackTitle: string, sessionLabel = 'Listen to the session') {
  return {
    type: 'ArticleAudio' as const,
    props: {
      audioUrl: DEMO_SESSION_AUDIO,
      trackTitle,
      sessionLabel,
      durationSec: 372,
      sessionTracks: demoSessionTracks(trackTitle),
    },
  }
}

function demoMeta(
  overrides: Record<string, unknown> = {},
) {
  return {
    type: 'feature',
    tags: [] as string[],
    isCoverStory: false,
    wirePick: false,
    homepageHero: false,
    trending: false,
    seoTitle: '',
    seoDescription: '',
    sessionAudioUrl: DEMO_SESSION_AUDIO,
    sessionLabel: 'Listen to the session',
    ...overrides,
  }
}

/** Client-side fallback when API returns stale/minimal system template payloads. */
export const WEB_SYSTEM_TEMPLATE_DOCUMENTS: Record<string, Record<string, unknown>> = {
  'system-blank': {
    version: 1,
    puck: {
      root: { props: {} },
      content: [
        { type: 'ArticleTitle', props: { text: 'Your headline' } },
        {
          type: 'ArticleHero',
          props: {
            imageUrl: demoImg('blank-hero', 1400, 900),
            caption: 'Hero image — replace via sidebar',
          },
        },
        {
          type: 'ArticleLead',
          props: {
            body: '<p>Write your opening paragraph here — set the tone, place the reader in the room, and give them a reason to keep scrolling.</p>',
          },
        },
        {
          type: 'ArticleBody',
          props: {
            body: '<p>Body copy goes here. Replace this with your editorial — sessions, scenes, and the details that make the story yours.</p>',
          },
        },
        demoAudioBlock('Session preview', 'Listen to the session'),
      ],
    },
    meta: demoMeta(),
  },
  'system-feature-story': {
    version: 1,
    puck: {
      root: { props: {} },
      content: [
        { type: 'ArticleTitle', props: { text: 'Cathedral of Noise' } },
        {
          type: 'ArticleHero',
          props: {
            imageUrl: demoImg('feature-hero', 1400, 900),
            caption: 'Warehouse session — Bangalore after midnight',
          },
        },
        demoAudioBlock('Cathedral of Noise', 'Listen to the session'),
        {
          type: 'ArticleLead',
          props: {
            body: `<p>The first thing you notice is not the volume — it is the patience. The room waits. The rigs hum. Then the sub arrives like weather rolling in off a highway, slow enough that you feel it in your chest before your ears register the hit.</p>
<p>The rusted beams above the floor don't just hold the roof — they hold the echo. Every take bounces back with a little more grit, a little more smoke, until the warehouse stops being a venue and starts being an instrument.</p>`,
          },
        },
        {
          type: 'ArticleBody',
          props: {
            body: '<blockquote><p>We are not chasing a scene. We are chasing a frequency.</p><cite>Voice note from the void echo session</cite></blockquote>',
          },
        },
        {
          type: 'ArticleImage',
          props: {
            imageUrl: demoImg('feature-intro', 1200, 900),
            caption: 'Crowd density at the warehouse threshold',
          },
        },
        {
          type: 'ArticleSection',
          props: {
            heading: 'Sound DNA',
            body: `<p>The sessions run slow and heavy. BPMs sit in the low 80s while sub pressure fills the gaps between notes. Modular chains feed into tape saturation; every pass is a commitment, not a sketch.</p>
<p>What reads as drone on paper becomes architecture in the room — walls of harmonic noise that move when you walk through them.</p>`,
          },
        },
        demoAudioBlock('Sound DNA session', 'Listen to the session'),
        {
          type: 'ArticleImage',
          props: {
            imageUrl: demoImg('feature-break', 1600, 700),
            caption: 'Full-bleed break image',
          },
        },
        {
          type: 'ArticleSection',
          props: {
            heading: 'Session One',
            body: `<p>Session one opens with a single oscillator and a floor tom mic placed too close to the cone. The first ten minutes are silence and tuning — then the room locks into a pulse that doesn't resolve for forty-seven minutes.</p>
<p>By the time the red light bleeds across the mixer, nobody remembers who started the take. That is the point.</p>`,
          },
        },
      ],
    },
    meta: demoMeta({
      type: 'feature',
      isCoverStory: true,
      seoDescription:
        "Inside Bangalore's warehouse sessions — where drone, doom, and the night India's underground learned to scream in stereo.",
    }),
  },
  'system-album-review': {
    version: 1,
    puck: {
      root: { props: {} },
      content: [
        { type: 'ArticleTitle', props: { text: 'VOID CONVO Sessions' } },
        {
          type: 'ArticleLead',
          props: {
            body: '<p>VOID CONVO rewires how we listen after midnight. The Delhi session series strips every gesture down to voice, sub, and silence — then rebuilds the mix until it feels like eavesdropping on a confession.</p>',
          },
        },
        {
          type: 'ArticleImage',
          props: {
            imageUrl: demoImg('review-artwork', 900, 900),
            caption: 'Album artwork — late-night transmission',
          },
        },
        demoAudioBlock('VOID CONVO Sessions', 'Listen to the album'),
        {
          type: 'ArticleBody',
          props: {
            body: '<blockquote><p>Silence is the loudest instrument in the room.</p><cite>VOID CONVO session note</cite></blockquote>',
          },
        },
        {
          type: 'ArticleSection',
          props: {
            heading: 'Signal chain',
            body: '<p>One mic, one pre, one limiter pushed too hard. The chain is intentionally wrong in all the right places — hiss where you expect polish, weight where you expect air.</p>',
          },
        },
        {
          type: 'ArticleSection',
          props: {
            heading: 'Verdict',
            body: '<p>Essential listening for anyone tracing the post-midnight line between conversation and composition. The mix does not resolve — it lingers, and that is the point.</p>',
          },
        },
        demoAudioBlock('Album preview', 'Listen to the album'),
      ],
    },
    meta: demoMeta({
      type: 'review',
      sessionLabel: 'Listen to the album',
      seoDescription: 'Late-night transmissions from Delhi — raw convo, colder mixes, zero compromise.',
    }),
  },
  'system-interview': {
    version: 1,
    puck: {
      root: { props: {} },
      content: [
        { type: 'ArticleTitle', props: { text: 'On the Record: Static Artist' } },
        {
          type: 'ArticleHero',
          props: {
            imageUrl: demoImg('interview-portrait', 1200, 1500),
            caption: 'Portrait — session day, no retakes',
          },
        },
        demoAudioBlock('On the Record: Static Artist', 'Listen to the interview'),
        {
          type: 'ArticleLead',
          props: {
            body: '<p>Static Artist does not perform for the tape — the tape performs for them. In a south Delhi studio with the monitors off-axis and the room lights dim, every answer arrives slower than the question, as if the silence between words is part of the arrangement.</p>',
          },
        },
        {
          type: 'ArticleBody',
          props: {
            body: '<blockquote><p>I do not write songs. I document frequencies until they start answering back.</p><cite>Static Artist</cite></blockquote>',
          },
        },
        {
          type: 'ArticleSection',
          props: {
            heading: 'On the record',
            body: `<p><strong>IOS:</strong> When did the warehouse sessions become the primary writing room?</p>
<p><strong>Static Artist:</strong> When we stopped trying to fix the room and started treating the reflections as harmony. The first EP was basically a map of where the concrete wanted the bass to sit.</p>`,
          },
        },
        {
          type: 'ArticleSection',
          props: {
            heading: 'After midnight',
            body: '<p>The second session runs past 2 AM. Vocals are one take — not because of discipline, but because the room only offers that window once per night. By the third pass the air changes and everyone knows the keeper is in the can.</p>',
          },
        },
        demoAudioBlock('Interview session', 'Listen to the interview'),
      ],
    },
    meta: demoMeta({
      type: 'feature',
      sessionLabel: 'Listen to the interview',
      seoDescription: 'A late-night conversation on process, pressure, and learning to trust the room.',
    }),
  },
  'system-photo-essay': {
    version: 1,
    puck: {
      root: { props: {} },
      content: [
        { type: 'ArticleTitle', props: { text: 'Warehouse Signals' } },
        {
          type: 'ArticleLead',
          props: {
            body: '<p>Twelve frames from three nights underground — no captions needed, only the light leaking through rust and the crowd learning to listen in the dark.</p>',
          },
        },
        {
          type: 'ArticleImage',
          props: {
            imageUrl: demoImg('photo-1', 1400, 900),
            caption: '01 — threshold',
          },
        },
        {
          type: 'ArticleImage',
          props: {
            imageUrl: demoImg('photo-2', 900, 1200),
            caption: '02 — rig detail',
          },
        },
        {
          type: 'ArticleBody',
          props: {
            body: '<blockquote><p>The photograph is not proof that you were there — it is proof that the room let you stay.</p><cite>Editor note</cite></blockquote>',
          },
        },
        {
          type: 'ArticleImage',
          props: {
            imageUrl: demoImg('photo-3', 1600, 700),
            caption: '03 — full bleed',
          },
        },
        {
          type: 'ArticleBody',
          props: {
            body: '<p>Close with a short coda — one paragraph tying the sequence together and pointing the reader back to the session audio.</p>',
          },
        },
        demoAudioBlock('Warehouse Signals', 'Listen to the session'),
      ],
    },
    meta: demoMeta({
      seoDescription: 'An image-led walkthrough of warehouse sessions — frames before paragraphs.',
    }),
  },
}

function resolvePuck(raw: Record<string, unknown>): Data | null {
  const puck = raw.puck
  if (!puck || typeof puck !== 'object') return null
  const candidate = puck as Data
  if (!Array.isArray(candidate.content)) return null
  return candidate
}

export function getSystemTemplateDocument(templateId: string): Record<string, unknown> | null {
  return WEB_SYSTEM_TEMPLATE_DOCUMENTS[templateId] ?? null
}

export function shouldUseWebTemplateFallback(
  raw: Record<string, unknown>,
  templateId: string,
): boolean {
  const fallback = WEB_SYSTEM_TEMPLATE_DOCUMENTS[templateId]
  if (!fallback) return false

  const puck = resolvePuck(raw)
  const fallbackPuck = resolvePuck(fallback)
  if (!puck || !fallbackPuck) return true

  if (puck.content.length < fallbackPuck.content.length) return true

  const title = extractTitleFromPuck(puck)
  const expectedTitle = extractTitleFromPuck(fallbackPuck)
  if (templateId !== 'system-blank' && title === 'Your headline' && expectedTitle !== 'Your headline') {
    return true
  }

  const needsImages = ['system-feature-story', 'system-interview', 'system-photo-essay', 'system-album-review']
  if (needsImages.includes(templateId)) {
    const hasImage = puck.content.some(
      (block) => block.type === 'ArticleHero' || block.type === 'ArticleImage',
    )
    if (!hasImage) return true
  }

  const needsAudio = templateId !== 'system-blank'
  if (needsAudio) {
    const hasAudio = puck.content.some((block) => block.type === 'ArticleAudio')
    if (!hasAudio) return true
  }

  return false
}
