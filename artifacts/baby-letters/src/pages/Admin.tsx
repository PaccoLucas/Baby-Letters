import { useState, useEffect, useRef } from "react";
import {
  Star, Plus, Pencil, Trash, Eye, EyeSlash, X, Check,
  Images, ChatText, ArrowUp, ArrowDown,
} from "@phosphor-icons/react";

const API = "/api";
const ADMIN_PASSWORD = "1234";

function headers() {
  return { "Content-Type": "application/json", "x-admin-password": ADMIN_PASSWORD };
}

interface Testimonial {
  id: number; name: string; avatar: string; text: string;
  stars: number; visible: boolean; createdAt: string;
}
interface PortfolioItem {
  id: number; url: string; alt: string;
  orderIndex: number; visible: boolean;
}

type Tab = "testimonials" | "portfolio";

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
          style={{ width: "100%", padding: "12px 16px", background: "#262626", border: `1px solid ${err ? "#ef4444" : "#444"}`, borderRadius: "10px", color: "#fff", fontSize: "1rem", outline: "none", marginBottom: err ? "8px" : "16px" }}
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
function IconBtn({ onClick, title, danger, children }: { onClick: () => void; title: string; danger?: boolean; children: React.ReactNode }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} title={title} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: h ? (danger ? "#ef444422" : "#d4af3722") : "transparent", border: `1px solid ${h ? (danger ? "#ef4444" : "#d4af37") : "#333"}`, color: h ? (danger ? "#ef4444" : "#d4af37") : "#a3a3a3", width: "34px", height: "34px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
      {children}
    </button>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "#262626", border: "1px solid #444", borderRadius: "8px", color: "#fff", fontSize: "0.9rem", outline: "none" };

// ─── TESTIMONIALS TAB ─────────────────────────────────────────────────────────
function TestimonialsTab({ toast }: { toast: (m: string) => void }) {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = { name: "", avatar: "", text: "", stars: 5, visible: true };
  const [form, setForm] = useState(emptyForm);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/testimonials`, { headers: headers() });
      setItems(await r.json());
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    try {
      const url = editingId ? `${API}/admin/testimonials/${editingId}` : `${API}/admin/testimonials`;
      const r = await fetch(url, { method: editingId ? "PUT" : "POST", headers: headers(), body: JSON.stringify(form) });
      if (!r.ok) throw new Error();
      toast(editingId ? "Atualizado!" : "Criado!");
      setShowForm(false); setForm(emptyForm); setEditingId(null); load();
    } catch { toast("Erro ao salvar"); }
    finally { setSaving(false); }
  }

  async function toggle(t: Testimonial) {
    await fetch(`${API}/admin/testimonials/${t.id}`, { method: "PUT", headers: headers(), body: JSON.stringify({ ...t, visible: !t.visible }) });
    load();
  }

  async function remove(id: number) {
    if (!confirm("Excluir?")) return;
    await fetch(`${API}/admin/testimonials/${id}`, { method: "DELETE", headers: headers() });
    toast("Excluído!"); load();
  }

  function startEdit(t: Testimonial) {
    setForm({ name: t.name, avatar: t.avatar, text: t.text, stars: t.stars, visible: t.visible });
    setEditingId(t.id); setShowForm(true);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.1rem", color: "#f5f5f5" }}>Depoimentos <span style={{ color: "#a3a3a3", fontSize: "0.85rem" }}>({items.length})</span></h2>
        <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "#d4af37", color: "#000", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
          <Plus size={16} weight="bold" /> Novo
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#1e1e1e", border: "1px solid #d4af3766", borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
          <h3 style={{ color: "#d4af37", fontSize: "0.95rem", marginBottom: "16px" }}>{editingId ? "Editar Depoimento" : "Novo Depoimento"}</h3>
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
        : items.length === 0 ? (
          <div style={{ background: "#171717", border: "1px dashed #333", borderRadius: "14px", padding: "50px 20px", textAlign: "center", color: "#a3a3a3" }}>
            <p style={{ marginBottom: "12px" }}>Nenhum depoimento ainda.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {items.map((t) => (
              <div key={t.id} style={{ background: "#171717", border: `1px solid ${t.visible ? "#2a2a2a" : "#333"}`, borderRadius: "12px", padding: "16px 18px", opacity: t.visible ? 1 : 0.6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#d4af37,#a07d1c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, color: "#000", flexShrink: 0 }}>{t.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{t.name}</div>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {Array.from({ length: t.stars }).map((_, i) => <Star key={i} size={11} weight="fill" color="#d4af37" />)}
                        </div>
                      </div>
                      {!t.visible && <span style={{ fontSize: "0.65rem", background: "#333", color: "#a3a3a3", padding: "2px 7px", borderRadius: "5px" }}>oculto</span>}
                    </div>
                    <p style={{ color: "#d4d4d4", fontSize: "0.85rem", lineHeight: 1.5 }}>"{t.text}"</p>
                  </div>
                  <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
                    <IconBtn onClick={() => toggle(t)} title={t.visible ? "Ocultar" : "Mostrar"}>{t.visible ? <Eye size={15} /> : <EyeSlash size={15} />}</IconBtn>
                    <IconBtn onClick={() => startEdit(t)} title="Editar"><Pencil size={15} /></IconBtn>
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
  const previewTimer = useRef<ReturnType<typeof setTimeout>>();

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/portfolio`, { headers: headers() });
      setItems(await r.json());
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function handleUrlChange(val: string) {
    setForm({ ...form, url: val });
    clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => setPreview(val), 800);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = { ...form, orderIndex: editingId ? form.orderIndex : items.length };
      const url = editingId ? `${API}/admin/portfolio/${editingId}` : `${API}/admin/portfolio`;
      const r = await fetch(url, { method: editingId ? "PUT" : "POST", headers: headers(), body: JSON.stringify(payload) });
      if (!r.ok) throw new Error();
      toast(editingId ? "Atualizado!" : "Foto adicionada!");
      setShowForm(false); setForm(emptyForm); setEditingId(null); setPreview(""); load();
    } catch { toast("Erro ao salvar"); }
    finally { setSaving(false); }
  }

  async function toggle(item: PortfolioItem) {
    await fetch(`${API}/admin/portfolio/${item.id}`, { method: "PUT", headers: headers(), body: JSON.stringify({ ...item, visible: !item.visible }) });
    load();
  }

  async function remove(id: number) {
    if (!confirm("Excluir esta foto?")) return;
    await fetch(`${API}/admin/portfolio/${id}`, { method: "DELETE", headers: headers() });
    toast("Foto removida!"); load();
  }

  async function move(item: PortfolioItem, dir: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.orderIndex - b.orderIndex);
    const idx = sorted.findIndex((i) => i.id === item.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await Promise.all([
      fetch(`${API}/admin/portfolio/${item.id}`, { method: "PUT", headers: headers(), body: JSON.stringify({ ...item, orderIndex: other.orderIndex }) }),
      fetch(`${API}/admin/portfolio/${other.id}`, { method: "PUT", headers: headers(), body: JSON.stringify({ ...other, orderIndex: item.orderIndex }) }),
    ]);
    load();
  }

  function startEdit(item: PortfolioItem) {
    setForm({ url: item.url, alt: item.alt, orderIndex: item.orderIndex, visible: item.visible });
    setPreview(item.url); setEditingId(item.id); setShowForm(true);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.1rem", color: "#f5f5f5" }}>Portfólio <span style={{ color: "#a3a3a3", fontSize: "0.85rem" }}>({items.length} fotos)</span></h2>
        <button onClick={() => { setForm(emptyForm); setEditingId(null); setPreview(""); setShowForm(true); }}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "#d4af37", color: "#000", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
          <Plus size={16} weight="bold" /> Adicionar Foto
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#1e1e1e", border: "1px solid #d4af3766", borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
          <h3 style={{ color: "#d4af37", fontSize: "0.95rem", marginBottom: "16px" }}>{editingId ? "Editar Foto" : "Nova Foto"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: preview ? "1fr auto" : "1fr", gap: "16px", alignItems: "start" }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "#a3a3a3", display: "block", marginBottom: "4px" }}>URL da Imagem</label>
              <input value={form.url} onChange={(e) => handleUrlChange(e.target.value)} placeholder="https://..." style={{ ...inputStyle, marginBottom: "10px" }} />
              <label style={{ fontSize: "0.75rem", color: "#a3a3a3", display: "block", marginBottom: "4px" }}>Descrição (alt)</label>
              <input value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} placeholder="Ex: Lettering no braço" style={{ ...inputStyle, marginBottom: "10px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <label style={{ fontSize: "0.75rem", color: "#a3a3a3" }}>Visível:</label>
                <button onClick={() => setForm({ ...form, visible: !form.visible })}
                  style={{ background: form.visible ? "#16a34a22" : "#333", border: `1px solid ${form.visible ? "#16a34a" : "#555"}`, color: form.visible ? "#4ade80" : "#a3a3a3", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                  {form.visible ? "Sim" : "Não"}
                </button>
              </div>
            </div>
            {preview && (
              <div style={{ width: "120px", height: "120px", borderRadius: "10px", overflow: "hidden", border: "1px solid #333", flexShrink: 0 }}>
                <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setPreview("")} />
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "16px" }}>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); setEditingId(null); setPreview(""); }}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", background: "transparent", border: "1px solid #444", color: "#a3a3a3", borderRadius: "7px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
              <X size={14} /> Cancelar
            </button>
            <button onClick={save} disabled={saving || !form.url}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 16px", background: saving || !form.url ? "#555" : "#d4af37", border: "none", color: "#000", borderRadius: "7px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
            {[...items].sort((a, b) => a.orderIndex - b.orderIndex).map((item) => (
              <div key={item.id} style={{ background: "#171717", border: "1px solid #2a2a2a", borderRadius: "12px", overflow: "hidden", opacity: item.visible ? 1 : 0.55 }}>
                <div style={{ aspectRatio: "1/1", position: "relative", overflow: "hidden" }}>
                  <img src={item.url} alt={item.alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/200x200/171717/555?text=Erro"; }} />
                  {!item.visible && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ background: "#333", color: "#a3a3a3", fontSize: "0.7rem", padding: "3px 8px", borderRadius: "5px" }}>oculta</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: "10px" }}>
                  <p style={{ fontSize: "0.75rem", color: "#a3a3a3", marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.alt}</p>
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

// ─── MAIN ADMIN ───────────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("testimonials");
  const [toastMsg, setToastMsg] = useState("");

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  }

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f5f5f5", padding: "24px" }}>
      <Toast msg={toastMsg} />
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h1 className="gothic-font" style={{ color: "#d4af37", fontSize: "1.8rem" }}>Baby Letters</h1>
            <p style={{ color: "#a3a3a3", fontSize: "0.8rem" }}>Painel de Administração</p>
          </div>
          <a href="/" style={{ color: "#a3a3a3", fontSize: "0.8rem", textDecoration: "none" }}>← Ver site</a>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "#111", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
          {([
            ["testimonials", <ChatText size={16} />, "Depoimentos"],
            ["portfolio", <Images size={16} />, "Portfólio"],
          ] as [Tab, React.ReactNode, string][]).map(([key, icon, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "7px", border: "none", background: tab === key ? "#d4af37" : "transparent", color: tab === key ? "#000" : "#a3a3a3", fontWeight: tab === key ? 700 : 400, cursor: "pointer", fontSize: "0.85rem", transition: "all 0.2s" }}>
              {icon} {label}
            </button>
          ))}
        </div>

        {tab === "testimonials" && <TestimonialsTab toast={showToast} />}
        {tab === "portfolio" && <PortfolioTab toast={showToast} />}
      </div>
    </div>
  );
}
