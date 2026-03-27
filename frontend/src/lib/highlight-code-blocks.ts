import hljs from "highlight.js/lib/common";

/** Run highlight.js on `pre code` blocks (for HTML from `generateHTML`, which has no editor decorations). */
export function highlightCodeBlocks(root: HTMLElement | null) {
  if (!root) return;
  root.querySelectorAll("pre code").forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    try {
      hljs.highlightElement(node);
    } catch {
      /* invalid language / empty */
    }
  });
}
