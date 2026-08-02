import React from "react";
import { NavTab } from "../types";

interface LandingViewProps {
  onStart: () => void;
  setActiveTab: (tab: NavTab) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStart }) => {
  const features = [
    {
      icon: "event_note",
      title: "Study Planner",
      description: "Plan your day intelligently.",
      iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
    {
      icon: "payments",
      title: "Smart Budget Predictor",
      description: "Track expenses and predict spending.",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      icon: "smart_toy",
      title: "AI Student Assistant",
      description: "Personalized guidance using your own data.",
      iconBg: "bg-[#4f46e5]/10 text-[#c3c0ff] border-[#4f46e5]/20",
    },
    {
      icon: "insights",
      title: "AI Performance Report",
      description: "Track your real academic progress.",
      iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    {
      icon: "explore",
      title: "Nearby Places",
      description: "Find affordable student-friendly places nearby.",
      iconBg: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    },
    {
      icon: "warning",
      title: "Student Risk Predictor",
      description: "Identify academic, financial, and placement risks early.",
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#131314] text-[#e5e2e3] font-['Inter',sans-serif] selection:bg-[#4f46e5]/30 selection:text-[#c3c0ff]">
      {/* 1. TOP NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#131314]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#c3c0ff] flex items-center justify-center text-white shadow-lg shadow-[#4f46e5]/25">
              <span className="material-symbols-outlined fill-1 text-xl">explore</span>
            </div>
            <span className="font-headline font-extrabold text-xl tracking-tight text-[#e5e2e3]">
              Student Life Compass
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={onStart}
              className="text-sm font-semibold text-[#c7c4d8] hover:text-white transition-colors px-4 py-2 rounded-xl"
            >
              Login
            </button>
            <button
              onClick={onStart}
              className="px-5 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white font-headline font-semibold text-sm transition-all shadow-lg shadow-[#4f46e5]/25 active:scale-95 flex items-center gap-2"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-32 md:pt-40 pb-20 md:pb-28 px-6 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#c3c0ff] font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#4f46e5] animate-ping" />
              <span>Student Life Compass</span>
            </div>

            <h1 className="font-headline font-black text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] text-white">
              Student Life Compass
            </h1>

            <p className="font-headline font-bold text-xl sm:text-2xl text-[#c3c0ff]">
              Your AI-powered Student Operating System
            </p>

            <p className="text-sm sm:text-base text-[#c7c4d8] leading-relaxed max-w-lg">
              Manage academics, finances, career planning, productivity, and daily student life from one intelligent platform.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onStart}
                className="px-7 py-3.5 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white font-headline font-bold text-sm transition-all shadow-xl shadow-[#4f46e5]/30 flex items-center gap-2 active:scale-95"
              >
                <span>Get Started</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
              <button
                onClick={onStart}
                className="px-7 py-3.5 rounded-xl glass-card hover:bg-white/10 text-white font-headline font-semibold text-sm transition-all border border-white/15"
              >
                Login
              </button>
            </div>
          </div>

          {/* Right Column: Clean Product Preview Window */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#4f46e5]/20 to-[#c3c0ff]/15 blur-3xl opacity-70 pointer-events-none" />
            <div className="relative glass-card rounded-2xl border border-white/15 overflow-hidden shadow-2xl bg-[#161626]/90">
              {/* Window Header Bar */}
              <div className="h-10 px-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono text-[#c7c4d8]/70">student-life-compass</span>
                <div className="w-12" />
              </div>

              {/* Minimal Clean UI Representation */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#c3c0ff]">PERFORMANCE SCORE</span>
                    <p className="font-headline font-black text-2xl text-white">84% Optimal</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    +6% Growth
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-[#c7c4d8] uppercase">Study Schedule</span>
                    <p className="text-xs font-bold text-white">DBMS Lab • 2 hrs</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-[#c7c4d8] uppercase">Budget Runway</span>
                    <p className="text-xs font-bold text-emerald-400">₹5,000 Safe</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#4f46e5]/10 border border-[#4f46e5]/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#c3c0ff] text-base">auto_awesome</span>
                    <span className="text-white font-medium">AI Early Risk Alert: Low</span>
                  </div>
                  <span className="text-[#c3c0ff] font-bold">Optimal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section className="py-20 md:py-28 px-6 max-w-[1200px] mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            One platform. Every aspect of student life.
          </h2>
          <p className="text-sm sm:text-base text-[#c7c4d8]">
            Built with dedicated intelligent tools to streamline daily university productivity.
          </p>
        </div>

        {/* Exactly 6 Clean Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, index) => (
            <div
              key={index}
              className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all space-y-4 group bg-gradient-to-br from-white/[0.03] to-transparent"
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${feat.iconBg} group-hover:scale-105 transition-transform`}>
                <span className="material-symbols-outlined text-2xl">{feat.icon}</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-headline font-bold text-lg text-white group-hover:text-[#c3c0ff] transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#c7c4d8] leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TAGLINE SECTION */}
      <section className="py-24 md:py-32 px-6 max-w-[1200px] mx-auto text-center border-t border-white/10">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="font-headline font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Everything a student needs.
          </h2>
          <h2 className="font-headline font-black text-3xl sm:text-5xl text-[#c3c0ff] tracking-tight leading-tight">
            Nothing they don't.
          </h2>
          <div className="pt-6">
            <button
              onClick={onStart}
              className="px-8 py-4 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white font-headline font-bold text-sm transition-all shadow-xl shadow-[#4f46e5]/30 inline-flex items-center gap-2 active:scale-95"
            >
              <span>Get Started Now</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
