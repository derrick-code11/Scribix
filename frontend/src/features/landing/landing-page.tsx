import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HeroDecor } from "@/components/marketing/hero-decor";
import { usePageTitle } from "@/hooks/use-page-title";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-48px" },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

const heroContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const cardInteractive =
  "rounded-2xl border border-scribix-text/8 bg-scribix-panel p-6 transition-all duration-300 ease-out hover:border-scribix-text/12 hover:shadow-md sm:p-8";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-scribix-text/45">
      {children}
    </p>
  );
}

function FeatureIcon({ variant }: { variant: "url" | "editor" | "embed" }) {
  const cls = "h-6 w-6";
  if (variant === "url") {
    return (
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-scribix-surface-tint">
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.19 8.688a4.5 4.5 0 0 1 6.364 6.364l-3.465 3.464a4.5 4.5 0 0 1-6.364 0 4.5 4.5 0 0 1 0-6.364l1.106-1.107"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.81 15.312a4.5 4.5 0 0 1-6.364-6.364l3.465-3.464a4.5 4.5 0 0 1 6.364 0 4.5 4.5 0 0 1 0 6.364l-1.106 1.107"
          />
        </svg>
      </div>
    );
  }
  if (variant === "editor") {
    return (
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-scribix-surface-tint">
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
          />
        </svg>
      </div>
    );
  }
  return (
    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-scribix-surface-tint">
      <svg
        className={cls}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
        />
      </svg>
    </div>
  );
}

const faqLinkClass =
  "font-medium text-scribix-primary underline-offset-2 hover:underline";

const FAQ_ITEMS: { q: string; body: ReactNode }[] = [
  {
    q: "What is Scribix?",
    body: (
      <p>
        Scribix is a writing tool with a built-in public profile. You draft in
        the browser, publish when you want, and share one link for your profile
        and posts.
      </p>
    ),
  },
  {
    q: "What is public versus private?",
    body: (
      <p>
        Published posts and the profile fields you fill in (name, bio, links)
        are visible to anyone with the URL. Drafts stay private to your account
        until you publish.
      </p>
    ),
  },
  {
    q: "Does it cost anything?",
    body: (
      <p>
        There is no charge to sign up or publish right now. If that ever
        changes, we would post clear notice before it applies to you.
      </p>
    ),
  },
  {
    q: "How do I sign in?",
    body: (
      <p>
        Account sign-in is not wired up in this preview. The Log in and Start
        writing screens are placeholders for a future release.
      </p>
    ),
  },
  {
    q: "Can I change my username after signup?",
    body: (
      <p>
        No. Your username is part of your public URL, so it stays fixed after
        you choose it. Pick something you are happy to use long term.
      </p>
    ),
  },
  {
    q: "Can I put posts on my own website?",
    body: (
      <p>
        A small embed script for other sites is not available yet. For now,
        link to your Scribix profile or individual post URLs from anywhere you
        like.
      </p>
    ),
  },
  {
    q: "What if I want to delete my account or content?",
    body: (
      <>
        <p>
          You can remove posts from the app when delete or unpublish is
          available on the post or dashboard.
        </p>
        <p>
          For account deletion, use in-app options if the product shows them, or
          use contact information on the site when it is listed.
        </p>
      </>
    ),
  },
  {
    q: "Where are the legal details?",
    body: (
      <p>
        See the{" "}
        <Link to="/terms" className={faqLinkClass}>
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className={faqLinkClass}>
          Privacy Policy
        </Link>{" "}
        for rules of use and how data is handled.
      </p>
    ),
  },
];

export function LandingPage() {
  usePageTitle("");

  return (
    <>
      <section className="relative overflow-hidden border-b border-scribix-text/5 bg-grain">
        <HeroDecor />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pb-32 sm:pt-14">
          <div className="relative rounded-2xl border border-scribix-text/10 bg-scribix-surface-muted p-8 sm:p-12 lg:p-14">
            <motion.div
              variants={heroContainer}
              initial="hidden"
              animate="show"
              className="relative max-w-3xl"
            >
              <motion.p
                variants={heroItem}
                className="font-mono text-xs uppercase tracking-[0.35em] text-scribix-text/50"
              >
                Writing for the web
              </motion.p>
              <motion.h1
                variants={heroItem}
                className="mt-6 font-display text-[clamp(2.25rem,5vw,3.75rem)] font-medium leading-[1.08] tracking-tight text-scribix-text"
              >
                A{" "}
                <em className="not-italic text-scribix-primary">
                  home for your writing
                </em>
                , not another tab you forget about.
              </motion.h1>
              <motion.p
                variants={heroItem}
                className="mt-6 max-w-xl text-lg leading-[1.75] text-scribix-text/70"
              >
                Write in the editor, publish when you’re ready, and send people
                one link for your bio, résumé, or readme. You don’t need a
                separate blog tool.
              </motion.p>
              <motion.div
                variants={heroItem}
                className="mt-10 flex flex-wrap gap-4"
              >
                <Link to="/signup">
                  <Button className="min-w-[160px]">Start writing</Button>
                </Link>
                <a href="#features">
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-w-[160px]"
                  >
                    What you get
                  </Button>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="border-b border-scribix-text/5 bg-scribix-surface-muted py-20 sm:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp}>
            <SectionLabel>Basics</SectionLabel>
            <h2 className="mt-3 max-w-2xl font-display text-3xl tracking-tight text-scribix-text sm:text-4xl">
              Drafts save while you write. Publishing is a few clicks.
            </h2>
            <p className="mt-4 max-w-2xl text-scribix-text/65">
              Your posts go on a public profile with a normal URL. Share it
              anywhere. People only see the finished page, not the editor.
            </p>
          </motion.div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {(
              [
                {
                  icon: "url" as const,
                  title: "Your URL",
                  body: "You get a profile at a short path. Same link for LinkedIn, GitHub, or the footer of your site.",
                },
                {
                  icon: "editor" as const,
                  title: "Editor in the browser",
                  body: "Headings, lists, links, the usual stuff. Drafts and published posts stay in sync.",
                },
                {
                  icon: "embed" as const,
                  title: "Embeds (maybe later)",
                  body: "I’d like a tiny script so recent posts can show on your own site. It doesn’t exist yet. Link to your profile for now.",
                },
              ] as const
            ).map((item) => (
              <motion.article
                key={item.title}
                {...fadeUp}
                className={cardInteractive}
              >
                <FeatureIcon variant={item.icon} />
                <h3 className="font-display text-xl text-scribix-text">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-scribix-text/65">
                  {item.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-scribix-text/5 bg-scribix-bg py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp}>
            <SectionLabel>Uses</SectionLabel>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-scribix-text sm:text-4xl">
              Good if you already have a site but hate maintaining a blog
            </h2>
          </motion.div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {[
              {
                title: "Developers",
                body: "Changelogs, design notes, side-project write-ups: one place to post and one link to put next to your GitHub.",
                cta: "Sign up",
                href: "/signup",
              },
              {
                title: "Designers",
                body: "Case studies and process notes without standing up WordPress or copying everything into Notion again.",
                cta: "Sign up",
                href: "/signup",
              },
              {
                title: "Your own site",
                body: "If a tiny embed script shows up someday, you could use it on your portfolio or marketing site. For now, link straight to your Scribix profile.",
                cta: "FAQ on embeds",
                href: "#faq",
              },
            ].map((card) => (
              <motion.article
                key={card.title}
                {...fadeUp}
                className={`flex flex-col ${cardInteractive} bg-scribix-bg`}
              >
                <h3 className="font-display text-xl text-scribix-text">
                  {card.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-scribix-text/65">
                  {card.body}
                </p>
                {card.href.startsWith("#") ? (
                  <a
                    href={card.href}
                    className="mt-6 inline-flex font-mono text-xs font-medium uppercase tracking-wider text-scribix-primary transition-colors hover:text-scribix-text"
                  >
                    {card.cta} →
                  </a>
                ) : (
                  <Link
                    to={card.href}
                    className="mt-6 inline-flex font-mono text-xs font-medium uppercase tracking-wider text-scribix-primary transition-colors hover:text-scribix-text"
                  >
                    {card.cta} →
                  </Link>
                )}
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-scribix-text/5 bg-scribix-bg py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp}>
            <SectionLabel>Kinds of posts</SectionLabel>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-scribix-text sm:text-4xl">
              Same editor, whatever you’re writing
            </h2>
            <p className="mt-3 max-w-2xl text-scribix-text/65">
              How-tos, essays, build notes, or whatever you want to put online.
            </p>
          </motion.div>
          <ol className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                n: "01",
                title: "How-tos",
                line: "Steps, code, screenshots if you add them.",
              },
              {
                n: "02",
                title: "Essays",
                line: "Longer pieces when you need more than a thread.",
              },
              {
                n: "03",
                title: "Build notes",
                line: "Version history and updates in one place.",
              },
            ].map((row) => (
              <motion.li
                key={row.n}
                {...fadeUp}
                className="border-l-2 border-scribix-primary/40 pl-5"
              >
                <p className="font-mono text-xs text-scribix-primary">
                  {row.n}
                </p>
                <p className="mt-2 font-display text-xl text-scribix-text">
                  {row.title}
                </p>
                <p className="mt-2 text-sm text-scribix-text/65">{row.line}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-scribix-text/5 bg-scribix-surface-muted py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp}>
            <SectionLabel>Flow</SectionLabel>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-scribix-text sm:text-4xl">
              Write, then publish, then (optional) embed
            </h2>
            <ol className="mt-12 grid gap-8 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Write",
                  line: "Draft in the editor; it saves as you go.",
                },
                {
                  step: "02",
                  title: "Publish",
                  line: "Pick a slug and your post is live on your profile.",
                },
                {
                  step: "03",
                  title: "Embed",
                  line: "If a small embed script exists someday, you’d paste it on your site. Until then, link to your profile.",
                },
              ].map((s) => (
                <li key={s.step} className={cardInteractive}>
                  <p className="font-mono text-xs text-scribix-primary">
                    {s.step}
                  </p>
                  <p className="mt-3 font-display text-xl text-scribix-text">
                    {s.title}
                  </p>
                  <p className="mt-2 text-sm text-scribix-text/65">{s.line}</p>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-scribix-text/5 bg-scribix-bg py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp}>
            <SectionLabel>Notes</SectionLabel>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-scribix-text sm:text-4xl">
              What changed lately
            </h2>
            <p className="mt-3 text-scribix-text/65">
              Occasional write-ups when something worth mentioning lands, with no
              fixed schedule.
            </p>
          </motion.div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                cat: "Update",
                date: "Mar 18, 2026",
                title: "Public profiles and posts",
                excerpt:
                  "Browse public profiles and posts by URL. Writing and accounts are not available in this preview.",
              },
              {
                cat: "Guide",
                date: "Feb 4, 2026",
                title: "From blank draft to a live URL",
                excerpt:
                  "Pick a username, write in the editor, set a slug, publish, then share your public link.",
              },
              {
                cat: "Idea",
                date: "Jan 22, 2026",
                title: "Embeds and custom domains",
                excerpt:
                  "Maybe a script to mirror recent posts on your own site, and custom domains down the line. Nothing promised.",
              },
            ].map((post) => (
              <Link key={post.title} to="/signup" className="group block">
                <motion.article
                  {...fadeUp}
                  className={`flex h-full flex-col ${cardInteractive} transition-colors group-hover:border-scribix-text/15`}
                >
                  <p className="font-mono text-[10px] uppercase tracking-wider text-scribix-text/45">
                    {post.cat} · {post.date}
                  </p>
                  <h3 className="mt-3 font-display text-lg text-scribix-text group-hover:text-scribix-primary">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-scribix-text/60">
                    {post.excerpt}
                  </p>
                  <span className="mt-4 font-mono text-xs text-scribix-primary">
                    Sign up →
                  </span>
                </motion.article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-scribix-surface-muted py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <motion.div {...fadeUp}>
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-scribix-text">
              Common questions
            </h2>
          </motion.div>
          <div className="mt-10 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-scribix-text/10 bg-scribix-panel px-5 py-4 transition-colors open:border-scribix-text/15 open:bg-scribix-panel open:shadow-sm"
              >
                <summary className="cursor-pointer list-none font-medium text-scribix-text marker:content-none [&::-webkit-details-marker]:hidden">
                  {item.q}
                </summary>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-scribix-text/65 [&_p]:leading-relaxed">
                  {item.body}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-scribix-text/8 bg-scribix-surface-wash py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-3xl tracking-tight text-scribix-text sm:text-4xl">
              Give it a spin
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-scribix-text/65">
              Free while the project is up. Pick a username, write something,
              publish when it feels ready.
            </p>
            <Link to="/signup" className="mt-8 inline-block">
              <Button className="min-w-[200px]">Start writing</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
