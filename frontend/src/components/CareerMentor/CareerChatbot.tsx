import React, { useState } from "react";
import { ChatMessage } from "../../types";

interface CareerChatbotProps {
  roleTitle: string;
}

// CareerChatbot: Interactive career assistant providing instant advice.
export const CareerChatbot: React.FC<CareerChatbotProps> = ({ roleTitle }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "mentor",
      text: `Hello! I am your AI Career Mentor. Ask me anything about becoming a successful ${roleTitle}!`,
    },
  ]);

  // TODO: Replace this mock response handler with real Gemini API call POST /api/career/chat
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const userText = input.toLowerCase();
    setInput("");

    // Simulate AI response logic
    setTimeout(() => {
      let botResponse = `To excel as a ${roleTitle}, focus on mastering foundational concepts first, building 2-3 portfolio projects, and practicing problem solving daily!`;
      if (userText.includes("how") || userText.includes("start") || userText.includes("become")) {
        botResponse = `Start with core programming fundamentals in Python/JS, learn database queries in SQL, build hands-on projects, and gain practical experience with open source!`;
      } else if (userText.includes("salary") || userText.includes("pay") || userText.includes("job")) {
        botResponse = `Entry-level ${roleTitle} positions offer competitive salaries. Key differentiators include strong project portfolios and clean Git commits.`;
      }

      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: "mentor", text: botResponse }]);
    }, 500);
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between h-96">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <span className="material-symbols-outlined text-[#c3c0ff]">smart_toy</span>
        <h3 className="font-headline font-bold text-lg text-white">AI Career Assistant</h3>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] p-3 rounded-xl text-xs ${
                msg.sender === "user"
                  ? "bg-[#4f46e5] text-white rounded-br-none"
                  : "bg-white/5 border border-white/10 text-white/90 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-white/10">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask AI about ${roleTitle}...`}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
        />
        <button type="submit" className="px-4 py-2 bg-[#4f46e5] text-white text-xs font-bold rounded-xl hover:brightness-110">
          Send
        </button>
      </form>
    </div>
  );
};
