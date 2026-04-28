import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LinkTypeIcon } from "@/features/settings/link-type-icon";
import {
  LINK_TYPES,
  getLinkTypeLabel,
} from "@/features/settings/link-type-meta";
import { SettingsCard } from "@/features/settings/components/settings-card";

interface ProfileLinkDraft {
  link_type: string;
  label: string;
  url: string;
}

interface ProfileLinksCardProps {
  links: ProfileLinkDraft[];
  linksSaving: boolean;
  linksSaved: boolean;
  linksError: boolean;
  onAddLink: () => void;
  onRemoveLink: (index: number) => void;
  onUpdateLink: (
    index: number,
    field: "link_type" | "label" | "url",
    value: string,
  ) => void;
  onSaveLinks: () => void;
}

export function ProfileLinksCard({
  links,
  linksSaving,
  linksSaved,
  linksError,
  onAddLink,
  onRemoveLink,
  onUpdateLink,
  onSaveLinks,
}: ProfileLinksCardProps) {
  return (
    <SettingsCard title="Profile Links" className="mt-8">
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-scribix-text-muted">
          Shown on your public profile. Pick a type so visitors see the right icon.
        </p>
        <button
          type="button"
          onClick={onAddLink}
          disabled={links.length >= 10}
          className="shrink-0 rounded-sm border border-scribix-border bg-scribix-surface-muted px-3 py-1.5 font-mono text-xs text-scribix-primary transition-colors hover:border-scribix-border-strong hover:bg-scribix-border-subtle disabled:opacity-40"
        >
          + Add link
        </button>
      </div>

      {links.length === 0 && (
        <p className="mt-6 rounded-lg border border-dashed border-scribix-border bg-scribix-surface-muted px-4 py-8 text-center text-sm text-scribix-text-muted">
          No links yet. Add your portfolio, GitHub, LinkedIn, or X.
        </p>
      )}

      <ul className="mt-5 space-y-3">
        {links.map((link, i) => (
          <li
            key={i}
            className="flex flex-col gap-3 rounded-xl border border-scribix-border bg-scribix-surface-muted p-3 shadow-sm transition-[border-color,box-shadow] hover:border-scribix-border-strong sm:flex-row sm:items-stretch"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-scribix-border bg-scribix-panel text-scribix-primary shadow-sm"
              title={getLinkTypeLabel(link.link_type)}
            >
              <LinkTypeIcon linkType={link.link_type} className="h-5 w-5" />
            </div>

            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,9rem)_1fr_1.4fr] sm:items-center">
              <div className="relative">
                <label className="sr-only">Link type</label>
                <select
                  value={link.link_type}
                  onChange={(e) => onUpdateLink(i, "link_type", e.target.value)}
                  className="h-11 w-full appearance-none rounded-sm border border-scribix-border bg-scribix-panel py-2 pl-3 pr-8 font-mono text-xs text-scribix-text shadow-sm transition-[border-color,box-shadow] hover:border-scribix-border-strong focus-visible:border-scribix-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scribix-primary/35"
                >
                  {LINK_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {getLinkTypeLabel(type)}
                    </option>
                  ))}
                </select>
                <span
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-scribix-text-muted"
                  aria-hidden
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </span>
              </div>
              <Input
                value={link.label}
                onChange={(e) => onUpdateLink(i, "label", e.target.value)}
                placeholder="Label (optional)"
                className="text-xs"
                aria-label="Link label"
              />
              <Input
                value={link.url}
                onChange={(e) => onUpdateLink(i, "url", e.target.value)}
                placeholder="https://…"
                className="text-xs sm:min-w-0"
                inputMode="url"
                aria-label="URL"
              />
            </div>

            <button
              type="button"
              onClick={() => onRemoveLink(i)}
              className="flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-sm border border-transparent text-scribix-text-muted transition-colors hover:border-scribix-border hover:bg-red-500/8 hover:text-red-600 sm:self-center"
              aria-label="Remove link"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={onSaveLinks} disabled={linksSaving}>
          {linksSaving ? "Saving…" : "Save Links"}
        </Button>
        {linksSaved && <span className="font-mono text-xs text-emerald-600">Saved</span>}
        {linksError && <span className="font-mono text-xs text-red-600">Failed to save</span>}
      </div>
    </SettingsCard>
  );
}
