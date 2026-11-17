import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { cache } from "react";

import { AppHeader } from "@/components/app-header";
import { DocumentView } from "@/components/editor/document-view";
import { ShareDialog } from "@/components/share-dialog";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getDocumentAccess, getPerson, getSharedWith } from "@/lib/documents";

/** The document, only if the signed-in user may open it. */
const load = cache(async (id: string) => {
  const user = await requireUser();
  const access = await getDocumentAccess(user.id, id);
  return access ? { ...access, user } : null;
});

export const generateMetadata = async ({
  params,
}: PageProps<"/d/[id]">): Promise<Metadata> => {
  const { id } = await params;
  const result = await load(id);
  return { title: result?.doc.title ?? "Not found" };
};

const DocumentPage = async ({ params, searchParams }: PageProps<"/d/[id]">) => {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  const result = await load(id);
  if (!result) {
    notFound();
  }
  const { doc, role, user } = result;

  let actions: ReactNode = null;
  if (role === "owner") {
    const [people, everyone] = await Promise.all([
      getSharedWith(doc.id),
      db
        .select({ email: users.email, id: users.id, name: users.name })
        .from(users)
        .orderBy(asc(users.name)),
    ]);
    actions = (
      <ShareDialog
        documentId={doc.id}
        initialPeople={people}
        owner={user}
        suggestions={everyone.filter((person) => person.id !== user.id)}
      />
    );
  } else {
    const owner = await getPerson(doc.ownerId);
    actions = (
      <span className="text-muted-foreground hidden shrink-0 text-sm md:inline">
        Shared by {owner?.name ?? "someone"}
      </span>
    );
  }

  return (
    <>
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4">
        <DocumentView
          actions={actions}
          content={doc.content}
          id={doc.id}
          isNew={isNew === "1"}
          title={doc.title}
          updatedAt={doc.updatedAt.toISOString()}
          version={doc.version}
        />
      </main>
    </>
  );
};

export default DocumentPage;
