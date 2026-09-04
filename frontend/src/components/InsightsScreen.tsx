import React, { useState, useEffect, useRef } from 'react';

interface InsightsScreenProps {
  onOpenStudyGuide: () => void;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({ onOpenStudyGuide }) => {
  const [activeSegment, setActiveSegment] = useState<'performance' | 'risk'>('performance');
  const [appliedRiskAction, setAppliedRiskAction] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleApplyRisk = (riskId: string, desc: string) => {
    setAppliedRiskAction(desc);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAppliedRiskAction(null), 3000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 space-y-6 max-w-[1400px] mx-auto pb-6 pt-1 lg:pt-2">
      {/* Segmented Control */}
      <div className="w-full bg-gray-100 p-1 rounded-xl flex border border-gray-200">
        <button
          onClick={() => setActiveSegment('performance')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSegment === 'performance'
              ? 'bg-white text-indigo-700 shadow-xs border border-gray-200'
              : 'text-gray-500 hover:text-[#1a1a1a]'
          }`}
          type="button"
        >
          Performance Metrics
        </button>
        <button
          onClick={() => setActiveSegment('risk')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSegment === 'risk'
              ? 'bg-white text-indigo-700 shadow-xs border border-gray-200'
              : 'text-gray-500 hover:text-[#1a1a1a]'
          }`}
          type="button"
        >
          <span>Predictive Risk</span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        </button>
      </div>

      {/* OVERALL STUDENT INDEX RADIAL CARD */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-xs p-6 border border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Good Standing</span>
            </div>
            <h2 className="text-xl font-semibold text-[#1a1a1a] tracking-tight pt-0.5">
              Student Wellness & Index
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Top <strong className="text-[#1a1a1a]">12%</strong> in CS cohort • Consistent weekly rhythm
            </p>
          </div>

          {/* Radial Gauge */}
          <div className="relative flex-shrink-0 w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="text-indigo-600"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray="84, 100"
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-light text-[#1a1a1a]">84</span>
              <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                / 100
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 text-center">
          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Study Rhythm</span>
            <span className="text-xs font-semibold text-indigo-600">92% Met</span>
          </div>
          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Budget Safety</span>
            <span className="text-xs font-semibold text-emerald-600">Healthy</span>
          </div>
          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Active Alerts</span>
            <span className="text-xs font-semibold text-rose-600">1 Action</span>
          </div>
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      {appliedRiskAction && (
        <div className="p-3 rounded-2xl bg-tertiary text-on-tertiary text-[12px] font-medium flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <span className="material-symbols-outlined text-[18px]">task_alt</span>
          <span>{appliedRiskAction}</span>
        </div>
      )}

      {/* TAB CONTENT: PERFORMANCE */}
      {activeSegment === 'performance' && (
        <div className="space-y-4">
          {/* GPA Progression Curve */}
          <div className="bg-white rounded-2xl p-6 shadow-xs space-y-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Academic Trajectory
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <h3 className="text-3xl font-light text-[#1a1a1a] tracking-tight">3.82</h3>
                  <span className="text-xs text-gray-400 font-normal">/ 4.00 CGPA</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                Dean's List
              </span>
            </div>

            {/* SVG Trend Line Chart */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>Semester 1 to 6 Progression</span>
                <span className="font-semibold text-indigo-600">+0.37 Overall Growth</span>
              </div>

              <div className="h-28 w-full relative pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80">
                  {/* Grid lines */}
                  <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeDasharray="4 4" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeDasharray="4 4" />

                  {/* Gradient fill */}
                  <defs>
                    <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M 10 65 Q 60 55, 110 45 T 210 25 T 290 12 L 290 80 L 10 80 Z"
                    fill="url(#gpaGradient)"
                  />
                  <path
                    d="M 10 65 Q 60 55, 110 45 T 210 25 T 290 12"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Dots with values */}
                  <circle cx="10" cy="65" r="3.5" fill="#4f46e5" />
                  <circle cx="65" cy="54" r="3.5" fill="#4f46e5" />
                  <circle cx="120" cy="43" r="3.5" fill="#4f46e5" />
                  <circle cx="175" cy="32" r="3.5" fill="#4f46e5" />
                  <circle cx="230" cy="22" r="3.5" fill="#4f46e5" />
                  <circle cx="290" cy="12" r="4.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </div>

              <div className="flex justify-between text-[10px] text-gray-400 pt-1 font-semibold uppercase tracking-wider">
                <span>Sem 1 (3.45)</span>
                <span>Sem 2</span>
                <span>Sem 3</span>
                <span>Sem 4</span>
                <span>Sem 5</span>
                <span className="text-indigo-600 font-bold">Sem 6 (3.82)</span>
              </div>
            </div>
          </div>

          {/* Key Velocity Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm space-y-2 border border-outline-variant/15">
              <span className="material-symbols-outlined text-primary text-[20px]">timer</span>
              <div>
                <span className="text-[11px] text-on-surface-variant block font-medium">Study Hours Met</span>
                <span className="text-[18px] font-bold text-on-surface">92%</span>
              </div>
              <p className="text-[11px] text-on-surface-variant">Avg 4.2 hrs/day • Target: 4.5h</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm space-y-2 border border-outline-variant/15">
              <span className="material-symbols-outlined text-secondary text-[20px]">task_alt</span>
              <div>
                <span className="text-[11px] text-on-surface-variant block font-medium">On-Time Deliveries</span>
                <span className="text-[18px] font-bold text-on-surface">88%</span>
              </div>
              <p className="text-[11px] text-on-surface-variant">22 of 25 milestones met</p>
            </div>
          </div>

          {/* Career Readiness Skill Matrix */}
          <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm space-y-3 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-on-surface">SWE Readiness Breakdown</h3>
              <span className="text-[12px] font-bold text-secondary">76% Overall</span>
            </div>

            <div className="space-y-2.5">
              <div className="space-y-1">
                <div className="flex justify-between text-[12px]">
                  <span className="text-on-surface font-medium">System Design & Databases</span>
                  <span className="font-bold text-primary">85%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[12px]">
                  <span className="text-on-surface font-medium">Cloud Fundamentals & Docker</span>
                  <span className="font-bold text-secondary">70%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[12px]">
                  <span className="text-on-surface font-medium">Distributed Systems & Concurrency</span>
                  <span className="font-bold text-outline">62%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-tertiary-fixed-dim rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PREDICTIVE RISK ANALYSIS */}
      {activeSegment === 'risk' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-0.5">
            <div>
              <h3 className="text-[17px] font-bold text-on-surface">Active Proactive Monitors</h3>
              <p className="text-[12px] text-on-surface-variant">
                Early warnings before academic or financial stress triggers
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-error-container text-on-error-container">
              3 Monitors
            </span>
          </div>

          {/* Risk 1: High/Moderate Academic Deadline */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-3 border-l-4 border-l-error border border-outline-variant/15">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold">
                    Moderate Risk
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    Due in 24 Hours
                  </span>
                </div>
                <h4 className="text-[15px] font-bold text-on-surface">
                  CS-304 Normalization Assignment
                </h4>
              </div>
              <span className="material-symbols-outlined text-error text-[22px]">warning</span>
            </div>

            <p className="text-[12px] text-on-surface-variant leading-relaxed">
              Observed pattern: Laboratory submission velocity is 30% below your usual cadence for database
              units. Unfinished submissions impact 15% course weight.
            </p>

            <div className="p-2.5 rounded-xl bg-surface-container-low text-[11px] text-on-surface flex items-center justify-between">
              <span>Recommendation: Block 2h study block tonight</span>
              <button
                onClick={() =>
                  handleApplyRisk('r-1', 'Added 2h DBMS study block tonight at 7:00 PM in Odegaard Library!')
                }
                className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-bold cursor-pointer hover:bg-primary-container"
                type="button"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Risk 2: Financial Pacing Month-End */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-3 border-l-4 border-l-tertiary-fixed-dim border border-outline-variant/15">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">
                    Low Risk
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-medium">9 Days Left</span>
                </div>
                <h4 className="text-[15px] font-bold text-on-surface">Month-End Allowance Pacing</h4>
              </div>
              <span className="material-symbols-outlined text-tertiary text-[22px]">check_circle</span>
            </div>

            <p className="text-[12px] text-on-surface-variant leading-relaxed">
              Your safe limit is currently ₹277/day. If Friday evening dinner exceeds ₹450, safe margin
              drops by 18%.
            </p>

            <div className="p-2.5 rounded-xl bg-surface-container-low text-[11px] text-on-surface flex items-center justify-between">
              <span>Campus cafeteria lunch saves ₹140</span>
              <button
                onClick={() =>
                  handleApplyRisk('r-2', 'Set daily spending reminder cap at ₹250 for Friday!')
                }
                className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold cursor-pointer"
                type="button"
              >
                Set Cap
              </button>
            </div>
          </div>

          {/* Risk 3: Career Mock Interview */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-3 border-l-4 border-l-secondary border border-outline-variant/15">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                    On Track
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-medium">Next Friday</span>
                </div>
                <h4 className="text-[15px] font-bold text-on-surface">
                  Technical Mock Interview: System Design
                </h4>
              </div>
              <span className="material-symbols-outlined text-secondary text-[22px]">rocket_launch</span>
            </div>

            <p className="text-[12px] text-on-surface-variant leading-relaxed">
              Matched with senior alumni mentor. Review B-Tree and Database Indexing topics beforehand to
              maximize assessment score.
            </p>

            <div className="pt-1 flex gap-2">
              <button
                onClick={onOpenStudyGuide}
                className="flex-1 py-2 rounded-xl bg-secondary text-on-secondary text-[12px] font-semibold cursor-pointer hover:opacity-90"
                type="button"
              >
                Review BCNF & Indexing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
