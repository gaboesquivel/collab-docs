import "server-only";
import { generateJSON } from "@tiptap/html/server";
import type { JSONContent } from "@tiptap/react";
import mammoth from "mammoth";
import { marked } from "marked";

import { editorExtensions } from "@/lib/editor/extensions";

export const MAX_IMPORT_BYTES = 4 * 1024 * 1024;

const KINDS = { docx: "docx", markdown: "md", md: "md", txt: "txt" } as const;
type Kind = (typeof KINDS)[keyof typeof KINDS];

export class ImportError extends Error {
  override name = "ImportError";
}

const extensionOf = (fileName: string) =>
  fileName.includes(".") ? (fileName.split(".").pop() ?? "").toLowerCase() : "";

const detectKind = (fileName: string): Kind => {
  const ext = extensionOf(fileName);
  if (ext in KINDS) {
    return KINDS[ext as keyof typeof KINDS];
  }
  if (ext === "doc") {
    throw new ImportError(
      "Old .doc files aren't supported. Save it as .docx in Word and try again."
    );
  }
  if (ext === "pdf") {
    throw new ImportError(
      "PDFs aren't supported. Upload a .docx, .md or .txt file instead."
    );
  }
  throw new ImportError(
    "That file type isn't supported. Upload a .docx, .md or .txt file."
  );
};

/** File name without its extension, used as the new document's title. */
export const titleFromFileName = (fileName: string) => {
  const base = fileName.replace(/\.[^.]+$/u, "").trim();
  return base || "Untitled";
};

// Word styles mammoth does not map by default. Underline is ignored by
// mammoth unless mapped explicitly.
const DOCX_STYLE_MAP = [
  "u => u",
  "p[style-name='Title'] => h1:fresh",
  "p[style-name='Subtitle'] => h2:fresh",
];

const escapeHtml = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const toHtml = async (kind: Kind, buffer: Buffer): Promise<string> => {
  switch (kind) {
    case "docx": {
      try {
        const result = await mammoth.convertToHtml(
          { buffer },
          {
            // Keep a placeholder so images can be counted, without inlining
            // their bytes as base64.
            convertImage: mammoth.images.imgElement(() =>
              Promise.resolve({ src: "" })
            ),
            styleMap: DOCX_STYLE_MAP,
          }
        );
        return result.value;
      } catch {
        throw new ImportError(
          "This .docx file couldn't be read. It may be damaged or password-protected."
        );
      }
    }
    case "md": {
      return marked.parse(buffer.toString("utf-8"), {
        async: false,
        gfm: true,
      });
    }
    default: {
      return buffer
        .toString("utf-8")
        .replaceAll("\r\n", "\n")
        .trim()
        .split(/\n\s*\n/u)
        .map((block) => `<p>${escapeHtml(block).replaceAll("\n", "<br>")}</p>`)
        .join("");
    }
  }
};

const count = (html: string, tag: string) =>
  (html.match(new RegExp(`<${tag}[\\s>/]`, "giu")) ?? []).length;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export interface ImportResult {
  title: string;
  content: JSONContent;
  /** Human-readable notes about content the editor could not keep. */
  removed: string[];
}

export const convertUpload = async (file: File): Promise<ImportResult> => {
  if (file.size === 0) {
    throw new ImportError("That file is empty.");
  }
  if (file.size > MAX_IMPORT_BYTES) {
    throw new ImportError("That file is larger than 4 MB.");
  }

  const kind = detectKind(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  let html = await toHtml(kind, buffer);

  const removed: string[] = [];
  const images = count(html, "img");
  const tables = count(html, "table");
  if (images > 0) {
    removed.push(`${plural(images, "image")} removed`);
  }
  if (tables > 0) {
    removed.push(`${plural(tables, "table")} converted to plain text`);
  }

  html = html
    // The editor has three heading levels; fold deeper ones into the third.
    .replaceAll(/<(?<slash>\/?)h[4-6]\b/giu, "<$<slash>h3")
    // Images are not kept; drop them and any paragraph left empty by that.
    .replaceAll(/<img\b[^>]*>/giu, "")
    .replaceAll(/<p>\s*<\/p>/giu, "");

  // Parsing against the editor schema drops every element and attribute it
  // does not define (scripts, styles, links, colours), keeping their text.
  const content = generateJSON(html, editorExtensions);

  return { content, removed, title: titleFromFileName(file.name) };
};
