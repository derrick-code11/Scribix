import StarterKit from "@tiptap/starter-kit";
import { Heading } from "@tiptap/extension-heading";
import Underline from "@tiptap/extension-underline";
import TiptapLink from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import type { AnyExtension, Extensions } from "@tiptap/core";
import { lowlight } from "@/lib/lowlight";

/** Enter exits heading into a normal paragraph (reliable split; keeps Mod-Alt-1… shortcuts). */
const HeadingWithEnter = Heading.extend({
  priority: 1000,
  addKeyboardShortcuts() {
    const parent = this.parent?.() as Record<string, () => boolean> | undefined;
    return {
      ...(parent ?? {}),
      Enter: () => {
        if (!this.editor.isActive("heading")) return false;
        return this.editor.commands.splitBlock();
      },
    };
  },
}).configure({ levels: [1, 2, 3] });

const imageAttrs = {
  class:
    "h-auto rounded-lg border border-scribix-border my-4 mx-auto block max-w-full",
};

const baseExtensions: Extensions = [
  StarterKit.configure({
    heading: false,
    codeBlock: false,
  }),
  HeadingWithEnter,
  CodeBlockLowlight.configure({
    lowlight,
    enableTabIndentation: true,
    tabSize: 2,
    HTMLAttributes: {
      class:
        "hljs rounded-md border border-scribix-border text-[0.85rem] leading-relaxed",
    },
  }),
  Underline,
  TiptapLink.configure({
    openOnClick: false,
    HTMLAttributes: { class: "text-scribix-link underline" },
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
    defaultAlignment: "left",
  }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Image.configure({
    inline: false,
    allowBase64: false,
    HTMLAttributes: imageAttrs,
  }),
  Highlight.configure({
    multicolor: false,
    HTMLAttributes: { class: "scribix-highlight" },
  }),
];

/** Same schema as the editor, without Placeholder — for `generateHTML` preview. */
export function getHtmlExtensions(): AnyExtension[] {
  return baseExtensions as AnyExtension[];
}

export function createEditorExtensions(options?: {
  placeholder?: string;
}): AnyExtension[] {
  return [
    ...baseExtensions,
    Placeholder.configure({
      placeholder: options?.placeholder ?? "Start writing…",
    }),
  ] as AnyExtension[];
}
