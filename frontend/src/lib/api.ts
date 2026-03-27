import { apiRequest } from '@/lib/api-client'
import type {
  EditableProfileResponse,
  MeResponse,
  PostEditorPayload,
  PostListItem,
  PostsCursorResponse,
  ProfileLink,
  ProfileSummary,
  PublicPostCard,
  PublicPostDetailResponse,
  UsernameAvailability,
} from '@/lib/types'

export async function fetchMe() {
  return apiRequest<MeResponse>('/auth/me')
}

export async function checkUsernameAvailability(username: string) {
  return apiRequest<UsernameAvailability>(
    `/profiles/username-availability?username=${encodeURIComponent(username)}`
  )
}

export async function updateProfile(body: {
  username?: string
  display_name?: string
  bio?: string | null
  avatar_media_id?: string | null
}) {
  return apiRequest<{ profile: ProfileSummary; onboarding: { is_complete: boolean } }>('/profiles/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function fetchMyProfile() {
  return apiRequest<EditableProfileResponse>('/profiles/me')
}

export async function replaceProfileLinks(links: ProfileLinkInput[]) {
  return apiRequest<{ links: ProfileLink[] }>('/profiles/me/links', {
    method: 'PUT',
    body: JSON.stringify({ links }),
  })
}

export type ProfileLinkInput = {
  link_type: 'portfolio' | 'github' | 'linkedin' | 'x' | 'other'
  label?: string | null
  url: string
  position: number
}

export type PublicProfileResponse = ProfileSummary & { links: ProfileLink[] }

export async function fetchPublicProfile(username: string) {
  return apiRequest<PublicProfileResponse>(`/profiles/${encodeURIComponent(username)}`, {
    skipAuth: true,
  })
}

export async function listMyPosts(search?: Record<string, string>) {
  const qs = search ? `?${new URLSearchParams(search).toString()}` : ''
  return apiRequest<PostsCursorResponse>(`/posts${qs}`)
}

export async function createDraft(title = 'Untitled Post') {
  return apiRequest<PostListItem>('/posts', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
}

export async function fetchPostForEditor(postId: string) {
  return apiRequest<PostEditorPayload>(`/posts/${postId}`)
}

export async function updatePost(
  postId: string,
  body: {
    title?: string
    content_json?: Record<string, unknown>
    content_text?: string | null
    excerpt?: string | null
    cover_media_id?: string | null
    tags?: string[]
  }
) {
  return apiRequest<PostEditorPayload>(`/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function setPostSlug(postId: string, slug: string) {
  return apiRequest<PostListItem>(`/posts/${postId}/slug`, {
    method: 'PATCH',
    body: JSON.stringify({ slug }),
  })
}

export async function publishPost(postId: string) {
  return apiRequest<PostListItem>(`/posts/${postId}/publish`, { method: 'POST' })
}

export async function unpublishPost(postId: string) {
  return apiRequest<PostListItem>(`/posts/${postId}/unpublish`, { method: 'POST' })
}

export async function fetchPublicPostFeed(username: string, cursor?: string) {
  const params = new URLSearchParams()
  if (cursor) params.set('cursor', cursor)
  const qs = params.toString()
  return apiRequest<{ items: PublicPostCard[]; page_info: { next_cursor: string | null; has_more: boolean } }>(
    `/public/${encodeURIComponent(username)}/posts${qs ? `?${qs}` : ''}`,
    { skipAuth: true }
  )
}

export async function fetchPublicPost(username: string, slug: string) {
  return apiRequest<PublicPostDetailResponse>(
    `/public/${encodeURIComponent(username)}/posts/${encodeURIComponent(slug)}`,
    { skipAuth: true }
  )
}
