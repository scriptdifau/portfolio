"use client";

import Image from "@tiptap/extension-image";
import { EditorContent, Node as TiptapNode, mergeAttributes, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Uploader } from "./Uploader";

const sizeAttrs = {
  size: {
    default: "full",
    parseHTML: (el: HTMLElement) => el.getAttribute("data-size") || "full",
    renderHTML: (a: Record<string, unknown>) => ({ "data-size": a.size }),
  },
  align: {
    default: "center",
    parseHTML: (el: HTMLElement) => el.getAttribute("data-align") || "center",
    renderHTML: (a: Record<string, unknown>) => ({ "data-align": a.align }),
  },
};

const SizedImage = Image.extend({
  addAttributes() {
    return { ...this.parent?.(), ...sizeAttrs };
  },
});

const Video = TiptapNode.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { src: { default: null }, ...sizeAttrs };
  },
  parseHTML() {
    return [{ tag: "video[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(HTMLAttributes, { autoplay: "", muted: "", loop: "", playsinline: "" }),
    ];
  },
});

const SIZES = [
  ["small", "S"],
  ["medium", "M"],
  ["large", "L"],
  ["full", "Piena"],
] as const;
const ALIGNS = [
  ["left", "Sinistra"],
  ["center", "Centro"],
  ["right", "Destra"],
] as const;

const btn = "border border-neutral-300 bg-white px-2 py-1 text-sm hover:bg-neutral-100";
const on = "!bg-black !text-white";

export function RichEditor({
  html,
  onChange,
}: {
  html: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } }), SizedImage, Video],
    content: html,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: "post-body min-h-72 p-4 outline-none" } },
  });

  if (!editor) return <div className="min-h-72 border border-neutral-300 bg-white" />;

  const media = editor.isActive("image") ? "image" : editor.isActive("video") ? "video" : null;
  const attrs = media ? editor.getAttributes(media) : {};
  const set = (a: Record<string, string>) =>
    editor.chain().focus().updateAttributes(media!, a).run();

  const insert = (f: { url: string; type: "image" | "video" }) =>
    f.type === "video"
      ? editor.chain().focus().insertContent({ type: "video", attrs: { src: f.url } }).run()
      : editor.chain().focus().setImage({ src: f.url }).run();

  const toggle = (active: boolean, run: () => void, label: string) => (
    <button type="button" onClick={run} className={`${btn} ${active ? on : ""}`}>
      {label}
    </button>
  );

  return (
    <div className="border border-neutral-300 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-neutral-200 bg-neutral-50 p-2">
        {toggle(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), "B")}
        {toggle(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), "I")}
        {toggle(
          editor.isActive("heading", { level: 2 }),
          () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          "Titolo",
        )}
        {toggle(
          editor.isActive("heading", { level: 3 }),
          () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          "Sottotitolo",
        )}
        {toggle(
          editor.isActive("bulletList"),
          () => editor.chain().focus().toggleBulletList().run(),
          "Elenco",
        )}
        {toggle(
          editor.isActive("blockquote"),
          () => editor.chain().focus().toggleBlockquote().run(),
          "Citazione",
        )}
        {toggle(
          editor.isActive("link"),
          () => {
            if (editor.isActive("link")) return editor.chain().focus().unsetLink().run();
            const url = window.prompt("Indirizzo del link (https://…)");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          },
          "Link",
        )}
        <span className="mx-1 h-6 w-px bg-neutral-300" />
        <Uploader label="🖼 Inserisci immagine/video" multiple onUploaded={insert} />
      </div>

      {media && (
        <div className="flex flex-wrap items-center gap-1 border-b border-neutral-200 bg-amber-50 p-2 text-sm">
          <span className="mr-1">{media === "image" ? "Immagine" : "Video"}:</span>
          {SIZES.map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => set({ size: v })}
              className={`${btn} ${attrs.size === v ? on : ""}`}
            >
              {l}
            </button>
          ))}
          <span className="mx-1 h-6 w-px bg-neutral-300" />
          {ALIGNS.map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => set({ align: v })}
              className={`${btn} ${attrs.align === v ? on : ""}`}
            >
              {l}
            </button>
          ))}
          <span className="mx-1 h-6 w-px bg-neutral-300" />
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteSelection().run()}
            className={`${btn} text-red-600`}
          >
            Elimina
          </button>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
