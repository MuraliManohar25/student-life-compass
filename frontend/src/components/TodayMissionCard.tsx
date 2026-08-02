import React, { useState } from "react";
import { Task } from "../services/taskEngine";

interface TodayMissionCardProps {
  tasks: Task[];
  toggleTask: (id: string) => void;
  addTask: (title: string) => void;
  onOpenStudyPlanner?: () => void;
  onOpenAskAi?: () => void;
}

export const TodayMissionCard: React.FC<TodayMissionCardProps> = ({
  tasks,
  toggleTask,
  addTask,
  onOpenStudyPlanner,
  onOpenAskAi,
}) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle);
    setNewTaskTitle("");
    setShowAddTask(false);
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#c3c0ff]">task_alt</span>
          <h3 className="font-headline font-bold text-lg text-white">Today's Mission</h3>
        </div>
        <div className="flex items-center gap-2">
          {tasks.length > 0 && (
            <span className="text-xs text-[#c7c4d8]">{completedCount}/{tasks.length} Done</span>
          )}
          <button onClick={() => setShowAddTask(!showAddTask)} className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#c3c0ff]">
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>
      </div>
      {showAddTask && (
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="New daily task..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
          />
          <button type="submit" className="px-3 py-1.5 bg-[#4f46e5] text-white text-xs font-bold rounded-lg hover:brightness-110">
            Add
          </button>
        </form>
      )}
      {tasks.length === 0 ? (
        <div className="py-6 text-center space-y-3">
          <p className="text-xs text-[#c7c4d8]">No tasks scheduled for today.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setShowAddTask(true)}
              className="px-3 py-1.5 rounded-lg bg-[#4f46e5] text-white text-xs font-bold hover:brightness-110"
            >
              Create Task
            </button>
            {onOpenAskAi && (
              <button
                onClick={onOpenAskAi}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#c3c0ff] text-xs font-bold hover:bg-white/10"
              >
                Generate AI Study Plan
              </button>
            )}
            {onOpenStudyPlanner && (
              <button
                onClick={onOpenStudyPlanner}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#c3c0ff] text-xs font-bold hover:bg-white/10"
              >
                Open Study Planner
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {tasks.map((t) => (
            <div
              key={t.id}
              onClick={() => toggleTask(t.id)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                t.completed ? "bg-white/[0.02] border-white/5 text-[#c7c4d8]/60 line-through" : "bg-white/5 border-white/10 text-white"
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${t.completed ? "bg-[#4f46e5] border-[#4f46e5] text-white" : "border-white/30"}`}>
                  {t.completed && <span className="material-symbols-outlined text-[10px]">check</span>}
                </div>
                <span className="truncate">{t.title}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
