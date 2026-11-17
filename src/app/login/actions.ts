"use server";

import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, deleteSession } from "@/lib/session";

export interface SignInState {
  error?: string;
  email?: string;
}

/** Only demo addresses can sign in, and signing in creates the account. */
const DEMO_EMAIL = /^[a-z0-9][a-z0-9._+-]{0,63}@demo\.test$/u;
// bcrypt ignores anything longer.
const MAX_PASSWORD_LENGTH = 72;

/** "mary.jane@demo.test" → "Mary Jane" */
const nameFromEmail = (email: string) =>
  email
    .split("@")[0]
    .split(/[._+-]+/u)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");

const findUser = async (email: string) => {
  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user ?? null;
};

/**
 * Signs in to a demo account. The first sign-in with a new @demo.test address
 * creates the account with that password; after that the same password is
 * required.
 */
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
  if (!DEMO_EMAIL.test(email)) {
    return { email, error: "Use an email ending in @demo.test." };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return { email, error: "Use a password of 72 characters or fewer." };
  }

  let user = await findUser(email);

  if (!user) {
    const passwordHash = await hash(password, 10);
    const [created] = await db
      .insert(users)
      .values({ email, name: nameFromEmail(email), passwordHash })
      .onConflictDoNothing({ target: users.email })
      .returning({ id: users.id });
    if (created) {
      await createSession(created.id);
      redirect("/");
    }
    // Someone created the same account a moment ago; check against theirs.
    user = await findUser(email);
  }

  if (!(user && (await compare(password, user.passwordHash)))) {
    return {
      email,
      error:
        "Wrong password for this account. It was set on its first sign-in.",
    };
  }

  await createSession(user.id);
  redirect("/");
};

export const signOut = async () => {
  await deleteSession();
  redirect("/login");
};
