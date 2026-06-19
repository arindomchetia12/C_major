import { Router } from "express";
import { db, providersTable, reviewsTable } from "@workspace/db";
import { count, avg, desc, sql } from "drizzle-orm";

const router = Router();

// GET /stats
router.get("/stats", async (_req, res) => {
  const [providerCount] = await db.select({ count: count() }).from(providersTable);
  const [reviewCount] = await db.select({ count: count() }).from(reviewsTable);

  const tradeCounts = await db
    .select({ trade: providersTable.trade, count: count() })
    .from(providersTable)
    .groupBy(providersTable.trade)
    .orderBy(desc(count()))
    .limit(1);

  const recentProviders = await db
    .select()
    .from(providersTable)
    .orderBy(desc(providersTable.createdAt))
    .limit(5);

  const recentWithStats = await Promise.all(
    recentProviders.map(async (p) => {
      const stats = await db
        .select({ avg: avg(reviewsTable.rating), count: count() })
        .from(reviewsTable)
        .where(sql`${reviewsTable.providerId} = ${p.id}`);
      return {
        ...p,
        createdAt: p.createdAt.toISOString(),
        averageRating: Number(stats[0]?.avg ?? 0),
        reviewCount: Number(stats[0]?.count ?? 0),
      };
    })
  );

  return res.json({
    totalProviders: Number(providerCount?.count ?? 0),
    totalReviews: Number(reviewCount?.count ?? 0),
    topTrade: tradeCounts[0]?.trade ?? "Plumber",
    recentProviders: recentWithStats,
  });
});

// GET /trades
router.get("/trades", async (_req, res) => {
  const trades = await db
    .select({ trade: providersTable.trade, count: count() })
    .from(providersTable)
    .groupBy(providersTable.trade)
    .orderBy(desc(count()));

  return res.json(trades.map((t) => ({ trade: t.trade, count: Number(t.count) })));
});

export default router;
