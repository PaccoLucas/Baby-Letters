import { useState } from "react";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=500&auto=format&fit=crop",
    alt: "Tattoo lettering work 1",
  },
  {
    src: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=500&auto=format&fit=crop",
    alt: "Tattoo lettering work 2",
  },
  {
    src: "https://images.unsplash.com/photo-1598371839696-5e5bb00b059b?q=80&w=500&auto=format&fit=crop",
    alt: "Tattoo lettering work 3",
  },
  {
    src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=500&auto=format&fit=crop",
    alt: "Tattoo lettering work 4",
  },
];

export default function Gallery() {
  return (
    <section
      style={{
        padding: "50px 20px",
        textAlign: "center",
        background: "#070707",
      }}
    >
      <h3
        className="gothic-font"
        style={{ fontSize: "2.2rem", marginBottom: "30px", color: "#d4af37" }}
      >
        Portfólio
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        {galleryImages.map((img, i) => (
          <GalleryItem key={i} src={img.src} alt={img.alt} />
        ))}
      </div>
    </section>
  );
}

function GalleryItem({ src, alt }: { src: string; alt: string }) {
  const [hovered, setHovered] = useState(false);

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
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: hovered ? "grayscale(0%)" : "grayscale(100%)",
          transform: hovered ? "scale(1.08)" : "scale(1)",
          opacity: hovered ? 1 : 0.7,
          transition: "filter 0.5s ease, transform 0.5s ease, opacity 0.5s ease",
          display: "block",
        }}
      />
    </div>
  );
}
