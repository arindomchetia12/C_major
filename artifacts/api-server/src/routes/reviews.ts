import { Router } from "express";
import { db, reviewsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListReviewsParams,
  CreateReviewParams,
  CreateReviewBody,
} from "@workspace/api-zod";

const router = Router();

// GET /providers/:id/reviews
router.get("/providers/:id/reviews", async (req, res) => {
  const parsed = ListReviewsParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.providerId, parsed.data.id))
    .orderBy(desc(reviewsTable.createdAt));

  return res.json(reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

// POST /providers/:id/reviews
router.post("/providers/:id/reviews", async (req, res) => {
  const params = CreateReviewParams.safeParse({ id: Number(req.params.id) });
  const body = CreateReviewBody.safeParse(req.body);
  if (!params.success || !body.success) return res.status(400).json({ error: "Invalid input" });

  const [review] = await db
    .insert(reviewsTable)
    .values({ providerId: params.data.id, ...body.data })
    .returning();

  return res.status(201).json({ ...review, createdAt: review.createdAt.toISOString() });
});

export default router;
