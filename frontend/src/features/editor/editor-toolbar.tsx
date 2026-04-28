import { useRef } from "react";
import type { Editor } from "@tiptap/react";

export function EditorToolbar({
  editor,
  onUploadImageFile,
}: {
  editor: Editor;
  onUploadImageFile?: (file: File) => Promise<string>;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const canUploadImage = Boolean(onUploadImageFile);

  return (
    <div className="flex flex-wrap items-center gap-0.5">
      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        B
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline"
      >
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <span className="line-through">S</span>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("highlight")}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        title="Highlight"
      >
        Hi
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        active={editor.isActive("heading", { level: 1 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        title="Heading 1"
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        title="Heading 2"
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("heading", { level: 3 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        title="Heading 3"
      >
        H3
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet list"
      >
        &bull;
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Ordered list"
      >
        1.
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        title="Task list"
      >
        &#9744;
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Blockquote"
      >
        &ldquo;
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="Code block"
      >
        {"</>"}
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        title="Align left"
      >
        &#8676;
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        title="Align center"
      >
        &#8596;
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        title="Align right"
      >
        &#8677;
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        active={false}
        onClick={() => {
          const url = window.prompt("Image URL:");
          if (url?.trim()) {
            editor.chain().focus().setImage({ src: url.trim() }).run();
          }
        }}
        title="Image from URL"
      >
        Img
      </ToolbarButton>
      {canUploadImage && (
        <>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file || !onUploadImageFile) return;
              try {
                const url = await onUploadImageFile(file);
                editor.chain().focus().setImage({ src: url }).run();
              } catch {
                // Keep editor usable if upload fails.
              }
            }}
          />
          <ToolbarButton
            active={false}
            onClick={() => imageInputRef.current?.click()}
            title="Upload image"
          >
            ↑
          </ToolbarButton>
        </>
      )}

      <ToolbarButton
        active={editor.isActive("link")}
        onClick={() => {
          if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
            return;
          }
          const url = window.prompt("URL:");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        title="Link"
      >
        &#128279;
      </ToolbarButton>
      <ToolbarButton
        active={false}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal rule"
      >
        &#8213;
      </ToolbarButton>

      <div className="ml-auto flex gap-0.5">
        <ToolbarButton
          active={false}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          &#8617;
        </ToolbarButton>
        <ToolbarButton
          active={false}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          &#8618;
        </ToolbarButton>
      </div>
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  disabled,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-7 min-w-7 items-center justify-center rounded px-1.5 font-mono text-xs transition-colors ${
        active
          ? "bg-scribix-primary/12 text-scribix-primary"
          : "text-scribix-text/60 hover:bg-scribix-text/6 hover:text-scribix-text"
      } disabled:opacity-30 disabled:pointer-events-none`}
    >
      {children}
    </button>
  );
}

function Separator() {
  return (
    <div className="mx-1 h-4 w-px bg-scribix-text/10" aria-hidden="true" />
  );
}
