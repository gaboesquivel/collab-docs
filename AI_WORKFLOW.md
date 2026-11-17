# AI workflow note

_Draft written with Claude from the session transcripts; edited by me before submitting._

## Tools I used

- **Claude Code (desktop app), running Claude Opus 5.5:** the single tool for discovery, planning, implementation, deployment and documentation. Two sessions, both in [docs/session](docs/session/README.md): about one hour to build, and five minutes, after a break, to add the automated test.
- **A product-shaping skill (`/shape`)** to run discovery as a conversation before any code: users, alternatives, scope, non-goals. Its output is `PRODUCT.md` and `ARCHITECTURE.md`.
- **Plan mode** for the implementation plan, which I reviewed and sent back twice before approving.
- **CLIs driven by the agent:** Vercel (project, GitHub link, Neon provisioning, environment variables, deploy checks) and GitHub (`gh`). No dashboards were used for setup.
- **Ultracite (Oxlint + Oxfmt)** as the lint and format gate the agent had to pass after every phase.

## Where AI materially sped up the work

- **Research and trade-offs in minutes:** checking which editor libraries are actually free (the Tiptap core is MIT, but its DOCX import and hosted collaboration are paid; BlockNote's DOCX export is GPL or paid), what Vercel's WebSocket support really allows, and what replaced Vercel Postgres.
- **Infrastructure from the terminal:** project link, Neon database, secrets and production deploys, all scripted through the Vercel CLI in one pass.
- **The import pipeline:** mammoth, marked and plain-text conversion through the editor's own schema, plus hand-built .docx fixtures (headings, all three text styles, both list types, a table, an image) to check it before any UI existed.
- **The save logic:** debounced autosave with version checks, so a stale save is refused instead of overwriting someone else's edit. The AI moved this into a plain class when React Compiler lint rules flagged the first version.
- **Documentation kept current** as decisions changed: README, `PRODUCT.md`, `ARCHITECTURE.md`.

## What I changed or rejected

- **Rejected the first implementation plan twice** before approving it: once to require the Vercel and GitHub CLIs for all setup, once to require Oxlint + Oxfmt with Ultracite's defaults.
- **Overrode the sign-in recommendation.** The AI proposed open sign-up plus demo accounts; I chose demo accounts only. Later I replaced the generated secret password with a public static one, then changed sign-in so any `@demo.test` address creates its account on first use. Testers can make users freely, and passwords are still enforced afterwards.
- **Stopped browser automation.** After the first phase I told the agent to verify with lint, types and builds only, and to leave browser testing to me.
- **Set the delivery rhythm mid-task:** commit immediately, then once per phase, straight to `main`.
- **Kept the AI's push-back where it was right:** it argued against live co-editing (the riskiest feature, and not required) and against treating "use Vercel as much as possible" as a goal in itself. I agreed with both.
- **Missed the automated-test requirement during the build.** I had told the agent to skip the assignment text. I added the import test in a second session once I re-read the brief.

## How I verified correctness, UX quality and reliability

- **After every phase:** `pnpm check` (lint and format), type check and a production build, then a check that the Vercel production deploy was live.
- **Import:** the converter was run against the fixtures during the build. Since session 2 it has been covered by an automated test (`pnpm test`, 11 cases): formatting kept, scripts and links stripped, removal notices, refused files, and every result passing the same schema check as a save.
- **Data access:** the new sharing and home-page queries were run once, read-only, against the real database, since a build can't catch bad SQL.
- **Product behaviour:** I walked through the core path by hand on the live URL: import, edit, share, edit as the second user, and see the change as the owner. The agent did not drive the browser after phase 1.
- **Reading the work:** I read each plan before approving it and checked each summary against the diff and the live app.
