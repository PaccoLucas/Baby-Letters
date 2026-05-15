import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Chatbot from "@/components/Chatbot";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a", color: "#f5f5f5" }}>
      <Header />
      <main>
        <Hero />
        <Chatbot />
        <Gallery />
        <Testimonials />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
