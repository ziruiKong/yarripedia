import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const wikiEdits = sqliteTable("wiki_edits", {
  slug: text("slug").primaryKey(),
  editJson: text("edit_json").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const wikiRevisions = sqliteTable("wiki_revisions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  timestamp: text("timestamp").notNull(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  picture: text("picture"),
});
