import { Router } from "express";
import { db, providersTable, portfolioTable, reviewsTable } from "@workspace/db";
import { eq, ilike, avg, count, desc, or, sql } from "drizzle-orm";
import {
  ListProvidersQueryParams,
  CreateProviderBody,
  UpdateProviderBody,
  GetProviderParams,
  DeleteProviderParams,
  UpdateProviderParams,
} from "@workspace/api-zod";

const router = Router();

async function getProviderWithStats(id: number) {
  const provider = await db.select().from(providersTable).where(eq(providersTable.id, id)).limit(1);
  if (!provider[0]) return null;

  const reviewStats = await db
    .select({ avg: avg(reviewsTable.rating), count: count() })
    .from(reviewsTable)
    .where(eq(reviewsTable.providerId, id));

  return {
    ...provider[0],
    createdAt: provider[0].createdAt.toISOString(),
    averageRating: Number(reviewStats[0]?.avg ?? 0),
    reviewCount: Number(reviewStats[0]?.count ?? 0),
  };
}

// GET /providers
router.get("/providers", async (req, res) => {
  const parsed = ListProvidersQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid query params" });

  const { trade, location, q, limit = 20, offset = 0 } = parsed.data;

  let query = db.select().from(providersTable);
  const conditions = [];

  if (trade) conditions.push(ilike(providersTable.trade, `%${trade}%`));
  if (location) conditions.push(or(ilike(providersTable.city, `%${location}%`), ilike(providersTable.state, `%${location}%`))!);
  if (q) conditions.push(or(ilike(providersTable.name, `%${q}%`), ilike(providersTable.bio, `%${q}%`))!);

  const baseQuery = conditions.length
    ? db.select().from(providersTable).where(conditions.length === 1 ? conditions[0] : sql`${conditions.join(" AND ")}`)
    : db.select().from(providersTable);

  const providers = await db
    .select()
    .from(providersTable)
    .where(conditions.length ? sql`${conditions.reduce((acc, c) => sql`${acc} AND ${c}`)}` : sql`1=1`)
    .orderBy(desc(providersTable.createdAt))
    .limit(limit ?? 20)
    .offset(offset ?? 0);

  const withStats = await Promise.all(
    providers.map(async (p) => {
      const stats = await db
        .select({ avg: avg(reviewsTable.rating), count: count() })
        .from(reviewsTable)
        .where(eq(reviewsTable.providerId, p.id));
      return {
        ...p,
        createdAt: p.createdAt.toISOString(),
        averageRating: Number(stats[0]?.avg ?? 0),
        reviewCount: Number(stats[0]?.count ?? 0),
      };
    })
  );

  return res.json(withStats);
});

// POST /providers
router.post("/providers", async (req, res) => {
  const parsed = CreateProviderBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const [provider] = await db.insert(providersTable).values(parsed.data).returning();
  return res.status(201).json({
    ...provider,
    createdAt: provider.createdAt.toISOString(),
    averageRating: 0,
    reviewCount: 0,
  });
});

// GET /providers/:id
router.get("/providers/:id", async (req, res) => {
  const parsed = GetProviderParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const provider = await getProviderWithStats(parsed.data.id);
  if (!provider) return res.status(404).json({ error: "Not found" });

  const portfolio = await db.select().from(portfolioTable).where(eq(portfolioTable.providerId, parsed.data.id)).orderBy(desc(portfolioTable.createdAt));
  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.providerId, parsed.data.id)).orderBy(desc(reviewsTable.createdAt));

  return res.json({
    ...provider,
    portfolio: portfolio.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
    reviews: reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
  });
});

// PATCH /providers/:id
router.patch("/providers/:id", async (req, res) => {
  const params = UpdateProviderParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateProviderBody.safeParse(req.body);
  if (!params.success || !body.success) return res.status(400).json({ error: "Invalid input" });

  const [updated] = await db
    .update(providersTable)
    .set(body.data)
    .where(eq(providersTable.id, params.data.id))
    .returning();

  if (!updated) return res.status(404).json({ error: "Not found" });

  const stats = await db
    .select({ avg: avg(reviewsTable.rating), count: count() })
    .from(reviewsTable)
    .where(eq(reviewsTable.providerId, updated.id));

  return res.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    averageRating: Number(stats[0]?.avg ?? 0),
    reviewCount: Number(stats[0]?.count ?? 0),
  });
});

// DELETE /providers/:id
router.delete("/providers/:id", async (req, res) => {
  const parsed = DeleteProviderParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  await db.delete(providersTable).where(eq(providersTable.id, parsed.data.id));
  return res.status(204).send();
});

export default router;
