"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import { renameDocument } from "@/app/documents/actions";

/** The document title, renamed in place on Enter or blur. */
export const TitleInput = ({
  documentId,
  initialTitle,
  autoFocus,
  onDone,
}: {
  documentId: string;
  initialTitle: string;
  autoFocus?: boolean;
  onDone?: () => void;
}) => {
  const [title, setTitle] = useState(initialTitle);
  const saved = useRef(initialTitle);

  const commit = async () => {
    const next = title.trim() || "Untitled";
    if (next === saved.current) {
      setTitle(next);
      return;
    }
    const previous = saved.current;
    saved.current = next;
    setTitle(next);
    document.title = `${next} · Docs`;
    const result = await renameDocument(documentId, next).catch(() => null);
    if (!result?.ok) {
      saved.current = previous;
      setTitle(previous);
      document.title = `${previous} · Docs`;
      toast.error(result?.error ?? "Couldn't rename the document.");
    }
  };

  return (
    <input
      aria-label="Document title"
      // Used only for brand-new documents, so the user can name it first.
      // oxlint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={autoFocus}
      className="hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-ring min-w-0 flex-1 truncate rounded-md bg-transparent px-2 py-1 text-xl font-semibold tracking-tight outline-none focus-visible:outline-2"
      maxLength={200}
      onBlur={commit}
      onChange={(event) => setTitle(event.target.value)}
      onFocus={(event) => {
        if (autoFocus) {
          event.target.select();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
          onDone?.();
        }
        if (event.key === "Escape") {
          setTitle(saved.current);
          event.currentTarget.blur();
        }
      }}
      value={title}
    />
  );
};
