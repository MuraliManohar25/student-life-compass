import React, { useState, useEffect } from "react";
import { NavTab, TimelineEvent } from "../types";
import { dashboardApi } from "../services/api";

interface HorizonEventsCardProps {
  events: TimelineEvent[];
  setActiveTab: (tab: NavTab) => void;
}

// Horizon Events Card: Renders upcoming monthly deadlines & events with a navigation link to full calendar.
export const HorizonEventsCard: React.FC<HorizonEventsCardProps> = ({ events, setActiveTab }) => {
  const [eventsData, setEventsData] = useState<TimelineEvent[]>(events);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await dashboardApi.getEvents();
        setEventsData(data.events || events);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="text-center text-[#c7c4d8] text-sm py-8">Loading events...</div>
      </div>
    );
  }
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between">
      {/* Header with Navigation Link */}
      <div className="flex justify-between items-center">
        <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[#c3c0ff]">event</span>
          <span>Horizon Events</span>
        </h3>
        <button
          onClick={() => setActiveTab("study-planner")}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[#c3c0ff] transition-all flex items-center gap-1"
        >
          <span>View Calendar</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
        {eventsData.map((evt) => (
          <div
            key={evt.id}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-xs text-white truncate">{evt.title}</h4>
              <p className="text-[11px] text-[#c7c4d8] truncate">{evt.location}</p>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                evt.badgeColor === "error"
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : evt.badgeColor === "primary"
                  ? "bg-[#4f46e5]/20 text-[#c3c0ff] border border-[#4f46e5]/30"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              }`}
            >
              {evt.dueText}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
