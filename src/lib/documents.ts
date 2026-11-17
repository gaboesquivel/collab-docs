import "server-only";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { documents } from "@/db/schema";
import type { Document } from "@/db/schema";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

export type Role = "owner" | "editor";

export interface DocumentAccess {
  doc: Document;
  role: Role;
}

/**
 * The document and the user's role on it, or null when the user may not open
 * it. Every read and write of a document goes through this check.
 */
export const getDocumentAccess = async (
  userId: string,
  documentId: string
): Promise<DocumentAccess | null> => {
  if (!UUID.test(documentId)) {
    return null;
  }
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.ownerId, userId)))
    .limit(1);
  return doc ? { doc, role: "owner" } : null;
};
