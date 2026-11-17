"use server";

import { getSchema } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { documents, users } from "@/db/schema";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { getDocumentAccess } from "@/lib/documents";
import { editorExtensions } from "@/lib/editor/extensions";
import { convertUpload, ImportError } from "@/lib/import/convert";

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_CHARS = 2_000_000;
const EMPTY_DOC: JSONContent = {
  content: [{ type: "paragraph" }],
  type: "doc",
};

const schema = getSchema(editorExtensions);

/** True when the content is a document the editor schema can represent. */
const isValidContent = (content: unknown): content is JSONContent => {
  try {
    schema.nodeFromJSON(content).check();
    return true;
  } catch {
    return false;
  }
};

// Create

export const createDocument = async () => {
  const user = await requireUser();
  const [doc] = await db
    .insert(documents)
    .values({ content: EMPTY_DOC, ownerId: user.id, title: "Untitled" })
    .returning({ id: documents.id });
  redirect(`/d/${doc.id}?new=1`);
};

// Import

export type ImportState =
  | { ok: true; id: string; title: string; removed: string[] }
  | { ok: false; error: string };

export const importDocument = async (
  formData: FormData
): Promise<ImportState> => {
  const user = await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Choose a file to import.", ok: false };
  }

  try {
    const { content, removed, title } = await convertUpload(file);
    const [doc] = await db
      .insert(documents)
      .values({ content, ownerId: user.id, title })
      .returning({ id: documents.id });
    revalidatePath("/");
    return { id: doc.id, ok: true, removed, title };
  } catch (error) {
    if (error instanceof ImportError) {
      return { error: error.message, ok: false };
    }
    console.error("Import failed", error);
    return {
      error: "Something went wrong importing that file. Please try again.",
      ok: false,
    };
  }
};

// Save

export type SaveResult =
  | { ok: true; version: number; savedAt: string }
  | { ok: false; reason: "conflict"; editedBy: string | null }
  | { ok: false; reason: "signed-out" | "not-found" | "invalid" };

/**
 * Saves the content only if nobody else has saved since `baseVersion`.
 * Never overwrites someone else's edit.
 */
export const saveDocument = async (input: {
  id: string;
  content: unknown;
  baseVersion: number;
}): Promise<SaveResult> => {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, reason: "signed-out" };
  }
  const access = await getDocumentAccess(user.id, input.id);
  if (!access) {
    return { ok: false, reason: "not-found" };
  }
  if (
    !Number.isInteger(input.baseVersion) ||
    !isValidContent(input.content) ||
    JSON.stringify(input.content).length > MAX_CONTENT_CHARS
  ) {
    return { ok: false, reason: "invalid" };
  }

  const now = new Date();
  const [saved] = await db
    .update(documents)
    .set({
      content: input.content,
      updatedAt: now,
      updatedBy: user.id,
      version: sql`${documents.version} + 1`,
    })
    .where(
      and(eq(documents.id, input.id), eq(documents.version, input.baseVersion))
    )
    .returning({ version: documents.version });

  if (saved) {
    return { ok: true, savedAt: now.toISOString(), version: saved.version };
  }

  const [latest] = await db
    .select({ name: users.name })
    .from(documents)
    .leftJoin(users, eq(users.id, documents.updatedBy))
    .where(eq(documents.id, input.id))
    .limit(1);
  return { editedBy: latest?.name ?? null, ok: false, reason: "conflict" };
};

// Rename

export type RenameResult =
  | { ok: true; title: string }
  | { ok: false; error: string };

export const renameDocument = async (
  id: string,
  rawTitle: string
): Promise<RenameResult> => {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You've been signed out. Sign in again.", ok: false };
  }
  const access = await getDocumentAccess(user.id, id);
  if (!access) {
    return { error: "This document is no longer available.", ok: false };
  }

  const title = rawTitle.trim().slice(0, MAX_TITLE_LENGTH) || "Untitled";
  await db
    .update(documents)
    .set({ title, updatedAt: new Date() })
    .where(eq(documents.id, id));
  revalidatePath("/");
  return { ok: true, title };
};
