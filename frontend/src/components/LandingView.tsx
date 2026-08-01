import React, { useState } from "react";
import { NavTab } from "../types";

interface LandingViewProps {
  onStart: () => void;
  setActiveTab: (tab: NavTab) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStart, setActiveTab }) => {
  const [demoOpen, setDemoOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Compass AI protect my student and grade data?",
      a: "All personal metrics, grade logs, and financial entries are encrypted client-side using zero-knowledge architecture. We never sell student data or train models on private coursework.",
    },
    {
      q: "Can I sync Compass AI with my university portal or Google Calendar?",
      a: "Yes. Compass AI supports direct integration with Canvas, Blackboard, Google Calendar, and Notion for automated assignment ingestion and study sync.",
    },
    {
      q: "What is included in the Student Beta access?",
      a: "Beta members receive unlimited access to the AI Career Mentor, Smart Budgeting Engine, Intelligence Score tracking, and early risk predictions for the entire academic term.",
    },
    {
      q: "How accurate is the Risk Prediction module?",
      a: "Our risk prediction algorithms cross-reference assignment difficulty, sleep patterns, and upcoming deadline density to predict academic overload with over 92% accuracy.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#131314] text-[#e5e2e3] font-['Inter',sans-serif] selection:bg-[#4f46e5]/30 selection:text-[#c3c0ff]">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#131314]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#c3c0ff] flex items-center justify-center text-white shadow-lg shadow-[#4f46e5]/30">
              <span className="material-symbols-outlined fill-1 text-2xl">explore</span>
            </div>
            <span className="font-headline font-black text-2xl tracking-tight text-[#e5e2e3]">
              Compass AI
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-[#c7c4d8] hover:text-[#c3c0ff] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-[#c7c4d8] hover:text-[#c3c0ff] transition-colors">
              How it Works
            </a>
            <a href="#testimonials" className="text-sm font-medium text-[#c7c4d8] hover:text-[#c3c0ff] transition-colors">
              Testimonials
            </a>
            <a href="#faq" className="text-sm font-medium text-[#c7c4d8] hover:text-[#c3c0ff] transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={onStart}
              className="text-sm font-medium text-[#c7c4d8] hover:text-white transition-colors hidden sm:block"
            >
              Sign In
            </button>
            <button
              onClick={onStart}
              className="px-5 py-2.5 rounded-full bg-[#4f46e5] text-[#dad7ff] font-headline font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#4f46e5]/30 flex items-center gap-2"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 max-w-7xl mx-auto relative">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#c3c0ff] font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#4f46e5] animate-ping"></span>
            NOW IN PRIVATE BETA FOR UNIVERSITY STUDENTS
          </div>

          <h1 className="font-headline font-black text-4xl sm:text-6xl md:text-7xl tracking-tight leading-[1.1]">
            Engineering Your Academic Excellence with{" "}
            <span className="text-gradient-primary text-glow-indigo">AI</span>
          </h1>

          <p className="text-base sm:text-lg text-[#c7c4d8] max-w-2xl mx-auto leading-relaxed">
            The high-performance OS for the modern student. Master your budget, visualize your career path, and predict academic risks before they happen.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onStart}
              className="px-8 py-4 rounded-full bg-[#4f46e5] text-white font-headline font-bold text-base hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-[#4f46e5]/40 flex items-center gap-2"
            >
              <span>Start Your Journey</span>
              <span className="material-symbols-outlined text-lg">bolt</span>
            </button>
            <button
              onClick={() => setDemoOpen(true)}
              className="px-8 py-4 rounded-full glass-card hover:bg-white/10 text-white font-headline font-semibold text-base transition-all flex items-center gap-2 border border-white/15"
            >
              <span className="material-symbols-outlined text-lg fill-1 text-[#c3c0ff]">play_circle</span>
              <span>Watch Demo</span>
            </button>
          </div>
        </div>

        {/* Hero Preview Card Window */}
        <div className="mt-16 relative max-w-5xl mx-auto">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#4f46e5]/30 to-[#c3c0ff]/20 blur-2xl opacity-60"></div>
          <div className="relative glass-card rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
            {/* Window bar */}
            <div className="h-10 px-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="text-[11px] font-mono text-[#c7c4d8]/70">compass-ai-dashboard-v2.4</div>
              <div className="w-12"></div>
            </div>

            {/* Mockup Banner Image */}
            <div className="relative group cursor-pointer" onClick={onStart}>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqDQPes3LZSLc_eQa6Ne_Qte35xYNTGama_h94bowfvZ_vdyKDtkiPUCCByJw6XqPdDnDYGdz8jmxfBnhpbaa8ec7jOJgIwb9iGvOWCrn9EveAN1uEx5DOK5j0C9J7GHUEB0lhqSbSZWzH3F910mOxTVkPRfmKV9z7i6fpBbYCbNtdf4VY_QXzG4eiLIins-OObZfGNvnARQgDzZ37Cj2PrOKEQSdn5DPEWNoM4JCz5186wPITDbU_"
                alt="Compass AI Dashboard Preview"
                className="w-full h-auto object-cover max-h-[520px] transition-transform duration-700 group-hover:scale-[1.01]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-transparent to-transparent opacity-60"></div>
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="bg-[#131314]/80 backdrop-blur-md p-4 rounded-xl border border-white/10">
                  <p className="text-xs font-semibold text-[#c3c0ff]">Murali K. • Stanford CS '26</p>
                  <p className="text-sm font-bold text-white">Student Intelligence Index: 84% (Top 15%)</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStart();
                  }}
                  className="px-4 py-2 bg-[#4f46e5] text-white text-xs font-bold rounded-lg hover:brightness-110"
                >
                  Launch App Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="font-headline font-bold text-3xl sm:text-4xl text-[#e5e2e3]">
            Architected for Modern Student Life
          </h2>
          <p className="text-sm sm:text-base text-[#c7c4d8]">
            Four core engines working synchronously to optimize your academic trajectory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: AI Career Mentor */}
          <div
            onClick={() => {
              setActiveTab("career-mentor");
            }}
            className="glass-card-interactive rounded-2xl p-6 border border-white/10 lg:col-span-2 cursor-pointer group flex flex-col justify-between min-h-[360px]"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#4f46e5]/20 border border-[#4f46e5]/40 flex items-center justify-center text-[#c3c0ff] mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl fill-1">psychology</span>
              </div>
              <h3 className="font-headline font-bold text-2xl text-white mb-2">AI Career Mentor</h3>
              <p className="text-sm text-[#c7c4d8] max-w-md mb-6">
                Dynamically maps your coursework to high-paying job profiles. Analyzes skill gaps in Python, ML, Docker, and recommends high-yield certifications.
              </p>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40 h-48">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnLtrFL8DTRSrNjXTtgskg87mKoHWO9wqiTcMY4RKNghV3aZOehQuy1JzuxmmuixSe1WfRan6XG8Eywnr3iW_58yF__xw7wIHeK5plxTLv2bp5yHmuXQOEPhbMNIG4t2756Ndvwci-1hyxOPKn3C5aNVMSZvv7TPzqmLwD_knQlyObTjOQjYxQ7eDudSxuUYkJzxZFHiV4B3fwO_Z6Knx3jzT0IzrQNK5Sql7Gdjjnujqvp1pAZwwf"
                alt="AI Career Mentor Skill Radar"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Card 2: Smart Budgeting */}
          <div
            onClick={() => setActiveTab("budget")}
            className="glass-card-interactive rounded-2xl p-6 border border-white/10 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">payments</span>
              </div>
              <h3 className="font-headline font-bold text-xl text-white mb-2">Smart Budgeting</h3>
              <p className="text-xs text-[#c7c4d8] mb-6">
                Automated student runway calculator and daily spending caps tailored for hostel living.
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-[#c7c4d8]">March Savings Goal</span>
                <span className="font-bold text-emerald-400">82% On Track</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full w-[82%]"></div>
              </div>
              <p className="text-[11px] text-[#c7c4d8]/80 text-right">₹1,640 remaining for 22 days</p>
            </div>
          </div>

          {/* Card 3: Risk Prediction */}
          <div
            onClick={() => setActiveTab("risk-prediction")}
            className="glass-card-interactive rounded-2xl p-6 border border-white/10 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-white mb-2">Early Risk Alert</h3>
            <p className="text-xs text-[#c7c4d8] mb-4">
              Detects deadline clustering and sleep deficits before they impact your semester GPA.
            </p>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>2 Major Submissions in next 48 hrs. Rest recommended.</span>
            </div>
          </div>

          {/* Card 4: Adaptive Study Planner */}
          <div
            onClick={() => setActiveTab("study-planner")}
            className="glass-card-interactive rounded-2xl p-6 border border-white/10 lg:col-span-2 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">event_note</span>
              </div>
              <h3 className="font-headline font-bold text-xl text-white mb-2">Adaptive Study Planner</h3>
              <p className="text-xs text-[#c7c4d8] mb-4">
                Dynamic calendar that recalibrates based on assignment weightage and personal energy cycles.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                <p className="text-[10px] text-[#c7c4d8]">09:00 AM</p>
                <p className="font-bold text-white mt-1">OS Lab</p>
              </div>
              <div className="bg-[#4f46e5]/20 p-3 rounded-lg border border-[#4f46e5]/40 text-center">
                <p className="text-[10px] text-[#c3c0ff]">02:00 PM</p>
                <p className="font-bold text-white mt-1">DSA Prep</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                <p className="text-[10px] text-[#c7c4d8]">06:00 PM</p>
                <p className="font-bold text-white mt-1">AI Mentor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="font-headline font-bold text-3xl sm:text-4xl text-[#e5e2e3]">
            How Compass AI Transforms Your Term
          </h2>
          <p className="text-sm sm:text-base text-[#c7c4d8]">
            Three steps to automated academic mastery and career trajectory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-2xl border border-white/10 space-y-4 relative">
            <span className="font-headline font-black text-5xl text-white/10">01</span>
            <h3 className="font-headline font-bold text-xl text-white">Connect Profiles</h3>
            <p className="text-xs text-[#c7c4d8] leading-relaxed">
              Link your university LMS, budget categories, and target career interests in 2 minutes.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-white/10 space-y-4 relative">
            <span className="font-headline font-black text-5xl text-[#4f46e5]/30">02</span>
            <h3 className="font-headline font-bold text-xl text-white">AI Personalization</h3>
            <p className="text-xs text-[#c7c4d8] leading-relaxed">
              Gemini algorithms compute your Intelligence Index, skill gaps, and budget runway.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-white/10 space-y-4 relative">
            <span className="font-headline font-black text-5xl text-[#c3c0ff]/30">03</span>
            <h3 className="font-headline font-bold text-xl text-white">Daily Calibration</h3>
            <p className="text-xs text-[#c7c4d8] leading-relaxed">
              Receive tailored morning missions, real-time risk alerts, and curated high-yield learning content.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="font-headline font-bold text-3xl sm:text-4xl text-[#e5e2e3]">
            Trusted by High-Achieving Students
          </h2>
          <p className="text-sm text-[#c7c4d8]">
            Hear from students using Compass AI to dominate their semesters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-2xl border border-white/10 space-y-6">
            <p className="text-sm text-[#e5e2e3] italic leading-relaxed">
              "Compass AI completely removed my exam burnout. The risk prediction module warned me 3 days before my midterms that my DBMS and OS assignments were overlapping dangerously."
            </p>
            <div className="flex items-center gap-4">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoQNO7RnaEEfBWV_B4vD0988xxwUnyvTQ1guDcmjFBVmYTtvxPCefdsx0BkMooWQk4UCuo2UTTcHMoLBbvBFTuR2eTFVqWpNboqbHkM83HDifx1WqRFeIMvy3jPpQRcqNZS7ejyetZXFShJAeW8zuuD2LbSoyHrcw_6ZiSUkcBkB220u5bQVtCNslAz0_mGW_5VcTgh0WRZthTvaqWHvYPbOVCeYei6OeJ10xBuB3m2HiCRwVIVG4c"
                alt="Sarah Jenkins"
                className="w-12 h-12 rounded-full object-cover border border-[#4f46e5]"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="font-bold text-sm text-white">Sarah Jenkins</h4>
                <p className="text-xs text-[#c7c4d8]">CS Senior • Stanford University</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-white/10 space-y-6">
            <p className="text-sm text-[#e5e2e3] italic leading-relaxed">
              "The AI Career Mentor mapped out my exact gaps for AI Engineering internships. I picked up Docker and PyTorch optimization in 3 weeks and landed my Stripe offer."
            </p>
            <div className="flex items-center gap-4">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2fEYvOpl-M7swtxVOMMvU-IgX9RcY4BldteKQWBoaBl-uoPiAXLwWkWlnKRvVis7mDukgf7N9EfNxUFc03j-DMJVASw-eQzLcFEPv7Er7QTFHcrODq9UbWapT1aCrZIT8TqCIhzGpkiGvQNexgQWn6LfvnezxshGq9R_XBt5VCLjAYIMaHceR1NTMLhogZgJ4D70nHASiM9EzDoogeLFUxE192pB46Thi_1eCoUhkZWV7wvLbQVu3"
                alt="David Chen"
                className="w-12 h-12 rounded-full object-cover border border-[#c3c0ff]"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="font-bold text-sm text-white">David Chen</h4>
                <p className="text-xs text-[#c7c4d8]">Finance & ML • NYU</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto border-t border-white/10">
        <div className="text-center mb-12 space-y-3">
          <h2 className="font-headline font-bold text-3xl text-[#e5e2e3]">Frequently Asked Questions</h2>
          <p className="text-xs text-[#c7c4d8]">Everything you need to know about Compass AI.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="glass-card rounded-xl border border-white/10 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-white/5 transition-colors"
              >
                <span className="font-headline font-semibold text-sm text-white">{faq.q}</span>
                <span className="material-symbols-outlined text-lg text-[#c3c0ff]">
                  {openFaq === idx ? "remove" : "add"}
                </span>
              </button>
              {openFaq === idx && (
                <div className="p-5 pt-0 text-xs text-[#c7c4d8] leading-relaxed border-t border-white/5">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <div className="glass-card p-12 rounded-3xl border border-[#4f46e5]/30 bg-gradient-to-b from-[#4f46e5]/20 to-transparent space-y-6">
          <h2 className="font-headline font-black text-3xl sm:text-5xl text-white">
            Ready to Take Control of Your Academic Journey?
          </h2>
          <p className="text-sm sm:text-base text-[#c7c4d8] max-w-xl mx-auto">
            Join thousands of university students optimizing their grades, skills, and savings.
          </p>
          <button
            onClick={onStart}
            className="px-8 py-4 rounded-full bg-[#4f46e5] text-white font-headline font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-[#4f46e5]/40 inline-flex items-center gap-2"
          >
            <span>Launch Student OS</span>
            <span className="material-symbols-outlined text-base">rocket_launch</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-xs text-[#c7c4d8]/60">
        <p>© 2026 Compass AI. Engineered for Student Excellence.</p>
      </footer>

      {/* Demo Video Popup Modal */}
      {demoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-3xl glass-card rounded-2xl border border-white/20 overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="font-headline font-bold text-lg text-white">Compass AI Workflow Demo</h3>
              <button
                onClick={() => setDemoOpen(false)}
                className="text-[#c7c4d8] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="aspect-video bg-black/60 rounded-xl border border-white/10 flex flex-col items-center justify-center p-6 text-center">
              <span className="material-symbols-outlined text-6xl text-[#c3c0ff] animate-pulse mb-3">
                play_circle
              </span>
              <p className="font-headline font-semibold text-white text-base">Interactive Applet Running</p>
              <p className="text-xs text-[#c7c4d8] mt-1 max-w-md">
                Click "Start Your Journey" or switch tabs in the top-left to interact with live AI metrics, Career Mentor radar, and Budget Tracker.
              </p>
              <button
                onClick={() => {
                  setDemoOpen(false);
                  onStart();
                }}
                className="mt-6 px-6 py-2.5 bg-[#4f46e5] text-white text-xs font-bold rounded-full hover:brightness-110"
              >
                Enter Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
