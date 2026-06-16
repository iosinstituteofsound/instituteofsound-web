import { Link, useParams } from 'react-router-dom'
import { useArticle } from '@/modules/explore/hooks/use-explore'
import { Loader } from '@/shared/components/feedback/loader'
import '@/modules/explore/styles/explore.css'

export function ArticlePage() {
  const { slug = '' } = useParams()
  const { data: article, isLoading, isError } = useArticle(slug)

  if (isLoading) return <Loader className="min-h-screen bg-background" />
  if (isError || !article) {
    return (
      <div className="explore-page flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Article not found.</p>
        <Link to="/explore" className="explore-accent-text text-sm underline">
          Back to Explore
        </Link>
      </div>
    )
  }

  return (
    <article className="explore-page min-h-screen">
      {article.coverUrl ? (
        <img src={article.coverUrl} alt="" className="max-h-[50vh] w-full object-cover" />
      ) : null}
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Link to="/explore" className="explore-accent-text text-xs uppercase tracking-widest">
          ← Explore
        </Link>
        <h1 className="explore-section-title mt-4">{article.title}</h1>
        {article.excerpt ? (
          <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>
        ) : null}
        <div
          className="explore-article-body prose prose-sm dark:prose-invert mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
        />
      </div>
    </article>
  )
}
