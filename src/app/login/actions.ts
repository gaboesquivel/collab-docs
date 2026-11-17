"use server";

import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, deleteSession } from "@/lib/session";

export interface SignInState {
  error?: string;
  email?: string;
}

export const signIn = async (
  _prev: SignInState,
  formData: FormData
): Promise<SignInState> => {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!(email && password)) {
    return { email, error: "Enter your email and password." };
  }

  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const valid = user ? await compare(password, user.passwordHash) : false;
  if (!(user && valid)) {
    return {
      email,
      error: "That email and password don't match a demo account.",
    };
  }

  await createSession(user.id);
  redirect("/");
};

export const signOut = async () => {
  await deleteSession();
  redirect("/login");
};
