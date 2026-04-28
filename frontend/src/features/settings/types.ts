import type { ProfileLink } from "@/lib/types";

export interface OwnProfileResponse {
  profile: {
    id: string;
    username: string;
    display_name: string;
    bio: string | null;
    avatar_url: string | null;
  };
  links: ProfileLink[];
}

export interface EmbedFeedPreview {
  username: string;
  items: {
    title: string;
    slug: string;
    url: string;
    absolute_url: string | null;
    excerpt: string | null;
    published_at: string | null;
  }[];
  page_info: {
    limit: number;
    offset: number;
    returned: number;
    has_more: boolean;
    next_offset: number | null;
  };
}
