import type { Editor } from "@tiptap/core";
import { BubbleMenu } from "@tiptap/react/menus";
import { useEditorState } from "@tiptap/react";
import { CODE_BLOCK_LANGUAGE_OPTIONS } from "@/lib/code-block-languages";

function getCodeBlockDom(editor: Editor): HTMLElement | null {
  const { view } = editor;
  const { $from } = view.state.selection;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === "codeBlock") {
      const pos = $from.before(d);
      const dom = view.nodeDOM(pos);
      if (dom instanceof HTMLElement) return dom;
    }
  }
  return null;
}

export function CodeBlockBubbleMenu({ editor }: { editor: Editor }) {
  const codeLang = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      if (!ed?.isActive("codeBlock")) return "";
      return (ed.getAttributes("codeBlock").language as string | null) ?? "";
    },
  });

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="codeBlockLangBubble"
      shouldShow={({ editor: ed }) => ed.isActive("codeBlock")}
      getReferencedVirtualElement={() => {
        const el = getCodeBlockDom(editor);
        if (!el) return null;
        return {
          getBoundingClientRect: () => el.getBoundingClientRect(),
          getClientRects: () => el.getClientRects(),
        };
      }}
      appendTo={() => document.body}
      options={{
        strategy: "fixed",
        placement: "top-start",
        offset: { mainAxis: 10, crossAxis: 0 },
        shift: { padding: 12 },
        flip: { padding: 12 },
      }}
      className="pointer-events-auto z-100 flex max-w-[calc(100vw-1.5rem)] flex-wrap items-center gap-2 rounded-lg border border-scribix-border-strong bg-scribix-panel px-2.5 py-2 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.25)] backdrop-blur-md dark:shadow-[0_10px_40px_-6px_rgba(0,0,0,0.55)]"
    >
      <label className="flex cursor-default items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-scribix-text-muted">
        <span className="shrink-0">Language</span>
        <select
          className="max-w-44 cursor-pointer appearance-none rounded-md border border-scribix-border bg-scribix-surface-muted py-1.5 pl-2 pr-6 font-mono text-[11px] normal-case tracking-normal text-scribix-text shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-scribix-primary/35"
          value={codeLang}
          onChange={(e) => {
            const v = e.target.value;
            editor
              .chain()
              .focus()
              .updateAttributes("codeBlock", { language: v || null })
              .run();
          }}
        >
          <option value="">Auto</option>
          {CODE_BLOCK_LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <span
        className="hidden shrink-0 font-mono text-[10px] text-scribix-text-muted/90 sm:inline"
        title="Indent with Tab, outdent with Shift+Tab"
      >
        Tab · indent
      </span>
    </BubbleMenu>
  );
}
