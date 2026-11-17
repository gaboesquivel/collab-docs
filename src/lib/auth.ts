import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";

import { db } from "@/db";
import { users } from "@/db/schema";

import { readSession } from "./session";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
}

/** The signed-in user, or null. Deduplicated per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const userId = await readSession();
  if (!userId) {
    return null;
  }
  const [user] = await db
    .select({ email: users.email, id: users.id, name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user ?? null;
});

/** The signed-in user; redirects to /login when there is none. */
export const requireUser = async (): Promise<CurrentUser> => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
};
