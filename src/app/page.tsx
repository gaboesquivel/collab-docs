import { desc, eq } from "drizzle-orm";
import { FileTextIcon, PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { createDocument } from "@/app/documents/actions";
import { AppHeader } from "@/components/app-header";
import { ImportButton } from "@/components/import-button";
import { LocalTime } from "@/components/local-time";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "My documents" };

const HomePage = async () => {
  const user = await requireUser();
  const docs = await db
    .select({
      id: documents.id,
      title: documents.title,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .where(eq(documents.ownerId, user.id))
    .orderBy(desc(documents.updatedAt));

  return (
    <>
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            My documents
          </h1>
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

        {docs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-16 text-center">
            <FileTextIcon className="text-muted-foreground size-8" />
            <p className="font-medium">No documents yet</p>
            <p className="text-muted-foreground max-w-sm text-sm">
              Create a new document, or import a Word (.docx), Markdown or text
              file.
            </p>
          </div>
        ) : (
          <ul className="divide-y rounded-xl border">
            {docs.map((doc) => (
              <li key={doc.id}>
                <Link
                  className="hover:bg-muted/50 flex items-center gap-3 px-4 py-3 transition-colors"
                  href={`/d/${doc.id}`}
                >
                  <FileTextIcon className="text-muted-foreground size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {doc.title}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-sm">
                    <LocalTime date={doc.updatedAt} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
};

export default HomePage;
