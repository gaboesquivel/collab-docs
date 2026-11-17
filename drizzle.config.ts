import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set; run `vercel env pull .env.local`");
}

export default defineConfig({
  dbCredentials: { url },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/db/schema.ts",
});
