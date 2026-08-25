import { Router } from "express";
import { db } from "../config/database.js";
import { users } from "../db/schema.js";
import { desc, limit } from "drizzle-orm";

const router = Router();

router.get("/leaderboard", async (_req, res) => {
  try {
    const top = await db
      .select()
      .from(users)
      .orderBy(desc(users.elo))
      .limit(50);
    res.json(top);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
