export interface ProfileSummary {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
}

export interface ProfileLink {
  id: string
  link_type: string
  label: string | null
  url: string
  position: number
}

export interface PostTag {
  id: string
  name: string
  slug: string
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

export interface OwnPostCard {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  excerpt: string | null
  cover_url: string | null
  tags: PostTag[]
  published_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface OwnPostDetail {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  content_json: Record<string, unknown>
  content_text: string | null
  excerpt: string | null
  cover: {
    id: string
    url: string
    width: number | null
    height: number | null
  } | null
  tags: PostTag[]
  published_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface OwnPostsResponse {
  items: OwnPostCard[]
  page_info: { next_cursor: string | null; has_more: boolean }
}

export interface CreatePostResponse {
  id: string
  title: string
  slug: string
  status: string
  created_at: string
}

export interface UpdatePostResponse {
  id: string
  title: string
  slug: string
  status: string
  updated_at: string
}
