import React, { useState } from "react";
import { StudyTask } from "../../services/studyPlannerEngine";

interface TaskEditModalProps {
  isOpen: boolean;
  task?: StudyTask | null;
  defaultDate?: string;
  onClose: () => void;
  onSave: (taskData: Omit<StudyTask, "id"> | StudyTask) => void;
}

// Add/Edit Task Modal with full editing fields
export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  isOpen,
  task,
  defaultDate,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(task?.title || "");
  const [subject, setSubject] = useState(task?.subject || "Computer Science");
  const [description, setDescription] = useState(task?.description || "");
  const [date, setDate] = useState(task?.date || defaultDate || new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState(task?.startTime || "07:00 PM");
  const [endTime, setEndTime] = useState(task?.endTime || "08:00 PM");
  const [duration, setDuration] = useState(task?.duration || "1 hour");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">(task?.priority || "Medium");
  const [category, setCategory] = useState<"Assignment" | "Class" | "Practice" | "Study" | "Revision" | "Personal">(
    task?.category || "Study"
  );
  const [isRecurring, setIsRecurring] = useState(task?.isRecurring || false);
  const [recurringFrequency, setRecurringFrequency] = useState<"None" | "Daily" | "Weekly">(
    task?.recurringFrequency || "None"
  );
  const [reminder, setReminder] = useState<"None" | "15 mins before" | "30 mins before" | "1 hour before" | "Custom">(
    task?.reminder || "15 mins before"
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title,
      subject,
      description,
      date,
      startTime,
      endTime,
      duration,
      priority,
      category,
      status: task?.status || ("Pending" as const),
      isRecurring,
      recurringFrequency,
      reminder,
      createdBy: task?.createdBy || ("User" as const),
      completedAt: task?.completedAt || null,
      rolledOverFrom: task?.rolledOverFrom || null,
    };

    if (task) {
      onSave({ ...payload, id: task.id });
    } else {
      onSave(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/20 max-w-xl w-full bg-[#161626]/95 text-white space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <h2 className="font-headline font-bold text-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c3c0ff]">edit_calendar</span>
            <span>{task ? "Edit Study Task" : "Add New Study Task"}</span>
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-[#c7c4d8] hover:text-white hover:bg-white/10">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DBMS Assignment 4"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4f46e5]"
            />
          </div>

          {/* Subject & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Operating Systems"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4f46e5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#1f1f33] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4f46e5]"
              >
                <option value="Assignment">Assignment</option>
                <option value="Class">Class / Lecture</option>
                <option value="Practice">Practice / DSA</option>
                <option value="Study">Study / Project</option>
                <option value="Revision">Revision</option>
                <option value="Personal">Personal / Wellness</option>
              </select>
            </div>
          </div>

          {/* Date, Start Time & End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="07:00 PM"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="08:00 PM"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
              />
            </div>
          </div>

          {/* Priority & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-[#1f1f33] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4f46e5]"
              >
                <option value="High">High (Red)</option>
                <option value="Medium">Medium (Orange)</option>
                <option value="Low">Low (Green)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
                Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 1 hour"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4f46e5]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task details or specific topics..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4f46e5]"
            />
          </div>

          {/* Recurring & Reminder Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => {
                    setIsRecurring(e.target.checked);
                    if (e.target.checked && recurringFrequency === "None") {
                      setRecurringFrequency("Daily");
                    }
                  }}
                  className="rounded border-white/20 text-[#4f46e5]"
                />
                <span>Recurring Schedule</span>
              </label>
              {isRecurring && (
                <select
                  value={recurringFrequency}
                  onChange={(e) => setRecurringFrequency(e.target.value as any)}
                  className="w-full bg-[#1f1f33] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
                Reminder
              </label>
              <select
                value={reminder}
                onChange={(e) => setReminder(e.target.value as any)}
                className="w-full bg-[#1f1f33] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="None">None</option>
                <option value="15 mins before">15 mins before</option>
                <option value="30 mins before">30 mins before</option>
                <option value="1 hour before">1 hour before</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#c7c4d8] hover:text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#4f46e5] text-white font-bold text-xs hover:brightness-110 shadow-lg shadow-[#4f46e5]/30"
            >
              Save Schedule Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
