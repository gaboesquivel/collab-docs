import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { AppHeader } from "@/components/app-header";
import { DocumentView } from "@/components/editor/document-view";
import { requireUser } from "@/lib/auth";
import { getDocumentAccess } from "@/lib/documents";

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
  const { doc, user } = result;

  return (
    <>
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4">
        <DocumentView
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
