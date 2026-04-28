import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { generateHTML } from "@tiptap/html";
import * as api from "@/api/public";
import { normalizeTipTapDoc } from "@/lib/tiptap-doc";
import { usePageTitle } from "@/hooks/use-page-title";
import { getHtmlExtensions } from "@/features/editor/editor-extensions";
import { AuthorAvatar } from "@/components/author-avatar";
import { useHighlightCodeBlocks } from "@/hooks/use-highlight-code-blocks";

export function PublicPostPage() {
  const { username, slug } = useParams<{ username: string; slug: string }>();

  const postQuery = useQuery({
    queryKey: ["public", "post", username, slug],
    queryFn: () => api.fetchPublicPost(username!, slug!),
    enabled: !!username && !!slug,
  });

  const data = postQuery.data;
  let html = "";
  if (data?.post.content_json) {
    try {
      html = generateHTML(
        normalizeTipTapDoc(data.post.content_json),
        getHtmlExtensions(),
      );
    } catch {
      html = "<p>This content couldn’t be displayed.</p>";
    }
  }

  usePageTitle(data?.seo.title ?? data?.post.title ?? "Post");

  const contentRef = useHighlightCodeBlocks(
    html,
    postQuery.isSuccess && !!data,
  );

  if (postQuery.isPending) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-scribix-text/50">
        Loading…
      </div>
    );
  }

  if (postQuery.isError || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-display text-xl text-scribix-text">
          No post at this address
        </p>
        <Link
          to="/"
          className="mt-6 inline-block font-mono text-sm text-scribix-primary"
        >
          ← Home
        </Link>
      </div>
    );
  }

  const { post, author } = data;

  return (
    <article className="mx-auto max-w-3xl px-4 pb-8 pt-2 sm:px-6 sm:pt-4">
      <header className="border-b border-scribix-border/80 pb-10">
        <Link
          to={`/${author.username}`}
          className="group inline-flex items-center gap-3 rounded-lg py-1 transition-colors hover:text-scribix-primary"
        >
          <AuthorAvatar
            photoUrl={author.avatar_url}
            name={author.display_name}
            size="sm"
            className="ring-scribix-border/35"
          />
          <span className="font-mono text-xs uppercase tracking-wider text-scribix-primary group-hover:underline">
            {author.display_name}
          </span>
        </Link>

        {post.cover?.url && (
          <div className="mt-8 overflow-hidden rounded-xl border border-scribix-border shadow-[0_2px_24px_-8px_rgba(0,0,0,0.35)]">
            <img
              src={post.cover.url}
              alt=""
              width={post.cover.width ?? undefined}
              height={post.cover.height ?? undefined}
              className="max-h-[min(55vh,480px)] w-full object-cover"
            />
          </div>
        )}

        <h1 className="mt-8 font-display text-[clamp(1.85rem,4.5vw,2.85rem)] font-medium leading-[1.12] tracking-tight text-scribix-text">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-scribix-text/70 sm:text-lg">
            {post.excerpt}
          </p>
        )}

        {post.published_at && (
          <p className="mt-5 font-mono text-xs text-scribix-text/45">
            {new Date(post.published_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}

        {post.tags.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <li key={t.id}>
                <span className="inline-flex rounded-full border border-scribix-border/80 bg-scribix-surface-muted/80 px-3 py-1 font-mono text-[11px] text-scribix-text/75">
                  {t.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </header>

      <div
        ref={contentRef}
        className="prose-public mt-12 text-scribix-text/90 [&_a]:text-scribix-primary [&_h1]:font-display [&_h2]:font-display [&_p]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <footer className="mt-16 rounded-2xl border border-scribix-border bg-scribix-panel/60 p-6 shadow-[inset_0_1px_0_0_color-mix(in_srgb,var(--color-scribix-text)_6%,transparent)] sm:p-8">
        <Link
          to={`/${author.username}`}
          className="flex items-start gap-4 transition-opacity hover:opacity-90"
        >
          <AuthorAvatar
            photoUrl={author.avatar_url}
            name={author.display_name}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-scribix-text">
              {author.display_name}
            </p>
            <p className="mt-0.5 font-mono text-xs text-scribix-text/45">
              @{author.username}
            </p>
            {author.bio && (
              <p className="mt-3 text-sm leading-relaxed text-scribix-text/70">
                {author.bio}
              </p>
            )}
          </div>
        </Link>
      </footer>
    </article>
  );
}
