"use client";

import { Placeholder } from "@tiptap/extensions";
import type { JSONContent } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { TriangleAlertIcon } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { editorExtensions } from "@/lib/editor/extensions";

import { SaveStatus } from "./save-status";
import { TitleInput } from "./title-input";
import { Toolbar } from "./toolbar";
import { useAutosave } from "./use-autosave";

export interface DocumentViewProps {
  id: string;
  title: string;
  content: JSONContent;
  version: number;
  updatedAt: string;
  isNew: boolean;
  /** Extra controls in the title bar, e.g. the share button. */
  actions?: ReactNode;
}

export const DocumentView = ({
  id,
  title,
  content,
  version,
  updatedAt,
  isNew,
  actions,
}: DocumentViewProps) => {
  const editor = useEditor({
    content,
    editorProps: {
      attributes: {
        "aria-label": "Document",
        class: "doc-content min-h-[60vh] pb-24",
      },
    },
    extensions: [
      ...editorExtensions,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    // Rendered on the server first; avoid a hydration mismatch.
    immediatelyRender: false,
  });

  const { status, retry, discard } = useAutosave({
    documentId: id,
    editor,
    initialSavedAt: updatedAt,
    initialVersion: version,
  });

  const reload = () => {
    discard();
    window.location.reload();
  };

  const copyMyText = async () => {
    if (!editor) {
      return;
    }
    try {
      await navigator.clipboard.writeText(
        editor.getText({ blockSeparator: "\n\n" })
      );
      toast.success("Your version is copied to the clipboard.");
    } catch {
      toast.error("Couldn't copy. Select the text and copy it manually.");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-6 pb-2">
        <div className="flex min-w-0 basis-full sm:flex-1 sm:basis-0">
          <TitleInput
            autoFocus={isNew}
            documentId={id}
            initialTitle={title}
            onDone={() => editor?.commands.focus("start")}
          />
        </div>
        <div className="flex flex-1 items-center justify-end gap-3 sm:flex-none">
          <SaveStatus onRetry={retry} status={status} />
          {actions}
        </div>
      </div>

      {status.kind === "conflict" ? (
        <div
          className="border-destructive/30 bg-destructive/5 mb-2 flex flex-col gap-3 rounded-lg border p-3 text-sm sm:flex-row sm:items-center"
          role="alert"
        >
          <TriangleAlertIcon className="text-destructive size-4 shrink-0" />
          <p className="flex-1">
            {status.editedBy ?? "Someone else"} edited this document after you
            opened it, so your latest changes weren&apos;t saved. Reload to see
            their version.
          </p>
          <div className="flex gap-2">
            <Button onClick={copyMyText} size="sm" variant="outline">
              Copy my text
            </Button>
            <Button onClick={reload} size="sm">
              Reload
            </Button>
          </div>
        </div>
      ) : null}

      <div className="bg-background/95 sticky top-14 z-[5] -mx-4 border-b px-4 py-1.5 backdrop-blur">
        {editor ? <Toolbar editor={editor} /> : <div className="h-8" />}
      </div>
      <div className="pt-8">
        {editor ? (
          <EditorContent editor={editor} />
        ) : (
          <div className="min-h-[60vh]" />
        )}
      </div>
    </div>
  );
};
