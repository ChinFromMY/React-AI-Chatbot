import "./Chatbot.css";
import { useState, useRef, useEffect } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import Message from "./Message";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data?.generated_text || "Sorry, I couldn't respond.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.length === 0 && !isLoading && (
          <div className="empty-state">
            <p className="empty-title">Start a conversation 👋</p>
            <p className="empty-subtitle">Ask anything and I’ll help you.</p>
          </div>
        )}

        {messages.map(msg => (
          <Message key={msg.id} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
        ))}

        {isLoading && (
          <div className="message-row bot">
            <div className="message-avatar"><Bot /></div>
            <div className="message-bubble bot typing">
              <Loader2 className="spinner" />
              Thinking...
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div ref={bottomRef} />
      </div>

      <div className="chatbot-input">
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={!inputText.trim() || isLoading}>
          <Send /> Send
        </button>
      </div>
    </div>
  );
}
