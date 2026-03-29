import type { RefObject } from "react";

type EditorPreviewPaneProps = {
  cover: {
    url: string;
    width: number | null;
    height: number | null;
  } | null;
  title: string;
  excerpt: string;
  tags: string[];
  username?: string;
  previewHtml: string;
  previewContentRef: RefObject<HTMLDivElement | null>;
};

export function EditorPreviewPane({
  cover,
  title,
  excerpt,
  tags,
  username,
  previewHtml,
  previewContentRef,
}: EditorPreviewPaneProps) {
  return (
    <article className="w-full max-w-3xl px-3 pb-24 pt-8 text-left sm:px-5 md:px-8">
      <header className="border-b border-scribix-border pb-8 text-left">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-scribix-text-muted">
          Preview
        </p>
        {cover?.url && (
          <div className="mt-4 overflow-hidden rounded-lg border border-scribix-border">
            <img
              src={cover.url}
              alt=""
              width={cover.width ?? undefined}
              height={cover.height ?? undefined}
              className="max-h-[min(50vh,420px)] w-full object-cover"
            />
          </div>
        )}
        <h1 className="mt-2 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-medium leading-tight tracking-tight text-scribix-text">
          {title || "Untitled"}
        </h1>
        {excerpt && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-scribix-text/70 sm:text-lg">
            {excerpt}
          </p>
        )}
        {username && (
          <p className="mt-3 font-mono text-xs text-scribix-text-muted">
            @{username}
          </p>
        )}
        {tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag}>
                <span className="inline-flex rounded-full border border-scribix-border/80 bg-scribix-surface-muted/80 px-3 py-1 font-mono text-[11px] text-scribix-text/75">
                  {tag}
                </span>
              </li>
            ))}
          </ul>
        )}
      </header>
      <div
        ref={previewContentRef}
        className="prose-public mt-10 text-scribix-text/90 [&_a]:text-scribix-primary"
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />
    </article>
  );
}
