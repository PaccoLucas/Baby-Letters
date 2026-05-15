import { useState, useEffect } from "react";

interface PortfolioItem {
  id: number;
  url: string;
  alt: string;
  orderIndex: number;
  visible: boolean;
}

const FALLBACK = [
  { id: 1, url: "https://images.unsplash.com/photo-1542727313-4f3e99aa2568?q=80&w=500&auto=format&fit=crop", alt: "Tattoo lettering work 1", orderIndex: 0, visible: true },
  { id: 2, url: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=500&auto=format&fit=crop", alt: "Tattoo lettering work 2", orderIndex: 1, visible: true },
  { id: 3, url: "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?q=80&w=500&auto=format&fit=crop", alt: "Tattoo lettering work 3", orderIndex: 2, visible: true },
  { id: 4, url: "https://images.unsplash.com/photo-1604881988758-f76ad2f7aac1?q=80&w=500&auto=format&fit=crop", alt: "Tattoo lettering work 4", orderIndex: 3, visible: true },
];

export default function Gallery() {
  const [items, setItems] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((data: PortfolioItem[]) => {
        setItems(Array.isArray(data) && data.length > 0 ? data : FALLBACK);
      })
      .catch(() => setItems(FALLBACK));
  }, []);

  const displayed = items.length > 0 ? items : FALLBACK;

  return (
    <section style={{ padding: "50px 20px", textAlign: "center", background: "#070707" }}>
      <h3 className="gothic-font" style={{ fontSize: "2.2rem", marginBottom: "30px", color: "#d4af37" }}>
        Portfólio
      </h3>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "12px",
        maxWidth: "600px",
        margin: "0 auto",
      }}>
        {displayed.map((item) => <GalleryItem key={item.id} {...item} />)}
      </div>
    </section>
  );
}

function GalleryItem({ url, alt }: PortfolioItem) {
  const [hovered, setHovered] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        aspectRatio: "1 / 1",
        background: "#171717",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #222",
        cursor: "pointer",
      }}
    >
      {errored ? (
        <div style={{
          width: "100%", height: "100%", display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "#555", fontSize: "0.8rem",
        }}>
          Imagem indisponível
        </div>
      ) : (
        <img
          src={url}
          alt={alt}
          onError={() => setErrored(true)}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            filter: hovered ? "grayscale(0%)" : "grayscale(100%)",
            transform: hovered ? "scale(1.08)" : "scale(1)",
            opacity: hovered ? 1 : 0.7,
            transition: "filter 0.5s ease, transform 0.5s ease, opacity 0.5s ease",
            display: "block",
          }}
        />
      )}
    </div>
  );
}
