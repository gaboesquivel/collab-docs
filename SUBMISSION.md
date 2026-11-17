# Submission: collab-docs

**Start here:** https://collab-docs-henna.vercel.app/submission has everything below on one page: what works, the requirements checklist, the notes, and how the work was done with AI.

## Links

- **Live app:** https://collab-docs-henna.vercel.app
- **Source:** https://github.com/gaboesquivel/collab-docs
- **Walkthrough video:** see [`VIDEO_URL.txt`](VIDEO_URL.txt)

## Test accounts

Any email ending in `@demo.test` signs in; the first password used becomes that account's password. Ready-made: `alice@demo.test`, `bob@demo.test`, `carol@demo.test`, all with password `demo1234`. To review sharing, share a document as Alice with `bob@demo.test`, then sign in as Bob and open it from **Shared with me**.

## What's included

| File | What it is |
| --- | --- |
| Source code | This repository (Next.js, Tiptap, Drizzle, Neon Postgres, deployed on Vercel) |
| [`README.md`](README.md) | What it does, how to try it, and local setup and run instructions |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Architecture note: priorities, constraints and decisions |
| [`AI_WORKFLOW.md`](AI_WORKFLOW.md) | AI workflow note: tools, where AI helped, what I changed or rejected, how I verified |
| [`PRODUCT.md`](PRODUCT.md) | Product direction: user, scope, non-goals |
| [`docs/session/`](docs/session/README.md) | Full transcripts and raw traces of both AI sessions |
| [`VIDEO_URL.txt`](VIDEO_URL.txt) | Walkthrough video link |
| `src/lib/import/convert.test.ts` | The automated test (`pnpm test`) |

## Status

- **Working end to end:** create, rename, edit and reopen documents with rich text; autosave with conflict protection; .docx/.md/.txt import; sharing with owned and shared lists; persistence across sessions.
- **Incomplete or deliberately left out:** real-time co-editing, a read-only role, keeping images and tables on import, and browser-level automated tests. Reasons are in `PRODUCT.md` and on the submission page.
- **Next 2–4 hours:** listed on the submission page.
