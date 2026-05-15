import { Router, type IRouter, type Request, type Response } from "express";
import { db, testimonialsTable, insertTestimonialSchema } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "1234";

function checkAuth(req: Request, res: Response): boolean {
  if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Senha incorreta" });
    return false;
  }
  return true;
}

// Public: list visible + approved testimonials
router.get("/testimonials", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(testimonialsTable)
      .where(and(eq(testimonialsTable.visible, true), eq(testimonialsTable.pending, false)))
      .orderBy(testimonialsTable.createdAt);
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Public: client submits a testimonial (goes to pending)
router.post("/testimonials/submit", async (req, res) => {
  try {
    const { name, text, stars } = req.body as { name: unknown; text: unknown; stars: unknown };
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
      res.status(400).json({ error: "Nome inválido" });
      return;
    }
    if (typeof text !== "string" || text.trim().length < 10 || text.trim().length > 1000) {
      res.status(400).json({ error: "Texto inválido" });
      return;
    }
    const starsNum = typeof stars === "number" ? Math.round(stars) : 5;
    const safeStars = Math.min(5, Math.max(1, starsNum));
    const initials = (name as string).trim().split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
    const [created] = await db
      .insert(testimonialsTable)
      .values({ name: name.trim(), text: text.trim(), stars: safeStars, avatar: initials, visible: false, pending: true })
      .returning();
    res.status(201).json({ success: true, id: created.id });
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
    const [created] = await db.insert(testimonialsTable).values(parsed.data).returning();
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
    if (!updated) { res.status(404).json({ error: "Não encontrado" }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Admin: approve a pending testimonial
router.post("/admin/testimonials/:id/approve", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const id = Number(req.params.id);
    const [updated] = await db
      .update(testimonialsTable)
      .set({ pending: false, visible: true })
      .where(eq(testimonialsTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Não encontrado" }); return; }
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
    await db.delete(testimonialsTable).where(eq(testimonialsTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
