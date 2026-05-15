import { useState, useEffect } from "react";
import { Star, Plus, Pencil, Trash, Eye, EyeSlash, X, Check } from "@phosphor-icons/react";

const API = "/api";
const ADMIN_PASSWORD = "1234";

interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  text: string;
  stars: number;
  visible: boolean;
  createdAt: string;
}

interface FormData {
  name: string;
  avatar: string;
  text: string;
  stars: number;
  visible: boolean;
}

const emptyForm: FormData = { name: "", avatar: "", text: "", stars: 5, visible: true };

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  function headers() {
    return { "Content-Type": "application/json", "x-admin-password": ADMIN_PASSWORD };
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function login() {
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthed(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  }

  async function fetchTestimonials() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/testimonials`, { headers: headers() });
      const data = await res.json();
      setTestimonials(data);
    } catch {
      showToast("Erro ao carregar depoimentos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authed) fetchTestimonials();
  }, [authed]);

  async function save() {
    setSaving(true);
    try {
      const url = editingId
        ? `${API}/admin/testimonials/${editingId}`
        : `${API}/admin/testimonials`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      showToast(editingId ? "Atualizado!" : "Criado!");
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchTestimonials();
    } catch {
      showToast("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisible(t: Testimonial) {
    await fetch(`${API}/admin/testimonials/${t.id}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ ...t, visible: !t.visible }),
    });
    fetchTestimonials();
  }

  async function remove(id: number) {
    if (!confirm("Excluir este depoimento?")) return;
    await fetch(`${API}/admin/testimonials/${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    showToast("Excluído!");
    fetchTestimonials();
  }

  function startEdit(t: Testimonial) {
    setForm({ name: t.name, avatar: t.avatar, text: t.text, stars: t.stars, visible: t.visible });
    setEditingId(t.id);
    setShowForm(true);
  }

  function startCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  // LOGIN SCREEN
  if (!authed) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0a0a0a", display: "flex",
        alignItems: "center", justifyContent: "center", padding: "20px",
      }}>
        <div style={{
          background: "#171717", border: "1px solid #333", borderRadius: "16px",
          padding: "40px", width: "100%", maxWidth: "380px", textAlign: "center",
        }}>
          <h1 className="gothic-font" style={{ color: "#d4af37", fontSize: "2rem", marginBottom: "8px" }}>
            Baby Letters
          </h1>
          <p style={{ color: "#a3a3a3", marginBottom: "32px", fontSize: "0.9rem" }}>
            Painel de Administração
          </p>
          <input
            type="password"
            placeholder="Digite a senha..."
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            style={{
              width: "100%", padding: "12px 16px", background: "#262626",
              border: `1px solid ${passwordError ? "#ef4444" : "#444"}`,
              borderRadius: "10px", color: "#fff", fontSize: "1rem",
              outline: "none", marginBottom: passwordError ? "8px" : "16px",
            }}
          />
          {passwordError && (
            <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "16px" }}>
              Senha incorreta
            </p>
          )}
          <button
            onClick={login}
            style={{
              width: "100%", padding: "12px", background: "#d4af37", color: "#000",
              border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  // ADMIN PANEL
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f5f5f5", padding: "24px" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", background: "#d4af37",
          color: "#000", padding: "12px 20px", borderRadius: "10px",
          fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 className="gothic-font" style={{ color: "#d4af37", fontSize: "1.8rem" }}>
              Baby Letters
            </h1>
            <p style={{ color: "#a3a3a3", fontSize: "0.85rem" }}>Painel de Depoimentos</p>
          </div>
          <button
            onClick={startCreate}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "#d4af37", color: "#000", border: "none",
              padding: "10px 18px", borderRadius: "10px", fontWeight: 700,
              cursor: "pointer", fontSize: "0.9rem",
            }}
          >
            <Plus size={18} weight="bold" />
            Novo Depoimento
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{
            background: "#171717", border: "1px solid #d4af3766", borderRadius: "16px",
            padding: "24px", marginBottom: "24px",
          }}>
            <h2 style={{ marginBottom: "20px", fontSize: "1rem", color: "#d4af37" }}>
              {editingId ? "Editar Depoimento" : "Novo Depoimento"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "#a3a3a3", display: "block", marginBottom: "6px" }}>
                  Nome do cliente
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Rafaela M."
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "#a3a3a3", display: "block", marginBottom: "6px" }}>
                  Iniciais (avatar)
                </label>
                <input
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value.slice(0, 3).toUpperCase() })}
                  placeholder="Ex: RM"
                  maxLength={3}
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "0.8rem", color: "#a3a3a3", display: "block", marginBottom: "6px" }}>
                Depoimento
              </label>
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="O que o cliente disse..."
                rows={3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
              />
            </div>
            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "#a3a3a3", display: "block", marginBottom: "6px" }}>
                  Estrelas
                </label>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setForm({ ...form, stars: n })}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                      <Star size={22} weight={n <= form.stars ? "fill" : "regular"} color="#d4af37" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "#a3a3a3", display: "block", marginBottom: "6px" }}>
                  Visível no site
                </label>
                <button
                  onClick={() => setForm({ ...form, visible: !form.visible })}
                  style={{
                    background: form.visible ? "#16a34a22" : "#333",
                    border: `1px solid ${form.visible ? "#16a34a" : "#555"}`,
                    color: form.visible ? "#4ade80" : "#a3a3a3",
                    padding: "6px 14px", borderRadius: "8px", cursor: "pointer",
                    fontSize: "0.85rem", fontWeight: 600,
                  }}
                >
                  {form.visible ? "Sim" : "Não"}
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowForm(false); setForm(emptyForm); setEditingId(null); }}
                style={{
                  display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px",
                  background: "transparent", border: "1px solid #444", color: "#a3a3a3",
                  borderRadius: "8px", cursor: "pointer", fontWeight: 600,
                }}
              >
                <X size={16} /> Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving || !form.name || !form.text}
                style={{
                  display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px",
                  background: saving || !form.name || !form.text ? "#555" : "#d4af37",
                  border: "none", color: "#000", borderRadius: "8px",
                  cursor: saving ? "not-allowed" : "pointer", fontWeight: 700,
                }}
              >
                <Check size={16} weight="bold" />
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <p style={{ color: "#a3a3a3", textAlign: "center", padding: "40px" }}>Carregando...</p>
        ) : testimonials.length === 0 ? (
          <div style={{
            background: "#171717", border: "1px dashed #333", borderRadius: "16px",
            padding: "60px 20px", textAlign: "center", color: "#a3a3a3",
          }}>
            <p style={{ marginBottom: "16px" }}>Nenhum depoimento ainda.</p>
            <button onClick={startCreate} style={{
              background: "#d4af37", color: "#000", border: "none",
              padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer",
            }}>
              Criar o primeiro
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {testimonials.map((t) => (
              <div key={t.id} style={{
                background: "#171717", border: `1px solid ${t.visible ? "#2a2a2a" : "#333"}`,
                borderRadius: "14px", padding: "18px 20px",
                opacity: t.visible ? 1 : 0.6,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <div style={{
                        width: "34px", height: "34px", borderRadius: "50%",
                        background: "linear-gradient(135deg, #d4af37, #a07d1c)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: 700, color: "#000", flexShrink: 0,
                      }}>
                        {t.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{t.name}</div>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {Array.from({ length: t.stars }).map((_, i) => (
                            <Star key={i} size={12} weight="fill" color="#d4af37" />
                          ))}
                        </div>
                      </div>
                      {!t.visible && (
                        <span style={{
                          fontSize: "0.7rem", background: "#333", color: "#a3a3a3",
                          padding: "2px 8px", borderRadius: "6px",
                        }}>oculto</span>
                      )}
                    </div>
                    <p style={{ color: "#d4d4d4", fontSize: "0.9rem", lineHeight: 1.5 }}>"{t.text}"</p>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <IconBtn onClick={() => toggleVisible(t)} title={t.visible ? "Ocultar" : "Mostrar"}>
                      {t.visible ? <Eye size={16} /> : <EyeSlash size={16} />}
                    </IconBtn>
                    <IconBtn onClick={() => startEdit(t)} title="Editar">
                      <Pencil size={16} />
                    </IconBtn>
                    <IconBtn onClick={() => remove(t.id)} title="Excluir" danger>
                      <Trash size={16} />
                    </IconBtn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", background: "#262626",
  border: "1px solid #444", borderRadius: "8px", color: "#fff",
  fontSize: "0.9rem", outline: "none",
};

function IconBtn({ onClick, title, danger, children }: {
  onClick: () => void; title: string; danger?: boolean; children: React.ReactNode;
}) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: h ? (danger ? "#ef444422" : "#d4af3722") : "transparent",
        border: `1px solid ${h ? (danger ? "#ef4444" : "#d4af37") : "#333"}`,
        color: h ? (danger ? "#ef4444" : "#d4af37") : "#a3a3a3",
        width: "34px", height: "34px", borderRadius: "8px",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}
    >
      {children}
    </button>
  );
}
