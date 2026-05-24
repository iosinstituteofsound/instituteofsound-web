import { Link, Navigate, useParams } from 'react-router-dom'
import { AcademyInfographic } from '@/components/academy/AcademyInfographic'
import { AcademyLessonVideo } from '@/components/academy/AcademyLessonVideo'
import { AcademyLessonComplete } from '@/components/academy/AcademyLessonComplete'
import { AcademyLessonShell } from '@/components/academy/AcademyLessonShell'
import { getAdjacentLessons, getLesson } from '@/lib/academy/registry'

export default function AcademyLessonPage() {
  const { track, lesson: lessonSlug } = useParams<{ track: string; lesson: string }>()
  const data = getLesson(track ?? '', lessonSlug ?? '')

  if (!data) return <Navigate to={`/academy/${track ?? ''}`} replace />

  const { prev, next } = getAdjacentLessons(data)

  return (
    <AcademyLessonShell lesson={data}>
      {data.trackSlug === 'ear-training' && (
        <div className="academy-lesson-lab-banner">
          <p>Phase 3 interactive drill</p>
          <Link to="/academy/ear-lab">Open Ear Lab →</Link>
        </div>
      )}
      {data.video && <AcademyLessonVideo video={data.video} />}
      <AcademyInfographic type={data.infographic} title={data.infographicTitle} />

      <div className="academy-lesson-body">
        {data.sections.map((section) => (
          <section key={section.heading} className="academy-lesson-section">
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
            {section.bullets && (
              <ul>
                {section.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <div className="academy-dodont-grid">
          <div className="academy-dodont academy-dodont-do">
            <h3>Do</h3>
            <ul>
              {data.dos.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div className="academy-dodont academy-dodont-dont">
            <h3>Don&apos;t</h3>
            <ul>
              {data.donts.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>

        <section className="academy-practice">
          <h2>Practice lab</h2>
          <ol>
            {data.practice.map((p) => (
              <li key={p.task}>
                <span>{p.task}</span>
                {p.toolHref && p.toolLabel && (
                  <Link to={p.toolHref} className="academy-practice-tool">
                    Open {p.toolLabel} →
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className="academy-takeaways">
          <h2>Key takeaways</h2>
          <ul>
            {data.takeaways.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <AcademyLessonComplete lessonId={data.id} />

        <nav className="academy-lesson-nav" aria-label="Lesson navigation">
          {prev ? (
            <Link to={`/academy/${data.trackSlug}/${prev.slug}`} className="academy-lesson-nav-prev">
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={`/academy/${data.trackSlug}/${next.slug}`} className="academy-lesson-nav-next">
              {next.title} →
            </Link>
          ) : (
            <Link to={`/academy/${data.trackSlug}`} className="academy-lesson-nav-next">
              Back to track →
            </Link>
          )}
        </nav>
      </div>
    </AcademyLessonShell>
  )
}
