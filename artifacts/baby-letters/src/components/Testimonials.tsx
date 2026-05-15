import { Star } from "@phosphor-icons/react";

const testimonials = [
  {
    name: "Rafaela M.",
    avatar: "RM",
    text: "Fiz meu lettering com a Brhenda e ficou INCRÍVEL. Ela entendeu exatamente o que eu queria. Super atenciosa e caprichosa!",
    stars: 5,
  },
  {
    name: "Lucas S.",
    avatar: "LS",
    text: "Trabalho impecável. Minha tatuagem ficou melhor do que eu imaginava. Com certeza voltarei para fazer mais peças!",
    stars: 5,
  },
  {
    name: "Camila R.",
    avatar: "CR",
    text: "A Brhenda é extremamente talentosa. O traço é perfeito, o atendimento é ótimo. Indico de olhos fechados!",
    stars: 5,
  },
  {
    name: "Thiago P.",
    avatar: "TP",
    text: "Fiz uma frase no braço e o resultado foi surreal. Arte urbana de verdade. Valeu cada centavo!",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section
      style={{
        padding: "60px 20px",
        background: "#0a0a0a",
        textAlign: "center",
      }}
    >
      <h3
        className="gothic-font"
        style={{ fontSize: "2.2rem", marginBottom: "10px", color: "#d4af37" }}
      >
        Depoimentos
      </h3>
      <p style={{ color: "#a3a3a3", marginBottom: "40px", fontSize: "0.95rem" }}>
        O que os clientes dizem sobre o trabalho da Brhenda
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {testimonials.map((t, i) => (
          <TestimonialCard key={i} {...t} />
        ))}
      </div>
    </section>
  );
}

function TestimonialCard({
  name,
  avatar,
  text,
  stars,
}: {
  name: string;
  avatar: string;
  text: string;
  stars: number;
}) {
  return (
    <div
      style={{
        background: "#171717",
        border: "1px solid #2a2a2a",
        borderRadius: "16px",
        padding: "24px",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        transition: "border-color 0.3s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor = "#d4af3755")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor = "#2a2a2a")
      }
    >
      {/* Stars */}
      <div style={{ display: "flex", gap: "3px" }}>
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} size={16} weight="fill" color="#d4af37" />
        ))}
      </div>

      {/* Text */}
      <p
        style={{
          color: "#d4d4d4",
          fontSize: "0.92rem",
          lineHeight: 1.6,
          flex: 1,
        }}
      >
        "{text}"
      </p>

      {/* Author */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #d4af37, #a07d1c)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#000",
            flexShrink: 0,
          }}
        >
          {avatar}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#f5f5f5" }}>
            {name}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#a3a3a3" }}>Cliente verificado</div>
        </div>
      </div>
    </div>
  );
}
