import { ChevronRightIcon } from "lucide-react";

import {
  formatClock,
  formatDuration,
  REPO,
  renderMarkdown,
  SESSIONS,
} from "./stats";
import { TURN_NOTES } from "./turns";

/** Every request in both sessions as a card that expands to the full exchange. */
export const SessionExplorer = () => (
  <div className="flex flex-col gap-8">
    {SESSIONS.map((session) => (
      <div className="flex flex-col gap-3" key={session.id}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-semibold">
            Session {session.id}: {session.title}
          </h3>
          <a
            className="text-muted-foreground text-sm underline underline-offset-4"
            href={`${REPO}/tree/main/docs/session/${session.id === 1 ? "1-build" : "2-testing"}`}
          >
            Raw trace on GitHub
          </a>
        </div>
        <ol className="flex flex-col gap-2">
          {session.turns.map((turn, index) => {
            const note = TURN_NOTES[session.id]?.[index];
            return (
              <li key={turn.at}>
                <details className="group rounded-lg border">
                  <summary className="hover:bg-muted/50 flex cursor-pointer list-none gap-3 p-3 [&::-webkit-details-marker]:hidden">
                    <ChevronRightIcon className="text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform group-open:rotate-90" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tabular-nums">
                        <span>{formatClock(turn.at)} UTC</span>
                        <span>·</span>
                        <span>
                          {turn.toolCalls} tool calls
                          {turn.durationMs >= 60_000
                            ? ` · ${formatDuration(turn.durationMs)}`
                            : ""}
                        </span>
                        {note?.steer ? (
                          <span className="bg-foreground text-background rounded px-1.5 py-0.5 font-medium">
                            {note.steer}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm">
                        {note?.summary ?? turn.prompt.slice(0, 140)}
                      </p>
                    </div>
                  </summary>
                  <div className="flex flex-col gap-4 border-t p-4">
                    <div>
                      <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                        Prompt
                      </p>
                      <p className="bg-muted/60 rounded-md p-3 text-sm whitespace-pre-wrap">
                        {turn.prompt}
                      </p>
                    </div>
                    {turn.steers.length > 0 ? (
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                          Steering during the work
                        </p>
                        <ul className="flex flex-col gap-1 text-sm">
                          {turn.steers.map((steer) => (
                            <li key={steer.at}>
                              <span className="text-muted-foreground tabular-nums">
                                {formatClock(steer.at)} · {steer.kind}:
                              </span>{" "}
                              “{steer.text}”
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {turn.reply ? (
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                          Claude
                        </p>
                        <div
                          className="prose-submission text-sm"
                          // Replies from the committed session export, rendered from Markdown.
                          // oxlint-disable-next-line react/no-danger
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdown(turn.reply),
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
      </div>
    ))}
  </div>
);
