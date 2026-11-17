import "server-only";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { documents, shares, users } from "@/db/schema";
import type { Document } from "@/db/schema";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

export type Role = "owner" | "editor";

export interface DocumentAccess {
  doc: Document;
  role: Role;
}

/**
 * The document and the user's role on it, or null when the user may not open
 * it. Every read and write of a document goes through this check: the owner
 * and anyone it is shared with may open and edit it.
 */
export const getDocumentAccess = async (
  userId: string,
  documentId: string
): Promise<DocumentAccess | null> => {
  if (!UUID.test(documentId)) {
    return null;
  }
  const [row] = await db
    .select({ doc: documents, sharedWith: shares.userId })
    .from(documents)
    .leftJoin(
      shares,
      and(eq(shares.documentId, documents.id), eq(shares.userId, userId))
    )
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!row) {
    return null;
  }
  if (row.doc.ownerId === userId) {
    return { doc: row.doc, role: "owner" };
  }
  return row.sharedWith ? { doc: row.doc, role: "editor" } : null;
};

export interface Person {
  id: string;
  name: string;
  email: string;
}

/** Everyone the document is shared with, oldest share first. */
export const getSharedWith = async (documentId: string): Promise<Person[]> => {
  const people = await db
    .select({ email: users.email, id: users.id, name: users.name })
    .from(shares)
    .innerJoin(users, eq(users.id, shares.userId))
    .where(eq(shares.documentId, documentId))
    .orderBy(asc(shares.createdAt));
  return people;
};

export const getPerson = async (userId: string): Promise<Person | null> => {
  const [person] = await db
    .select({ email: users.email, id: users.id, name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return person ?? null;
};
