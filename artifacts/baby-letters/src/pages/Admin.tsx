import { useState, useEffect, useRef, useCallback } from "react";
import {
  Star, Plus, Pencil, Trash, Eye, EyeSlash, X, Check,
  Images, ChatText, ArrowUp, ArrowDown, ThumbsUp, Clock,
  User, UploadSimple, MagnifyingGlassPlus, MagnifyingGlassMinus,
} from "@phosphor-icons/react";
import { useUpload } from "@workspace/object-storage-web";

const API = "/api";
const ADMIN_PASSWORD = "1234";

function authHeaders() {
  return { "Content-Type": "application/json", "x-admin-password": ADMIN_PASSWORD };
}

interface Testimonial {
  id: number; name: string; avatar: string; text: string;
  stars: number; visible: boolean; pending: boolean; createdAt: string;
}
interface PortfolioItem {
  id: number; url: string; alt: string; orderIndex: number; visible: boolean;
}

type Tab = "testimonials" | "portfolio" | "profile";
type TestimonialsView = "approved" | "pending";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function storageUrl(objectPath: string) {
  return `/api/storage${objectPath}`;
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  function attempt() {
    if (pw === ADMIN_PASSWORD) { onLogin(); setErr(false); }
    else setErr(true);
  }
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#171717", border: "1px solid #333", borderRadius: "16px", padding: "40px", width: "100%", maxWidth: "380px", textAlign: "center" }}>
        <h1 className="gothic-font" style={{ color: "#d4af37", fontSize: "2rem", marginBottom: "8px" }}>Baby Letters</h1>
        <p style={{ color: "#a3a3a3", marginBottom: "32px", fontSize: "0.9rem" }}>Painel de Administração</p>
        <input
          type="password" placeholder="Digite a senha..." value={pw}
          onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && attempt()}
          style={{ width: "100%", padding: "12px 16px", background: "#262626", border: `1px solid ${err ? "#ef4444" : "#444"}`, borderRadius: "10px", color: "#fff", fontSize: "1rem", outline: "none", marginBottom: err ? "8px" : "16px", boxSizing: "border-box" }}
        />
        {err && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "16px" }}>Senha incorreta</p>}
        <button onClick={attempt} style={{ width: "100%", padding: "12px", background: "#d4af37", color: "#000", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
          Entrar
        </button>
      </div>
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div style={{ position: "fixed", top: "20px", right: "20px", background: "#d4af37", color: "#000", padding: "12px 20px", borderRadius: "10px", fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
      {msg}
    </div>
  );
}

// ─── ICON BTN ─────────────────────────────────────────────────────────────────
function IconBtn({ onClick, title, danger, success, children }: { onClick: () => void; title: string; danger?: boolean; success?: boolean; children: React.ReactNode }) {
  const [h, setH] = useState(false);
  const color = danger ? "#ef4444" : success ? "#4ade80" : "#d4af37";
  return (
    <button onClick={onClick} title={title} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: h ? `${color}22` : "transparent", border: `1px solid ${h ? color : "#333"}`, color: h ? color : "#a3a3a3", width: "34px", height: "34px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
      {children}
    </button>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "#262626", border: "1px solid #444", borderRadius: "8px", color: "#fff", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" };

// ─── FILE DROP ZONE ───────────────────────────────────────────────────────────
function FileDropZone({ onFile, accept = "image/*", label = "Clique ou arraste uma foto aqui" }: { onFile: (f: File) => void; accept?: string; label?: string }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  function handle(files: FileList | null) {
    const f = files?.[0];
    if (f) onFile(f);
  }
  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
      style={{ border: `2px dashed ${drag ? "#d4af37" : "#444"}`, borderRadius: "12px", padding: "28px 16px", textAlign: "center", cursor: "pointer", background: drag ? "#d4af3708" : "#171717", transition: "all 0.2s" }}
    >
      <UploadSimple size={28} color="#d4af37" style={{ marginBottom: "8px" }} />
      <p style={{ color: "#a3a3a3", fontSize: "0.85rem", margin: 0 }}>{label}</p>
      <p style={{ color: "#555", fontSize: "0.75rem", marginTop: "4px" }}>JPG, PNG ou WEBP</p>
      <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }} onChange={(e) => handle(e.target.files)} />
    </div>
  );
}

// ─── CANVAS CROPPER ───────────────────────────────────────────────────────────
function PhotoCropper({ file, onCropped, onCancel }: { file: File; onCropped: (blob: Blob) => void; onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const SIZE = 300;

  // Load image
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      // Auto-fit: zoom to fill the crop square
      const scale = Math.max(SIZE / img.width, SIZE / img.height);
      setZoom(scale);
      setOffset({ x: 0, y: 0 });
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Draw
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);
    const w = img.width * zoom;
    const h = img.height * zoom;
    const x = (SIZE - w) / 2 + offset.x;
    const y = (SIZE - h) / 2 + offset.y;
    ctx.drawImage(img, x, y, w, h);
    // Overlay
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, SIZE, SIZE);
    // Clear circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 4, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
    // Circle border
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 4, 0, Math.PI * 2);
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [zoom, offset]);

  useEffect(() => { draw(); }, [draw]);

  function onMouseDown(e: React.MouseEvent) {
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging) return;
    setOffset({ x: dragStart.current.ox + e.clientX - dragStart.current.mx, y: dragStart.current.oy + e.clientY - dragStart.current.my });
  }

  // Touch support
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { mx: t.clientX, my: t.clientY, ox: offset.x, oy: offset.y };
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset({ x: dragStart.current.ox + t.clientX - dragStart.current.mx, y: dragStart.current.oy + t.clientY - dragStart.current.my });
  }

  function exportCrop() {
    const img = imgRef.current;
    if (!img) return;
    const out = document.createElement("canvas");
    out.width = 400; out.height = 400;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    // Draw circle
    ctx.beginPath();
    ctx.arc(200, 200, 200, 0, Math.PI * 2);
    ctx.clip();
    const scale = 400 / SIZE;
    const w = img.width * zoom * scale;
    const h = img.height * zoom * scale;
    const x = (400 - w) / 2 + offset.x * scale;
    const y = (400 - h) / 2 + offset.y * scale;
    ctx.drawImage(img, x, y, w, h);
    out.toBlob((blob) => { if (blob) onCropped(blob); }, "image/jpeg", 0.92);
  }

  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ color: "#a3a3a3", fontSize: "0.8rem", marginBottom: "12px" }}>Arraste para reposicionar • Use o zoom para ajustar</p>
      <canvas
        ref={canvasRef} width={SIZE} height={SIZE}
        style={{ borderRadius: "50%", cursor: dragging ? "grabbing" : "grab", touchAction: "none", maxWidth: "100%", display: "block", margin: "0 auto" }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={() => setDragging(false)}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "10px", maxWidth: "300px", margin: "16px auto" }}>
        <MagnifyingGlassMinus size={18} color="#a3a3a3" />
        <input type="range" min={0.3} max={3} step={0.02} value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: "#d4af37" }} />
        <MagnifyingGlassPlus size={18} color="#a3a3a3" />
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button onClick={onCancel} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "10px 20px", background: "transparent", border: "1px solid #444", color: "#a3a3a3", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
          <X size={14} /> Cancelar
        </button>
        <button onClick={exportCrop} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "10px 20px", background: "#d4af37", border: "none", color: "#000", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>
          <Check size={14} weight="bold" /> Salvar foto
        </button>
      </div>
    </div>
  );
}

// ─── PROFILE TAB ──────────────────────────────────────────────────────────────
function ProfileTab({ toast }: { toast: (m: string) => void }) {
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const { uploadFile, isUploading } = useUpload();

  useEffect(() => {
    fetch(`${API}/settings/profile_photo`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.value) setCurrentPhoto(d.value); })
      .catch(() => {});
  }, []);

  async function handleCropped(blob: Blob) {
    setSaving(true);
    try {
      const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
      const result = await uploadFile(file);
      if (!result) throw new Error("Upload falhou");
      const photoUrl = storageUrl(result.objectPath);
      await fetch(`${API}/admin/settings/profile_photo`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ value: photoUrl }),
      });
      setCurrentPhoto(photoUrl);
      setSelectedFile(null);
      toast("Foto de perfil atualizada!");
    } catch {
      toast("Erro ao salvar foto");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.1rem", color: "#f5f5f5", marginBottom: "24px" }}>Foto de Perfil</h2>

      {selectedFile ? (
        <div style={{ background: "#171717", border: "1px solid #d4af3766", borderRadius: "14px", padding: "24px" }}>
          <h3 style={{ color: "#d4af37", fontSize: "0.95rem", marginBottom: "16px", textAlign: "center" }}>Ajustar foto</h3>
          {saving || isUploading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#a3a3a3" }}>Salvando...</div>
          ) : (
            <PhotoCropper file={selectedFile} onCropped={handleCropped} onCancel={() => setSelectedFile(null)} />
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "600px" }}>
          <div style={{ background: "#171717", border: "1px solid #2a2a2a", borderRadius: "14px", padding: "20px", textAlign: "center" }}>
            <p style={{ color: "#a3a3a3", fontSize: "0.8rem", marginBottom: "12px" }}>Foto atual</p>
            <div style={{ width: "120px", height: "120px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 12px", background: "#262626", border: "3px solid #d4af37" }}>
              <img
                src={currentPhoto || "/brhenda-profile.jpg"}
                alt="Foto de perfil"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/brhenda-profile.jpg"; }}
              />
            </div>
            <p style={{ color: "#555", fontSize: "0.75rem" }}>{currentPhoto ? "Foto personalizada" : "Foto padrão"}</p>
          </div>
          <div style={{ background: "#171717", border: "1px solid #2a2a2a", borderRadius: "14px", padding: "20px" }}>
            <p style={{ color: "#a3a3a3", fontSize: "0.8rem", marginBottom: "12px" }}>Nova foto</p>
            <FileDropZone label="Clique ou arraste uma foto" onFile={setSelectedFile} />
            <p style={{ color: "#555", fontSize: "0.72rem", textAlign: "center", marginTop: "10px" }}>Você poderá recortar e ajustar antes de salvar</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PORTFOLIO TAB ────────────────────────────────────────────────────────────
function PortfolioTab({ toast }: { toast: (m: string) => void }) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = { url: "", alt: "Trabalho Baby Letters", orderIndex: 0, visible: true };
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const previewTimer = useRef<ReturnType<typeof setTimeout>>();
  const { uploadFile, isUploading } = useUpload();

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/portfolio`, { headers: authHeaders() });
      setItems(await r.json());
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function handleFileUpload(file: File) {
    const result = await uploadFile(file);
    if (!result) { toast("Erro ao fazer upload"); return; }
    const url = storageUrl(result.objectPath);
    setForm({ ...form, url });
    setPreview(url);
  }

  function handleUrlChange(val: string) {
    setForm({ ...form, url: val });
    clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => setPreview(val), 800);
  }

  async function save() {
    if (!form.url) { toast("Adicione uma foto primeiro"); return; }
    setSaving(true);
    try {
      const payload = { ...form, orderIndex: editingId ? form.orderIndex : items.length };
      const url = editingId ? `${API}/admin/portfolio/${editingId}` : `${API}/admin/portfolio`;
      const r = await fetch(url, { method: editingId ? "PUT" : "POST", headers: authHeaders(), body: JSON.stringify(payload) });
      if (!r.ok) throw new Error();
      toast(editingId ? "Atualizado!" : "Foto adicionada!");
      setShowForm(false); setForm(emptyForm); setEditingId(null); setPreview(""); load();
    } catch { toast("Erro ao salvar"); }
    finally { setSaving(false); }
  }

  async function toggle(item: PortfolioItem) {
    await fetch(`${API}/admin/portfolio/${item.id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify({ ...item, visible: !item.visible }) });
    load();
  }

  async function remove(id: number) {
    if (!confirm("Excluir esta foto?")) return;
    await fetch(`${API}/admin/portfolio/${id}`, { method: "DELETE", headers: authHeaders() });
    toast("Foto removida!"); load();
  }

  async function move(item: PortfolioItem, dir: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.orderIndex - b.orderIndex);
    const idx = sorted.findIndex((i) => i.id === item.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await Promise.all([
      fetch(`${API}/admin/portfolio/${item.id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify({ ...item, orderIndex: other.orderIndex }) }),
      fetch(`${API}/admin/portfolio/${other.id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify({ ...other, orderIndex: item.orderIndex }) }),
    ]);
    load();
  }

  function startEdit(item: PortfolioItem) {
    setForm({ url: item.url, alt: item.alt, orderIndex: item.orderIndex, visible: item.visible });
    setPreview(item.url); setEditingId(item.id); setShowForm(true); setUploadMode("url");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.1rem", color: "#f5f5f5" }}>Portfólio <span style={{ color: "#a3a3a3", fontSize: "0.85rem" }}>({items.length} fotos)</span></h2>
        <button onClick={() => { setForm(emptyForm); setEditingId(null); setPreview(""); setUploadMode("file"); setShowForm(true); }}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "#d4af37", color: "#000", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
          <Plus size={16} weight="bold" /> Adicionar Foto
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#1e1e1e", border: "1px solid #d4af3766", borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
          <h3 style={{ color: "#d4af37", fontSize: "0.95rem", marginBottom: "16px" }}>{editingId ? "Editar Foto" : "Nova Foto"}</h3>

          {/* Mode toggle */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "14px", background: "#111", padding: "3px", borderRadius: "8px", width: "fit-content" }}>
            {(["file", "url"] as const).map((m) => (
              <button key={m} onClick={() => setUploadMode(m)}
                style={{ padding: "5px 14px", borderRadius: "6px", border: "none", background: uploadMode === m ? "#d4af37" : "transparent", color: uploadMode === m ? "#000" : "#a3a3a3", fontWeight: uploadMode === m ? 700 : 400, cursor: "pointer", fontSize: "0.8rem" }}>
                {m === "file" ? "📱 Do celular/PC" : "🔗 Por link"}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: preview ? "1fr auto" : "1fr", gap: "16px", alignItems: "start" }}>
            <div>
              {uploadMode === "file" ? (
                isUploading ? (
                  <div style={{ background: "#171717", borderRadius: "12px", padding: "28px", textAlign: "center", color: "#d4af37" }}>Enviando foto...</div>
                ) : form.url ? (
                  <div style={{ background: "#171717", borderRadius: "10px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #333" }}>
                    <span style={{ color: "#4ade80", fontSize: "0.85rem" }}>✓ Foto carregada</span>
                    <button onClick={() => { setForm({ ...form, url: "" }); setPreview(""); }} style={{ background: "none", border: "none", color: "#a3a3a3", cursor: "pointer", fontSize: "0.8rem" }}>Trocar</button>
                  </div>
                ) : (
                  <FileDropZone label="Clique ou arraste a foto do portfólio" onFile={handleFileUpload} />
                )
              ) : (
                <>
                  <label style={{ fontSize: "0.75rem", color: "#a3a3a3", display: "block", marginBottom: "4px" }}>URL da Imagem</label>
                  <input value={form.url} onChange={(e) => handleUrlChange(e.target.value)} placeholder="https://..." style={{ ...inputStyle, marginBottom: "10px" }} />
                </>
              )}
              <label style={{ fontSize: "0.75rem", color: "#a3a3a3", display: "block", marginBottom: "4px", marginTop: "10px" }}>Descrição</label>
              <input value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} placeholder="Ex: Lettering no braço" style={{ ...inputStyle, marginBottom: "10px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <label style={{ fontSize: "0.75rem", color: "#a3a3a3" }}>Visível no site:</label>
                <button onClick={() => setForm({ ...form, visible: !form.visible })}
                  style={{ background: form.visible ? "#16a34a22" : "#333", border: `1px solid ${form.visible ? "#16a34a" : "#555"}`, color: form.visible ? "#4ade80" : "#a3a3a3", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                  {form.visible ? "Sim" : "Não"}
                </button>
              </div>
            </div>
            {preview && (
              <div style={{ width: "110px", height: "110px", borderRadius: "10px", overflow: "hidden", border: "1px solid #d4af3766", flexShrink: 0 }}>
                <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setPreview("")} />
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "16px" }}>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); setEditingId(null); setPreview(""); }}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", background: "transparent", border: "1px solid #444", color: "#a3a3a3", borderRadius: "7px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
              <X size={14} /> Cancelar
            </button>
            <button onClick={save} disabled={saving || !form.url || isUploading}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 16px", background: saving || !form.url || isUploading ? "#555" : "#d4af37", border: "none", color: "#000", borderRadius: "7px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
              <Check size={14} weight="bold" /> {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: "#a3a3a3", textAlign: "center", padding: "40px" }}>Carregando...</p>
        : items.length === 0 ? (
          <div style={{ background: "#171717", border: "1px dashed #333", borderRadius: "14px", padding: "50px 20px", textAlign: "center", color: "#a3a3a3" }}>
            <p>Nenhuma foto no portfólio ainda.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "12px" }}>
            {[...items].sort((a, b) => a.orderIndex - b.orderIndex).map((item) => (
              <div key={item.id} style={{ background: "#171717", border: "1px solid #2a2a2a", borderRadius: "12px", overflow: "hidden", opacity: item.visible ? 1 : 0.55 }}>
                <div style={{ aspectRatio: "1/1", position: "relative", overflow: "hidden" }}>
                  <img src={item.url} alt={item.alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.2"; }} />
                  {!item.visible && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ background: "#333", color: "#a3a3a3", fontSize: "0.7rem", padding: "3px 8px", borderRadius: "5px" }}>oculta</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: "10px" }}>
                  <p style={{ fontSize: "0.72rem", color: "#a3a3a3", marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.alt}</p>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    <IconBtn onClick={() => move(item, -1)} title="Mover para cima"><ArrowUp size={13} /></IconBtn>
                    <IconBtn onClick={() => move(item, 1)} title="Mover para baixo"><ArrowDown size={13} /></IconBtn>
                    <IconBtn onClick={() => toggle(item)} title={item.visible ? "Ocultar" : "Mostrar"}>{item.visible ? <Eye size={13} /> : <EyeSlash size={13} />}</IconBtn>
                    <IconBtn onClick={() => startEdit(item)} title="Editar"><Pencil size={13} /></IconBtn>
                    <IconBtn onClick={() => remove(item.id)} title="Excluir" danger><Trash size={13} /></IconBtn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ─── TESTIMONIALS TAB ─────────────────────────────────────────────────────────
function TestimonialsTab({ toast }: { toast: (m: string) => void }) {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<TestimonialsView>("approved");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = { name: "", avatar: "", text: "", stars: 5, visible: true, pending: false };
  const [form, setForm] = useState(emptyForm);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/testimonials`, { headers: authHeaders() });
      setItems(await r.json());
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const approved = items.filter((t) => !t.pending);
  const pending = items.filter((t) => t.pending);
  const displayed = view === "approved" ? approved : pending;

  async function save() {
    setSaving(true);
    try {
      const url = editingId ? `${API}/admin/testimonials/${editingId}` : `${API}/admin/testimonials`;
      const r = await fetch(url, { method: editingId ? "PUT" : "POST", headers: authHeaders(), body: JSON.stringify(form) });
      if (!r.ok) throw new Error();
      toast(editingId ? "Atualizado!" : "Criado!");
      setShowForm(false); setForm(emptyForm); setEditingId(null); load();
    } catch { toast("Erro ao salvar"); }
    finally { setSaving(false); }
  }

  async function toggle(t: Testimonial) {
    await fetch(`${API}/admin/testimonials/${t.id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify({ ...t, visible: !t.visible }) });
    load();
  }

  async function approve(t: Testimonial) {
    await fetch(`${API}/admin/testimonials/${t.id}/approve`, { method: "POST", headers: authHeaders() });
    toast("Depoimento aprovado!"); load();
  }

  async function remove(id: number) {
    if (!confirm("Excluir?")) return;
    await fetch(`${API}/admin/testimonials/${id}`, { method: "DELETE", headers: authHeaders() });
    toast("Excluído!"); load();
  }

  function startEdit(t: Testimonial) {
    setForm({ name: t.name, avatar: t.avatar, text: t.text, stars: t.stars, visible: t.visible, pending: t.pending });
    setEditingId(t.id); setShowForm(true); setView("approved");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "1.1rem", color: "#f5f5f5" }}>Depoimentos</h2>
        <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); setView("approved"); }}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "#d4af37", color: "#000", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
          <Plus size={16} weight="bold" /> Novo
        </button>
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
        {([["approved", <Check size={13} weight="bold" />, "Publicados", approved.length, "#d4af37"], ["pending", <Clock size={13} />, "Aguardando", pending.length, "#f59e0b"]] as [TestimonialsView, React.ReactNode, string, number, string][]).map(([key, icon, label, count, color]) => (
          <button key={key} onClick={() => setView(key)}
            style={{ position: "relative", display: "flex", alignItems: "center", gap: "6px", padding: "7px 16px", borderRadius: "8px", border: `1px solid ${view === key ? color : "#333"}`, background: view === key ? `${color}15` : "transparent", color: view === key ? color : "#a3a3a3", cursor: "pointer", fontSize: "0.82rem", fontWeight: view === key ? 700 : 400 }}>
            {icon} {label} ({count})
            {key === "pending" && count > 0 && <span style={{ position: "absolute", top: "-6px", right: "-6px", background: "#ef4444", color: "#fff", width: "16px", height: "16px", borderRadius: "50%", fontSize: "0.65rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{count}</span>}
          </button>
        ))}
      </div>

      {showForm && (
        <div style={{ background: "#1e1e1e", border: "1px solid #d4af3766", borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
          <h3 style={{ color: "#d4af37", fontSize: "0.95rem", marginBottom: "16px" }}>{editingId ? "Editar" : "Novo Depoimento"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "#a3a3a3", display: "block", marginBottom: "4px" }}>Nome</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Rafaela M." style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "#a3a3a3", display: "block", marginBottom: "4px" }}>Iniciais</label>
              <input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value.slice(0, 3).toUpperCase() })} placeholder="Ex: RM" maxLength={3} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ fontSize: "0.75rem", color: "#a3a3a3", display: "block", marginBottom: "4px" }}>Depoimento</label>
            <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: "20px", marginBottom: "16px", alignItems: "center" }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "#a3a3a3", display: "block", marginBottom: "4px" }}>Estrelas</label>
              <div style={{ display: "flex", gap: "3px" }}>
                {[1,2,3,4,5].map((n) => (
                  <button key={n} onClick={() => setForm({ ...form, stars: n })} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                    <Star size={20} weight={n <= form.stars ? "fill" : "regular"} color="#d4af37" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "#a3a3a3", display: "block", marginBottom: "4px" }}>Visível</label>
              <button onClick={() => setForm({ ...form, visible: !form.visible })}
                style={{ background: form.visible ? "#16a34a22" : "#333", border: `1px solid ${form.visible ? "#16a34a" : "#555"}`, color: form.visible ? "#4ade80" : "#a3a3a3", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                {form.visible ? "Sim" : "Não"}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); setEditingId(null); }}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", background: "transparent", border: "1px solid #444", color: "#a3a3a3", borderRadius: "7px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
              <X size={14} /> Cancelar
            </button>
            <button onClick={save} disabled={saving || !form.name || !form.text}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 16px", background: saving || !form.name || !form.text ? "#555" : "#d4af37", border: "none", color: "#000", borderRadius: "7px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
              <Check size={14} weight="bold" /> {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: "#a3a3a3", textAlign: "center", padding: "40px" }}>Carregando...</p>
        : displayed.length === 0 ? (
          <div style={{ background: "#171717", border: "1px dashed #333", borderRadius: "14px", padding: "50px 20px", textAlign: "center", color: "#a3a3a3" }}>
            {view === "pending" ? <p>Nenhum depoimento aguardando aprovação.</p> : <p>Nenhum depoimento publicado.</p>}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {displayed.map((t) => (
              <div key={t.id} style={{ background: "#171717", border: `1px solid ${t.pending ? "#f59e0b33" : t.visible ? "#2a2a2a" : "#333"}`, borderRadius: "12px", padding: "16px 18px", opacity: !t.pending && !t.visible ? 0.6 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#d4af37,#a07d1c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, color: "#000", flexShrink: 0 }}>{t.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{t.name}</div>
                        <div style={{ display: "flex", gap: "2px" }}>{Array.from({ length: t.stars }).map((_, i) => <Star key={i} size={11} weight="fill" color="#d4af37" />)}</div>
                      </div>
                      {t.pending && <span style={{ fontSize: "0.65rem", background: "#f59e0b22", color: "#f59e0b", border: "1px solid #f59e0b44", padding: "2px 8px", borderRadius: "5px" }}>aguardando</span>}
                      {!t.pending && !t.visible && <span style={{ fontSize: "0.65rem", background: "#333", color: "#a3a3a3", padding: "2px 7px", borderRadius: "5px" }}>oculto</span>}
                    </div>
                    <p style={{ color: "#d4d4d4", fontSize: "0.85rem", lineHeight: 1.5 }}>"{t.text}"</p>
                  </div>
                  <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
                    {t.pending && <IconBtn onClick={() => approve(t)} title="Aprovar" success><ThumbsUp size={15} /></IconBtn>}
                    {!t.pending && <IconBtn onClick={() => toggle(t)} title={t.visible ? "Ocultar" : "Mostrar"}>{t.visible ? <Eye size={15} /> : <EyeSlash size={15} />}</IconBtn>}
                    {!t.pending && <IconBtn onClick={() => startEdit(t)} title="Editar"><Pencil size={15} /></IconBtn>}
                    <IconBtn onClick={() => remove(t.id)} title="Excluir" danger><Trash size={15} /></IconBtn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("testimonials");
  const [toastMsg, setToastMsg] = useState("");

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  }

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const tabs: [Tab, React.ReactNode, string][] = [
    ["testimonials", <ChatText size={16} />, "Depoimentos"],
    ["portfolio", <Images size={16} />, "Portfólio"],
    ["profile", <User size={16} />, "Perfil"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f5f5f5", padding: "24px" }}>
      <Toast msg={toastMsg} />
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h1 className="gothic-font" style={{ color: "#d4af37", fontSize: "1.8rem" }}>Baby Letters</h1>
            <p style={{ color: "#a3a3a3", fontSize: "0.8rem" }}>Painel de Administração</p>
          </div>
          <a href="/" style={{ color: "#a3a3a3", fontSize: "0.8rem", textDecoration: "none" }}>← Ver site</a>
        </div>

        <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "#111", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
          {tabs.map(([key, icon, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "7px", border: "none", background: tab === key ? "#d4af37" : "transparent", color: tab === key ? "#000" : "#a3a3a3", fontWeight: tab === key ? 700 : 400, cursor: "pointer", fontSize: "0.85rem", transition: "all 0.2s" }}>
              {icon} {label}
            </button>
          ))}
        </div>

        {tab === "testimonials" && <TestimonialsTab toast={showToast} />}
        {tab === "portfolio" && <PortfolioTab toast={showToast} />}
        {tab === "profile" && <ProfileTab toast={showToast} />}
      </div>
    </div>
  );
}
