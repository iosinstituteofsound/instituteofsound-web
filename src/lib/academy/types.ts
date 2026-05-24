export type AcademyTrackSlug =
  | 'production'
  | 'mixing'
  | 'mastering'
  | 'recording'
  | 'genres'
  | 'ear-training'
  | 'release'

export type AcademyPhase = 'Phase 1' | 'Phase 2' | 'Phase 3'

export type AcademyInfographicType =
  | 'waveform-db'
  | 'signal-flow'
  | 'arrangement'
  | 'static-mix'
  | 'eq-zones'
  | 'compressor'
  | 'master-chain'
  | 'loudness'
  | 'export-qc'
  | 'mic-placement'
  | 'room-treatment'
  | 'double-tracking'
  | 'genre-spectrum'
  | 'metal-template'
  | 'cinematic-depth'
  | 'frequency-bands'
  | 'dynamics-crest'
  | 'reference-ab'
  | 'release-timeline'
  | 'metadata-map'
  | 'distributor-checklist'

export interface AcademyLessonSection {
  heading: string
  body: string
  bullets?: string[]
}

export interface AcademyPracticeStep {
  task: string
  toolHref?: string
  toolLabel?: string
}

export interface AcademyLessonVideo {
  title: string
  youtubeId: string
}

export interface AcademyLesson {
  id: string
  slug: string
  trackSlug: AcademyTrackSlug
  title: string
  duration: string
  level: 'Beginner' | 'Intermediate'
  summary: string
  outcome: string
  /** Optional curated study video (YouTube embed). */
  video?: AcademyLessonVideo
  infographic: AcademyInfographicType
  infographicTitle: string
  sections: AcademyLessonSection[]
  dos: string[]
  donts: string[]
  practice: AcademyPracticeStep[]
  takeaways: string[]
}

export interface AcademyTrack {
  slug: AcademyTrackSlug
  title: string
  phase: AcademyPhase
  description: string
  moduleCount: number
  readTime: string
}

export interface AcademyQuizOption {
  id: string
  text: string
}

export interface AcademyQuizQuestion {
  id: string
  prompt: string
  options: AcademyQuizOption[]
  correctId: string
  explanation: string
}

export interface AcademyQuiz {
  id: string
  slug: string
  trackSlug: AcademyTrackSlug
  title: string
  description: string
  passPercent: number
  questions: AcademyQuizQuestion[]
}
