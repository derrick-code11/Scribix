import { Button } from "@/components/ui/button";

type SaveStatus = "idle" | "saving" | "saved" | "error";
type EditorView = "edit" | "preview";

type EditorTopBarProps = {
  saveStatus: SaveStatus;
  liveUrl: string | null;
  view: EditorView;
  onSetView: (view: EditorView) => void;
  onOpenMobileDetails: () => void;
  postStatus: "draft" | "published";
  onPublish: () => void;
  onUnpublish: () => void;
  publishPending: boolean;
  unpublishPending: boolean;
};

export function EditorTopBar({
  saveStatus,
  liveUrl,
  view,
  onSetView,
  onOpenMobileDetails,
  postStatus,
  onPublish,
  onUnpublish,
  publishPending,
  unpublishPending,
}: EditorTopBarProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-scribix-border bg-scribix-panel/95 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-4 md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-block min-w-18 font-mono text-[11px] text-scribix-text-muted tabular-nums">
            {saveStatus === "saving" && "Saving…"}
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "error" && "Couldn’t save"}
            {saveStatus === "idle" && ""}
          </span>
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="group hidden items-center gap-1.5 rounded-full border border-scribix-primary/35 bg-scribix-primary/8 px-2.5 py-1 font-mono text-[11px] text-scribix-primary transition-colors hover:border-scribix-primary/55 hover:bg-scribix-primary/15 sm:inline-flex"
            >
              <span>View Live</span>
              <svg
                className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path
                  d="M7 6h7v7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 14 14 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="inline-flex rounded-md border border-scribix-border bg-scribix-surface-muted p-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => onSetView("edit")}
              className={`rounded-sm px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
                view === "edit"
                  ? "bg-scribix-panel text-scribix-text shadow-sm"
                  : "text-scribix-text-muted hover:text-scribix-text"
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onSetView("preview")}
              className={`rounded-sm px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
                view === "preview"
                  ? "bg-scribix-panel text-scribix-text shadow-sm"
                  : "text-scribix-text-muted hover:text-scribix-text"
              }`}
            >
              Preview
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenMobileDetails}
            className="rounded-md border border-scribix-border bg-scribix-panel px-3 py-1.5 font-mono text-[11px] text-scribix-text/80 shadow-sm transition-colors hover:border-scribix-border-strong hover:bg-scribix-border-subtle lg:hidden"
          >
            Post details
          </button>

          {postStatus === "draft" ? (
            <Button
              onClick={onPublish}
              disabled={publishPending}
              className="px-4 py-2 text-xs"
            >
              {publishPending ? "Publishing…" : "Publish"}
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={onUnpublish}
              disabled={unpublishPending}
              className="px-4 py-2 text-xs"
            >
              {unpublishPending ? "Unpublishing…" : "Unpublish"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
