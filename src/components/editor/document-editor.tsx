"use client";

import type { JSONContent } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";

import { editorExtensions } from "@/lib/editor/extensions";

import { Toolbar } from "./toolbar";

export const DocumentEditor = ({
  initialContent,
}: {
  initialContent: JSONContent;
}) => {
  const editor = useEditor({
    content: initialContent,
    editorProps: {
      attributes: {
        "aria-label": "Document",
        class: "doc-content min-h-[60vh]",
      },
    },
    extensions: editorExtensions,
    // Rendered on the server first; avoid a hydration mismatch.
    immediatelyRender: false,
  });

  if (!editor) {
    return <div className="min-h-[60vh]" />;
  }

  return (
    <div className="flex flex-col">
      <div className="bg-background/95 sticky top-14 z-[5] -mx-4 border-b px-4 py-2 backdrop-blur">
        <Toolbar editor={editor} />
      </div>
      <div className="pt-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
