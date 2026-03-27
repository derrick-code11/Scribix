import { apiRequest } from "@/api/client";
import type {
  ProfileLink,
  ProfileSummary,
  PublicPostCard,
  PublicPostDetailResponse,
} from "@/lib/types";

export type PublicProfileResponse = ProfileSummary & { links: ProfileLink[] };

export async function fetchPublicProfile(username: string) {
  return apiRequest<PublicProfileResponse>(
    `/profiles/${encodeURIComponent(username)}`,
  );
}

export async function fetchPublicPostFeed(username: string, cursor?: string) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  const qs = params.toString();
  return apiRequest<{
    items: PublicPostCard[];
    page_info: { next_cursor: string | null; has_more: boolean };
  }>(
    `/public/${encodeURIComponent(username)}/posts${qs ? `?${qs}` : ""}`,
  );
}

export async function fetchPublicPost(username: string, slug: string) {
  return apiRequest<PublicPostDetailResponse>(
    `/public/${encodeURIComponent(username)}/posts/${encodeURIComponent(slug)}`,
  );
}
