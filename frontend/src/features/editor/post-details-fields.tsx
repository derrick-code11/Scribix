import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "./tag-input";

type CoverInfo = {
  url: string;
  width: number | null;
  height: number | null;
};

export type PostDetailsFieldsProps = {
  excerpt: string;
  onExcerptChange: (v: string) => void;
  tags: string[];
  onTagsChange: (v: string[]) => void;
  slug: string | undefined;
  status: "draft" | "published";
  cover: CoverInfo | null;
  coverUploading: boolean;
  onCoverFile: (file: File) => void;
  onRemoveCover: () => void;
};

export function PostDetailsFields({
  excerpt,
  onExcerptChange,
  tags,
  onTagsChange,
  slug,
  status,
  cover,
  coverUploading,
  onCoverFile,
  onRemoveCover,
}: PostDetailsFieldsProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-scribix-text-muted">
          Cover image
        </label>
        <p className="mb-2 text-[11px] leading-snug text-scribix-text-muted">
          Preview image for cards and the post header. PNG or JPEG, max
          5&nbsp;MB.
        </p>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onCoverFile(file);
          }}
        />
        <div className="relative aspect-video overflow-hidden rounded-lg border border-scribix-border bg-scribix-surface-muted">
          {cover?.url ? (
            <img
              src={cover.url}
              alt=""
              width={cover.width ?? undefined}
              height={cover.height ?? undefined}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex min-h-[120px] items-center justify-center px-4 text-center text-xs text-scribix-text-muted">
              No cover yet
            </div>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            className="px-3 py-1.5 text-xs"
            disabled={coverUploading}
            onClick={() => coverInputRef.current?.click()}
          >
            {coverUploading ? "Uploading…" : cover ? "Replace" : "Upload"}
          </Button>
          {cover && (
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              disabled={coverUploading}
              onClick={onRemoveCover}
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-scribix-text-muted">
          Status
        </p>
        <p className="mt-1.5 inline-flex rounded-full border border-scribix-border bg-scribix-panel px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-scribix-text/80">
          {status}
        </p>
      </div>
      {slug && status === "published" && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-scribix-text-muted">
            URL slug
          </p>
          <p className="mt-1 break-all font-mono text-xs text-scribix-text/70">
            /{slug}
          </p>
          <p className="mt-1 text-[11px] text-scribix-text-muted">
            Locked after publish
          </p>
        </div>
      )}
      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-scribix-text-muted">
          Excerpt
        </label>
        <Textarea
          value={excerpt}
          onChange={(e) => onExcerptChange(e.target.value)}
          placeholder="Short summary for cards and SEO…"
          rows={4}
          className="text-sm"
        />
      </div>
      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-scribix-text-muted">
          Tags
        </label>
        <TagInput tags={tags} onChange={onTagsChange} />
      </div>
    </div>
  );
}
