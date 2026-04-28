import hljs from "highlight.js/lib/common";

export function highlightCodeBlocks(root: HTMLElement | null) {
  if (!root) return;
  root.querySelectorAll("pre code").forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    try {
      hljs.highlightElement(node);
    } catch {
      // Skip malformed code blocks and continue highlighting others.
    }
  });
}
