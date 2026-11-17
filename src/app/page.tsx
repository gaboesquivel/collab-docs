import { count, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { FileTextIcon, PlusIcon, UsersIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { createDocument } from "@/app/documents/actions";
import { AppHeader } from "@/components/app-header";
import { ImportButton } from "@/components/import-button";
import { LocalTime } from "@/components/local-time";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { documents, shares, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Documents" };

const owners = alias(users, "owners");
const editors = alias(users, "editors");

interface Row {
  id: string;
  title: string;
  updatedAt: Date;
  editedBy: string | null;
  detail: ReactNode;
}

const DocumentList = ({ rows, me }: { rows: Row[]; me: string }) => (
  <ul className="divide-y rounded-xl border">
    {rows.map((doc) => (
      <li key={doc.id}>
        <Link
          className="hover:bg-muted/50 focus-visible:bg-muted/50 flex items-center gap-3 px-4 py-3 transition-colors outline-none"
          href={`/d/${doc.id}`}
        >
          <FileTextIcon className="text-muted-foreground size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{doc.title}</p>
            {doc.detail ? (
              <p className="text-muted-foreground truncate text-xs sm:hidden">
                {doc.detail}
              </p>
            ) : null}
          </div>
          {doc.detail ? (
            <span className="text-muted-foreground hidden shrink-0 text-sm sm:inline">
              {doc.detail}
            </span>
          ) : null}
          <span className="text-muted-foreground shrink-0 text-right text-sm sm:w-40">
            {doc.editedBy && doc.editedBy !== me ? `${doc.editedBy}, ` : ""}
            <LocalTime date={doc.updatedAt} />
          </span>
        </Link>
      </li>
    ))}
  </ul>
);

const EmptyState = ({ title, body }: { title: string; body: string }) => (
  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center">
    <FileTextIcon className="text-muted-foreground size-8" />
    <p className="font-medium">{title}</p>
    <p className="text-muted-foreground max-w-sm text-sm">{body}</p>
  </div>
);

const HomePage = async () => {
  const user = await requireUser();

  const [mine, sharedWithMe] = await Promise.all([
    db
      .select({
        editedBy: editors.name,
        id: documents.id,
        shareCount: count(shares.userId),
        title: documents.title,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .leftJoin(shares, eq(shares.documentId, documents.id))
      .leftJoin(editors, eq(editors.id, documents.updatedBy))
      .where(eq(documents.ownerId, user.id))
      .groupBy(documents.id, editors.name)
      .orderBy(desc(documents.updatedAt)),
    db
      .select({
        editedBy: editors.name,
        id: documents.id,
        ownerName: owners.name,
        title: documents.title,
        updatedAt: documents.updatedAt,
      })
      .from(shares)
      .innerJoin(documents, eq(documents.id, shares.documentId))
      .innerJoin(owners, eq(owners.id, documents.ownerId))
      .leftJoin(editors, eq(editors.id, documents.updatedBy))
      .where(eq(shares.userId, user.id))
      .orderBy(desc(documents.updatedAt)),
  ]);

  return (
    <>
      <AppHeader user={user} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-8">
        <section aria-labelledby="mine" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight" id="mine">
                My documents
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Import accepts .docx, .md and .txt files up to 4 MB.
              </p>
            </div>
            <div className="flex gap-2">
              <ImportButton />
              <form action={createDocument}>
                <Button type="submit">
                  <PlusIcon />
                  New document
                </Button>
              </form>
            </div>
          </div>
          {mine.length === 0 ? (
            <EmptyState
              body="Create a new document, or import a Word (.docx), Markdown or text file."
              title="No documents yet"
            />
          ) : (
            <DocumentList
              me={user.name}
              rows={mine.map((doc) => ({
                ...doc,
                detail:
                  doc.shareCount > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <UsersIcon className="size-3.5" />
                      Shared with {doc.shareCount}
                    </span>
                  ) : null,
              }))}
            />
          )}
        </section>

        <section aria-labelledby="shared" className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight" id="shared">
            Shared with me
          </h2>
          {sharedWithMe.length === 0 ? (
            <EmptyState
              body="When someone shares a document with you, it shows up here."
              title="Nothing shared with you yet"
            />
          ) : (
            <DocumentList
              me={user.name}
              rows={sharedWithMe.map((doc) => ({
                ...doc,
                detail: `Owned by ${doc.ownerName}`,
              }))}
            />
          )}
        </section>
      </main>
    </>
  );
};

export default HomePage;
