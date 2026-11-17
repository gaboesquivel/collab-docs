"use client";

import type { Editor } from "@tiptap/core";
import { useEffect, useRef, useState } from "react";

import { saveDocument } from "@/app/documents/actions";

import { Autosaver } from "./autosaver";
import type { SaveStatus } from "./autosaver";

export type { SaveStatus } from "./autosaver";

/**
 * Wires an Autosaver to the editor and the page: saves after typing, when the
 * tab is hidden and on Cmd/Ctrl+S, and warns before leaving with unsaved work.
 */
export const useAutosave = ({
  editor,
  documentId,
  initialVersion,
  initialSavedAt,
}: {
  editor: Editor | null;
  documentId: string;
  initialVersion: number;
  initialSavedAt: string;
}) => {
  const [status, setStatus] = useState<SaveStatus>({
    at: initialSavedAt,
    kind: "saved",
  });
  const saver = useRef<Autosaver | null>(null);

  useEffect(() => {
    if (!editor) {
      return;
    }
    const instance = new Autosaver({
      getContent: () => editor.getJSON(),
      onConflict: () => editor.setEditable(false),
      onStatus: setStatus,
      send: (content, baseVersion) =>
        saveDocument({ baseVersion, content, id: documentId }),
      version: initialVersion,
    });
    saver.current = instance;

    const onUpdate = () => instance.changed();
    const onHide = () => {
      if (document.visibilityState === "hidden") {
        instance.flush();
      }
    };
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (instance.hasPendingChanges) {
        event.preventDefault();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        instance.flush();
      }
    };

    editor.on("update", onUpdate);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      editor.off("update", onUpdate);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("keydown", onKeyDown);
      instance.flush();
      instance.dispose();
      saver.current = null;
    };
  }, [editor, documentId, initialVersion]);

  return {
    /** Lets the page reload without the unsaved-changes prompt. */
    discard: () => saver.current?.discard(),
    retry: () => saver.current?.flush(),
    status,
  };
};
