import React, { useState } from "react";
import { ChatMessage } from "../../types";
import { aiApi } from "../../services/api";
import ReactMarkdown from "react-markdown";

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
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      let profileContext: any = { roleTitle };
      try {
        const { profileApi } = await import("../../services/api");
        const profile = await profileApi.getProfile();
        if (profile) {
          profileContext = {
            target_role: profile.target_role,
            current_gpa: profile.current_gpa,
            college: profile.college,
            roleTitle,
          };
        }
      } catch { /* use basic roleTitle context */ }

      const data = await aiApi.ask(userText, profileContext);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: "mentor", text: data.reply || "I am processing your career query." },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "mentor",
          text: "I couldn't reach the AI service right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
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
              {msg.sender === "user" ? (
                msg.text
              ) : (
                <div className="prose prose-invert prose-xs max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl rounded-bl-none text-xs text-white/70 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              Analyzing...
            </div>
          </div>
        )}
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
        <button type="submit" disabled={loading} className="px-4 py-2 bg-[#4f46e5] text-white text-xs font-bold rounded-xl hover:brightness-110 disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  );
};
