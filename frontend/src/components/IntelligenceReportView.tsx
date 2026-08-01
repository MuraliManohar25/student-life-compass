import React, { useState, useEffect } from "react";
import { NavTab } from "../types";
import { reportsApi } from "../services/api";

interface IntelligenceReportViewProps {
  setActiveTab: (tab: NavTab) => void;
}

export const IntelligenceReportView: React.FC<IntelligenceReportViewProps> = ({
  setActiveTab,
}) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      setError(null);
      try {
        const data = await reportsApi.getWeeklyReport();
        if (data) {
          setReport(data);
        } else {
          setError("Couldn't load your report — try again");
        }
      } catch (err) {
        console.warn("Weekly report API load error:", err);
        setError("Couldn't load your report — try again");
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl border border-white/10 text-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-[#c3c0ff] animate-spin">autorenew</span>
          <p className="text-sm text-[#e5e2e3]">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl border border-white/10 text-center space-y-4 max-w-md">
          <span className="material-symbols-outlined text-4xl text-amber-400">warning</span>
          <p className="text-sm text-[#e5e2e3]">{error || "Couldn't load your report — try again"}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#4f46e5] text-white text-xs font-bold rounded-xl hover:brightness-110"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header Card */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-[#4f46e5]/25 via-transparent to-transparent">
        <div className="flex items-center gap-4">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBNH8AOgbd8KxayE2MRjU3TS0KM23L-L2wIRqzprdkuWKTD8NGmO1QQY-84-ZF0v5zfL98kjQg463M81AUlaAwVef43hhVTak6HhxBmmX2dVPjxCfGEth8FlBoo5eKatL0-ABnQGpT0FeYtgtQ70jQhz2XIJL6at2kUKoIOnHf8TQaF3H6THXo4nVJgS8XXpv28uF5uUpqh1UpxuxUYrIcxfY-GS6QMNycydGCORBDX0SDMUhHR35l"
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover border-2 border-[#4f46e5] shadow-lg shadow-[#4f46e5]/30"
            referrerPolicy="no-referrer"
          />
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[#c3c0ff] uppercase">
              INTELLIGENCE REPORT // SEMESTER 02
            </p>
            <h1 className="font-headline font-black text-2xl sm:text-3xl text-white">
              Student Intelligence Score
            </h1>
            <p className="text-xs text-[#c7c4d8] mt-0.5">
              {report.student_name} • {report.major} • Calibrated Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            id="export-report-btn"
            onClick={() => {
              window.print();
            }}
            title="Save this report as a PDF"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Export as PDF</span>
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className="px-4 py-2 rounded-xl bg-[#4f46e5] text-white text-xs font-bold hover:brightness-110 transition-all"
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* Composite Score + Radar + Growth Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composite Score summary */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#c3c0ff] tracking-widest uppercase">
              OVERALL RATING
            </span>
            <div className="flex items-baseline gap-3 mt-2">
              <h2 className="font-headline font-black text-6xl text-white">{report.intelligence_score}%</h2>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                {report.score_change}
              </span>
            </div>
            <p className="text-xs text-[#c7c4d8] mt-3 leading-relaxed">
              You are currently performing better than <strong className="text-white">{report.cohort_ranking}</strong> in your academic track.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex justify-between text-xs">
              <span className="text-[#c7c4d8]">Academic Rigor</span>
              <span className="font-bold text-white">{report.academic_rigor}/100</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#c7c4d8]">Career Velocity</span>
              <span className="font-bold text-white">{report.career_velocity}/100</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#c7c4d8]">Financial Discipline</span>
              <span className="font-bold text-emerald-400">{report.financial_discipline}/100</span>
            </div>
          </div>
        </div>

        {/* 5-Axis Capability Matrix Radar Chart */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-headline font-bold text-lg text-white">Capability Matrix</h3>
            <span className="text-xs text-[#c7c4d8]">5 Dimensions</span>
          </div>

          <div className="relative w-full h-56 flex items-center justify-center">
            <svg className="w-56 h-56" viewBox="0 0 200 200">
              <polygon
                points="100,20 176,75 147,165 53,165 24,75"
                fill="rgba(79,70,229,0.2)"
                stroke="#4f46e5"
                strokeWidth="2"
              />
              <polygon
                points="100,35 160,80 135,150 65,150 40,80"
                fill="rgba(195,192,255,0.3)"
                stroke="#c3c0ff"
                strokeWidth="2"
              />
              <circle cx="100" cy="35" r="3" fill="#c3c0ff" />
              <circle cx="160" cy="80" r="3" fill="#c3c0ff" />
              <circle cx="135" cy="150" r="3" fill="#c3c0ff" />
              <circle cx="65" cy="150" r="3" fill="#c3c0ff" />
              <circle cx="40" cy="80" r="3" fill="#c3c0ff" />
            </svg>
            <span className="absolute top-1 text-[10px] font-bold text-white">Academics (88%)</span>
            <span className="absolute right-0 top-14 text-[10px] font-bold text-white">Career (84%)</span>
            <span className="absolute right-2 bottom-2 text-[10px] font-bold text-white">Placement (94%)</span>
            <span className="absolute left-2 bottom-2 text-[10px] font-bold text-white">Finance (79%)</span>
            <span className="absolute left-0 top-14 text-[10px] font-bold text-white">Lifestyle (68%)</span>
          </div>
        </div>

        {/* Growth Trend Bar Chart */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-headline font-bold text-lg text-white">Growth Trend (6 Months)</h3>
          <div className="h-44 flex items-end justify-between gap-2 pt-6">
            {[
              { m: "May", v: 68 },
              { m: "Jun", v: 72 },
              { m: "Jul", v: 75 },
              { m: "Aug", v: 78 },
              { m: "Sep", v: 80 },
              { m: "Oct", v: 82 },
            ].map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-[#c3c0ff] font-bold">{col.v}%</span>
                <div className="w-full bg-white/5 rounded-t h-32 flex items-end p-1">
                  <div
                    style={{ height: `${col.v}%` }}
                    className="w-full bg-gradient-to-t from-[#4f46e5] to-[#c3c0ff] rounded-t"
                  ></div>
                </div>
                <span className="text-[10px] text-[#c7c4d8]">{col.m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Detail Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-[#c3c0ff]">
            <span className="text-xs text-[#c7c4d8]">GPA Projection</span>
            <span className="material-symbols-outlined text-lg">school</span>
          </div>
          <p className="font-headline font-black text-2xl text-white">{report.metrics.gpa_projection}</p>
          <p className="text-[11px] text-emerald-400">Dean's Honor Roll</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-[#c3c0ff]">
            <span className="text-xs text-[#c7c4d8]">Placement Odds</span>
            <span className="material-symbols-outlined text-lg">work</span>
          </div>
          <p className="font-headline font-black text-2xl text-white">{report.metrics.placement_odds}</p>
          <p className="text-[11px] text-[#c3c3ff]">Matched with Tier-1 Tech</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-[#c3c0ff]">
            <span className="text-xs text-[#c7c4d8]">Monthly Runway</span>
            <span className="material-symbols-outlined text-lg">payments</span>
          </div>
          <p className="font-headline font-black text-2xl text-white">{report.metrics.monthly_runway}</p>
          <p className="text-[11px] text-emerald-400">₹1,640 Buffer</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-[#c3c0ff]">
            <span className="text-xs text-[#c7c4d8]">Sleep Quality</span>
            <span className="material-symbols-outlined text-lg">bedtime</span>
          </div>
          <p className="font-headline font-black text-2xl text-white">{report.metrics.sleep_quality}</p>
          <p className="text-[11px] text-amber-300">Needs +45m before exams</p>
        </div>
      </div>

      {/* AI Performance Breakdown */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4f46e5]/20 text-[#c3c0ff] flex items-center justify-center">
            <span className="material-symbols-outlined text-xl fill-1">auto_awesome</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-xl text-white">AI Diagnostic Synthesis</h3>
            <p className="text-xs text-[#c7c4d8]">Automated analysis based on 120+ data points this month.</p>
          </div>
        </div>

        <p className="text-sm text-[#e5e2e3] leading-relaxed">
          {report.ai_synthesis}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {report.actionable_tips.map((tip: any, idx: number) => (
            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <span className={`text-xs font-bold ${tip.color || 'text-[#c3c0ff]'}`}>⚡ {tip.type}</span>
              <p className="text-xs text-[#c7c4d8]">
                {tip.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
