import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import * as api from '@/lib/api'
import { normalizeTipTapDoc } from '@/lib/tiptap-doc'
import { usePageTitle } from '@/hooks/use-page-title'

export function PublicPostPage() {
  const { username, slug } = useParams<{ username: string; slug: string }>()

  const postQuery = useQuery({
    queryKey: ['public', 'post', username, slug],
    queryFn: () => api.fetchPublicPost(username!, slug!),
    enabled: !!username && !!slug,
  })

  const data = postQuery.data

  let html = ''
  if (data?.post.content_json) {
    try {
      html = generateHTML(normalizeTipTapDoc(data.post.content_json), [StarterKit])
    } catch {
      html = '<p>This content couldn’t be displayed.</p>'
    }
  }

  usePageTitle(data?.seo.title ?? data?.post.title ?? 'Post')

  if (postQuery.isPending) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-scribix-text/50">
        Loading…
      </div>
    )
  }

  if (postQuery.isError || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-display text-xl text-scribix-text">No post at this address</p>
        <Link to="/" className="mt-6 inline-block font-mono text-sm text-scribix-primary">
          ← Home
        </Link>
      </div>
    )
  }

  const { post, author } = data

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="border-b border-scribix-text/10 pb-10">
        <Link
          to={`/${author.username}`}
          className="font-mono text-xs uppercase tracking-wider text-scribix-primary hover:underline"
        >
          ← {author.display_name}
        </Link>
        <h1 className="mt-6 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-medium leading-tight tracking-tight text-scribix-text">
          {post.title}
        </h1>
        {post.published_at && (
          <p className="mt-4 font-mono text-xs text-scribix-text/45">
            {new Date(post.published_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
        {post.tags.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <li
                key={t.id}
                className="rounded-full bg-scribix-surface-tint px-3 py-1 font-mono text-[11px] text-scribix-text/70"
              >
                {t.name}
              </li>
            ))}
          </ul>
        )}
      </header>

      <div
        className="prose-public mt-12 text-scribix-text/90 [&_a]:text-scribix-primary [&_h1]:font-display [&_h2]:font-display [&_p]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <footer className="mt-20 border-t border-scribix-text/10 pt-10">
        <div className="flex items-center gap-4">
          <div
            className="h-14 w-14 shrink-0 rounded-sm bg-scribix-surface-muted ring-1 ring-scribix-text/10"
            aria-hidden
          />
          <div>
            <p className="font-medium text-scribix-text">{author.display_name}</p>
            <p className="font-mono text-xs text-scribix-text/45">@{author.username}</p>
          </div>
        </div>
        {author.bio && <p className="mt-4 text-sm text-scribix-text/70">{author.bio}</p>}
      </footer>
    </article>
  )
}
