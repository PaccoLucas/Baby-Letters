import { useState } from "react";
import { WhatsappLogo } from "@phosphor-icons/react";

const WHATSAPP_NUMBER = "5511982656845";
const WHATSAPP_MESSAGE = "Olá Brhenda! Vim pelo site e gostaria de mais informações.";

export default function WhatsAppFloat() {
  const [hovered, setHovered] = useState(false);

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "#25D366",
        color: "#000",
        borderRadius: "50px",
        padding: hovered ? "14px 20px" : "14px",
        boxShadow: "0 4px 20px rgba(37, 211, 102, 0.45)",
        textDecoration: "none",
        fontWeight: 700,
        fontSize: "0.9rem",
        transition: "all 0.3s ease",
        overflow: "hidden",
        whiteSpace: "nowrap",
        maxWidth: hovered ? "220px" : "52px",
      }}
      aria-label="Falar no WhatsApp"
    >
      <WhatsappLogo size={24} weight="fill" style={{ flexShrink: 0 }} />
      <span
        style={{
          opacity: hovered ? 1 : 0,
          maxWidth: hovered ? "160px" : "0px",
          transition: "opacity 0.25s ease, max-width 0.3s ease",
          overflow: "hidden",
        }}
      >
        Falar no WhatsApp
      </span>
    </a>
  );
}
