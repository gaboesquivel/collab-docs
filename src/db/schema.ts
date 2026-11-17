import type { JSONContent } from "@tiptap/react";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  email: text("email").notNull().unique(),
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
});

export const documents = pgTable(
  "documents",
  {
    content: jsonb("content").$type<JSONContent>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // Bumped on every save; a save based on an older version is rejected.
    version: integer("version").notNull().default(1),
  },
  (table) => [index("documents_owner_idx").on(table.ownerId)]
);

export type User = typeof users.$inferSelect;
export type Document = typeof documents.$inferSelect;
