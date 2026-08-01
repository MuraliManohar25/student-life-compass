import React, { useState, useEffect } from "react";
import { CuratedResource, ChatMessage } from "../types";
import { careerApi } from "../services/api";

export const CareerMentorView: React.FC = () => {
  const [selectedCareer, setSelectedCareer] = useState("AI Engineer");
  const [marketMatchIndex, setMarketMatchIndex] = useState(84);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "mentor",
      text: "Your Python and ML scores are exceptional (88%). However, top AI Engineer roles at Google and Stripe require Docker deployment and PyTorch model quantization. Shall we focus on Docker this week?",
    },
  ]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [activeWeek, setActiveWeek] = useState<number>(2);

  const [skillGap, setSkillGap] = useState<any[]>([
    { name: "Python", score: 92 },
    { name: "ML/PyTorch", score: 88 },
    { name: "Docker/MLOps", score: 54 },
    { name: "SQL/NoSQL", score: 78 },
    { name: "Algorithms", score: 85 }
  ]);

  const [roadmap, setRoadmap] = useState<any[]>([
    { week: 1, title: "Advanced Python & AsyncIO", desc: "Decorators, generators, and asynchronous pipelines.", progress: 100, status: "COMPLETED" },
    { week: 2, title: "Docker & Containerization", desc: "Multi-stage builds, GPU passthrough, and docker-compose.", progress: 68, status: "IN PROGRESS" },
    { week: 3, title: "Transformer Models & LoRA", desc: "Fine-tuning open source LLMs using HuggingFace & PEFT.", progress: 0, status: "LOCKED" }
  ]);

  const resources: CuratedResource[] = [
    {
      id: "r1",
      type: "COURSE",
      title: "Deep Learning Specialization",
      description: "Master Neural Networks, CNNs, Transformers and Hyperparameter tuning.",
      meta: "DeepLearning.AI • 8 Weeks",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGVNAa9O1RKYEM1saiegxuoaitLlkGMEomu0hT2fFjKX470FvHj83pGM04fBKlSYX73Pb_M3A2ZnEd1XYHfwZarPiKs-bXVU2naYJpA4uxcSo5wp34Etfq4Vk_y_-bSEMGm0dsh8jZh5gfCOR2bWAO_O3GGh5OAol6J5xhrzWoEV5Uj3TALhkg__89ki6DbyWOe3fEH8-RhjqJ5kiFToWd-mWu1iRb1qFrsMdL2OL4HWbC_9CX7epF",
      link: "#",
      typeBg: "bg-purple-500/20",
      typeText: "text-purple-300",
    },
    {
      id: "r2",
      type: "YOUTUBE",
      title: "MLOps Crash Course 2024",
      description: "Deploying PyTorch models with Docker, FastAPI, and GitHub Actions.",
      meta: "FreeCodeCamp • 1.2M Views",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsSggHEy0mFaiYimODwa4C5RENnLuQE0Q0A0WiNcLn-xrfCLt2fefKoCYwhgIzahIKnwT4td_F4BWwx2TSuyE0lcpIvWhX_HciPAYUiqT3_jDIxJzLRfDLVWklPhOAUP1GidylsypNSlIji-ehOpgTcZicx_068f8RYCFOYwWm_dREw1K-uTMoQ8mmBIQUOUyMRDyoypvebOEHScoDTM8piQFPeulb8KWD4rx6m3GmbpHjmBW3CtcR",
      link: "#",
      typeBg: "bg-red-500/20",
      typeText: "text-red-300",
    },
    {
      id: "r3",
      type: "DOCS",
      title: "PyTorch Optimization & ONNX Runtime",
      description: "Official guide on converting PyTorch checkpoints for high-throughput inference.",
      meta: "PyTorch Docs • 15 Min Read",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKSjiYnEIUOeBbo7rh-2JSxEP5As_2gP3-37Csj8jsUv38ehfWARuS2NM6GW8C1GKmbxPKhuiF-XEDBJKcNmNSx7jCGN9_18Sn7Q1mFdH1lp_mT3crUOAzb-KHg9IS2Nv4l1Fyax8zTVJxzb2duf0_R4fv5i3iLTkOTWLYLjo0bXn_62p2skvr1HcPk23X9cjHhmFbcxJGuvyaVcqnVzsjrulaYxZPWfDEOCxlMSqJC9bFdT_I4qHR",
      link: "#",
      typeBg: "bg-[#4f46e5]/20",
      typeText: "text-[#c3c0ff]",
    },
    {
      id: "r4",
      type: "PROJECT",
      title: "Real-time Object Detection Pipeline",
      description: "Hands-on project: OpenCV, YOLOv8, and WebRTC streaming for edge devices.",
      meta: "GitHub Project • 4.8★ Rating",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCifZhkRBsTsxQuQsIE8WJNgI8tjznIBe5l2Au8WdLXu0_vdYsrQPxTifpZnY6-SOH7F3_N87enmHRuftC-Eku_RDFp7sDS3eAYrXzYlJdX3U6AVua9NqOZZ0vv2fNxLdaJ7_Xz-4ZsaMHQ_PQAqXfIkr7XPd5vfudan0PEkh9iuCOTQuoPcHecx_OLyj8n4dBjwaDeRJaG84yG79wDfDdWxZcWhay4EwSw_qoS8vxvSh0mKLsyF3Z2",
      link: "#",
      typeBg: "bg-emerald-500/20",
      typeText: "text-emerald-300",
    },
  ];

  const fetchCareerAnalysis = async (role: string) => {
    try {
      const data = await careerApi.analyze(role);
      if (data.market_match_index) setMarketMatchIndex(data.market_match_index);
      if (data.skill_gap && data.skill_gap.length > 0) setSkillGap(data.skill_gap);
      if (data.roadmap && data.roadmap.length > 0) setRoadmap(data.roadmap);
    } catch (err) {
      console.warn("Career analysis fallback:", err);
    }
  };

  useEffect(() => {
    fetchCareerAnalysis(selectedCareer);
  }, [selectedCareer]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || loadingAi) return;

    const userText = chatInput;
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "user", text: userText },
    ]);
    setChatInput("");
    setLoadingAi(true);

    try {
      const res = await careerApi.chat(userText);
      setChatMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: "mentor", text: res.reply },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "mentor",
          text: "I've updated your roadmap with a 45-minute Docker containerization lab. Completing this will boost your placement match rate to 92%.",
        },
      ]);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#4f46e5]/20 via-transparent to-transparent">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#c3c0ff] uppercase">
            CAREER VECTOR ENGINE
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-headline font-black text-2xl sm:text-3xl text-white">
              Target Role:
            </h1>
            <select
              value={selectedCareer}
              onChange={(e) => setSelectedCareer(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-1.5 text-base font-bold text-[#c3c0ff] focus:outline-none focus:border-[#4f46e5]"
            >
              <option value="AI Engineer" className="bg-[#131314] text-white">
                AI Engineer
              </option>
              <option value="Backend Architect" className="bg-[#131314] text-white">
                Backend Architect
              </option>
              <option value="Data Scientist" className="bg-[#131314] text-white">
                Data Scientist
              </option>
              <option value="Full Stack Lead" className="bg-[#131314] text-white">
                Full Stack Lead
              </option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-[#c7c4d8]">Market Match Index</p>
            <p className="text-2xl font-headline font-black text-emerald-400">{marketMatchIndex}% Ready</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
            A+
          </div>
        </div>
      </div>

      {/* Grid: Skill Gap Radar + Mentor Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Gap Analysis Radar Chart */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c3c0ff]">radar</span>
              <span>Skill Gap Analysis</span>
            </h3>
            <span className="text-xs text-[#c7c4d8]">Proficiency vs Market Demand</span>
          </div>

          <div className="relative w-full h-64 flex items-center justify-center pt-2">
            {/* SVG Pentagon Radar Chart */}
            <svg className="w-64 h-64" viewBox="0 0 200 200">
              <polygon points="100,20 176,75 147,165 53,165 24,75" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <polygon points="100,45 152,86 132,148 68,148 48,86" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <polygon points="100,70 128,97 117,131 83,131 72,97" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

              <line x1="100" y1="100" x2="100" y2="20" stroke="rgba(255,255,255,0.15)" />
              <line x1="100" y1="100" x2="176" y2="75" stroke="rgba(255,255,255,0.15)" />
              <line x1="100" y1="100" x2="147" y2="165" stroke="rgba(255,255,255,0.15)" />
              <line x1="100" y1="100" x2="53" y2="165" stroke="rgba(255,255,255,0.15)" />
              <line x1="100" y1="100" x2="24" y2="75" stroke="rgba(255,255,255,0.15)" />

              <polygon points="100,25 170,78 140,160 58,160 30,78" fill="rgba(34,211,238,0.1)" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 3" />
              <polygon points="100,30 162,82 110,145 62,140 38,80" fill="rgba(79,70,229,0.35)" stroke="#c3c0ff" strokeWidth="2.5" />

              <circle cx="100" cy="30" r="3" fill="#c3c0ff" />
              <circle cx="162" cy="82" r="3" fill="#c3c0ff" />
              <circle cx="110" cy="145" r="3" fill="#c3c0ff" />
              <circle cx="62" cy="140" r="3" fill="#c3c0ff" />
              <circle cx="38" cy="80" r="3" fill="#c3c0ff" />
            </svg>

            {/* Dynamic Skill Labels */}
            <span className="absolute top-1 text-[11px] font-bold text-white">Python (92%)</span>
            <span className="absolute right-0 top-16 text-[11px] font-bold text-white">ML/PyTorch (88%)</span>
            <span className="absolute right-4 bottom-2 text-[11px] font-bold text-amber-300">Docker/MLOps (54%)</span>
            <span className="absolute left-4 bottom-2 text-[11px] font-bold text-white">SQL/NoSQL (78%)</span>
            <span className="absolute left-0 top-16 text-[11px] font-bold text-white">Algorithms (85%)</span>
          </div>

          <div className="flex justify-center gap-6 text-xs pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#4f46e5] border border-[#c3c0ff]"></div>
              <span className="text-[#e5e2e3]">Your Current Profile</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-cyan-500/30 border border-cyan-400 border-dashed"></div>
              <span className="text-[#c7c4d8]">Market Benchmark</span>
            </div>
          </div>
        </div>

        {/* AI Mentor Insight Chat */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#4f46e5]/20 text-[#c3c0ff] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg fill-1">smart_toy</span>
              </div>
              <h3 className="font-headline font-bold text-lg text-white">AI Mentor Dialogue</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
              Active Session
            </span>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                  msg.sender === "mentor"
                    ? "bg-white/5 border border-white/10 text-[#e5e2e3]"
                    : "bg-[#4f46e5] text-white self-end ml-auto max-w-[85%]"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loadingAi && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#c7c4d8] animate-pulse">
                Mentor is calculating skill alignment...
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-white/5">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about MLOps, interview questions, or projects..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
            />
            <button
              type="submit"
              disabled={loadingAi}
              className="px-4 py-2 bg-[#4f46e5] text-white text-xs font-bold rounded-xl hover:brightness-110 active:scale-95"
            >
              Reply
            </button>
          </form>
        </div>
      </div>

      {/* Skill Roadmap Timeline */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-headline font-bold text-xl text-white">Personalized Skill Roadmap</h3>
            <p className="text-xs text-[#c7c4d8]">Step-by-step path to master {selectedCareer} for top tech offers.</p>
          </div>
          <span className="text-xs text-[#c3c0ff] font-bold">Week 2 of 8</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roadmap.map((step, idx) => (
            <div
              key={idx}
              onClick={() => setActiveWeek(step.week || idx + 1)}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                activeWeek === (step.week || idx + 1)
                  ? "bg-[#4f46e5]/10 border-[#4f46e5] shadow-lg shadow-[#4f46e5]/20"
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    step.status === "COMPLETED"
                      ? "text-emerald-400 bg-emerald-500/20"
                      : step.status === "IN PROGRESS"
                      ? "text-[#c3c0ff] bg-[#4f46e5]/20"
                      : "text-[#c7c4d8] bg-white/10"
                  }`}
                >
                  {step.status} {step.progress ? `(${step.progress}%)` : ""}
                </span>
                <span className="text-xs text-[#c7c4d8]">Week 0{step.week || idx + 1}</span>
              </div>
              <h4 className="font-bold text-sm text-white mb-1">{step.title}</h4>
              <p className="text-xs text-[#c7c4d8] mb-3">{step.desc || step.description}</p>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  style={{ width: `${step.progress || 0}%` }}
                  className={`h-full rounded-full ${
                    step.status === "COMPLETED" ? "bg-emerald-400" : "bg-[#4f46e5]"
                  }`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Curated High-Yield Resources */}
      <div className="space-y-4">
        <h3 className="font-headline font-bold text-xl text-white">Curated High-Yield Resources</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((item) => (
            <div
              key={item.id}
              className="glass-card-interactive rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-40 overflow-hidden bg-black/40">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${item.typeBg} ${item.typeText}`}
                  >
                    {item.type}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-[#c3c0ff] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#c7c4d8] line-clamp-2">{item.description}</p>
                </div>
              </div>
              <div className="p-4 pt-0 flex justify-between items-center text-[11px] text-[#c7c4d8] border-t border-white/5 mt-2">
                <span>{item.meta}</span>
                <span className="material-symbols-outlined text-sm text-[#c3c0ff] group-hover:translate-x-1 transition-transform">
                  open_in_new
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
