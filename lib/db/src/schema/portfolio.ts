import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const portfolioTable = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  alt: text("alt").notNull().default("Trabalho Baby Letters"),
  orderIndex: integer("order_index").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPortfolioSchema = createInsertSchema(portfolioTable).omit({
  id: true,
  createdAt: true,
});

export type InsertPortfolioItem = z.infer<typeof insertPortfolioSchema>;
export type PortfolioItem = typeof portfolioTable.$inferSelect;
