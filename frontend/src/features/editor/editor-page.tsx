import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/core";
import { useEditor, EditorContent } from "@tiptap/react";
import { generateHTML } from "@tiptap/html";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useHighlightCodeBlocks } from "@/hooks/use-highlight-code-blocks";
import { usePageTitle } from "@/hooks/use-page-title";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useAuth } from "@/context/auth-context";
import {
  requestUploadUrl,
  registerMedia,
  uploadFileToS3,
} from "@/api/auth";
import {
  fetchOwnPost,
  updatePost,
  publishPost,
  unpublishPost,
} from "@/api/posts";
import { normalizeTipTapDoc } from "@/lib/tiptap-doc";
import { createEditorExtensions, getHtmlExtensions } from "./editor-extensions";
import { CodeBlockBubbleMenu } from "./code-block-bubble-menu";
import { EditorToolbar } from "./editor-toolbar";
import { TagInput } from "./tag-input";

type SaveStatus = "idle" | "saving" | "saved" | "error";
type EditorView = "edit" | "preview";

function PostDetailsFields({
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
}: {
  excerpt: string;
  onExcerptChange: (v: string) => void;
  tags: string[];
  onTagsChange: (v: string[]) => void;
  slug: string | undefined;
  status: "draft" | "published";
  cover: {
    url: string;
    width: number | null;
    height: number | null;
  } | null;
  coverUploading: boolean;
  onCoverFile: (file: File) => void;
  onRemoveCover: () => void;
}) {
  const coverInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-scribix-text-muted">
          Cover image
        </label>
        <p className="mb-2 text-[11px] leading-snug text-scribix-text-muted">
          Preview image for cards and the post header. PNG or JPEG, max 5&nbsp;MB.
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

export function EditorPage() {
  const { postId } = useParams<{ postId: string }>();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [view, setView] = useState<EditorView>("edit");
  const [previewHtml, setPreviewHtml] = useState("");
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false);
  const initialized = useRef(false);

  const previewContentRef = useHighlightCodeBlocks(
    previewHtml,
    view === "preview",
  );

  const postQuery = useQuery({
    queryKey: ["own-post", postId],
    queryFn: () => fetchOwnPost(postId!),
    enabled: !!postId,
  });

  const post = postQuery.data;

  usePageTitle(post?.title || "Editor");

  const editorExtensions = useMemo(() => createEditorExtensions(), []);

  const editor = useEditor({
    extensions: editorExtensions,
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[min(55vh,28rem)] max-w-none px-1 py-4 text-left outline-none focus:outline-none text-scribix-text",
      },
    },
    onUpdate: () => {
      setSaveStatus("idle");
    },
  });

  useEffect(() => {
    if (post && editor && !initialized.current) {
      setTitle(post.title);
      setExcerpt(post.excerpt || "");
      setTags(post.tags.map((t) => t.name));

      const content = post.content_json as JSONContent;
      if (content?.type === "doc" && content.content?.length) {
        editor.commands.setContent(content);
      }
      initialized.current = true;
    }
  }, [post, editor]);

  const htmlExtensions = useRef(getHtmlExtensions());
  useEffect(() => {
    if (!editor) return;
    const syncPreview = () => {
      try {
        const html = generateHTML(
          normalizeTipTapDoc(editor.getJSON()),
          htmlExtensions.current,
        );
        setPreviewHtml(html);
      } catch {
        setPreviewHtml("<p>Preview couldn’t be rendered.</p>");
      }
    };
    syncPreview();
    editor.on("update", syncPreview);
    editor.on("transaction", syncPreview);
    return () => {
      editor.off("update", syncPreview);
      editor.off("transaction", syncPreview);
    };
  }, [editor]);

  const saveMutation = useMutation({
    mutationFn: (data: Parameters<typeof updatePost>[1]) =>
      updatePost(postId!, data),
    onMutate: () => setSaveStatus("saving"),
    onSuccess: () => {
      setSaveStatus("saved");
      queryClient.invalidateQueries({ queryKey: ["own-posts"] });
    },
    onError: () => setSaveStatus("error"),
  });

  const coverUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!postId) throw new Error("Missing post");
      if (!["image/png", "image/jpeg"].includes(file.type)) {
        throw new Error("Use PNG or JPEG.");
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image must be 5 MB or smaller.");
      }
      const { upload_url, storage_key } = await requestUploadUrl({
        file_name: file.name,
        mime_type: file.type,
        file_size_bytes: file.size,
        asset_type: "cover_image",
      });
      await uploadFileToS3(upload_url, file);
      const media = await registerMedia({
        storage_key,
        asset_type: "cover_image",
        mime_type: file.type,
        file_size_bytes: file.size,
      });
      await updatePost(postId, { cover_media_id: media.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["own-post", postId] });
      queryClient.invalidateQueries({ queryKey: ["own-posts"] });
    },
  });

  const removeCoverMutation = useMutation({
    mutationFn: () => updatePost(postId!, { cover_media_id: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["own-post", postId] });
      queryClient.invalidateQueries({ queryKey: ["own-posts"] });
    },
  });

  const uploadInlineImage = useCallback(async (file: File) => {
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      throw new Error("Only PNG or JPEG images are allowed.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image must be 5 MB or smaller.");
    }
    const { upload_url, storage_key } = await requestUploadUrl({
      file_name: file.name,
      mime_type: file.type,
      file_size_bytes: file.size,
      asset_type: "other",
    });
    await uploadFileToS3(upload_url, file);
    const media = await registerMedia({
      storage_key,
      asset_type: "other",
      mime_type: file.type,
      file_size_bytes: file.size,
    });
    return media.public_url;
  }, []);

  const doSave = useCallback(() => {
    if (!editor || !postId) return;
    saveMutation.mutate({
      title: title || "Untitled",
      content_json: editor.getJSON() as Record<string, unknown>,
      content_text: editor.getText(),
      excerpt: excerpt || null,
      tags,
    });
  }, [editor, postId, title, excerpt, tags, saveMutation]);

  const debouncedSave = useDebouncedCallback(doSave, 1500);

  useEffect(() => {
    if (!editor || !initialized.current) return;
    const handler = () => debouncedSave();
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor, debouncedSave]);

  useEffect(() => {
    if (initialized.current) debouncedSave();
  }, [title, excerpt, tags, debouncedSave]);

  const publishMutation = useMutation({
    mutationFn: () => publishPost(postId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["own-post", postId] });
      queryClient.invalidateQueries({ queryKey: ["own-posts"] });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () => unpublishPost(postId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["own-post", postId] });
      queryClient.invalidateQueries({ queryKey: ["own-posts"] });
    },
  });

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

  const liveUrl =
    post.status === "published" && profile?.username && post.slug
      ? `/${profile.username}/${post.slug}`
      : null;

  const detailsProps = {
    excerpt,
    onExcerptChange: setExcerpt,
    tags,
    onTagsChange: setTags,
    slug: post.slug,
    status: post.status,
    cover: post.cover,
    coverUploading: coverUploadMutation.isPending,
    onCoverFile: (file: File) => coverUploadMutation.mutate(file),
    onRemoveCover: () => removeCoverMutation.mutate(),
  };

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      {/* Editor toolbar (below app header) */}
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
                className="hidden font-mono text-[11px] text-scribix-primary underline-offset-2 hover:underline sm:inline"
              >
                View live
              </a>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {/* Edit / Preview */}
            <div className="inline-flex rounded-md border border-scribix-border bg-scribix-surface-muted p-0.5 shadow-inner">
              <button
                type="button"
                onClick={() => setView("edit")}
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
                onClick={() => setView("preview")}
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
              onClick={() => setMobileDetailsOpen(true)}
              className="rounded-md border border-scribix-border bg-scribix-panel px-3 py-1.5 font-mono text-[11px] text-scribix-text/80 shadow-sm transition-colors hover:border-scribix-border-strong hover:bg-scribix-border-subtle lg:hidden"
            >
              Post details
            </button>

            {post.status === "draft" ? (
              <Button
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending}
                className="px-4 py-2 text-xs"
              >
                {publishMutation.isPending ? "Publishing…" : "Publish"}
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => unpublishMutation.mutate()}
                disabled={unpublishMutation.isPending}
                className="px-4 py-2 text-xs"
              >
                {unpublishMutation.isPending ? "Unpublishing…" : "Unpublish"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Main column */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {view === "edit" ? (
            <>
              <div className="w-full max-w-3xl px-3 pt-6 text-left sm:px-5 md:px-8">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title"
                  className="w-full bg-transparent text-left font-display text-[clamp(1.75rem,4vw,2.75rem)] font-medium leading-tight tracking-tight text-scribix-text outline-none placeholder:text-scribix-text-muted"
                />
              </div>

              {editor && (
                <div className="sticky top-0 z-10 mt-4 w-full max-w-3xl px-3 sm:px-5 md:px-8">
                  <div className="rounded-lg border border-scribix-border bg-scribix-panel/95 px-2 py-1.5 shadow-sm backdrop-blur-md">
                    <EditorToolbar
                      editor={editor}
                      onUploadImageFile={uploadInlineImage}
                    />
                  </div>
                </div>
              )}

              <div className="relative w-full max-w-3xl px-3 pb-24 text-left sm:px-5 md:px-8">
                {editor && <CodeBlockBubbleMenu editor={editor} />}
                <EditorContent editor={editor} />
              </div>
            </>
          ) : (
            <article className="w-full max-w-3xl px-3 pb-24 pt-8 text-left sm:px-5 md:px-8">
              <header className="border-b border-scribix-border pb-8 text-left">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-scribix-text-muted">
                  Preview
                </p>
                {post.cover?.url && (
                  <div className="mt-4 overflow-hidden rounded-lg border border-scribix-border">
                    <img
                      src={post.cover.url}
                      alt=""
                      width={post.cover.width ?? undefined}
                      height={post.cover.height ?? undefined}
                      className="max-h-[min(50vh,420px)] w-full object-cover"
                    />
                  </div>
                )}
                <h1 className="mt-2 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-medium leading-tight tracking-tight text-scribix-text">
                  {title || "Untitled"}
                </h1>
                {profile && (
                  <p className="mt-3 font-mono text-xs text-scribix-text-muted">
                    @{profile.username}
                  </p>
                )}
              </header>
              <div
                ref={previewContentRef}
                className="prose-public mt-10 text-scribix-text/90 [&_a]:text-scribix-primary"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </article>
          )}
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden w-[min(100%,22rem)] shrink-0 overflow-y-auto border-l border-scribix-border bg-scribix-surface-muted lg:block xl:w-96">
          <div className="sticky top-0 border-b border-scribix-border bg-scribix-surface-muted/95 px-4 py-3 backdrop-blur-md">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-scribix-text-muted">
              Post details
            </h2>
          </div>
          <div className="p-4 sm:p-5">
            <PostDetailsFields {...detailsProps} />
          </div>
        </aside>
      </div>

      {/* Mobile / small tablet drawer */}
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
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <PostDetailsFields {...detailsProps} />
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
