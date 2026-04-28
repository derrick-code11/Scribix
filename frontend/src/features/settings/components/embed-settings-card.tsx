import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsCard } from "@/features/settings/components/settings-card";
import { SettingsFieldLabel } from "@/features/settings/components/settings-field-label";
import type { EmbedFeedPreview } from "@/features/settings/types";
import type { RefObject } from "react";

interface EmbedSettingsCardProps {
  embedSectionRef: RefObject<HTMLElement | null>;
  normalizedUsername: string;
  embedLimit: string;
  embedTarget: string;
  embedClassPrefix: string;
  embedNewTab: boolean;
  widgetSnippet: string;
  dataSnippet: string;
  copiedSnippet: "widget" | "data" | null;
  embedPreviewPending: boolean;
  embedPreviewError: boolean;
  embedPreviewData?: EmbedFeedPreview;
  onEmbedLimitChange: (value: string) => void;
  onEmbedTargetChange: (value: string) => void;
  onEmbedClassPrefixChange: (value: string) => void;
  onEmbedNewTabChange: (checked: boolean) => void;
  onCopySnippet: (text: string, kind: "widget" | "data") => void;
}

export function EmbedSettingsCard({
  embedSectionRef,
  normalizedUsername,
  embedLimit,
  embedTarget,
  embedClassPrefix,
  embedNewTab,
  widgetSnippet,
  dataSnippet,
  copiedSnippet,
  embedPreviewPending,
  embedPreviewError,
  embedPreviewData,
  onEmbedLimitChange,
  onEmbedTargetChange,
  onEmbedClassPrefixChange,
  onEmbedNewTabChange,
  onCopySnippet,
}: EmbedSettingsCardProps) {
  return (
    <SettingsCard title="Embed" className="mt-8">
      <section ref={embedSectionRef} id="embed-settings" className="mt-4 space-y-6">
        <p className="text-sm text-scribix-text-muted">
          Share your latest Scribix posts on any site with a copy-paste script.
          Widget mode auto-renders cards; data mode gives you JSON for custom UI.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <SettingsFieldLabel>Username</SettingsFieldLabel>
            <Input value={normalizedUsername} readOnly />
          </div>
          <div>
            <SettingsFieldLabel>Limit (1-20)</SettingsFieldLabel>
            <Input
              value={embedLimit}
              inputMode="numeric"
              onChange={(e) => onEmbedLimitChange(e.target.value)}
            />
          </div>
          <div>
            <SettingsFieldLabel>Target selector</SettingsFieldLabel>
            <Input
              value={embedTarget}
              onChange={(e) => onEmbedTargetChange(e.target.value)}
              placeholder="#scribix-blog"
            />
          </div>
          <div>
            <SettingsFieldLabel>Class prefix</SettingsFieldLabel>
            <Input
              value={embedClassPrefix}
              onChange={(e) => onEmbedClassPrefixChange(e.target.value)}
              placeholder="scribix-embed"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-scribix-text-muted">
          <input
            type="checkbox"
            checked={embedNewTab}
            onChange={(e) => onEmbedNewTabChange(e.target.checked)}
          />
          Open embedded links in a new tab
        </label>

        <div className="rounded-lg border border-scribix-border bg-scribix-surface-muted p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="font-mono text-[11px] uppercase tracking-wider text-scribix-text-muted">
              Widget Snippet
            </p>
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              onClick={() => onCopySnippet(widgetSnippet, "widget")}
            >
              {copiedSnippet === "widget" ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-md border border-scribix-border bg-scribix-panel p-3 font-mono text-xs text-scribix-text">
            <code>{widgetSnippet}</code>
          </pre>
        </div>

        <div className="rounded-lg border border-scribix-border bg-scribix-surface-muted p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="font-mono text-[11px] uppercase tracking-wider text-scribix-text-muted">
              Data Mode Snippet
            </p>
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              onClick={() => onCopySnippet(dataSnippet, "data")}
            >
              {copiedSnippet === "data" ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-md border border-scribix-border bg-scribix-panel p-3 font-mono text-xs text-scribix-text">
            <code>{dataSnippet}</code>
          </pre>
        </div>

        <div className="rounded-lg border border-scribix-border bg-scribix-surface-muted p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-scribix-text-muted">
            Live Preview
          </p>
          {embedPreviewPending && (
            <p className="mt-3 text-sm text-scribix-text-muted">Loading preview…</p>
          )}
          {embedPreviewError && (
            <p className="mt-3 text-sm text-red-600">
              Could not load preview. Ensure you have published posts.
            </p>
          )}
          {embedPreviewData && (
            <ul className="mt-3 space-y-2">
              {embedPreviewData.items.length === 0 && (
                <li className="text-sm text-scribix-text-muted">
                  No published posts yet. Publish at least one post to test embeds.
                </li>
              )}
              {embedPreviewData.items.slice(0, 3).map((item) => (
                <li
                  key={item.slug}
                  className="rounded-md border border-scribix-border bg-scribix-panel p-3"
                >
                  <p className="font-medium text-scribix-text">{item.title}</p>
                  {item.excerpt && (
                    <p className="mt-1 line-clamp-2 text-sm text-scribix-text-muted">
                      {item.excerpt}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-scribix-text-muted">
            Validation hints: your username must exist, `limit` must be between 1 and
            20, and your target selector should match one container element on the host
            page.
          </p>
        </div>
      </section>
    </SettingsCard>
  );
}
