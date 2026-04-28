import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/api/client";
import type { EmbedFeedPreview } from "@/features/settings/types";
import { useTransientFlag } from "@/features/settings/hooks/use-transient-flag";

const EMBED_SDK_URL = "https://api.apiscribix.org/api/v1/embed/sdk.js";
const DEFAULT_EMBED_TARGET = "#scribix-blog";
const DEFAULT_EMBED_CLASS_PREFIX = "scribix-embed";

export function useEmbedSettings({
  username,
  searchParams,
}: {
  username?: string;
  searchParams: URLSearchParams;
}) {
  const embedSectionRef = useRef<HTMLElement | null>(null);
  const [embedLimit, setEmbedLimit] = useState("6");
  const [embedTarget, setEmbedTarget] = useState(DEFAULT_EMBED_TARGET);
  const [embedClassPrefix, setEmbedClassPrefix] = useState(DEFAULT_EMBED_CLASS_PREFIX);
  const [embedNewTab, setEmbedNewTab] = useState(true);
  const [copiedSnippet, setCopiedSnippet] = useState<"widget" | "data" | null>(null);
  const { active: copiedActive, trigger: triggerCopied, reset: resetCopied } =
    useTransientFlag(1800);

  const normalizedUsername = username?.trim().toLowerCase() ?? "";
  const normalizedLimit = Math.min(20, Math.max(1, Number(embedLimit) || 6));

  const widgetSnippet = useMemo(() => {
    const attrs = [
      `data-scribix-username="${normalizedUsername}"`,
      `data-scribix-target="${embedTarget || DEFAULT_EMBED_TARGET}"`,
      `data-scribix-limit="${normalizedLimit}"`,
      `data-scribix-class-prefix="${embedClassPrefix || DEFAULT_EMBED_CLASS_PREFIX}"`,
      `data-scribix-new-tab="${embedNewTab ? "true" : "false"}"`,
    ];

    return [
      `<div id="${(embedTarget || DEFAULT_EMBED_TARGET).replace("#", "")}"></div>`,
      `<script src="${EMBED_SDK_URL}"`,
      `  ${attrs.join("\n  ")}`,
      "></script>",
    ].join("\n");
  }, [normalizedUsername, embedTarget, normalizedLimit, embedClassPrefix, embedNewTab]);

  const dataSnippet = useMemo(
    () =>
      [
        `<script src="${EMBED_SDK_URL}" data-scribix-username="${normalizedUsername}" data-scribix-mode="data"></script>`,
        "<script>",
        `  const feed = await window.ScribixEmbed.getPosts({ username: "${normalizedUsername}", limit: ${normalizedLimit} });`,
        "  // Use feed.items to render posts in your UI.",
        "</script>",
      ].join("\n"),
    [normalizedUsername, normalizedLimit],
  );

  const embedPreviewQuery = useQuery({
    queryKey: ["embed-preview", normalizedUsername, normalizedLimit],
    enabled: normalizedUsername.length > 0,
    queryFn: () =>
      apiRequest<EmbedFeedPreview>(
        `/embed/${encodeURIComponent(normalizedUsername)}/posts?limit=${normalizedLimit}&offset=0`,
      ),
  });

  const copySnippet = useCallback(async (text: string, kind: "widget" | "data") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSnippet(kind);
      triggerCopied();
    } catch {
      resetCopied();
      setCopiedSnippet(null);
    }
  }, [resetCopied, triggerCopied]);

  useEffect(() => {
    if (searchParams.get("tab") !== "embed") return;
    embedSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [searchParams]);

  return {
    embedSectionRef,
    embedLimit,
    setEmbedLimit,
    embedTarget,
    setEmbedTarget,
    embedClassPrefix,
    setEmbedClassPrefix,
    embedNewTab,
    setEmbedNewTab,
    copiedSnippet: copiedActive ? copiedSnippet : null,
    normalizedUsername,
    widgetSnippet,
    dataSnippet,
    embedPreviewQuery,
    copySnippet,
  };
}
