import { Router, type IRouter, type Request, type Response } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "1234";

function checkAuth(req: Request, res: Response): boolean {
  if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Senha incorreta" });
    return false;
  }
  return true;
}

// Public: get a setting by key
router.get("/settings/:key", async (req, res) => {
  try {
    const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, req.params.key));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ key: row.key, value: row.value });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Admin: upsert a setting
router.put("/admin/settings/:key", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const { value } = req.body as { value: unknown };
    if (typeof value !== "string") { res.status(400).json({ error: "Valor inválido" }); return; }
    const [row] = await db
      .insert(settingsTable)
      .values({ key: req.params.key, value })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value, updatedAt: new Date() } })
      .returning();
    res.json(row);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
