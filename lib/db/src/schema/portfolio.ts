import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { providersTable } from "./providers";

export const portfolioTable = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => providersTable.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  caption: text("caption").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPortfolioSchema = createInsertSchema(portfolioTable).omit({ id: true, createdAt: true });
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type PortfolioItem = typeof portfolioTable.$inferSelect;
