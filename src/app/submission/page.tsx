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

const WORKS = [
  "Sign in with any @demo.test email; demo accounts are ready.",
  "Create, rename, edit and reopen documents with rich text.",
  "Autosave with visible status, and protection against overwriting someone else's edit.",
  "Import .docx, .md and .txt into a new document, with a note on anything removed.",
  "Share with another user; they edit it from “Shared with me”; the owner sees their changes.",
];

const LEFT_OUT = [
  "Real-time co-editing and live cursors: one person edits at a time, by design.",
  "A read-only role: every share grants edit access.",
  "Images and tables on import: removed or flattened, and the user is told.",
  "Browser-level automated tests: the core path is checked by hand.",
  "Separate development database: local development uses the production database.",
];

const NEXT = [
  "Presence indicator (“Bob is viewing”) with light polling: the first step towards collaboration.",
  "Version history from the saved versions the app already counts, with restore.",
  "One end-to-end browser test of the share-and-edit path on preview deploys.",
  "Keep tables on import, with the matching Tiptap extension.",
  "A Neon branch for development so local work never touches production data.",
];

const List = ({ items }: { items: string[] }) => (
  <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

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
        <h1 className="text-3xl font-semibold tracking-tight">
          collab-docs: a lightweight collaborative document editor
        </h1>
        <p className="text-muted-foreground">
          Write formatted documents, import Word, Markdown or text files, share
          them with another user, and come back to find everything saved.
        </p>
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
        <div className="bg-muted/60 rounded-xl p-4 text-sm">
          <p className="font-medium">Test accounts</p>
          <p className="text-muted-foreground mt-1">
            <code>alice@demo.test</code>, <code>bob@demo.test</code> and{" "}
            <code>carol@demo.test</code>, password <code>demo1234</code>. Any
            other <code>@demo.test</code> email creates its account on first
            sign-in with the password you type.
          </p>
        </div>
      </header>

      <Section id="tldr" title="TL;DR">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">Works end to end</h3>
            <List items={WORKS} />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">Left out on purpose</h3>
            <List items={LEFT_OUT} />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">Next 2–4 hours</h3>
            <List items={NEXT} />
          </div>
        </div>
      </Section>

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

      <Section id="review" title="How to review sharing">
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm">
          <li>
            Sign in as <code>alice@demo.test</code> and import a .docx, or
            create a document and format some text.
          </li>
          <li>
            Click <strong>Share</strong> and add <code>bob@demo.test</code>.
          </li>
          <li>
            Sign out, sign in as Bob, open it from{" "}
            <strong>Shared with me</strong> and edit it.
          </li>
          <li>
            Sign back in as Alice: the document shows Bob&apos;s edit and the
            list shows who edited it last.
          </li>
        </ol>
        <p className="text-muted-foreground text-sm">
          To see conflict protection, open the same document in two tabs, type
          in one until it says Saved, then type in the other.
        </p>
      </Section>

      <Section id="built" title="How it was built">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile
            caption={`${SESSIONS.length} sessions; the AI was working for ${formatDuration(sum.agentMs)} of it`}
            label="Time in sessions"
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
          <h3 className="mb-4 font-medium">What the AI did: tool calls</h3>
          <ToolMix />
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

      <Section id="sessions" title="Session explorer">
        <p className="text-muted-foreground text-sm">
          Every request from both sessions. Tagged cards are where I changed the
          direction the AI proposed. Open a card for the full prompt and reply.
        </p>
        <SessionExplorer />
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
    </main>
  );
};

export default SubmissionPage;
