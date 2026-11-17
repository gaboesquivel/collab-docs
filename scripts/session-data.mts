// Builds src/app/submission/session-data.json from the exported session traces
// in docs/session and the git history. Run with `pnpm session:data` after the
// traces change; the page only reads the generated JSON.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const SESSIONS = [
  { dir: "1-build", id: 1, title: "Build" },
  { dir: "2-testing", id: 2, title: "Testing" },
] as const;

const OUT = "src/app/submission/session-data.json";

type Json = Record<string, unknown>;

interface ContentPart {
  type: string;
  text?: string;
  name?: string;
}

const isRecord = (value: unknown): value is Json =>
  typeof value === "object" && value !== null;

const stripReminders = (text: string) =>
  text.replaceAll(/<system-reminder>[\s\S]*?<\/system-reminder>/gu, "").trim();

/** The /shape command arrives wrapped in tags; keep only what the user typed. */
const cleanPrompt = (text: string) => {
  const args = /<command-args>(?<args>[\s\S]*?)<\/command-args>/u.exec(text);
  const name = /<command-name>(?<name>[\s\S]*?)<\/command-name>/u.exec(text);
  if (args?.groups && name?.groups) {
    return `${name.groups.name.trim()} ${args.groups.args.trim()}`;
  }
  return text;
};

/** Text the user typed in this event, or null for tool results and metadata. */
const promptText = (event: Json): string | null => {
  if (event.type !== "user" || event.isMeta) {
    return null;
  }
  const message = event.message as Json;
  const content = message?.content;
  let text = "";
  if (typeof content === "string") {
    text = content;
  } else if (Array.isArray(content)) {
    const parts = content as ContentPart[];
    if (parts.some((p) => p.type === "tool_result")) {
      return null;
    }
    text = parts
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("\n");
  }
  text = cleanPrompt(stripReminders(text));
  if (!text || text.startsWith("[Request interrupted")) {
    return null;
  }
  return text;
};

const REJECTION = /the user said:\n(?<said>[\s\S]*)$/u;

/**
 * Instructions the user gave while Claude was working: a message sent
 * mid-turn, or the reason given when rejecting a proposed plan.
 */
const steerText = (event: Json): { kind: string; text: string } | null => {
  const attachment = event.attachment as Json | undefined;
  if (
    event.type === "attachment" &&
    attachment?.type === "queued_command" &&
    typeof attachment.prompt === "string"
  ) {
    return { kind: "Sent mid-task", text: attachment.prompt.trim() };
  }
  if (event.type !== "user" || !isRecord(event.message)) {
    return null;
  }
  const { content } = event.message as Json;
  if (!Array.isArray(content)) {
    return null;
  }
  for (const part of content as Json[]) {
    if (part.type !== "tool_result" || typeof part.content !== "string") {
      continue;
    }
    const match = REJECTION.exec(part.content);
    if (match?.groups) {
      return { kind: "Rejected the plan", text: match.groups.said.trim() };
    }
  }
  return null;
};

const TOOL_GROUPS: [string, (name: string) => boolean][] = [
  ["Shell commands", (n) => n === "Bash"],
  ["Files written", (n) => n === "Write"],
  ["Files edited", (n) => n === "Edit"],
  ["Files read", (n) => n === "Read"],
  ["Web searches", (n) => n === "WebSearch"],
  ["Browser actions", (n) => n.startsWith("mcp__Claude_Browser")],
  [
    "Planning and status",
    (n) =>
      n.startsWith("mcp__ccd_turn") ||
      n === "ExitPlanMode" ||
      n === "ToolSearch",
  ],
];

const groupOf = (name: string) =>
  TOOL_GROUPS.find(([, match]) => match(name))?.[0] ?? "Other";

const commitsBetween = (start: string, end: string) =>
  execFileSync(
    "git",
    [
      "log",
      `--since=${start}`,
      `--until=${end}`,
      "--reverse",
      "--format=%h%x09%aI%x09%s",
    ],
    { encoding: "utf-8" }
  )
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash, at, subject] = line.split("\t");
      return { at: new Date(at).toISOString(), hash, subject };
    });

// One pass over the trace collecting several independent tallies; splitting
// it up would mean walking 1,500 events several times for no clarity gain.
// oxlint-disable-next-line complexity
const buildSession = (session: (typeof SESSIONS)[number]) => {
  const events = readFileSync(
    `docs/session/${session.dir}/trace.jsonl`,
    "utf-8"
  )
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Json);

  const stamps = events
    .map((e) => e.timestamp)
    .filter((t): t is string => typeof t === "string")
    .toSorted();
  const [start] = stamps;
  const end = stamps.at(-1) ?? start;

  const tokens = { cacheRead: 0, cacheWrite: 0, input: 0, output: 0 };
  const seenMessages = new Set<string>();
  const tools = new Map<string, number>();
  let replies = 0;

  interface Turn {
    prompt: string;
    at: string;
    lastAt: string;
    reply: string[];
    steers: { at: string; kind: string; text: string }[];
    toolCalls: number;
  }
  const turns: Turn[] = [];

  for (const event of events) {
    const at = typeof event.timestamp === "string" ? event.timestamp : null;
    const prompt = promptText(event);
    if (prompt && at) {
      // A prompt resent after an interrupt replaces the empty first attempt.
      const previous = turns.at(-1);
      if (previous?.prompt === prompt && previous.toolCalls === 0) {
        turns.pop();
      }
      turns.push({
        at,
        lastAt: at,
        prompt,
        reply: [],
        steers: [],
        toolCalls: 0,
      });
      continue;
    }
    const turn = turns.at(-1);
    const steer = steerText(event);
    if (steer && turn && at) {
      turn.steers.push({ at, ...steer });
    }
    if (turn && at && event.type === "assistant") {
      turn.lastAt = at;
    }
    if (event.type !== "assistant" || !isRecord(event.message)) {
      continue;
    }
    const message = event.message as Json;
    const parts = (message.content ?? []) as ContentPart[];
    for (const part of parts) {
      if (part.type === "tool_use" && part.name) {
        const group = groupOf(part.name);
        tools.set(group, (tools.get(group) ?? 0) + 1);
        if (turn) {
          turn.toolCalls += 1;
        }
      }
      if (part.type === "text" && part.text?.trim() && turn) {
        turn.reply.push(part.text.trim());
      }
    }
    // A streamed reply is logged once per content block; count usage once.
    const id = typeof message.id === "string" ? message.id : null;
    if (id && !seenMessages.has(id)) {
      seenMessages.add(id);
      replies += 1;
      const usage = (message.usage ?? {}) as Record<string, number>;
      tokens.input += usage.input_tokens ?? 0;
      tokens.output += usage.output_tokens ?? 0;
      tokens.cacheRead += usage.cache_read_input_tokens ?? 0;
      tokens.cacheWrite += usage.cache_creation_input_tokens ?? 0;
    }
  }

  const agentMs = turns.reduce(
    (sum, t) => sum + (Date.parse(t.lastAt) - Date.parse(t.at)),
    0
  );

  return {
    agentMs,
    commits: commitsBetween(start, end),
    end,
    id: session.id,
    replies,
    start,
    title: session.title,
    tokens,
    tools: [...tools.entries()]
      .map(([name, count]) => ({ count, name }))
      .toSorted((a, b) => b.count - a.count),
    turns: turns.map((t) => ({
      at: t.at,
      durationMs: Date.parse(t.lastAt) - Date.parse(t.at),
      prompt: t.prompt,
      reply: t.reply.join("\n\n"),
      steers: t.steers,
      toolCalls: t.toolCalls,
    })),
    wallMs: Date.parse(end) - Date.parse(start),
  };
};

const data = {
  generatedAt: new Date().toISOString(),
  sessions: SESSIONS.map(buildSession),
};

writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
for (const s of data.sessions) {
  console.log(
    `${s.title}: ${Math.round(s.wallMs / 60_000)} min wall, ${Math.round(s.agentMs / 60_000)} min agent, ` +
      `${s.turns.length} turns, ${s.replies} replies, ${s.tokens.output} output tokens, ${s.commits.length} commits`
  );
}
