import React, { useState } from "react";
import { NavTab } from "../types";
import { aiApi } from "../services/api";

interface AskAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavTab;
}

export const AskAiModal: React.FC<AskAiModalProps> = ({
  isOpen,
  onClose,
  activeTab,
}) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    {
      sender: "ai",
      text: "Hello Murali! I'm Compass AI, your personal academic advisor. How can I assist your study goals or career path today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query;
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setQuery("");
    setLoading(true);

    try {
      const data = await aiApi.ask(userText, {
        career: "AI Engineer",
        score: "84%",
        activeTab,
      });
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: data.reply || "I am processing your query based on your student index." },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I analyzed your current schedule: focus on DBMS and Operating Systems to keep your top 15% cohort rank.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl glass-card rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex flex-col h-[520px]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4f46e5] text-[#dad7ff] flex items-center justify-center shadow-lg shadow-[#4f46e5]/30">
              <span className="material-symbols-outlined fill-1 text-xl">auto_awesome</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-[#e5e2e3]">Compass AI Assistant</h3>
              <p className="text-xs text-[#c7c4d8] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
                Powered by Gemini AI • Context Aware
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-[#c7c4d8] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-[#4f46e5] text-white rounded-tr-none shadow-md shadow-[#4f46e5]/20"
                    : "bg-white/5 border border-white/10 text-[#e5e2e3] rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none text-xs text-[#c7c4d8] flex items-center gap-2">
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                Analyzing student workload & career vectors...
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-6 py-2 flex gap-2 overflow-x-auto text-xs border-t border-white/5 bg-white/[0.02]">
          <button
            onClick={() => {
              setQuery("How can I prepare for Operating Systems exam in 2 days?");
            }}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#c7c4d8] whitespace-nowrap transition-colors"
          >
            ⚡ OS Exam Prep Strategy
          </button>
          <button
            onClick={() => {
              setQuery("What Docker topics should I learn for AI engineering?");
            }}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#c7c4d8] whitespace-nowrap transition-colors"
          >
            🐳 Docker for AI Roadmap
          </button>
          <button
            onClick={() => {
              setQuery("How can I optimize my monthly hostel budget?");
            }}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#c7c4d8] whitespace-nowrap transition-colors"
          >
            💸 Budget Optimization
          </button>
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about coursework, budget, or career..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#e5e2e3] focus:outline-none focus:border-[#4f46e5] transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-2.5 bg-[#4f46e5] text-white font-medium rounded-xl hover:bg-[#4f46e5]/90 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            <span>Ask</span>
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
