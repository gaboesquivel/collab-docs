# Product

## Purpose

A lightweight, browser-based document workspace: write formatted documents, import existing files, share them with a colleague, and come back to find everything saved.

This is a one-day take-home for Ajaia. The primary audience is the reviewer, who judges product judgment, deliberate use of AI tools, and working output. A small app that works every time and explains its decisions beats a larger one that breaks in a demo.

## Problem and primary user

A person who needs to draft a document, bring in an existing Word or Markdown file, and hand it to a colleague to edit, without setting up or paying for a full suite. The user need is assumed from the brief, not researched.

## Value

Free tools already solve this (Google Docs; self-hosted Docmost and Outline). The build is justified because the assignment is the point. So the value is in the execution:

- Simple and reliable: the user can always see that their work is saved, and sharing never silently loses someone's edit.
- Built on free, open-source libraries for the hard parts (editor, Word import), so time goes into experience and trade-offs.

## Primary metric

**The core path completes end to end on the deployed app:** user A writes or imports a document, shares it with user B, B opens and edits it, and A returns and sees B's edit with formatting intact.

Every requirement in the brief is on this path. It is observed by walking through it manually on the live URL with two accounts. There are no real users, so baseline and targets are unknown.

## Scope

- Sign in with any `@demo.test` email. The first sign-in creates the account with the password used; after that, the same password is required. Three ready-made accounts exist for quick demos.
- Document list with "My documents" and "Shared with me".
- Create, rename, open and edit documents with bold, italic, underline, headings, and bulleted and numbered lists.
- Autosave with a visible save status, and a warning before leaving with unsaved changes.
- Upload .docx, .md or .txt to create a **new** editable document, named after the file, owned by the uploader and opened immediately. Formatting the editor supports is kept. Anything it cannot show (tables, images, fonts, colours, comments) is dropped, and the user is told what was removed. .doc, PDF and other types get a clear "not supported" message.
- Share a document with another existing user, by email, as an editor.
- One person edits at a time. If someone else saved since you opened the document, you see a notice instead of silently overwriting their work.
- Everything persists across sessions.

## Non-goals

- **Real-time co-editing and live cursors:** the highest-risk feature, and the brief only asks that another user can access the document.
- **Keeping uploaded originals:** the document is a converted copy; storing files adds work for no user benefit at this scope.
- **PDF and legacy .doc import:** extraction is unreliable, and a messy import makes the app look broken.
- **Public links, invites to people without accounts, access requests:** sharing between existing users is enough to prove the model.
- **Real sign-up and account management** (verification, password reset, profiles): creating a demo account on first sign-in is enough to show and test sharing between users.
- **Read-only viewer role:** every share grants edit access; a second role adds permission logic without changing the core path.
- **Comments, version history, export, folders:** each is a feature of its own and none is on the core path.
- **AI features in the app:** the "AI-native" criterion is about how the work is done, which the process and these documents show.
- **Paid dependencies:** a requirement of the brief. Hosting stays on free tiers: Vercel Hobby and Neon Free.

## Open questions and assumptions

- Assumed: rare simultaneous edits are acceptable without live co-editing.
