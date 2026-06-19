import { Router } from "express";
import { db, portfolioTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListPortfolioParams,
  AddPortfolioItemParams,
  AddPortfolioItemBody,
  DeletePortfolioItemParams,
} from "@workspace/api-zod";

const router = Router();

// GET /providers/:id/portfolio
router.get("/providers/:id/portfolio", async (req, res) => {
  const parsed = ListPortfolioParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const items = await db
    .select()
    .from(portfolioTable)
    .where(eq(portfolioTable.providerId, parsed.data.id))
    .orderBy(desc(portfolioTable.createdAt));

  return res.json(items.map((i) => ({ ...i, createdAt: i.createdAt.toISOString() })));
});

// POST /providers/:id/portfolio
router.post("/providers/:id/portfolio", async (req, res) => {
  const params = AddPortfolioItemParams.safeParse({ id: Number(req.params.id) });
  const body = AddPortfolioItemBody.safeParse(req.body);
  if (!params.success || !body.success) return res.status(400).json({ error: "Invalid input" });

  const [item] = await db
    .insert(portfolioTable)
    .values({ providerId: params.data.id, ...body.data })
    .returning();

  return res.status(201).json({ ...item, createdAt: item.createdAt.toISOString() });
});

// DELETE /providers/:id/portfolio/:itemId
router.delete("/providers/:id/portfolio/:itemId", async (req, res) => {
  const parsed = DeletePortfolioItemParams.safeParse({
    id: Number(req.params.id),
    itemId: Number(req.params.itemId),
  });
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  await db.delete(portfolioTable).where(eq(portfolioTable.id, parsed.data.itemId));
  return res.status(204).send();
});

export default router;
