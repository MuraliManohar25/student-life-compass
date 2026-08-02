import React from "react";
import { DayScheduleSummary, StudyTask } from "../../services/studyPlannerEngine";

interface CalendarViewProps {
  weekSummaries: DayScheduleSummary[];
  onSelectTask: (task: StudyTask) => void;
  onAddTask: (dateIso: string) => void;
}

// Calendar View: Monthly/Weekly Calendar Grid View color-coding study tasks by priority
export const CalendarView: React.FC<CalendarViewProps> = ({
  weekSummaries,
  onSelectTask,
  onAddTask,
}) => {
  const getPriorityColor = (p: string) => {
    switch (p) {
      case "High":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      case "Medium":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "Low":
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    }
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6 bg-gradient-to-br from-[#1a1a2e]/70 via-[#16162a]/60 to-[#0f0f1b]/80 backdrop-blur-xl">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h2 className="font-headline font-bold text-xl text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400">calendar_month</span>
            <span>Weekly Calendar Grid View</span>
          </h2>
          <p className="text-xs text-[#c7c4d8] mt-0.5">
            Visual calendar layout color-coded by priority across all 7 days of the week
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#c3c0ff] font-semibold">
          7-Day Interactive Grid
        </span>
      </div>

      {/* 7-Day Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekSummaries.map((day) => (
          <div
            key={day.isoDate}
            className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
              day.isToday
                ? "bg-[#4f46e5]/10 border-[#4f46e5]/50 shadow-lg shadow-[#4f46e5]/10"
                : "bg-white/5 border-white/10 hover:border-white/20"
            }`}
          >
            {/* Header: Day Name & Date */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${day.isToday ? "text-[#c3c0ff]" : "text-[#c7c4d8]"}`}>
                  {day.dayName.slice(0, 3)}
                </span>
                <span className="text-xs font-headline font-bold text-white">
                  {day.dateStr.slice(0, 6)}
                </span>
              </div>

              <button
                onClick={() => onAddTask(day.isoDate)}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center text-xs font-bold"
                title="Add task to this date"
              >
                +
              </button>
            </div>

            {/* Task Chips */}
            <div className="space-y-1.5 min-h-[140px] overflow-y-auto max-h-[220px]">
              {day.tasks.length === 0 ? (
                <div className="text-[10px] text-[#c7c4d8] text-center pt-8 italic">No tasks</div>
              ) : (
                day.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className={`p-2 rounded-xl border text-[11px] cursor-pointer hover:brightness-125 transition-all space-y-0.5 ${getPriorityColor(
                      task.priority
                    )} ${task.status === "Completed" ? "opacity-60 line-through" : ""}`}
                  >
                    <div className="flex justify-between items-center gap-1 font-bold">
                      <span className="truncate">{task.title}</span>
                      <span className="text-[9px] opacity-80 shrink-0">{task.startTime}</span>
                    </div>
                    <span className="text-[9px] opacity-75 block">{task.subject}</span>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            <div className="pt-2 border-t border-white/10 flex justify-between text-[10px] text-[#c7c4d8]">
              <span>{day.tasks.length} Task(s)</span>
              <span className="font-bold text-white">{day.totalHours}h</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
