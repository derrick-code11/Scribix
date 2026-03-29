import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/core";
import { useEditor, type Editor } from "@tiptap/react";
import { generateHTML } from "@tiptap/html";
import { useHighlightCodeBlocks } from "@/hooks/use-highlight-code-blocks";
import { usePageTitle } from "@/hooks/use-page-title";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useAuth } from "@/context/auth-context";
import { requestUploadUrl, registerMedia, uploadFileToS3 } from "@/api/auth";
import {
  fetchOwnPost,
  updatePost,
  publishPost,
  unpublishPost,
} from "@/api/posts";
import { normalizeTipTapDoc } from "@/lib/tiptap-doc";
import { createEditorExtensions, getHtmlExtensions } from "./editor-extensions";
import type { PostDetailsFieldsProps } from "./post-details-fields";

type SaveStatus = "idle" | "saving" | "saved" | "error";
type EditorView = "edit" | "preview";

type LocalEditorDraft = {
  postId: string;
  title: string;
  excerpt: string;
  tags: string[];
  content: JSONContent;
  savedAt: string;
};

export function useEditorPostState() {
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
  const editorRef = useRef<Editor | null>(null);
  const saveNowRef = useRef<() => Promise<void>>(async () => {});
  const draftStorageKey = useMemo(
    () => (postId ? `scribix-editor-draft:${postId}` : null),
    [postId],
  );

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
      handleKeyDown: (_view, event) => {
        if (
          (event.metaKey || event.ctrlKey) &&
          event.key.toLowerCase() === "s"
        ) {
          event.preventDefault();
          void saveNowRef.current();
          return true;
        }
        return false;
      },
    },
    onUpdate: () => setSaveStatus("idle"),
  });

  useEffect(() => {
    editorRef.current = editor;
    return () => {
      editorRef.current = null;
    };
  }, [editor]);

  useEffect(() => {
    if (post && editor && !initialized.current) {
      let nextTitle = post.title;
      let nextExcerpt = post.excerpt || "";
      let nextTags = post.tags.map((t) => t.name);
      let nextContent = post.content_json as JSONContent;

      if (draftStorageKey) {
        try {
          const rawDraft = localStorage.getItem(draftStorageKey);
          if (rawDraft) {
            const draft = JSON.parse(rawDraft) as LocalEditorDraft;
            const draftIsNewer =
              Date.parse(draft.savedAt || "") > Date.parse(post.updated_at || "");
            if (draftIsNewer && draft.postId === post.id) {
              nextTitle = draft.title || post.title;
              nextExcerpt = draft.excerpt || "";
              nextTags = Array.isArray(draft.tags) ? draft.tags : nextTags;
              nextContent = (draft.content || nextContent) as JSONContent;
            }
          }
        } catch {
          localStorage.removeItem(draftStorageKey);
        }
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(nextTitle);
      setExcerpt(nextExcerpt);
      setTags(nextTags);
      if (nextContent?.type === "doc") {
        editor.commands.setContent(nextContent);
      }
      initialized.current = true;
    }
  }, [post, editor, draftStorageKey]);

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
      if (draftStorageKey) localStorage.removeItem(draftStorageKey);
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

  const persistLocalDraft = useCallback(() => {
    if (
      !draftStorageKey ||
      !postId ||
      !initialized.current ||
      !editorRef.current
    ) {
      return;
    }
    const draft: LocalEditorDraft = {
      postId,
      title,
      excerpt,
      tags,
      content: editorRef.current.getJSON(),
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(draftStorageKey, JSON.stringify(draft));
  }, [draftStorageKey, postId, title, excerpt, tags]);

  const doSaveNow = useCallback(async () => {
    if (!postId || !initialized.current || !editorRef.current) return;
    await saveMutation.mutateAsync({
      title: title || "Untitled",
      content_json: editorRef.current.getJSON() as Record<string, unknown>,
      content_text: editorRef.current.getText(),
      excerpt: excerpt || null,
      tags,
    });
  }, [postId, title, excerpt, tags, saveMutation]);

  useEffect(() => {
    saveNowRef.current = doSaveNow;
  }, [doSaveNow]);

  const debouncedSave = useDebouncedCallback(() => {
    void doSaveNow();
  }, 1500);

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

  const persistLocalDraftRef = useRef(persistLocalDraft);
  useEffect(() => {
    persistLocalDraftRef.current = persistLocalDraft;
  }, [persistLocalDraft]);

  useEffect(() => {
    if (!editor || !initialized.current) return;
    const handler = () => persistLocalDraftRef.current();
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor]);

  useEffect(() => {
    if (initialized.current) persistLocalDraftRef.current();
  }, [title, excerpt, tags]);

  useEffect(() => {
    const onBeforeUnload = () => {
      persistLocalDraftRef.current();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      persistLocalDraftRef.current();
    };
  }, []);

  const publishMutation = useMutation({
    mutationFn: async () => {
      await doSaveNow();
      return publishPost(postId!);
    },
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

  const liveUrl =
    post?.status === "published" && profile?.username && post.slug
      ? `/${profile.username}/${post.slug}`
      : null;

  const detailsProps: PostDetailsFieldsProps | null = post
    ? {
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
      }
    : null;

  return {
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
  };
}
