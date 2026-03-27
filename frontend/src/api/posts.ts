import { authRequest } from "@/api/client";
import type {
  CreatePostResponse,
  OwnPostDetail,
  OwnPostsResponse,
  UpdatePostResponse,
  PostTag,
  ProfileLink,
} from "@/lib/types";

export function createPost(title = "Untitled") {
  return authRequest<CreatePostResponse>("/posts", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export interface ListPostsParams {
  status?: "draft" | "published" | "all";
  q?: string;
  tag?: string;
  sort?: string;
  order?: string;
  cursor?: string;
  limit?: number;
}

export function fetchOwnPosts(params: ListPostsParams = {}) {
  const qs = new URLSearchParams();
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.q) qs.set("q", params.q);
  if (params.tag) qs.set("tag", params.tag);
  if (params.sort) qs.set("sort", params.sort);
  if (params.order) qs.set("order", params.order);
  if (params.cursor) qs.set("cursor", params.cursor);
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return authRequest<OwnPostsResponse>(`/posts${query ? `?${query}` : ""}`);
}

export function fetchOwnPost(postId: string) {
  return authRequest<OwnPostDetail>(`/posts/${postId}`);
}

export function updatePost(
  postId: string,
  data: {
    title?: string;
    content_json?: Record<string, unknown>;
    content_text?: string | null;
    excerpt?: string | null;
    cover_media_id?: string | null;
    tags?: string[];
  },
) {
  return authRequest<UpdatePostResponse>(`/posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function publishPost(postId: string) {
  return authRequest<{ id: string; status: string; published_at: string }>(
    `/posts/${postId}/publish`,
    { method: "POST" },
  );
}

export function unpublishPost(postId: string) {
  return authRequest<{ id: string; status: string }>(
    `/posts/${postId}/unpublish`,
    { method: "POST" },
  );
}

export function deletePost(postId: string) {
  return authRequest<{ id: string; deleted: boolean }>(`/posts/${postId}`, {
    method: "DELETE",
  });
}

export function restorePost(postId: string) {
  return authRequest<{ id: string; restored: boolean }>(
    `/posts/${postId}/restore`,
    { method: "POST" },
  );
}

export function searchTags(query?: string) {
  const qs = query ? `?query=${encodeURIComponent(query)}` : "";
  return authRequest<PostTag[]>(`/tags${qs}`);
}

export function replaceProfileLinks(
  links: {
    link_type: string;
    label: string | null;
    url: string;
    position: number;
  }[],
) {
  return authRequest<ProfileLink[]>("/profiles/me/links", {
    method: "PUT",
    body: JSON.stringify({ links }),
  });
}
