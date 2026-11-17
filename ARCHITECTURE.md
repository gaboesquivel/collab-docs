# Architecture

Technical direction and constraints. Product scope lives in `PRODUCT.md`.

## Platform

- **Vercel-first, where it is the obvious choice:** Next.js (App Router) on Vercel Hobby, deployed from `main`, so there is always a live URL. Choose each piece on its merits, not because of the brand.
- **Postgres on Neon Free**, added through the Vercel Marketplace. Vercel's own Postgres product no longer exists. Stay within both free tiers. Local development uses the same database as production (pulled with `vercel env pull`), so anything created locally is visible on the live site.
- **UI:** shadcn/ui and Geist (both MIT).
- **Only free, open-source libraries.** Use the Tiptap core (MIT) for the editor. Do not use Tiptap Pro extensions (their DOCX import/export and hosted collaboration are paid) or BlockNote's XL packages (GPL-3.0 or a paid commercial license).

## Editing and saving

- Store documents as the editor's structured JSON, not raw HTML. It is the format the editor reads back exactly, and it avoids storing unsanitised markup.
- One writer at a time, using optimistic concurrency: each document has a version number, a save carries the version it was based on, and the server rejects a save based on an outdated version. The client then shows the "someone else edited this" notice. Never last-write-wins silently.
- Autosave with a debounce, and a visible saving / saved / failed state. A failed save must never look like a successful one.

## Real-time is out, deliberately

Vercel Functions now support WebSockets (newly; the docs call it beta). Connections close when a function hits its maximum run time (5 minutes by default), and each connection lives on its own instance, so co-editing would also need a relay such as Redis. That is too fragile for a one-day build. If live co-editing is ever added, the likely route is Yjs, with Hocuspocus (MIT) on a long-running host instead of Vercel Functions.

## Access control

- Accounts come only from a seed script; there is no sign-up route. Each demo account has a password, stored hashed, so sign-in and per-document access mean something on a public URL.
- Every read and write of a document checks on the server that the user is the owner or has been shared it. Hiding a document in the UI is not access control.
- A share is a permission record (document, user); every share grants edit access. There are no link-based or public tokens.

## Import

- Convert uploads on the server, in memory, into editor JSON. Do not store the original file (no Blob storage needed).
- .docx via mammoth (BSD-2-Clause), .md via marked, .txt as paragraphs. All three become HTML, which is then parsed against the editor's own schema. That parse is the sanitiser: any element or attribute the schema does not define (scripts, links, styles) is dropped, keeping only its text.
- Cap uploads at 4 MB, checked in the browser and on the server. Vercel Functions limit request bodies to about 4.5 MB and Server Actions default to 1 MB, so the Server Action limit is raised just enough; the user gets a clear error instead of a platform failure.
- Report which content the editor could not represent and therefore dropped.
