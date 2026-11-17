// `server-only` throws when imported outside a React Server build. Tests run
// server code directly in Node, so vitest.config.mts resolves it here instead.
export const serverOnlyStub = true;
