import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import drizzle from "ultracite/oxlint/drizzle";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";

export default defineConfig({
  env: core.env,
  extends: [core, react, next, drizzle],
  // Generated shadcn/ui components are vendored as-is.
  ignorePatterns: [...(core.ignorePatterns ?? []), "src/components/ui/**"],
});
