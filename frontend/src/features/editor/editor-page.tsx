import { Link } from "react-router-dom";
import { PostDetailsFields } from "./post-details-fields";
import { EditorTopBar } from "./editor-top-bar";
import { EditorEditPane } from "./editor-edit-pane";
import { EditorPreviewPane } from "./editor-preview-pane";
import { useEditorPostState } from "./use-editor-post-state";

export function EditorPage() {
  const {
    postQuery,
    post,
    profile,
    title,
    setTitle,
    excerpt,
    tags,
    saveStatus,
    view,
    setView,
    previewHtml,
    previewContentRef,
    mobileDetailsOpen,
    setMobileDetailsOpen,
    editor,
    uploadInlineImage,
    liveUrl,
    publishMutation,
    unpublishMutation,
    detailsProps,
  } = useEditorPostState();

  if (postQuery.isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-scribix-text-muted">Loading…</p>
      </div>
    );
  }

  if (postQuery.isError || !post) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-display text-xl text-scribix-text">Post not found</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block font-mono text-sm text-scribix-primary"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <EditorTopBar
        saveStatus={saveStatus}
        liveUrl={liveUrl}
        view={view}
        onSetView={setView}
        onOpenMobileDetails={() => setMobileDetailsOpen(true)}
        postStatus={post.status}
        onPublish={() => publishMutation.mutate()}
        onUnpublish={() => unpublishMutation.mutate()}
        publishPending={publishMutation.isPending}
        unpublishPending={unpublishMutation.isPending}
      />

      <div className="flex min-h-0 flex-1">
        <div className="min-h-0 flex-1 overflow-y-auto">
          {view === "edit" ? (
            <EditorEditPane
              title={title}
              onTitleChange={setTitle}
              editor={editor}
              onUploadImageFile={uploadInlineImage}
            />
          ) : (
            <EditorPreviewPane
              cover={post.cover}
              title={title}
              excerpt={excerpt}
              tags={tags}
              username={profile?.username}
              previewHtml={previewHtml}
              previewContentRef={previewContentRef}
            />
          )}
        </div>

        <aside className="hidden w-[min(100%,22rem)] shrink-0 overflow-y-auto border-l border-scribix-border bg-scribix-surface-muted lg:block xl:w-96">
          <div className="sticky top-0 border-b border-scribix-border bg-scribix-surface-muted/95 px-4 py-3 backdrop-blur-md">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-scribix-text-muted">
              Post details
            </h2>
          </div>
          <div className="p-4 sm:p-5">
            {detailsProps && <PostDetailsFields {...detailsProps} />}
          </div>
        </aside>
      </div>

      {mobileDetailsOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
            aria-label="Close details"
            onClick={() => setMobileDetailsOpen(false)}
          />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-[min(100%,22rem)] flex-col border-l border-scribix-border bg-scribix-panel shadow-xl lg:hidden">
            <div className="flex items-center justify-between border-b border-scribix-border px-4 py-3">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-scribix-text-muted">
                Post details
              </h2>
              <button
                type="button"
                onClick={() => setMobileDetailsOpen(false)}
                className="rounded-sm p-1.5 text-scribix-text-muted transition-colors hover:bg-scribix-border-subtle hover:text-scribix-text"
                aria-label="Close"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {detailsProps && <PostDetailsFields {...detailsProps} />}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
