import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import type { JSONContent } from '@tiptap/core'
import * as api from '@/lib/api'
import { normalizeTipTapDoc } from '@/lib/tiptap-doc'
import { ApiError } from '@/lib/api-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { usePageTitle } from '@/hooks/use-page-title'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { useAuth } from '@/hooks/use-auth'

export function EditorPage() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { profile } = useAuth()
  const [titleOverride, setTitleOverride] = useState<string | null>(null)
  const [slugOverride, setSlugOverride] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [publishError, setPublishError] = useState<string | null>(null)

  const postQuery = useQuery({
    queryKey: ['posts', postId],
    queryFn: () => api.fetchPostForEditor(postId!),
    enabled: !!postId,
  })

  const post = postQuery.data
  const title = titleOverride ?? post?.title ?? ''
  const slug = slugOverride ?? post?.slug ?? ''
  const slugDirty = slugOverride !== null

  usePageTitle(post?.title ? `Edit · ${post.title}` : 'Editor')

  const persistBody = useCallback(
    async (json: JSONContent, text: string) => {
      if (!postId) return
      setSaveState('saving')
      try {
        await api.updatePost(postId, {
          content_json: json as Record<string, unknown>,
          content_text: text || null,
        })
        setSaveState('saved')
        queryClient.invalidateQueries({ queryKey: ['posts', 'list'] })
        window.setTimeout(() => setSaveState((s) => (s === 'saved' ? 'idle' : s)), 2000)
      } catch {
        setSaveState('error')
      }
    },
    [postId, queryClient]
  )

  const debouncedPersist = useDebouncedCallback(persistBody, 900)

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Placeholder.configure({ placeholder: 'Write the body of your post…' }),
      ],
      content: { type: 'doc', content: [] },
      editorProps: {
        attributes: {
          class:
            'prose-editor focus:outline-none min-h-[min(50vh,420px)] px-1 text-scribix-text leading-relaxed',
        },
      },
      onUpdate: ({ editor: ed }) => {
        debouncedPersist(ed.getJSON(), ed.getText())
      },
    },
    [postId]
  )

  useEffect(() => {
    if (!post || !editor || editor.isDestroyed) return
    editor.commands.setContent(normalizeTipTapDoc(post.content_json), { emitUpdate: false })
  }, [post, editor])

  const saveMetaMutation = useMutation({
    mutationFn: async () => {
      if (!postId) return
      await api.updatePost(postId, { title })
      if (slugDirty && slug) {
        await api.setPostSlug(postId, slug)
      }
    },
    onSuccess: async () => {
      setTitleOverride(null)
      setSlugOverride(null)
      await queryClient.invalidateQueries({ queryKey: ['posts', postId] })
      await queryClient.invalidateQueries({ queryKey: ['posts', 'list'] })
      setSaveState('saved')
      window.setTimeout(() => setSaveState('idle'), 1500)
    },
    onError: () => {
      setSaveState('error')
    },
  })

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!postId) throw new Error('Missing post')
      await api.updatePost(postId, { title })
      if (slugDirty && slug) {
        await api.setPostSlug(postId, slug)
      }
      return api.publishPost(postId)
    },
    onSuccess: async (published) => {
      if (profile) {
        navigate(`/${profile.username}/${published.slug}`)
      } else {
        navigate('/dashboard')
      }
      await queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (e: unknown) => {
      const msg = e instanceof ApiError ? e.message : 'Publish failed'
      setPublishError(msg)
    },
  })

  const handleBlurTitle = () => {
    if (!postId || !post || title === post.title) return
    void api.updatePost(postId, { title }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['posts', postId] })
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] })
    })
  }

  if (postQuery.isPending || !postId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (postQuery.isError || !post) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <p className="text-red-700">This post didn’t load.</p>
        <Link to="/dashboard" className="mt-4 inline-block font-mono text-sm text-scribix-primary">
          ← Back to posts
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="font-mono text-xs uppercase tracking-wider text-scribix-text/55 hover:text-scribix-text"
        >
          ← Posts
        </Link>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-scribix-text/45">
            {saveState === 'saving' && 'Saving…'}
            {saveState === 'saved' && 'Saved'}
            {saveState === 'error' && 'Save failed'}
            {saveState === 'idle' && ''}
          </span>
          <Button
            type="button"
            variant="secondary"
            onClick={() => saveMetaMutation.mutate()}
            disabled={saveMetaMutation.isPending}
          >
            Save title and URL
          </Button>
          <Button
            type="button"
            onClick={() => {
              setPublishError(null)
              publishMutation.mutate()
            }}
            disabled={post.status === 'published' || publishMutation.isPending}
          >
            {post.status === 'published' ? 'Published' : publishMutation.isPending ? 'Publishing…' : 'Publish'}
          </Button>
        </div>
      </div>

      {publishError && (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{publishError}</p>
      )}

      <div className="mt-10 space-y-8">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitleOverride(e.target.value)}
            onBlur={handleBlurTitle}
            className="font-display text-2xl font-medium"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">URL slug</Label>
          {profile && (
            <p className="text-xs text-scribix-text/50">
              /{profile.username}/
              <span className="font-mono text-scribix-text/80">{slug || '…'}</span>
            </p>
          )}
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlugOverride(e.target.value)}
            className="font-mono text-sm"
          />
        </div>
        <div className="rounded-2xl border border-scribix-text/10 bg-scribix-panel px-4 py-6 shadow-sm sm:px-6">
          {editor && <EditorContent editor={editor} />}
        </div>
      </div>
    </div>
  )
}
