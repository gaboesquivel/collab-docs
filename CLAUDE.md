## Product context

- `PRODUCT.md`: Users, goals, metrics, and scope.
- `ARCHITECTURE.md`: Technical direction and constraints.

Read relevant documents before substantial changes. Surface conflicts with established product direction. Update them only when I agree the direction has changed.

## Workflow

- Commit straight to `main`; no feature branches or pull requests. Every push to `main` deploys to production on Vercel.
- Testing is manual for now: I walk through the core path on the live URL. Don't add test suites unless I ask.
