import { Router, type IRouter, type Request, type Response } from "express";
import { db, portfolioTable, insertPortfolioSchema } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "1234";

function checkAuth(req: Request, res: Response): boolean {
  if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Senha incorreta" });
    return false;
  }
  return true;
}

// Public: visible items ordered by orderIndex
router.get("/portfolio", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(portfolioTable)
      .where(eq(portfolioTable.visible, true))
      .orderBy(asc(portfolioTable.orderIndex));
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Admin: all items
router.get("/admin/portfolio", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const rows = await db
      .select()
      .from(portfolioTable)
      .orderBy(asc(portfolioTable.orderIndex));
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Admin: create
router.post("/admin/portfolio", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const parsed = insertPortfolioSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dados inválidos" });
      return;
    }
    const [created] = await db.insert(portfolioTable).values(parsed.data).returning();
    res.status(201).json(created);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Admin: update
router.put("/admin/portfolio/:id", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const id = Number(req.params.id);
    const parsed = insertPortfolioSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dados inválidos" });
      return;
    }
    const [updated] = await db
      .update(portfolioTable)
      .set(parsed.data)
      .where(eq(portfolioTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Não encontrado" }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Admin: delete
router.delete("/admin/portfolio/:id", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    await db.delete(portfolioTable).where(eq(portfolioTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
