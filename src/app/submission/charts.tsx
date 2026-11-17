import { formatClock, formatDuration, SESSIONS } from "./stats";
import type { Session } from "./stats";

// Two categorical roles (slots 1 and 2 of the reference palette) plus the
// app's neutral tokens. Text never uses the series colours.
const PROMPT = "#2a78d6";
const COMMIT = "#eb6834";

const Legend = () => (
  <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
    <span className="inline-flex items-center gap-1.5">
      <svg aria-hidden="true" className="size-2.5" viewBox="0 0 10 10">
        <circle cx="5" cy="5" fill={PROMPT} r="4" />
      </svg>
      Your prompt
    </span>
    <span className="inline-flex items-center gap-1.5">
      <svg aria-hidden="true" className="size-2.5" viewBox="0 0 10 10">
        <rect fill={COMMIT} height="8" rx="1" width="8" x="1" y="1" />
      </svg>
      Commit to main (deploys)
    </span>
    <span className="inline-flex items-center gap-1.5">
      <span className="bg-foreground/15 inline-block h-2 w-4 rounded-sm" />
      AI working on a request
    </span>
  </div>
);

const SessionTrack = ({ session }: { session: Session }) => {
  const start = Date.parse(session.start);
  const span = Math.max(session.wallMs, 1);
  const x = (iso: string) => ((Date.parse(iso) - start) / span) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">
          Session {session.id}: {session.title}
        </span>
        <span className="text-muted-foreground tabular-nums">
          {formatClock(session.start)}–{formatClock(session.end)} UTC ·{" "}
          {formatDuration(session.wallMs)}
        </span>
      </div>
      <svg
        aria-label={`Timeline of session ${session.id}: ${session.turns.length} prompts and ${session.commits.length} commits over ${formatDuration(session.wallMs)}`}
        className="h-10 w-full overflow-visible"
        preserveAspectRatio="none"
        role="img"
        viewBox="0 0 100 40"
      >
        <line
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="0.4"
          x1="0"
          x2="100"
          y1="20"
          y2="20"
        />
        {session.turns.map((turn) => (
          <rect
            fill="currentColor"
            fillOpacity="0.12"
            height="10"
            key={`work-${turn.at}`}
            rx="1"
            width={Math.max((turn.durationMs / span) * 100, 0.4)}
            x={x(turn.at)}
            y="15"
          >
            <title>{`AI working ${formatDuration(turn.durationMs)} from ${formatClock(turn.at)} UTC`}</title>
          </rect>
        ))}
        {session.commits.map((commit) => (
          <rect
            fill={COMMIT}
            height="7"
            key={commit.hash}
            rx="1"
            stroke="white"
            strokeWidth="0.6"
            width="1.4"
            x={x(commit.at) - 0.7}
            y="28"
          >
            <title>{`${formatClock(commit.at)} UTC · ${commit.hash} ${commit.subject}`}</title>
          </rect>
        ))}
        {session.turns.map((turn) => (
          <circle
            cx={x(turn.at)}
            cy="9"
            fill={PROMPT}
            key={`prompt-${turn.at}`}
            r="1.6"
            stroke="white"
            strokeWidth="0.5"
          >
            <title>{`${formatClock(turn.at)} UTC · ${turn.prompt.slice(0, 120)}`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
};

/** Both sessions, each on its own scale, with the break between them. */
export const SessionTimeline = () => {
  const [first, second] = SESSIONS;
  const breakMs = second ? Date.parse(second.start) - Date.parse(first.end) : 0;
  return (
    <div className="flex flex-col gap-4">
      <Legend />
      <SessionTrack session={first} />
      {second ? (
        <>
          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            <span className="border-foreground/20 flex-1 border-t border-dashed" />
            Break · {formatDuration(breakMs)}
            <span className="border-foreground/20 flex-1 border-t border-dashed" />
          </div>
          <SessionTrack session={second} />
        </>
      ) : null}
      <p className="text-muted-foreground text-xs">
        Each row has its own time scale. Hover a mark for details.
      </p>
    </div>
  );
};

/** Tool calls across both sessions, one hue, sorted by count. */
export const ToolMix = () => {
  const counts = new Map<string, number>();
  for (const session of SESSIONS) {
    for (const tool of session.tools) {
      counts.set(tool.name, (counts.get(tool.name) ?? 0) + tool.count);
    }
  }
  const rows = [...counts.entries()].toSorted((a, b) => b[1] - a[1]);
  const max = Math.max(...rows.map(([, count]) => count));

  return (
    <ul aria-label="Tool calls by type" className="flex flex-col gap-2">
      {rows.map(([name, count]) => (
        <li
          className="grid grid-cols-[8.5rem_1fr_2.5rem] items-center gap-3 text-sm"
          key={name}
          title={`${name}: ${count}`}
        >
          <span className="text-muted-foreground truncate">{name}</span>
          <span className="bg-muted h-3 rounded-r-sm">
            <span
              className="block h-full rounded-r-[4px]"
              style={{ background: PROMPT, width: `${(count / max) * 100}%` }}
            />
          </span>
          <span className="text-right font-medium tabular-nums">{count}</span>
        </li>
      ))}
    </ul>
  );
};
