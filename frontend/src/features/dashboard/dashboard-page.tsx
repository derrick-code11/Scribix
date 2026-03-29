import { useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePageTitle } from "@/hooks/use-page-title";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useAuth } from "@/context/auth-context";
import {
  createPost,
  fetchOwnPosts,
  deletePost,
  publishPost,
  unpublishPost,
} from "@/api/posts";
import type { OwnPostCard } from "@/lib/types";

type StatusFilter = "all" | "draft" | "published";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DashboardPage() {
  usePageTitle("Dashboard");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusFilter = (searchParams.get("status") as StatusFilter) || "all";
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const debouncedUpdate = useDebouncedCallback((val: string) => {
    setDebouncedSearch(val);
    const next = new URLSearchParams(searchParams);
    if (val) next.set("q", val);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  }, 350);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      debouncedUpdate(e.target.value);
    },
    [debouncedUpdate],
  );

  const setStatus = useCallback(
    (s: StatusFilter) => {
      const next = new URLSearchParams(searchParams);
      if (s === "all") next.delete("status");
      else next.set("status", s);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const postsQuery = useInfiniteQuery({
    queryKey: ["own-posts", statusFilter, debouncedSearch],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      fetchOwnPosts({
        status: statusFilter,
        q: debouncedSearch || undefined,
        cursor: pageParam || undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.page_info.next_cursor,
  });

  const createMutation = useMutation({
    mutationFn: () => createPost("Untitled"),
    onSuccess: (data) => {
      navigate(`/editor/${data.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["own-posts"] }),
  });

  const publishMutation = useMutation({
    mutationFn: publishPost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["own-posts"] }),
  });

  const unpublishMutation = useMutation({
    mutationFn: unpublishPost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["own-posts"] }),
  });

  const posts = postsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const hasMore = postsQuery.data?.pages.at(-1)?.page_info.has_more ?? false;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-scribix-text/45">
            Dashboard
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-scribix-text sm:text-4xl">
            Your Posts
          </h1>
        </div>
        <Button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Creating…" : "New Post"}
        </Button>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          {(["all", "draft", "published"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-sm px-3 py-1.5 font-mono text-xs capitalize transition-colors ${
                statusFilter === s
                  ? "bg-scribix-primary text-scribix-primary-fg"
                  : "text-scribix-text/60 hover:bg-scribix-text/4"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <Input
          placeholder="Search posts…"
          value={search}
          onChange={handleSearchChange}
          className="max-w-xs"
        />
      </div>

      <div className="mt-8">
        {postsQuery.isPending && (
          <p className="py-12 text-center text-sm text-scribix-text/50">
            Loading…
          </p>
        )}

        {postsQuery.isSuccess && posts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-scribix-text/12 py-16 text-center">
            <p className="font-display text-xl text-scribix-text/70">
              {debouncedSearch ? "No posts match your search" : "No posts yet"}
            </p>
            <p className="mt-2 text-sm text-scribix-text/50">
              {debouncedSearch
                ? "Try a different search term"
                : "Create your first post and start writing"}
            </p>
            {!debouncedSearch && (
              <Button
                className="mt-6"
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
              >
                Write your first post
              </Button>
            )}
          </div>
        )}

        {posts.length > 0 && (
          <ul className="space-y-3">
            {posts.map((post) => (
              <PostRow
                key={post.id}
                post={post}
                username={profile?.username}
                onDelete={() => deleteMutation.mutate(post.id)}
                onPublish={() => publishMutation.mutate(post.id)}
                onUnpublish={() => unpublishMutation.mutate(post.id)}
              />
            ))}
          </ul>
        )}

        {hasMore && (
          <div className="mt-6 text-center">
            <Button
              variant="secondary"
              onClick={() => postsQuery.fetchNextPage()}
              disabled={postsQuery.isFetchingNextPage}
            >
              {postsQuery.isFetchingNextPage ? "Loading more…" : "Load more"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function PostRow({
  post,
  username,
  onDelete,
  onPublish,
  onUnpublish,
}: {
  post: OwnPostCard;
  username?: string;
  onDelete: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}) {
  return (
    <li className="group rounded-xl border border-scribix-text/8 bg-scribix-panel px-5 py-4 transition-colors hover:border-scribix-text/15">
      <div className="flex items-start justify-between gap-4">
        <Link to={`/editor/${post.id}`} className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <h3 className="truncate font-display text-lg text-scribix-text group-hover:text-scribix-primary">
              {post.title || "Untitled"}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                post.status === "published"
                  ? "bg-scribix-primary/10 text-scribix-primary"
                  : "bg-scribix-text/6 text-scribix-text/50"
              }`}
            >
              {post.status}
            </span>
          </div>
          {post.excerpt && (
            <p className="mt-1.5 line-clamp-1 text-sm text-scribix-text/55">
              {post.excerpt}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3">
            <span className="font-mono text-[11px] text-scribix-text/40">
              {post.status === "published"
                ? `Published ${formatDate(post.published_at)}`
                : `Edited ${formatDate(post.updated_at)}`}
            </span>
            {post.tags.length > 0 && (
              <div className="flex gap-1.5">
                {post.tags.slice(0, 3).map((t) => (
                  <span
                    key={t.id}
                    className="rounded-full bg-scribix-surface-tint px-2 py-0.5 font-mono text-[10px] text-scribix-text/60"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          {post.status === "published" && username && (
            <a
              href={`/${username}/${post.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-sm px-2 py-1 font-mono text-[11px] text-scribix-text/50 transition-colors hover:bg-scribix-text/4 hover:text-scribix-text/80"
            >
              View
            </a>
          )}
          {post.status === "draft" ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                onPublish();
              }}
              className="rounded-sm px-2 py-1 font-mono text-[11px] text-scribix-primary transition-colors hover:bg-scribix-primary/8"
            >
              Publish
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                onUnpublish();
              }}
              className="rounded-sm px-2 py-1 font-mono text-[11px] text-scribix-text/50 transition-colors hover:bg-scribix-text/4"
            >
              Unpublish
            </button>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="rounded-sm px-2 py-1 font-mono text-[11px] text-red-500/70 transition-colors hover:bg-red-500/8 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}
