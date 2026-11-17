## Product context

- `PRODUCT.md`: Users, goals, metrics, and scope.
- `ARCHITECTURE.md`: Technical direction and constraints.

Read relevant documents before substantial changes. Surface conflicts with established product direction. Update them only when I agree the direction has changed.

## Workflow

- Commit straight to `main`; no feature branches or pull requests. Every push to `main` deploys to production on Vercel.
- Testing is mostly manual: I walk through the core path on the live URL.
- One automated test covers document import (`src/lib/import/convert.test.ts`, run with `pnpm test`): .docx/.md/.txt conversion, sanitising, what gets reported as removed, and refused files. Run it before pushing changes to import or the editor schema, and keep it passing.
- Automated tests never touch the database (local dev shares production's). Don't add further test suites or browser automation unless I ask.
