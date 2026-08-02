import React from "react";

export const ProgressTimelineCard: React.FC = () => {
  const milestones = [
    { week: "Week 1", title: "Completed Python Core & Async Basics", completed: true },
    { week: "Week 2", title: "Finished DBMS Lab Assignment 4", completed: true },
    { week: "Week 3", title: "Solved 40 DSA Problems on LeetCode", completed: true },
    { week: "Week 4", title: "Started Machine Learning & PyTorch", completed: false },
  ];

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[#c3c0ff]">route</span>
          <span>Student Progress Timeline</span>
        </h3>
        <span className="text-xs text-[#c7c4d8]">Weekly Milestones</span>
      </div>

      <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
        {milestones.map((item) => (
          <div key={item.week} className="flex items-center gap-4 relative z-10 pl-1">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                item.completed
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                  : "bg-[#4f46e5]/30 border border-[#4f46e5] text-[#c3c0ff]"
              }`}
            >
              {item.completed ? "✓" : "→"}
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex-1 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-[#c3c0ff] uppercase">{item.week}</span>
                <p className="text-xs font-semibold text-white mt-0.5">{item.title}</p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.completed
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-white/5 text-[#c7c4d8] border border-white/10"
                }`}
              >
                {item.completed ? "Achieved" : "In Progress"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
