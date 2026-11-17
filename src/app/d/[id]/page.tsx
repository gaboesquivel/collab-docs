import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { AppHeader } from "@/components/app-header";
import { DocumentEditor } from "@/components/editor/document-editor";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { requireUser } from "@/lib/auth";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

/** The document, only if the signed-in user may open it. */
const loadDocument = cache(async (id: string) => {
  if (!UUID.test(id)) {
    return null;
  }
  const user = await requireUser();
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.ownerId, user.id)))
    .limit(1);
  return doc ? { doc, user } : null;
});

export const generateMetadata = async ({
  params,
}: PageProps<"/d/[id]">): Promise<Metadata> => {
  const { id } = await params;
  const result = await loadDocument(id);
  return { title: result?.doc.title ?? "Not found" };
};

const DocumentPage = async ({ params }: PageProps<"/d/[id]">) => {
  const { id } = await params;
  const result = await loadDocument(id);
  if (!result) {
    notFound();
  }
  const { doc, user } = result;

  return (
    <>
      <AppHeader user={user}>
        <span className="text-muted-foreground">/</span>
        <h1 className="truncate font-medium">{doc.title}</h1>
      </AppHeader>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24">
        <p className="bg-muted text-muted-foreground mt-3 rounded-md px-3 py-2 text-sm">
          Changes aren&apos;t saved yet. Saving arrives in the next update.
        </p>
        <DocumentEditor initialContent={doc.content} />
      </main>
    </>
  );
};

export default DocumentPage;
