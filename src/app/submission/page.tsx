import {
  CheckCircle2Icon,
  CircleDashedIcon,
  ExternalLinkIcon,
  FileTextIcon,
  FolderGit2Icon,
  PlayCircleIcon,
} from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SessionTimeline, ToolMix } from "./charts";
import { SessionExplorer } from "./session-explorer";
import {
  formatCompact,
  formatDuration,
  LIVE,
  aiWorkflowHtml,
  architectureHtml,
  PRICES,
  REPO,
  SESSIONS,
  totals,
  videoUrl,
} from "./stats";

export const dynamic = "force-static";

export const metadata: Metadata = {
  description:
    "Ajaia take-home submission: a lightweight collaborative document editor, with notes and the full AI session history.",
  title: "Submission",
};

const blob = (file: string) => `${REPO}/blob/main/${file}`;

const Section = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) => (
  <section aria-labelledby={id} className="flex scroll-mt-6 flex-col gap-4">
    <h2 className="text-xl font-semibold tracking-tight" id={id}>
      {title}
    </h2>
    {children}
  </section>
);

const Tile = ({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) => (
  <div className="flex flex-col gap-1 rounded-xl border p-4">
    <p className="text-muted-foreground text-sm">{label}</p>
    <p className="text-2xl font-semibold tabular-nums">{value}</p>
    <p className="text-muted-foreground text-xs">{caption}</p>
  </div>
);

const LinkButton = ({
  href,
  icon,
  children,
  primary,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  primary?: boolean;
}) => (
  <a
    className={
      primary
        ? "bg-primary text-primary-foreground inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium"
        : "hover:bg-muted inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium"
    }
    href={href}
  >
    {icon}
    {children}
  </a>
);

type Status = "done" | "pending";

const REQUIREMENTS: {
  area: string;
  item: string;
  status: Status;
  how: ReactNode;
}[] = [
  {
    area: "Documents",
    how: "“New document” on the home page; or import a file.",
    item: "Create a new document",
    status: "done",
  },
  {
    area: "Documents",
    how: "Click the title in the editor; Enter or click away saves.",
    item: "Rename a document",
    status: "done",
  },
  {
    area: "Documents",
    how: "Tiptap editor with toolbar and shortcuts: bold, italic, underline, H1–H3, bulleted and numbered lists.",
    item: "Edit rich text in the browser",
    status: "done",
  },
  {
    area: "Documents",
    how: "Autosave about 1 s after typing, Cmd/Ctrl+S, on tab switch; visible save status; warning before leaving unsaved.",
    item: "Save and reopen",
    status: "done",
  },
  {
    area: "Upload",
    how: ".docx, .md and .txt up to 4 MB become a new editable document. Types are stated on the home page, in errors and in the README.",
    item: "Upload a file into the workflow",
    status: "done",
  },
  {
    area: "Sharing",
    how: "Owner shares by email from the Share dialog and can remove access. Home splits “My documents” and “Shared with me”.",
    item: "Owner, grant access, owned vs shared",
    status: "done",
  },
  {
    area: "Persistence",
    how: "Neon Postgres stores the editor's structured JSON, so formatting survives; shares persist per user.",
    item: "Survives refresh, keeps formatting and access",
    status: "done",
  },
  {
    area: "Quality",
    how: (
      <a className="underline underline-offset-4" href={blob("README.md")}>
        README: local setup and run
      </a>
    ),
    item: "Setup and run instructions",
    status: "done",
  },
  {
    area: "Quality",
    how: (
      <a className="underline underline-offset-4" href={LIVE}>
        {LIVE.replace("https://", "")}
      </a>
    ),
    item: "Working deployed URL",
    status: "done",
  },
  {
    area: "Quality",
    how: "Import, sign-in and sharing errors in plain language; failed saves show Retry; stale saves are refused, never overwritten.",
    item: "Validation and error handling",
    status: "done",
  },
  {
    area: "Quality",
    how: (
      <a
        className="underline underline-offset-4"
        href={blob("src/lib/import/convert.test.ts")}
      >
        pnpm test: 11 cases on document import
      </a>
    ),
    item: "At least one meaningful automated test",
    status: "done",
  },
  {
    area: "Notes",
    how: "Below, and in ARCHITECTURE.md",
    item: "Architecture note",
    status: "done",
  },
  {
    area: "Notes",
    how: "Below, and in AI_WORKFLOW.md",
    item: "AI workflow note",
    status: "done",
  },
  {
    area: "Notes",
    how: "VIDEO_URL.txt",
    item: "3–5 minute walkthrough video",
    status: "pending",
  },
];

const SubmissionPage = () => {
  const sum = totals();
  const video = videoUrl();
  const architecture = architectureHtml();
  const aiWorkflow = aiWorkflowHtml();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-4 py-10">
      <header className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          Ajaia · AI-native full stack assignment
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Collab Docs</h1>
        <div id="tldr">
          <h2 className="font-semibold">TL;DR</h2>
          <p>
            Import a Word, Markdown or text file and start editing. Collab Docs
            preserves supported formatting, autosaves changes and lets a
            colleague edit the same document. Today, collaborators take turns.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton
            href={LIVE}
            icon={<ExternalLinkIcon className="size-4" />}
            primary
          >
            Open the live app
          </LinkButton>
          <LinkButton href={REPO} icon={<FolderGit2Icon className="size-4" />}>
            Source on GitHub
          </LinkButton>
          {video ? (
            <LinkButton
              href={video}
              icon={<PlayCircleIcon className="size-4" />}
            >
              Walkthrough video
            </LinkButton>
          ) : (
            <span className="text-muted-foreground inline-flex h-9 items-center gap-2 rounded-lg border border-dashed px-3 text-sm">
              <PlayCircleIcon className="size-4" />
              Video coming soon
            </span>
          )}
        </div>
      </header>

      <Section id="review" title="Try document import">
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm">
          <li>
            Sign in as <code>alice@demo.test</code> with <code>demo1234</code>.
            Import a .docx, .md or .txt file up to 4 MB.
          </li>
          <li>
            Rename the draft, edit a heading or list, and wait for{" "}
            <strong>Saved</strong>. Reopen it to check the formatting.
          </li>
          <li>
            Share it with <code>bob@demo.test</code>. Sign in as Bob with the
            same password, edit it from <strong>Shared with me</strong>, and
            wait for <strong>Saved</strong>. Alice will see the edit when she
            reopens it.
          </li>
        </ol>
      </Section>

      <Section id="decisions" title="Product and engineering decisions">
        <p>
          <strong>Import came first.</strong> An attachment would still leave
          the writer with a file to open elsewhere. Mammoth converts Word files
          into editable content. Tiptap keeps supported formatting, and the app
          tells the writer when an image was removed or a table flattened.
        </p>
        <p>
          <strong>Sharing grants edit access.</strong> Named accounts make
          ownership visible. Postgres stores the document and its permissions.
          Each save checks the version so an older tab can’t silently overwrite
          a colleague’s work.
        </p>
      </Section>

      <Section id="built" title="Recorded Claude Code sessions">
        <p className="text-sm">
          I used /shape with Claude Code to define the scope in PRODUCT.md.
          Claude proposed open registration. I chose demo accounts so reviewers
          could try sharing immediately. I checked the flow by hand, then caught
          a missed requirement and added 11 import test cases in the second
          session.
        </p>
        <details>
          <summary className="cursor-pointer text-sm font-medium">
            Explore the build and testing sessions
          </summary>
          <div className="mt-4 flex flex-col gap-8">
            <SessionExplorer />
            <Section id="metrics" title="Session metrics">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Tile
                  caption={`${SESSIONS.length} sessions only. The AI was working for ${formatDuration(sum.agentMs)} of it`}
                  label="Recorded session time"
                  value={formatDuration(sum.wallMs)}
                />
                <Tile
                  caption={`Across ${sum.prompts} prompts`}
                  label="Output tokens"
                  value={formatCompact(sum.outputTokens)}
                />
                <Tile
                  caption={`Estimate at Claude Opus 5.5 API list prices (${PRICES.asOf}); built on a Claude Code plan`}
                  label="API-equivalent cost"
                  value={`≈ $${Math.round(sum.cost)}`}
                />
                <Tile
                  caption="Each push to main deployed to production"
                  label="Commits shipped"
                  value={String(sum.commits)}
                />
              </div>
              <div className="rounded-xl border p-4">
                <h3 className="mb-4 font-medium">Session timeline</h3>
                <SessionTimeline />
              </div>
              <div className="rounded-xl border p-4">
                <h3 className="mb-4 font-medium">
                  What the AI did: tool calls
                </h3>
                <ToolMix />
              </div>
            </Section>
          </div>
        </details>
      </Section>

      <Section id="next" title="Next 2–4 hours">
        <p>
          I’d prototype live co-editing in one shared document. I’d focus on
          whether two writers can see each other’s cursor, type in the same
          paragraph and reopen it with both edits intact.
        </p>
        <p className="text-muted-foreground text-sm">
          After that, I’d explore an MCP server so an agent could open and edit
          documents using the same permissions as its user.
        </p>
      </Section>

      <Section id="deliverables" title="Deliverables">
        <ul className="flex flex-col gap-2 text-sm">
          {[
            ["README.md", "Setup, run instructions and what the app does"],
            ["ARCHITECTURE.md", "Architecture note"],
            ["AI_WORKFLOW.md", "AI workflow note"],
            ["PRODUCT.md", "Product direction, scope and non-goals"],
            ["SUBMISSION.md", "What's included"],
            ["VIDEO_URL.txt", "Walkthrough video link"],
            ["docs/session/README.md", "Full transcripts and raw traces"],
          ].map(([file, label]) => (
            <li className="flex items-center gap-2" key={file}>
              <FileTextIcon className="text-muted-foreground size-4 shrink-0" />
              <a
                className="font-medium underline underline-offset-4"
                href={blob(file)}
              >
                {file}
              </a>
              <span className="text-muted-foreground">{label}</span>
            </li>
          ))}
        </ul>
      </Section>
      <details className="flex flex-col">
        <summary className="cursor-pointer font-medium">
          Requirements and full notes
        </summary>
        <div className="mt-6 flex flex-col gap-10">
          <Section id="requirements" title="Requirements checklist">
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-muted-foreground text-xs">
                  <tr>
                    <th className="px-3 py-2 font-medium" scope="col">
                      Requirement
                    </th>
                    <th className="px-3 py-2 font-medium" scope="col">
                      How it&apos;s met
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {REQUIREMENTS.map((row) => (
                    <tr key={row.item}>
                      <td className="w-2/5 px-3 py-2.5 align-top">
                        <span className="flex items-start gap-2">
                          {row.status === "done" ? (
                            <CheckCircle2Icon
                              aria-label="Done"
                              className="mt-0.5 size-4 shrink-0 text-green-700"
                            />
                          ) : (
                            <CircleDashedIcon
                              aria-label="Pending"
                              className="text-muted-foreground mt-0.5 size-4 shrink-0"
                            />
                          )}
                          <span>
                            <span className="font-medium">{row.item}</span>
                            <span className="text-muted-foreground block text-xs">
                              {row.area}
                              {row.status === "pending" ? " · pending" : ""}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className="text-muted-foreground px-3 py-2.5 align-top">
                        {row.how}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="ai" title="AI workflow note">
            <div
              className="prose-submission"
              // Trusted Markdown from this repository.
              // oxlint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: aiWorkflow }}
            />
          </Section>

          <Section id="architecture" title="Architecture note">
            <div
              className="prose-submission"
              // Trusted Markdown from this repository.
              // oxlint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: architecture }}
            />
          </Section>
        </div>
      </details>
    </main>
  );
};

export default SubmissionPage;
