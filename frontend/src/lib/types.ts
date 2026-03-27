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
