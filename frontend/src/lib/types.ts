export type UserStatus = 'active' | 'suspended' | 'deleted'

export interface UserSummary {
  id: string
  status: UserStatus
}

export interface ProfileSummary {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
}

export interface OnboardingState {
  is_complete: boolean
  missing_fields: string[]
}

export interface MeResponse {
  user: UserSummary
  profile: ProfileSummary | null
  onboarding: OnboardingState
}

export interface AuthCredentialsResponse {
  user: UserSummary
  token: string
}

export interface ProfileLink {
  id: string
  link_type: string
  label: string | null
  url: string
  position: number
}

export interface EditableProfileResponse {
  profile: ProfileSummary
  links: ProfileLink[]
}

export type PostStatus = 'draft' | 'published'

export interface PostTag {
  id: string
  name: string
  slug: string
}

export interface PostListItem {
  id: string
  title: string
  slug: string
  status: PostStatus
  excerpt: string | null
  cover: { id: string; url: string } | null
  tags: PostTag[]
  published_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PostEditorPayload extends PostListItem {
  content_json: Record<string, unknown>
  content_text: string | null
}

export interface PageInfo {
  next_cursor: string | null
  has_more: boolean
}

export interface PostsCursorResponse {
  items: PostListItem[]
  page_info: PageInfo
}

export interface UsernameAvailability {
  username: string
  available: boolean
  reason: string | null
}

export interface PublicPostCard {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_url: string | null
  tags: PostTag[]
  published_at: string | null
}

export interface PublicPostDetailResponse {
  post: {
    id: string
    title: string
    slug: string
    content_json: Record<string, unknown>
    content_text: string | null
    excerpt: string | null
    cover: { url: string; width: number | null; height: number | null } | null
    tags: PostTag[]
    published_at: string | null
    updated_at: string
  }
  author: {
    username: string
    display_name: string
    bio: string | null
    avatar_url: string | null
  }
  seo: {
    title: string
    description: string
    og_image: string | null
    canonical_url: string
  }
}
