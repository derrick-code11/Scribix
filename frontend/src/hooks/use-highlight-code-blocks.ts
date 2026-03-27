import { useLayoutEffect, useRef } from "react";
import { highlightCodeBlocks } from "@/lib/highlight-code-blocks";

export function useHighlightCodeBlocks(html: string, enabled = true) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!enabled) return;
    highlightCodeBlocks(ref.current);
  }, [html, enabled]);
  return ref;
}
