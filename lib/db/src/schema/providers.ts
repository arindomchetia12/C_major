import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const providersTable = pgTable("providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  trade: text("trade").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  bio: text("bio").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  yearsExperience: integer("years_experience"),
  hourlyRate: real("hourly_rate"),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProviderSchema = createInsertSchema(providersTable).omit({ id: true, createdAt: true, isVerified: true });
export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type Provider = typeof providersTable.$inferSelect;
