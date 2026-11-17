// Creates (or resets the password of) the demo accounts. There is no sign-up;
// this script is the only way accounts come into existence.
import { neon } from "@neondatabase/serverless";
import { hash } from "bcryptjs";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

import { users } from "../src/db/schema";

config({ path: ".env.local" });

const DEMO_USERS = [
  { email: "alice@demo.test", name: "Alice" },
  { email: "bob@demo.test", name: "Bob" },
  { email: "carol@demo.test", name: "Carol" },
];

const main = async () => {
  const url = process.env.DATABASE_URL;
  const password = process.env.DEMO_PASSWORD;
  if (!(url && password)) {
    throw new Error("DATABASE_URL and DEMO_PASSWORD must be set in .env.local");
  }

  const db = drizzle(neon(url));
  const passwordHash = await hash(password, 10);

  await Promise.all(
    DEMO_USERS.map((user) =>
      db
        .insert(users)
        .values({ ...user, passwordHash })
        .onConflictDoUpdate({
          set: { name: user.name, passwordHash },
          target: users.email,
        })
    )
  );

  console.log(
    `Seeded ${DEMO_USERS.length} demo accounts: ${DEMO_USERS.map((u) => u.email).join(", ")}`
  );
};

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
