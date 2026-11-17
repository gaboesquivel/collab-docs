"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { documents } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { convertUpload, ImportError } from "@/lib/import/convert";

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
