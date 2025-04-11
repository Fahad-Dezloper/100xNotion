"use client";
import "./tiptap.css";
import { cn } from "@/lib/utils";
import { ImageExtension } from "@/components/tiptap/extensions/image";
import { ImagePlaceholder } from "@/components/tiptap/extensions/image-placeholder";
import SearchAndReplace from "@/components/tiptap/extensions/search-and-replace";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { EditorContent, type Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TipTapFloatingMenu } from "@/components/tiptap/extensions/floating-menu";
import { FloatingToolbar } from "@/components/tiptap/extensions/floating-toolbar";
import { EditorToolbar } from "./toolbars/editor-toolbar";
import Placeholder from "@tiptap/extension-placeholder";
import { content } from "@/lib/content";
import { useWebSocket } from "@/context/WebContext";
import { useState, useEffect } from "react";

const extensions = [
  StarterKit.configure({
    orderedList: {
      HTMLAttributes: {
        class: "list-decimal",
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: "list-disc",
      },
    },
    heading: {
      levels: [1, 2, 3, 4],
    },
  }),
  Placeholder.configure({
    emptyNodeClass: "is-editor-empty",
    placeholder: ({ node }) => {
      switch (node.type.name) {
        case "heading":
          return `Heading ${node.attrs.level}`;
        case "detailsSummary":
          return "Section title";
        case "codeBlock":
          // never show the placeholder when editing code
          return "";
        default:
          return "Write, type '/' for commands";
      }
    },
    includeChildren: false,
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  TextStyle,
  Subscript,
  Superscript,
  Underline,
  Link,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  ImageExtension,
  ImagePlaceholder,
  SearchAndReplace,
  Typography,
];

export function RichTextEditorDemo({ className }: { className?: string }) {
  const { sendMessage, editorContent, activeUserEmail } = useWebSocket();
  // console.log("form Rich Text Editor", activeUserEmail);
  // const [editorContentt, setEditorContent] = useState('');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: extensions as Extension[],
    content: editorContent,
    editorProps: {
      attributes: {
        class: "max-w-full focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      // do what you want to do with output
      // Update stats
      // saving as text/json/hmtml
      // const text = editor.getHTML();
      sendMessage(editor.getHTML());
      // setEditorContent(editor.getHTML());
      // setEditorContent(editorContent);
      // console.log(editor.getHTML());
      // console.log(editor.getText());
    },
  });

  useEffect(() => {
    if (!editor) return;
  
    let timeout: NodeJS.Timeout;
  
    const updateTooltip = () => {
      const tooltip = document.getElementById("caret-tooltip");
      if (!tooltip) return;
  
      const { state, view } = editor;
      const { from, empty } = state.selection;
  
      if (!empty) {
        tooltip.style.display = "none";
        return;
      }
  
      const coords = view.coordsAtPos(from);
  
      tooltip.style.left = `${coords.left}px`;
      tooltip.style.top = `${coords.top - 35}px`; // Position above the caret
      tooltip.style.display = "block";
  
      // Hide tooltip after a short delay
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        tooltip.style.display = "none";
      }, 2000);
    };
  
    editor.on("update", updateTooltip);
    editor.on("selectionUpdate", updateTooltip);
  
    return () => {
      editor.off("update", updateTooltip);
      editor.off("selectionUpdate", updateTooltip);
      clearTimeout(timeout);
    };
  }, [editor]);
  

  useEffect(() => {
    if (editor && editorContent) {
      // Skip update if the editor already has this content to prevent cursor jumps
      // Only update if the content is different from current editor content
      if (editor.getHTML() !== editorContent) {
        editor.commands.setContent(editorContent, false);
      }
    }
  }, [editor, editorContent]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden overflow-y-scroll border bg-card sm:pb-0",
        className
      )}
    >
      <EditorToolbar editor={editor} />
      <FloatingToolbar editor={editor} />
      <TipTapFloatingMenu editor={editor} />
      <EditorContent
        editor={editor}
        className=" min-h-[600px] w-full min-w-full cursor-text sm:p-6"
      />
      <div
        id="caret-tooltip"
        className="absolute hidden bg-yellow-300 text-black px-2 py-1 text-sm rounded shadow-md z-50 pointer-events-none transition-opacity duration-200"
      >
        {activeUserEmail}
      </div>

    </div>
  );
}
