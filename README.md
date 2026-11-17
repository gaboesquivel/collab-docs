# collab-docs

A lightweight, browser-based document workspace: write formatted documents, import Word, Markdown or text files, share them with another user, and come back to find everything saved.

**Live:** https://collab-docs-henna.vercel.app

## Try it

Sign in with any email ending in `@demo.test`. The first sign-in with a new address creates the account with whatever password you type; after that, the same password is required. Ready-made accounts: `alice@demo.test`, `bob@demo.test` and `carol@demo.test`, all with password `demo1234`.

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

The product direction, scope and non-goals are in [PRODUCT.md](PRODUCT.md), and the technical constraints in [ARCHITECTURE.md](ARCHITECTURE.md). The AI-assisted sessions that produced them and the code are in [docs/session](docs/session/README.md). In short:

- **Shared access, not live co-editing.** Real-time editing was the riskiest feature and the brief doesn't need it; version checks prevent lost edits instead.
- **Import converts and discards the original**, like opening a Word file in Google Docs. Conversion goes through the editor's own schema, which also strips anything unsafe.
- **Demo accounts, created on first sign-in.** Any `@demo.test` address works and the first password used becomes its password, so testers can make as many users as they need without a sign-up form. Passwords are hashed and sessions are a signed cookie, so access control is real on a public URL.
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
- `pnpm test`: automated test for document import (Vitest). It converts sample .docx, .md and .txt files, checks formatting, sanitising and the "removed" notices, and checks refused files. No database or sign-in needed.
- `pnpm db:generate`: create a migration after changing `src/db/schema.ts`.

Local development uses the same Neon database as the live site. Every push to `main` deploys to production.
