import React, { useState, useEffect } from "react";
import { studyApi } from "../services/api";

export const StudyPlannerView: React.FC = () => {
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [selectedDay, setSelectedDay] = useState("Today");

  const [timetable, setTimetable] = useState([
    { id: 1, time: "09:00 AM", title: "Operating Systems Lecture", room: "Hall 302", tag: "Lecture", status: "Done" },
    { id: 2, time: "11:30 AM", title: "DBMS Lab Assignment 4", room: "Lab B", tag: "Assignment", status: "In Progress" },
    { id: 3, time: "02:00 PM", title: "DSA Problem Solving (LeetCode)", room: "Library", tag: "Practice", status: "Upcoming" },
    { id: 4, time: "05:00 PM", title: "Docker Containerization Study", room: "Hostel Room", tag: "AI Mentor", status: "Upcoming" },
  ]);

  // Bug #4 fix — countdown effect
  useEffect(() => {
    if (!timerActive) return;
    const id = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 1) {
          clearInterval(id);
          setTimerActive(false);
          setTimerDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerActive]);

  useEffect(() => {
    async function loadSessions() {
      try {
        const data = await studyApi.getSessions();
        if (data && data.length > 0) {
          setTimetable(data.map((s: any) => ({
            id: s.id,
            time: s.scheduled_time,
            title: s.title,
            room: s.room,
            tag: s.tag,
            status: s.status
          })));
        }
      } catch (err) {
        console.warn("Study sessions fallback:", err);
      }
    }
    loadSessions();
  }, []);

  const handleStartSprint = () => {
    if (!timerActive && timerSeconds === 25 * 60) {
      // Only log a new sprint when starting fresh
      studyApi.logSprint(25).catch((err) => console.warn(err));
    }
    setTimerDone(false);
    setTimerActive(!timerActive);
  };


  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
            ADAPTIVE SCHEDULER
          </span>
          <h1 className="font-headline font-black text-2xl sm:text-3xl text-white">
            Adaptive Study Planner
          </h1>
          <p className="text-xs text-[#c7c4d8] mt-1">
            Dynamic calendar calibrated against assignment weightage and energy levels.
          </p>
        </div>

        <div className="flex gap-2">
          {["Today", "Tomorrow", "This Week"].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedDay === d
                  ? "bg-[#4f46e5] text-white"
                  : "bg-white/5 border border-white/10 text-[#c7c4d8] hover:text-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Focus Session Timer + Daily Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pomodoro Focus Timer */}
        <div className={`glass-card p-6 rounded-2xl border text-center space-y-6 flex flex-col justify-between transition-all duration-500 ${timerDone ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10"}`}>
          <div>
            <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-2 transition-colors ${timerDone ? "bg-emerald-500/20 text-emerald-400" : "bg-cyan-500/20 text-cyan-400"}`}>
              <span className="material-symbols-outlined text-xl">{timerDone ? "check_circle" : "timer"}</span>
            </div>
            <h3 className="font-headline font-bold text-lg text-white">Focus Sprint Timer</h3>
            <p className={`text-xs ${timerDone ? "text-emerald-400 font-semibold" : "text-[#c7c4d8]"}`}>
              {timerDone ? "🎉 Sprint Complete! Great work!" : "25 Min Deep Work Session"}
            </p>
          </div>

          <div className="my-4">
            <span className={`font-mono font-black text-5xl tracking-widest transition-colors ${timerDone ? "text-emerald-400" : timerActive ? "text-cyan-300" : "text-white"}`}>
              {Math.floor(timerSeconds / 60)
                .toString()
                .padStart(2, "0")}
              :
              {(timerSeconds % 60).toString().padStart(2, "0")}
            </span>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleStartSprint}
              className="px-6 py-2.5 rounded-xl bg-[#4f46e5] text-white font-bold text-xs hover:brightness-110 active:scale-95 transition-all"
            >
              {timerActive ? "Pause Sprint" : "Start Sprint"}
            </button>
            <button
              onClick={() => {
                setTimerActive(false);
                setTimerDone(false);
                setTimerSeconds(25 * 60);
              }}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#c7c4d8] hover:text-white"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Timetable Schedule */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 lg:col-span-2 space-y-4">
          <h3 className="font-headline font-bold text-lg text-white">Daily Calibrated Schedule</h3>

          <div className="space-y-3">
            {timetable.map((slot) => (
              <div
                key={slot.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-[#c3c0ff] font-bold w-20">{slot.time}</span>
                  <div>
                    <h4 className="font-bold text-xs text-white">{slot.title}</h4>
                    <p className="text-[11px] text-[#c7c4d8]">{slot.room}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-[#c7c4d8] border border-white/10">
                    {slot.tag}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      slot.status === "Done"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : slot.status === "In Progress"
                        ? "bg-[#4f46e5]/20 text-[#c3c0ff]"
                        : "bg-white/5 text-[#c7c4d8]"
                    }`}
                  >
                    {slot.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
