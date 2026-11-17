import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

import { marked } from "marked";

import data from "./session-data.json";

export type Session = (typeof data.sessions)[number];
export const SESSIONS: Session[] = data.sessions;

export const REPO = "https://github.com/gaboesquivel/collab-docs";
export const LIVE = "https://collab-docs-henna.vercel.app";

/**
 * Claude Opus 5.5 list prices in USD per million tokens, per Anthropic's model
 * table as of 2026-11-03. Cache writes in these sessions used the 1-hour TTL,
 * billed at 2× the input price.
 */
export const PRICES = {
  asOf: "2026-11-03",
  cacheRead: 0.2,
  cacheWrite1h: 8,
  input: 4,
  output: 20,
};

export const estimateCost = (tokens: Session["tokens"]) =>
  (tokens.input * PRICES.input +
    tokens.output * PRICES.output +
    tokens.cacheRead * PRICES.cacheRead +
    tokens.cacheWrite * PRICES.cacheWrite1h) /
  1_000_000;

const sumOf = (pick: (s: Session) => number) =>
  SESSIONS.reduce((acc, s) => acc + pick(s), 0);

export const totals = () => ({
  agentMs: sumOf((s) => s.agentMs),
  commits: sumOf((s) => s.commits.length),
  cost: sumOf((s) => estimateCost(s.tokens)),
  outputTokens: sumOf((s) => s.tokens.output),
  prompts: sumOf((s) => s.turns.length),
  wallMs: sumOf((s) => s.wallMs),
});

export const formatDuration = (ms: number) => {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
};

export const formatCompact = (n: number) =>
  new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(n);

/** "19:58" in UTC; reviewers see the same labels wherever they are. */
export const formatClock = (iso: string) => iso.slice(11, 16);

const BLOB = `${REPO}/blob/main/`;

/**
 * Renders trusted Markdown from this repository. Relative links point into the
 * GitHub repo, since the files themselves aren't served by the app.
 */
export const renderMarkdown = (markdown: string) =>
  (marked.parse(markdown, { async: false, gfm: true }) as string).replaceAll(
    /href="(?!https?:|#|mailto:)(?<target>[^"]+)"/gu,
    (_match, target: string) => `href="${BLOB}${target.replace(/^\.\//u, "")}"`
  );

// The page supplies its own section heading.
const withoutTitle = (markdown: string) => markdown.replace(/^# .*\n+/u, "");

// Literal paths, so the build traces only these files.
export const architectureHtml = () =>
  renderMarkdown(
    withoutTitle(
      readFileSync(path.join(process.cwd(), "ARCHITECTURE.md"), "utf-8")
    )
  );

export const aiWorkflowHtml = () =>
  renderMarkdown(
    withoutTitle(
      readFileSync(path.join(process.cwd(), "AI_WORKFLOW.md"), "utf-8")
    )
  );

export const videoUrl = () => {
  const value = readFileSync(
    path.join(process.cwd(), "VIDEO_URL.txt"),
    "utf-8"
  ).trim();
  return /^https?:\/\//u.test(value) ? value : null;
};
