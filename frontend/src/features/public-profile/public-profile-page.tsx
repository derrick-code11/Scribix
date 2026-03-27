import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import * as api from "@/api/public";
import { usePageTitle } from "@/hooks/use-page-title";
import { AuthorAvatar } from "@/components/author-avatar";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <div className="animate-pulse rounded-2xl border border-scribix-border bg-scribix-panel/30 p-8 sm:p-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="h-20 w-20 shrink-0 rounded-full bg-scribix-surface-muted" />
          <div className="w-full flex-1 space-y-3">
            <div className="mx-auto h-9 max-w-xs rounded bg-scribix-surface-muted sm:mx-0 sm:max-w-md" />
            <div className="mx-auto h-4 max-w-32 rounded bg-scribix-surface-muted sm:mx-0" />
            <div className="mx-auto mt-4 h-4 max-w-lg rounded bg-scribix-surface-muted sm:mx-0" />
          </div>
        </div>
      </div>
      <div className="mt-12 space-y-4">
        <div className="h-3 w-24 rounded bg-scribix-surface-muted" />
        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-scribix-border bg-scribix-panel/20"
            >
              <div className="aspect-[2.1/1] bg-scribix-surface-muted" />
              <div className="space-y-2 p-5">
                <div className="h-3 w-20 rounded bg-scribix-surface-muted" />
                <div className="h-6 w-full rounded bg-scribix-surface-muted" />
                <div className="h-4 w-full rounded bg-scribix-surface-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();

  const profileQuery = useQuery({
    queryKey: ["public", "profile", username],
    queryFn: () => api.fetchPublicProfile(username!),
    enabled: !!username,
  });

  const postsQuery = useQuery({
    queryKey: ["public", "posts", username],
    queryFn: () => api.fetchPublicPostFeed(username!),
    enabled: !!username && profileQuery.isSuccess,
  });

  const profile = profileQuery.data;

  usePageTitle(profile?.display_name ?? username ?? "Profile");

  if (profileQuery.isPending) {
    return <ProfileSkeleton />;
  }

  if (profileQuery.isError || !profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-display text-xl text-scribix-text">
          No profile at that address
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

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <section className="relative overflow-hidden rounded-2xl border border-scribix-border bg-scribix-panel/50 shadow-[inset_0_1px_0_0_color-mix(in_srgb,var(--color-scribix-text)_7%,transparent)]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,color-mix(in_srgb,var(--color-scribix-primary)_14%,transparent),transparent_55%)]"
          aria-hidden
        />
        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-start sm:gap-10 sm:text-left">
            <AuthorAvatar
              photoUrl={profile.avatar_url}
              name={profile.display_name}
              size="lg"
              className="ring-4 ring-scribix-border/25 shadow-xl sm:mt-1"
            />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-scribix-text-muted">
                Writer
              </p>
              <h1 className="mt-2 font-display text-[clamp(1.85rem,4vw,2.75rem)] font-medium leading-tight tracking-tight text-scribix-text">
                {profile.display_name}
              </h1>
              <p className="mt-2 font-mono text-sm text-scribix-text/45">
                @{profile.username}
              </p>
              {profile.bio && (
                <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-scribix-text/80 sm:mx-0">
                  {profile.bio}
                </p>
              )}
              {profile.links.length > 0 && (
                <ul className="mt-8 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {profile.links.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-full border border-scribix-border bg-scribix-surface-muted/80 px-4 py-2 font-mono text-xs text-scribix-text/85 transition-colors hover:border-scribix-primary/45 hover:bg-scribix-border-subtle hover:text-scribix-text"
                      >
                        {link.label || link.link_type}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 sm:mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-scribix-border/80 pb-4">
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.28em] text-scribix-text-muted">
              Latest writing
            </h2>
            <p className="mt-1 text-sm text-scribix-text/50">
              Posts published on Scribix
            </p>
          </div>
        </div>

        {postsQuery.isPending && (
          <p className="mt-10 text-sm text-scribix-text/50">Loading posts…</p>
        )}

        {postsQuery.data && postsQuery.data.items.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed border-scribix-border bg-scribix-surface-muted/40 px-6 py-14 text-center">
            <p className="font-display text-lg text-scribix-text/70">
              Nothing published yet
            </p>
            <p className="mt-2 text-sm text-scribix-text/45">
              When this writer publishes, their posts will show up here.
            </p>
          </div>
        )}

        {postsQuery.data && postsQuery.data.items.length > 0 && (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 sm:gap-7">
            {postsQuery.data.items.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/${profile.username}/${p.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-scribix-border bg-scribix-panel/40 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-scribix-border-strong hover:shadow-md"
                >
                  <div className="relative aspect-[2.15/1] overflow-hidden bg-scribix-surface-muted">
                    {p.cover_url ? (
                      <img
                        src={p.cover_url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div
                        className="h-full w-full bg-linear-to-br from-scribix-surface-muted via-scribix-bg to-scribix-surface-muted"
                        aria-hidden
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <time
                      dateTime={p.published_at ?? undefined}
                      className="font-mono text-[11px] uppercase tracking-wider text-scribix-text/45"
                    >
                      {formatDate(p.published_at)}
                    </time>
                    <h3 className="mt-2 font-display text-xl leading-snug text-scribix-text transition-colors group-hover:text-scribix-primary sm:text-[1.35rem]">
                      {p.title}
                    </h3>
                    {p.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-scribix-text/65">
                        {p.excerpt}
                      </p>
                    )}
                    {p.tags.length > 0 && (
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {p.tags.slice(0, 4).map((t) => (
                          <li key={t.id}>
                            <span className="inline-flex rounded-md border border-scribix-border/70 bg-scribix-bg/80 px-2 py-0.5 font-mono text-[10px] text-scribix-text/60">
                              {t.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
