import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      style={{
        padding: "20px",
        textAlign: "center",
        background: scrolled
          ? "rgba(0,0,0,0.95)"
          : "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)",
        position: "fixed",
        width: "100%",
        top: 0,
        zIndex: 100,
        transition: "background 0.3s ease",
        backdropFilter: scrolled ? "blur(8px)" : "none",
      }}
    >
      <h1
        className="gothic-font"
        style={{ fontSize: "2rem", letterSpacing: "2px", color: "#f5f5f5" }}
      >
        Baby Letters
      </h1>
    </header>
  );
}
