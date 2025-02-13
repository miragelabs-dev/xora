import { pgTable, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  address: varchar("address", {
    length: 42,
  })
    .notNull()
    .primaryKey(),
});
export type User = typeof users.$inferSelect;
