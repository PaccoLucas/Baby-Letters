import { useState, useEffect } from "react";
import { Star, PaperPlaneTilt } from "@phosphor-icons/react";

interface Testimonial {
  id: number; name: string; avatar: string; text: string;
  stars: number; visible: boolean; pending: boolean;
}

const FALLBACK: Testimonial[] = [
  { id: 1, name: "Rafaela M.", avatar: "RM", text: "Fiz meu lettering com a Brhenda e ficou INCRÍVEL. Ela entendeu exatamente o que eu queria. Super atenciosa e caprichosa!", stars: 5, visible: true, pending: false },
  { id: 2, name: "Lucas S.", avatar: "LS", text: "Trabalho impecável. Minha tatuagem ficou melhor do que eu imaginava. Com certeza voltarei para fazer mais peças!", stars: 5, visible: true, pending: false },
  { id: 3, name: "Camila R.", avatar: "CR", text: "A Brhenda é extremamente talentosa. O traço é perfeito, o atendimento é ótimo. Indico de olhos fechados!", stars: 5, visible: true, pending: false },
  { id: 4, name: "Thiago P.", avatar: "TP", text: "Fiz uma frase no braço e o resultado foi surreal. Arte urbana de verdade. Valeu cada centavo!", stars: 5, visible: true, pending: false },
];

export default function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => r.json())
      .then((data: Testimonial[]) => {
        setItems(Array.isArray(data) && data.length > 0 ? data : FALLBACK);
      })
      .catch(() => setItems(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <section style={{ padding: "60px 20px", background: "#0a0a0a", textAlign: "center" }}>
      <h3 className="gothic-font" style={{ fontSize: "2.2rem", marginBottom: "10px", color: "#d4af37" }}>
        Depoimentos
      </h3>
      <p style={{ color: "#a3a3a3", marginBottom: "40px", fontSize: "0.95rem" }}>
        O que os clientes dizem sobre o trabalho da Brhenda
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "16px",
        maxWidth: "900px",
        margin: "0 auto 40px auto",
      }}>
        {items.map((t) => <TestimonialCard key={t.id} {...t} />)}
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "transparent", border: "1px solid #d4af3777", color: "#d4af37", borderRadius: "10px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, transition: "all 0.2s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#d4af3715"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          <PaperPlaneTilt size={18} weight="fill" />
          Deixar meu depoimento
        </button>
      ) : (
        <SubmitForm onClose={() => setShowForm(false)} />
      )}
    </section>
  );
}

function TestimonialCard({ name, avatar, text, stars }: Testimonial) {
  return (
    <div
      style={{ background: "#171717", border: "1px solid #2a2a2a", borderRadius: "16px", padding: "24px", textAlign: "left", display: "flex", flexDirection: "column", gap: "14px", transition: "border-color 0.3s" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "#d4af3755")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "#2a2a2a")}
    >
      <div style={{ display: "flex", gap: "3px" }}>
        {Array.from({ length: stars }).map((_, i) => <Star key={i} size={16} weight="fill" color="#d4af37" />)}
      </div>
      <p style={{ color: "#d4d4d4", fontSize: "0.92rem", lineHeight: 1.6, flex: 1 }}>"{text}"</p>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg,#d4af37,#a07d1c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#000", flexShrink: 0 }}>
          {avatar}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#f5f5f5" }}>{name}</div>
          <div style={{ fontSize: "0.75rem", color: "#a3a3a3" }}>Cliente verificado</div>
        </div>
      </div>
    </div>
  );
}

type Status = "idle" | "sending" | "sent" | "error";

function SubmitForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [stars, setStars] = useState(5);
  const [hoverStar, setHoverStar] = useState(0);
  const [status, setStatus] = useState<Status>("idle");

  async function submit() {
    if (!name.trim() || !text.trim()) return;
    setStatus("sending");
    try {
      const r = await fetch("/api/testimonials/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text, stars }),
      });
      if (!r.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", background: "#171717",
    border: "1px solid #333", borderRadius: "9px", color: "#f5f5f5",
    fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
  };

  if (status === "sent") {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto", background: "#171717", border: "1px solid #16a34a55", borderRadius: "16px", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🙏</div>
        <h4 style={{ color: "#4ade80", fontSize: "1.1rem", marginBottom: "8px" }}>Depoimento enviado!</h4>
        <p style={{ color: "#a3a3a3", fontSize: "0.85rem", marginBottom: "20px" }}>Obrigada! Seu depoimento será publicado após aprovação.</p>
        <button onClick={onClose} style={{ padding: "8px 20px", background: "#d4af37", border: "none", color: "#000", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Fechar</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", background: "#171717", border: "1px solid #333", borderRadius: "16px", padding: "28px 24px", textAlign: "left" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h4 style={{ color: "#d4af37", fontSize: "1rem" }}>Deixar depoimento</h4>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#a3a3a3", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1 }}>✕</button>
      </div>

      <label style={{ fontSize: "0.75rem", color: "#a3a3a3", display: "block", marginBottom: "4px" }}>Seu nome</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Mariana S." style={{ ...inputStyle, marginBottom: "12px" }} />

      <label style={{ fontSize: "0.75rem", color: "#a3a3a3", display: "block", marginBottom: "4px" }}>Avaliação</label>
      <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onMouseEnter={() => setHoverStar(n)} onMouseLeave={() => setHoverStar(0)} onClick={() => setStars(n)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
            <Star size={24} weight={(hoverStar || stars) >= n ? "fill" : "regular"} color="#d4af37" />
          </button>
        ))}
      </div>

      <label style={{ fontSize: "0.75rem", color: "#a3a3a3", display: "block", marginBottom: "4px" }}>Seu depoimento</label>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Conta como foi a sua experiência..." rows={4}
        style={{ ...inputStyle, resize: "vertical", marginBottom: "16px" }} />

      {status === "error" && <p style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "10px" }}>Erro ao enviar. Tente novamente.</p>}

      <button onClick={submit} disabled={status === "sending" || !name.trim() || !text.trim()}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", width: "100%", padding: "11px", background: status === "sending" || !name.trim() || !text.trim() ? "#444" : "#d4af37", border: "none", color: "#000", borderRadius: "9px", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}>
        <PaperPlaneTilt size={16} weight="fill" />
        {status === "sending" ? "Enviando..." : "Enviar depoimento"}
      </button>
      <p style={{ fontSize: "0.72rem", color: "#666", textAlign: "center", marginTop: "10px" }}>Seu depoimento será publicado após aprovação da Brhenda.</p>
    </div>
  );
}
