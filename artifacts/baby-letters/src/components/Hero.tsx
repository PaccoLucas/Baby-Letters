import { Needle, PaintBrushBroad, MapPin } from "@phosphor-icons/react";

export default function Hero() {
  return (
    <section
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "20px",
        marginTop: "50px",
      }}
    >
      <div
        style={{
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          border: "3px solid #d4af37",
          marginBottom: "20px",
          boxShadow: "0 0 30px rgba(212, 175, 55, 0.35)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <img
          src="/brhenda-profile.jpg"
          alt="Brhenda Rodrigues"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 38%",
            filter: "contrast(1.08) brightness(1.05) saturate(1.1)",
            transform: "scale(1.4)",
            transformOrigin: "center 38%",
          }}
        />
      </div>

      <h2
        className="gothic-font"
        style={{ fontSize: "2.8rem", marginBottom: "10px", lineHeight: 1.1 }}
      >
        Lettering &amp; Arte Urbana
      </h2>

      <p
        style={{
          color: "#a3a3a3",
          fontSize: "1.1rem",
          maxWidth: "500px",
          marginBottom: "30px",
        }}
      >
        Especialista em caligrafia personalizada e tattoos exclusivas em Jundiaí - SP.
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "30px",
        }}
      >
        <Tag icon={<Needle size={14} weight="fill" />} label="Lettering Pro" />
        <Tag icon={<PaintBrushBroad size={14} weight="fill" />} label="Graffiti Artist" />
        <Tag icon={<MapPin size={14} weight="fill" />} label="Cartel Tattoos" />
      </div>
    </section>
  );
}

function Tag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      style={{
        background: "#171717",
        padding: "5px 15px",
        borderRadius: "20px",
        fontSize: "0.9rem",
        border: "1px solid #333",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {icon}
      {label}
    </span>
  );
}
