import { mysqlTable as table, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/mysql-core";

// Change the user schema as per your requirements.
// This is a basic user schema with common fields like id, name, email, password, etc.
export const users = table("users", {
  id: t.int("id").primaryKey().autoincrement(),
  name: t.varchar("name", { length: 255 }).notNull(),
  email: t.varchar("email", { length: 255 }).notNull().unique(),
  password: t.varchar("password", { length: 255 }).notNull(),
  isActive: t.boolean("is_active").default(true),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
  updatedAt: t.timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const refreshTokens = table(
  "refresh_tokens",
  {
    id: t.int("id").primaryKey().autoincrement(),
    userId: t.int("user_id").notNull().references(() => users.id, {onDelete: 'cascade'}).notNull(),
    token: t.varchar("token", { length: 255 }).notNull(),
    expiresAt: t.timestamp("expires_at").notNull(),
    isRevoked: t.boolean("is_revoked").default(false).notNull(),
    createdAt: t.timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_refresh_tokens_user_id").on(table.userId),
    index("idx_refresh_tokens_expires_at").on(table.expiresAt),
    index("idx_refresh_tokens_is_revoked").on(table.isRevoked),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

/**
 * Create a table scheme as many as you need.
 */
