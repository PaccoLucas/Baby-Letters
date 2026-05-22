import { Router, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import { RequestUploadUrlBody } from "@workspace/api-zod";

const router = Router();

// Define a pasta física onde o seu servidor vai guardar as fotos
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Se a pasta ainda não existir, o servidor cria automaticamente ao ligar
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// 1. O site pede um "bilhete" para subir a foto
router.post("/uploads/request-url", async (req: Request, res: Response) => {
  try {
    const parsed = RequestUploadUrlBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Missing or invalid required fields" });
    }

    const { name, size, contentType } = parsed.data;

    // Criamos um nome único com a data atual para não haver ficheiros repetidos
    const uniqueName = `${Date.now()}-${name.replace(/[^a-zA-Z0-9.]/g, "")}`;

    // Em vez de apontar para o Replit, apontamos para a nossa própria rota (criada abaixo)
    const uploadURL = `/api/storage/direct-upload/${uniqueName}`;

    res.json({
      uploadURL,
      objectPath: `/objects/${uniqueName}`, // O endereço que será guardado na base de dados
      metadata: { name, size, contentType },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

// 2. ROTA NOVA: Onde o site efetivamente entrega a foto
router.put("/direct-upload/:filename", (req: Request, res: Response) => {
  const fileName = req.params.filename;
  const filePath = path.join(UPLOADS_DIR, fileName);

  // Captura a foto que veio do navegador e grava diretamente no disco rígido
  const writeStream = fs.createWriteStream(filePath);
  req.pipe(writeStream);

  req.on("end", () => {
    res.status(200).json({ success: true });
  });

  req.on("error", () => {
    res.status(500).json({ error: "Failed to save file" });
  });
});

// 3. O site pede para ver a foto (quando carrega o portfólio para os clientes)
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

// 4. Rota extra de segurança para ficheiros públicos
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
