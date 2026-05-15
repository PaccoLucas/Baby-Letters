import { Router, type IRouter, type Request, type Response } from "express";
import { db, testimonialsTable, insertTestimonialSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "1234";

function checkAuth(req: Request, res: Response): boolean {
  const password = req.headers["x-admin-password"];
  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Senha incorreta" });
    return false;
  }
  return true;
}

// Public: list visible testimonials
router.get("/testimonials", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.visible, true))
      .orderBy(testimonialsTable.createdAt);
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Admin: list all testimonials
router.get("/admin/testimonials", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const rows = await db
      .select()
      .from(testimonialsTable)
      .orderBy(testimonialsTable.createdAt);
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Admin: create testimonial
router.post("/admin/testimonials", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const parsed = insertTestimonialSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dados inválidos" });
      return;
    }
    const [created] = await db
      .insert(testimonialsTable)
      .values(parsed.data)
      .returning();
    res.status(201).json(created);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Admin: update testimonial
router.put("/admin/testimonials/:id", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const id = Number(req.params.id);
    const parsed = insertTestimonialSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dados inválidos" });
      return;
    }
    const [updated] = await db
      .update(testimonialsTable)
      .set(parsed.data)
      .where(eq(testimonialsTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Não encontrado" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Admin: delete testimonial
router.delete("/admin/testimonials/:id", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const id = Number(req.params.id);
    await db.delete(testimonialsTable).where(eq(testimonialsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
