# collab-docs

A lightweight, browser-based document workspace: write formatted documents, import Word, Markdown or text files, share them with another user, and come back to find everything saved.

**Live:** https://collab-docs-henna.vercel.app

## Try it

Sign in with one of the demo accounts: `alice@demo.test`, `bob@demo.test` or `carol@demo.test`. They share one password, kept out of the repo as the `DEMO_PASSWORD` environment variable in Vercel (`vercel env pull` puts it in `.env.local`). There is no sign-up.

The path that shows everything:

1. As Alice, import a .docx (or create a new document) and write something with headings, bold, italic, underline and lists.
2. Click **Share** and add `bob@demo.test`.
3. Sign out, sign in as Bob, open it from **Shared with me** and edit it.
4. Sign back in as Alice: the document shows Bob's edit.

## What it does

- **Documents:** create, rename in place, edit and reopen. The editor supports bold, italic, underline, three heading levels, and bulleted and numbered lists, with keyboard shortcuts.
- **Saving:** autosave about a second after you stop typing, with a visible Saved / Saving / Couldn't save status and a Retry button. Saving also happens on Cmd/Ctrl+S and when you switch tabs, and the browser asks before you leave with unsaved changes.
- **Import:** .docx, .md and .txt files (up to 4 MB) become a new editable document named after the file. Formatting the editor supports is kept. Images are removed and tables become plain text, and you're told when that happens. PDF and old .doc files are refused with a clear message.
- **Sharing:** the owner shares by email with another account, sees who has access and can remove it. People it's shared with can edit and rename; only the owner can share.
- **No silent overwrites:** one person edits at a time. If someone else saved after you opened the document, your save is refused, the editor locks, and you can reload their version or copy your text first.

## Decisions

The product direction, scope and non-goals are in [PRODUCT.md](PRODUCT.md), and the technical constraints in [ARCHITECTURE.md](ARCHITECTURE.md). In short:

- **Shared access, not live co-editing.** Real-time editing was the riskiest feature and the brief doesn't need it; version checks prevent lost edits instead.
- **Import converts and discards the original**, like opening a Word file in Google Docs. Conversion goes through the editor's own schema, which also strips anything unsafe.
- **Demo accounts only**, with hashed passwords and a signed session cookie, so access control is real on a public URL without building sign-up.
- **Free, open-source dependencies only:** Next.js, Tiptap core, mammoth, marked, Drizzle, shadcn/ui; hosted on Vercel Hobby with Neon Free Postgres.

## Develop

Requires Node 24 and pnpm, plus the Vercel CLI linked to the project.

```bash
pnpm install
vercel env pull .env.local
pnpm db:migrate
pnpm db:seed
pnpm dev
```

- `pnpm check` / `pnpm fix`: lint and format (Oxlint + Oxfmt via Ultracite).
- `pnpm db:generate`: create a migration after changing `src/db/schema.ts`.

Local development uses the same Neon database as the live site. Every push to `main` deploys to production.
