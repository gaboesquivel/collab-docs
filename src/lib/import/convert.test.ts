import { readFile } from "node:fs/promises";

import { getSchema } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import { describe, expect, it } from "vitest";

import { editorExtensions } from "@/lib/editor/extensions";

import {
  convertUpload,
  ImportError,
  MAX_IMPORT_BYTES,
  titleFromFileName,
} from "./convert";

const schema = getSchema(editorExtensions);

/** Same check saveDocument runs: imported content must always be storable. */
const expectStorable = (content: JSONContent) => {
  expect(() => schema.nodeFromJSON(content).check()).not.toThrow();
};

const nodes = (content: JSONContent): JSONContent[] => [
  content,
  ...(content.content ?? []).flatMap(nodes),
];

const plainText = (content: JSONContent) =>
  nodes(content)
    .map((node) => node.text ?? "")
    .join("");

const textWithMark = (content: JSONContent, mark: string) =>
  nodes(content)
    .filter((node) => node.marks?.some((m) => m.type === mark))
    .map((node) => node.text);

const markTypes = (content: JSONContent) =>
  new Set(
    nodes(content).flatMap((node) => node.marks?.map((m) => m.type) ?? [])
  );

const headings = (content: JSONContent) =>
  nodes(content)
    .filter((node) => node.type === "heading")
    .map((node) => [node.attrs?.level, plainText(node)]);

const file = (name: string, body: BlobPart) => new File([body], name);

describe("convertUpload", () => {
  it("converts a .docx, keeping supported formatting and reporting what was dropped", async () => {
    // Fixture: a Title paragraph, a Heading 4, bold and underlined runs,
    // a 2-cell table and one embedded image.
    const bytes = await readFile(
      new URL("fixtures/sample.docx", import.meta.url)
    );
    const result = await convertUpload(file("sample.docx", bytes));

    expectStorable(result.content);
    expect(result.title).toBe("sample");
    expect(headings(result.content)).toEqual([
      [1, "Quarterly plan"],
      [3, "Deep heading"],
    ]);
    expect(textWithMark(result.content, "bold")).toEqual(["bold"]);
    expect(textWithMark(result.content, "underline")).toEqual(["underlined"]);
    expect(plainText(result.content)).toContain("Cell A");
    expect(plainText(result.content)).toContain("Cell B");
    expect(nodes(result.content).some((node) => node.type === "image")).toBe(
      false
    );
    expect(result.removed).toEqual([
      "1 image removed",
      "1 table converted to plain text",
    ]);
  });

  it("sanitises Markdown through the editor schema", async () => {
    const markdown = [
      "#### Deep heading",
      "",
      "Read [the guide](https://example.com) and ~~ignore~~ this.",
      "",
      "<script>alert('x')</script>",
      "",
      '<p style="color:red" onclick="alert(1)">Styled</p>',
    ].join("\n");
    const result = await convertUpload(file("notes.md", markdown));

    expectStorable(result.content);
    expect(headings(result.content)).toEqual([[3, "Deep heading"]]);
    expect(plainText(result.content)).toContain(
      "Read the guide and ignore this."
    );
    expect(plainText(result.content)).toContain("Styled");
    expect(markTypes(result.content)).toEqual(new Set());
    expect(JSON.stringify(result.content)).not.toMatch(
      /script|onclick|style|href/u
    );
    expect(result.removed).toEqual([]);
  });

  it("turns plain text into paragraphs and keeps markup as literal text", async () => {
    const text = "First line\r\nsecond line\r\n\r\n<b>not bold</b>";
    const result = await convertUpload(file("notes.txt", text));

    expectStorable(result.content);
    expect(result.content.content?.map((node) => node.type)).toEqual([
      "paragraph",
      "paragraph",
    ]);
    expect(
      nodes(result.content).filter((n) => n.type === "hardBreak")
    ).toHaveLength(1);
    expect(plainText(result.content)).toContain("<b>not bold</b>");
    expect(markTypes(result.content)).toEqual(new Set());
  });

  it.each([
    ["report.pdf", "x", "PDFs aren't supported"],
    ["old.doc", "x", "Old .doc files aren't supported"],
    ["sheet.xlsx", "x", "That file type isn't supported"],
    ["no-extension", "x", "That file type isn't supported"],
    ["empty.txt", "", "That file is empty."],
    ["huge.txt", "a".repeat(MAX_IMPORT_BYTES + 1), "larger than 4 MB"],
  ])("refuses %s with a clear message", async (name, body, message) => {
    const attempt = convertUpload(file(name, body));
    await expect(attempt).rejects.toBeInstanceOf(ImportError);
    await expect(attempt).rejects.toThrow(message);
  });

  it("refuses a damaged .docx", async () => {
    await expect(
      convertUpload(file("broken.docx", "not a zip"))
    ).rejects.toThrow("couldn't be read");
  });
});

describe("titleFromFileName", () => {
  it("drops only the last extension and falls back to Untitled", () => {
    expect(titleFromFileName("Q3 plan.final.docx")).toBe("Q3 plan.final");
    expect(titleFromFileName(".md")).toBe("Untitled");
  });
});
