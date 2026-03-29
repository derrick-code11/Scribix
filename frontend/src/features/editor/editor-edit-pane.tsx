import { EditorContent, type Editor } from "@tiptap/react";
import { CodeBlockBubbleMenu } from "./code-block-bubble-menu";
import { EditorToolbar } from "./editor-toolbar";

type EditorEditPaneProps = {
  title: string;
  onTitleChange: (value: string) => void;
  editor: Editor | null;
  onUploadImageFile: (file: File) => Promise<string>;
};

export function EditorEditPane({
  title,
  onTitleChange,
  editor,
  onUploadImageFile,
}: EditorEditPaneProps) {
  return (
    <>
      <div className="w-full max-w-3xl px-3 pt-6 text-left sm:px-5 md:px-8">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Post title"
          className="w-full bg-transparent text-left font-display text-[clamp(1.75rem,4vw,2.75rem)] font-medium leading-tight tracking-tight text-scribix-text outline-none placeholder:text-scribix-text-muted"
        />
      </div>

      <div className="relative w-full max-w-3xl px-3 pb-44 text-left sm:px-5 md:px-8">
        {editor && <CodeBlockBubbleMenu editor={editor} />}
        <EditorContent editor={editor} />
      </div>

      {editor && (
        <div className="pointer-events-none fixed bottom-3 left-3 right-3 z-30 flex justify-start sm:left-5 sm:right-5 md:left-8 md:right-8 lg:right-88 xl:right-96">
          <div className="pointer-events-auto w-full max-w-3xl rounded-xl border border-scribix-border bg-scribix-panel/92 px-2 py-1 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.8)] backdrop-blur-md">
            <EditorToolbar editor={editor} onUploadImageFile={onUploadImageFile} />
          </div>
        </div>
      )}
    </>
  );
}
