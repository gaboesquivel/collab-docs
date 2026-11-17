import { StarterKit } from "@tiptap/starter-kit";

/**
 * The one document schema, shared by the browser editor and server-side
 * import. Anything not enabled here cannot exist in a stored document, which
 * is what makes import conversion double as sanitisation.
 *
 * Scope from PRODUCT.md: bold, italic, underline, headings, bulleted and
 * numbered lists.
 */
export const editorExtensions = [
  StarterKit.configure({
    blockquote: false,
    code: false,
    codeBlock: false,
    heading: { levels: [1, 2, 3] },
    horizontalRule: false,
    link: false,
    strike: false,
  }),
];
