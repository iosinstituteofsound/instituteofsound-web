import type { Config } from '@measured/puck'
import { ArticleSessionAudioPlayer } from '@/modules/editor/components/article-session-audio-player'
import { ArticleSessionVideoPlayer } from '@/modules/editor/components/article-session-video-player'
import {
  PuckImageField,
  PuckRichTextField,
  PuckTextareaField,
  PuckTextField,
} from '@/modules/editor/components/puck-fields'

export type ArticlePuckComponents = {
  ArticleTitle: { text: string }
  ArticleLead: { body: string }
  ArticleBody: { body: string }
  ArticleHero: { imageUrl: string; caption: string }
  ArticleImage: { imageUrl: string; caption: string }
  ArticleAudio: { audioUrl: string; trackTitle: string; sessionLabel: string; durationSec?: number; sessionTracks?: Array<{ id: string; title: string; artistName: string; durationSec: number; streamUrl: string }> }
  ArticleVideo: { videoUrl: string; videoTitle: string; caption: string; posterUrl?: string }
  ArticleSection: { heading: string; body: string }
  ArticleDivider: Record<string, never>
}

export const articlePuckConfig: Config<{
  components: ArticlePuckComponents
  root: Record<string, never>
}> = {
  categories: {
    writing: { title: 'Writing', components: ['ArticleTitle', 'ArticleLead', 'ArticleBody'] },
    media: { title: 'Media', components: ['ArticleHero', 'ArticleImage', 'ArticleAudio', 'ArticleVideo'] },
    structure: { title: 'Structure', components: ['ArticleSection', 'ArticleDivider'] },
  },
  components: {
    ArticleTitle: {
      label: 'Title',
      fields: {
        text: {
          type: 'custom',
          label: 'Headline',
          render: ({ value, onChange }) => (
            <PuckTextField value={value ?? ''} onChange={onChange} placeholder="Article title" />
          ),
        },
      },
      defaultProps: { text: '' },
      render: ({ text }) => (
        <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
          {text || 'Untitled article'}
        </h1>
      ),
    },
    ArticleLead: {
      label: 'Lead paragraph',
      fields: {
        body: {
          type: 'custom',
          label: 'Intro',
          render: ({ value, onChange }) => (
            <PuckRichTextField
              value={value ?? ''}
              onChange={onChange}
              placeholder="Opening paragraph…"
              minHeight="160px"
            />
          ),
        },
      },
      defaultProps: { body: '<p></p>' },
      render: ({ body }) => (
        <div
          className="prose prose-lg dark:prose-invert max-w-none font-serif text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: body || '<p></p>' }}
        />
      ),
    },
    ArticleBody: {
      label: 'Body',
      fields: {
        body: {
          type: 'custom',
          label: 'Content',
          render: ({ value, onChange }) => (
            <PuckRichTextField value={value ?? ''} onChange={onChange} placeholder="Write your editorial…" />
          ),
        },
      },
      defaultProps: { body: '<p></p>' },
      render: ({ body }) => (
        <div
          className="prose prose-base dark:prose-invert max-w-none font-serif"
          dangerouslySetInnerHTML={{ __html: body || '<p></p>' }}
        />
      ),
    },
    ArticleHero: {
      label: 'Hero image',
      fields: {
        imageUrl: {
          type: 'custom',
          label: 'Image',
          render: ({ value, onChange }) => <PuckImageField value={value ?? ''} onChange={onChange} />,
        },
        caption: {
          type: 'custom',
          label: 'Caption',
          render: ({ value, onChange }) => (
            <PuckTextareaField value={value ?? ''} onChange={onChange} placeholder="Optional caption" />
          ),
        },
      },
      defaultProps: { imageUrl: '', caption: '' },
      render: ({ imageUrl, caption }) => (
        <figure className="overflow-hidden rounded-xl border border-border bg-card">
          {imageUrl ? (
            <img src={imageUrl} alt={caption || ''} className="aspect-[16/9] w-full object-cover" />
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center bg-muted text-sm text-muted-foreground">
              Add a hero image
            </div>
          )}
          {caption ? (
            <figcaption className="border-t border-border px-4 py-2 text-sm text-muted-foreground">
              {caption}
            </figcaption>
          ) : null}
        </figure>
      ),
    },
    ArticleImage: {
      label: 'Image',
      fields: {
        imageUrl: {
          type: 'custom',
          label: 'Image',
          render: ({ value, onChange }) => <PuckImageField value={value ?? ''} onChange={onChange} />,
        },
        caption: {
          type: 'custom',
          label: 'Caption',
          render: ({ value, onChange }) => (
            <PuckTextareaField value={value ?? ''} onChange={onChange} placeholder="Optional caption" />
          ),
        },
      },
      defaultProps: { imageUrl: '', caption: '' },
      render: ({ imageUrl, caption }) => (
        <figure className="overflow-hidden rounded-xl border border-border bg-card">
          {imageUrl ? (
            <img src={imageUrl} alt={caption || ''} className="w-full object-cover" />
          ) : (
            <div className="flex h-48 items-center justify-center bg-muted text-sm text-muted-foreground">
              Add an image
            </div>
          )}
          {caption ? (
            <figcaption className="border-t border-border px-4 py-2 text-sm text-muted-foreground">
              {caption}
            </figcaption>
          ) : null}
        </figure>
      ),
    },
    ArticleAudio: {
      label: 'Session audio',
      fields: {
        audioUrl: {
          type: 'custom',
          label: 'Audio URL',
          render: ({ value, onChange }) => (
            <PuckTextField value={value ?? ''} onChange={onChange} placeholder="https://…" />
          ),
        },
        trackTitle: {
          type: 'custom',
          label: 'Track title',
          render: ({ value, onChange }) => (
            <PuckTextField value={value ?? ''} onChange={onChange} placeholder="Track name" />
          ),
        },
        sessionLabel: {
          type: 'custom',
          label: 'Session label',
          render: ({ value, onChange }) => (
            <PuckTextField value={value ?? ''} onChange={onChange} placeholder="Listen to the session" />
          ),
        },
      },
      defaultProps: {
        audioUrl: '',
        trackTitle: 'Session',
        sessionLabel: 'Listen to the session',
        sessionTracks: [],
      },
      render: ({ audioUrl, trackTitle, sessionLabel, sessionTracks }) => (
        <ArticleSessionAudioPlayer
          audioUrl={audioUrl || ''}
          trackTitle={trackTitle || 'Session'}
          sessionLabel={sessionLabel || 'Listen to the session'}
          sessionTracks={sessionTracks}
          variant="compact"
        />
      ),
    },
    ArticleVideo: {
      label: 'Session video',
      fields: {
        videoUrl: {
          type: 'custom',
          label: 'Video URL',
          render: ({ value, onChange }) => (
            <PuckTextField value={value ?? ''} onChange={onChange} placeholder="https://…" />
          ),
        },
        videoTitle: {
          type: 'custom',
          label: 'Video title',
          render: ({ value, onChange }) => (
            <PuckTextField value={value ?? ''} onChange={onChange} placeholder="Video name" />
          ),
        },
        caption: {
          type: 'custom',
          label: 'Caption',
          render: ({ value, onChange }) => (
            <PuckTextField value={value ?? ''} onChange={onChange} placeholder="Watch the session" />
          ),
        },
      },
      defaultProps: {
        videoUrl: '',
        videoTitle: 'Session video',
        caption: 'Watch the session',
        posterUrl: '',
      },
      render: ({ videoUrl, videoTitle, caption, posterUrl }) => (
        <ArticleSessionVideoPlayer
          videoUrl={videoUrl || ''}
          videoTitle={videoTitle || 'Session video'}
          caption={caption || 'Watch the session'}
          posterUrl={posterUrl || undefined}
        />
      ),
    },
    ArticleSection: {
      label: 'Section',
      fields: {
        heading: {
          type: 'custom',
          label: 'Heading',
          render: ({ value, onChange }) => (
            <PuckTextField value={value ?? ''} onChange={onChange} placeholder="Section heading" />
          ),
        },
        body: {
          type: 'custom',
          label: 'Body',
          render: ({ value, onChange }) => (
            <PuckRichTextField value={value ?? ''} onChange={onChange} placeholder="Section content…" />
          ),
        },
      },
      defaultProps: { heading: '', body: '<p></p>' },
      render: ({ heading, body }) => (
        <section data-article-section className="space-y-4">
          {heading ? <h2 className="font-serif text-2xl font-bold text-foreground">{heading}</h2> : null}
          <div
            className="prose prose-base dark:prose-invert max-w-none font-serif"
            dangerouslySetInnerHTML={{ __html: body || '<p></p>' }}
          />
        </section>
      ),
    },
    ArticleDivider: {
      label: 'Divider',
      fields: {},
      defaultProps: {},
      render: () => <hr className="border-border" />,
    },
  },
}
