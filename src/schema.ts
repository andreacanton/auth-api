import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export interface User {
  userId: number;
  email: string;
  passwordHash: string;
  lastAccess: string;
}

export const users = sqliteTable("users", {
  userId: integer("user_id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  lastAccess: text("last_access"),
});

export const userSessions = sqliteTable("user_sessions", {
  sessionId: text("session_id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.userId),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at"),
});
