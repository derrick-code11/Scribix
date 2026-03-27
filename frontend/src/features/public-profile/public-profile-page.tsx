import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import * as api from "@/lib/api";
import { usePageTitle } from "@/hooks/use-page-title";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-scribix-text/50">
        Loading…
      </div>
    );
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
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="border-b border-scribix-text/10 pb-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div
            className="h-20 w-20 shrink-0 rounded-sm bg-scribix-surface-muted ring-1 ring-scribix-text/10"
            aria-hidden
          />
          <div>
            <h1 className="font-display text-3xl tracking-tight text-scribix-text sm:text-4xl">
              {profile.display_name}
            </h1>
            <p className="mt-1 font-mono text-sm text-scribix-text/45">
              @{profile.username}
            </p>
            {profile.bio && (
              <p className="mt-4 max-w-xl text-scribix-text/75">
                {profile.bio}
              </p>
            )}
            {profile.links.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-3">
                {profile.links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-scribix-text/12 bg-scribix-panel px-4 py-1.5 font-mono text-xs text-scribix-text/80 transition-colors hover:border-scribix-primary/40"
                    >
                      {link.label || link.link_type}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </header>

      <section className="mt-14">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-scribix-text/45">
          Posts
        </h2>
        {postsQuery.isPending && (
          <p className="mt-6 text-sm text-scribix-text/50">Loading…</p>
        )}
        {postsQuery.data && postsQuery.data.items.length === 0 && (
          <p className="mt-6 text-scribix-text/55">Nothing published yet.</p>
        )}
        {postsQuery.data && postsQuery.data.items.length > 0 && (
          <ul className="mt-8 space-y-6">
            {postsQuery.data.items.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/${profile.username}/${p.slug}`}
                  className="group block rounded-2xl border border-transparent px-1 py-2 transition-colors hover:border-scribix-text/8 hover:bg-scribix-surface-muted"
                >
                  <p className="font-mono text-[11px] uppercase tracking-wider text-scribix-text/45">
                    {formatDate(p.published_at)}
                  </p>
                  <h3 className="mt-1 font-display text-xl text-scribix-text group-hover:text-scribix-primary">
                    {p.title}
                  </h3>
                  {p.excerpt && (
                    <p className="mt-2 text-sm text-scribix-text/65">
                      {p.excerpt}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
