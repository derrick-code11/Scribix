import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import * as api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { usePageTitle } from '@/hooks/use-page-title'
import { useAuth } from '@/hooks/use-auth'

function formatDate(iso: string | null) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function DashboardPage() {
  usePageTitle('Posts')
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const postsQuery = useQuery({
    queryKey: ['posts', 'list'],
    queryFn: () => api.listMyPosts({ status: 'all', sort: 'updated_at', order: 'desc' }),
  })

  const createMutation = useMutation({
    mutationFn: () => api.createDraft(),
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] })
      navigate(`/editor/${post.id}`)
    },
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-scribix-text">
            Posts
          </h1>
          {profile && (
            <p className="mt-2 text-sm text-scribix-text/60">
              Your public page:{' '}
              <a
                href={`/${profile.username}`}
                className="font-mono text-scribix-primary hover:underline"
              >
                /{profile.username}
              </a>
            </p>
          )}
        </div>
        <Button type="button" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creating…' : 'New post'}
        </Button>
      </div>

      <div className="mt-12">
        {postsQuery.isPending && (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        )}
        {postsQuery.isError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Couldn&apos;t load posts. Check your connection and refresh the page.
          </p>
        )}
        {postsQuery.data && postsQuery.data.items.length === 0 && (
          <div className="rounded-2xl border border-scribix-text/8 bg-scribix-surface-muted px-6 py-16 text-center">
            <p className="font-display text-xl text-scribix-text">No posts yet</p>
            <p className="mt-2 text-sm text-scribix-text/60">
              Start a draft and publish when you want it live.
            </p>
            <Button type="button" className="mt-8" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'New draft'}
            </Button>
          </div>
        )}
        {postsQuery.data && postsQuery.data.items.length > 0 && (
          <ul className="divide-y divide-scribix-text/8 rounded-2xl border border-scribix-text/8 bg-scribix-panel">
            {postsQuery.data.items.map((post) => (
              <li key={post.id}>
                <Link
                  to={`/editor/${post.id}`}
                  className="flex flex-col gap-1 px-5 py-4 transition-colors hover:bg-scribix-surface-tint/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-scribix-text">{post.title}</p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-scribix-text/45">
                      {post.status === 'published' ? 'Published' : 'Draft'} · Updated {formatDate(post.updated_at)}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-scribix-primary">Edit →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
