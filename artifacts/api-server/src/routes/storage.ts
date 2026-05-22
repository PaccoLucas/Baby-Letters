import { Router, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import { RequestUploadUrlBody } from "@workspace/api-zod";

const router = Router();
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// A morada oficial do seu servidor no Railway
const BACKEND_URL = "https://workspaceapi-server-production-bce8.up.railway.app";

router.post("/uploads/request-url", async (req: Request, res: Response) => {
  try {
    const parsed = RequestUploadUrlBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Missing or invalid required fields" });
    }

    const { name, size, contentType } = parsed.data;
    const uniqueName = `${Date.now()}-${name.replace(/[^a-zA-Z0-9.]/g, "")}`;

    res.json({
      // Devolvemos o link absoluto para o site não se perder
      uploadURL: `${BACKEND_URL}/api/storage/direct-upload/${uniqueName}`,
      objectPath: `${BACKEND_URL}/api/storage/objects/${uniqueName}`,
      metadata: { name, size, contentType },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

router.put("/direct-upload/:filename", (req: Request, res: Response) => {
  const fileName = req.params.filename;
  const filePath = path.join(UPLOADS_DIR, fileName);

  const writeStream = fs.createWriteStream(filePath);
  req.pipe(writeStream);

  req.on("end", () => {
    res.status(200).json({ success: true });
  });

  req.on("error", () => {
    res.status(500).json({ error: "Failed to save file" });
  });
});

router.get("/objects/*path", (req: Request, res: Response) => {
  const raw = req.params.path;
  const fileName = Array.isArray(raw) ? raw.join("/") : raw;
  const filePath = path.join(UPLOADS_DIR, fileName);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "Object not found" });
  }
});

router.get("/public-objects/*filePath", (req: Request, res: Response) => {
  const raw = req.params.filePath;
  const fileName = Array.isArray(raw) ? raw.join("/") : raw;
  const filePath = path.join(UPLOADS_DIR, fileName);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "Public object not found" });
  }
});

export default router;
