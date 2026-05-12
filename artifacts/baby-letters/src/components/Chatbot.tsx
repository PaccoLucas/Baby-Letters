import { useState, useRef, useEffect } from "react";
import { PaperPlaneRight, WhatsappLogo } from "@phosphor-icons/react";

const WHATSAPP_NUMBER = "5511965125056";

type Sender = "bot" | "user";

interface Message {
  id: number;
  text: string;
  sender: Sender;
}

type ChatStep = 0 | 1 | 2 | 3 | "done";

interface BudgetData {
  idea: string;
  size: string;
  bodyPart: string;
}

let idCounter = 0;
function nextId() {
  return ++idCounter;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId(),
      text: "Salve! Sou a assistente virtual da Brhenda Rodrigues. Pronto para eternizar uma ideia? 🔥",
      sender: "bot",
    },
  ]);
  const [step, setStep] = useState<ChatStep>(0);
  const [inputValue, setInputValue] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [showOptions, setShowOptions] = useState(true);
  const [showLocationOption, setShowLocationOption] = useState(false);
  const [showWhatsappBtn, setShowWhatsappBtn] = useState(false);
  const budgetData = useRef<BudgetData>({ idea: "", size: "", bodyPart: "" });
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function scrollToBottom() {
    setTimeout(() => {
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      }
    }, 50);
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, showWhatsappBtn]);

  function addMessage(text: string, sender: Sender, delay = 0) {
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextId(), text, sender }]);
    }, delay);
  }

  function showLocation() {
    setShowOptions(false);
    addMessage("Onde fica o estúdio?", "user");
    addMessage("Atendemos no Cartel Tattoos em Jundiaí - SP! 📍\n\nBora aproveitar a viagem e já orçar sua tattoo?", "bot", 600);
    setTimeout(() => {
      setShowLocationOption(true);
      scrollToBottom();
    }, 1100);
  }

  function startBudget() {
    setShowOptions(false);
    setShowLocationOption(false);
    addMessage("Quero fazer um Orçamento", "user");
    addMessage("Perfeito! Pra Brhenda entender seu projeto, qual é a palavra, frase ou desenho que você quer?", "bot", 600);
    setTimeout(() => {
      setShowInput(true);
      setStep(1);
      inputRef.current?.focus();
    }, 800);
  }

  function sendMessage() {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    addMessage(text, "user");

    if (step === 1) {
      budgetData.current.idea = text;
      addMessage("Massa! E qual o tamanho aproximado em centímetros?", "bot", 600);
      setStep(2);
    } else if (step === 2) {
      budgetData.current.size = text;
      addMessage("E em qual parte do corpo você pretende fazer?", "bot", 600);
      setStep(3);
    } else if (step === 3) {
      budgetData.current.bodyPart = text;
      setShowInput(false);
      setStep("done");
      addMessage("Show! Gerando seu orçamento agora... ✍️", "bot", 500);
      const { idea, size, bodyPart } = budgetData.current;
      const finalMsg = `Olá Brhenda! Gostaria de um orçamento para uma tattoo.\n\n🔥 *Detalhes do Pedido:*\n- *Ideia:* ${idea}\n- *Tamanho:* ${size}\n- *Local:* ${bodyPart}`;
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(finalMsg)}`;
      setWhatsappUrl(url);
      addMessage("Tudo pronto! Clique no botão abaixo para me enviar esses dados no WhatsApp e eu te passo o valor exato.", "bot", 1500);
      setTimeout(() => {
        setShowWhatsappBtn(true);
      }, 2200);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") sendMessage();
  }

  return (
    <div
      style={{
        maxWidth: "500px",
        width: "90%",
        margin: "-50px auto 50px auto",
        background: "#171717",
        borderRadius: "12px",
        border: "1px solid #333",
        overflow: "hidden",
        boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          background: "#111",
          padding: "15px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderBottom: "1px solid #333",
        }}
      >
        <div
          className="pulse-gold"
          style={{
            width: "10px",
            height: "10px",
            background: "#25D366",
            borderRadius: "50%",
            flexShrink: 0,
          }}
        />
        <div>
          <strong style={{ fontSize: "0.95rem" }}>Assistente Baby Letters ⚜️</strong>
          <div style={{ fontSize: "0.7rem", color: "#a3a3a3" }}>Resposta instantânea</div>
        </div>
      </div>

      {/* Chat Body */}
      <div
        ref={chatBodyRef}
        className="chat-body"
        style={{
          padding: "20px",
          height: "380px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          scrollBehavior: "smooth",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="animate-fade-in-up"
            style={{
              maxWidth: "85%",
              padding: "12px 16px",
              borderRadius: "18px",
              fontSize: "0.95rem",
              lineHeight: 1.4,
              alignSelf: msg.sender === "bot" ? "flex-start" : "flex-end",
              background: msg.sender === "bot" ? "#262626" : "#d4af37",
              color: msg.sender === "bot" ? "#fff" : "#000",
              fontWeight: msg.sender === "user" ? 600 : 400,
              borderBottomLeftRadius: msg.sender === "bot" ? "4px" : "18px",
              borderBottomRightRadius: msg.sender === "user" ? "4px" : "18px",
              whiteSpace: "pre-line",
            }}
          >
            {msg.text}
          </div>
        ))}

        {/* Initial Options */}
        {showOptions && (
          <div
            className="animate-fade-in-up"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              alignSelf: "flex-end",
              width: "100%",
              alignItems: "flex-end",
            }}
          >
            <OptionButton onClick={startBudget} label="Pedir Orçamento" />
            <OptionButton onClick={showLocation} label="Localização do Estúdio" />
          </div>
        )}

        {/* Location follow-up */}
        {showLocationOption && (
          <div
            className="animate-fade-in-up"
            style={{ alignSelf: "flex-end" }}
          >
            <OptionButton onClick={startBudget} label="Sim, bora!" />
          </div>
        )}

        {/* WhatsApp Final Button */}
        {showWhatsappBtn && (
          <div className="animate-fade-in-up" style={{ width: "100%" }}>
            <button
              onClick={() => window.open(whatsappUrl, "_blank")}
              style={{
                background: "#25D366",
                color: "#000",
                border: "none",
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.95rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "8px",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <WhatsappLogo size={20} weight="fill" />
              ENVIAR ORÇAMENTO
            </button>
          </div>
        )}
      </div>

      {/* Input Area */}
      {showInput && (
        <div
          style={{
            padding: "15px",
            background: "#111",
            borderTop: "1px solid #333",
            display: "flex",
            gap: "10px",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escreva aqui..."
            style={{
              flex: 1,
              background: "#262626",
              border: "none",
              padding: "12px 15px",
              borderRadius: "20px",
              color: "white",
              outline: "none",
              fontSize: "0.95rem",
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              background: "#d4af37",
              color: "#000",
              border: "none",
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexShrink: 0,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <PaperPlaneRight size={20} weight="fill" />
          </button>
        </div>
      )}
    </div>
  );
}

function OptionButton({ onClick, label }: { onClick: () => void; label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#d4af37" : "transparent",
        border: "1px solid #d4af37",
        color: hovered ? "#000" : "#d4af37",
        padding: "10px 18px",
        borderRadius: "20px",
        cursor: "pointer",
        transition: "all 0.25s",
        fontSize: "0.9rem",
        fontWeight: 600,
      }}
    >
      {label}
    </button>
  );
}
