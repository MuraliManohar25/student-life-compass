import React, { useState } from 'react';
import { TaskItem, StudentSpot, NavTab } from '../types';

interface HomeScreenProps {
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenStudyGuide: () => void;
  spots: StudentSpot[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  tasks,
  onToggleTask,
  onNavigateTab,
  onOpenStudyGuide,
  spots
}) => {
  const [activeTaskStarting, setActiveTaskStarting] = useState(false);
  const [taskStarted, setTaskStarted] = useState(false);
  const [snoozedPriority, setSnoozedPriority] = useState(false);
  const [selectedSpotDay, setSelectedSpotDay] = useState<string>('wed');

  const completedCount = tasks.filter((t) => t.completed).length;

  const handleStartTask = () => {
    setActiveTaskStarting(true);
    setTimeout(() => {
      setActiveTaskStarting(false);
      setTaskStarted(true);
    }, 600);
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 space-y-6 max-w-[1400px] mx-auto pb-6 pt-1 lg:pt-2">
      {/* Student Welcome & Vital Context Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1a1a1a] truncate tracking-tight">
              Good morning, Alex
            </h1>
            <span className="text-xl">👋</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs uppercase tracking-widest text-gray-500 font-semibold">
            <span>CS • Sem 6</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="text-indigo-600 font-bold">UW Seattle</span>
          </div>
        </div>
        <div className="relative shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-700 shadow-xs border border-gray-200">
          <span className="material-symbols-outlined text-[22px]">wb_sunny</span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
        </div>
      </div>

      {/* Main Dashboard Responsive Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: AI Nudge & Today's Focus */}
        <div className="lg:col-span-7 space-y-6">
          {/* Smart AI Proactive Nudge Card - Signature Geometric Indigo Panel */}
          {!snoozedPriority && (
            <div className="relative overflow-hidden rounded-2xl bg-indigo-900 text-white p-6 shadow-sm border border-indigo-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-indigo-200">
                    Compass AI Priority
                  </span>
                </div>
                <span className="text-[10px] bg-red-500/20 text-red-200 border border-red-400/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Urgent
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-white leading-snug tracking-tight">
                  Complete your DBMS Normalization Assignment first
                </h2>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  Due tomorrow at 11:59 PM. Estimated focus session:{' '}
                  <span className="font-semibold text-white">2 hrs</span>. Clears 35% of this week’s workload!
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2.5">
                <button
                  onClick={handleStartTask}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer ${
                    taskStarted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-indigo-950 hover:bg-indigo-50'
                  }`}
                  type="button"
                >
                  {activeTaskStarting ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">
                        progress_activity
                      </span>
                      <span>Launching Focus Mode...</span>
                    </>
                  ) : taskStarted ? (
                    <>
                      <span className="material-symbols-outlined text-[16px]">check</span>
                      <span>Focus Timer Active (2h)</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                      <span>Start Task (2 hrs)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onOpenStudyGuide}
                  className="px-3.5 py-2.5 rounded-lg bg-indigo-800 text-indigo-100 font-medium text-xs hover:bg-indigo-700 transition-colors cursor-pointer flex items-center gap-1.5"
                  type="button"
                  title="View AI Step Guide"
                >
                  <span className="material-symbols-outlined text-[15px]">menu_book</span>
                  <span>Guide</span>
                </button>

                <button
                  onClick={() => setSnoozedPriority(true)}
                  className="px-3 py-2.5 rounded-lg bg-indigo-950/70 text-indigo-300 font-medium text-xs hover:bg-indigo-800 transition-colors cursor-pointer"
                  type="button"
                >
                  Later
                </button>
              </div>
            </div>
          )}

          {/* Today's Focus Action Section */}
          <div className="bg-white rounded-2xl p-6 shadow-xs space-y-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[20px]">check_circle</span>
                <h3 className="text-base font-semibold text-[#1a1a1a] tracking-tight">Today's Focus</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-gray-100 text-gray-700">
                {completedCount} of {tasks.length} complete
              </span>
            </div>

            {/* Interactive Task Items */}
            <div className="space-y-2">
              {tasks.map((task) => {
                const isPriority = task.priority === 'High';
                const isMedium = task.priority === 'Medium';

                return (
                  <div
                    key={task.id}
                    className={`task-item group flex items-start justify-between p-3.5 rounded-xl border transition-all ${
                      task.completed
                        ? 'bg-gray-50/60 border-gray-100 opacity-60'
                        : 'bg-gray-50/80 border-gray-100 hover:bg-gray-100/90'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                          task.completed
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 bg-white text-transparent hover:border-indigo-600'
                        }`}
                        type="button"
                        aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                      >
                        <span
                          className={`material-symbols-outlined text-[14px] ${
                            task.completed ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          check
                        </span>
                      </button>

                      <div className="min-w-0">
                        <span
                          onClick={() => onToggleTask(task.id)}
                          className={`text-sm block font-medium truncate cursor-pointer ${
                            task.completed ? 'line-through text-gray-400' : 'text-[#1a1a1a]'
                          }`}
                        >
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-gray-500 text-xs">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">schedule</span>
                            {task.dueTime}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">timer</span>
                            {task.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ml-2 ${
                        task.completed
                          ? 'bg-gray-100 text-gray-500'
                          : isPriority
                          ? 'bg-red-50 text-red-700'
                          : isMedium
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {task.completed ? 'Done' : task.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Snapshot Analytics Bento */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Campus Snapshot</h3>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-emerald-200/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Real-time sync
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Budget Snapshot */}
              <div
                onClick={() => onNavigateTab('finance')}
                className="bg-white rounded-2xl p-6 shadow-xs space-y-4 cursor-pointer hover:border-gray-300 border border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <span
                        className="material-symbols-outlined text-[22px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        account_balance_wallet
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase tracking-widest font-semibold">
                        Monthly Budget
                      </span>
                      <span className="text-3xl font-light text-[#1a1a1a] tracking-tight">
                        ₹2,500 <span className="text-xs text-gray-400 font-normal">left</span>
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                    Healthy
                  </span>
                </div>

                {/* Weekly mini bar visual */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center text-gray-500 text-xs font-medium">
                    <span>Spent ₹4,500 of ₹7,000</span>
                    <span className="font-semibold text-[#1a1a1a]">64% spent</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden flex">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: '64%' }}
                    />
                  </div>

                  <div className="flex items-end justify-between pt-3 px-2 h-14">
                    {[
                      { id: 'mon', day: 'M', label: 'Mon', h: 'h-6', val: '₹130' },
                      { id: 'tue', day: 'T', label: 'Tue', h: 'h-8', val: '₹170' },
                      { id: 'wed', day: 'W', label: 'Wed', h: 'h-12', val: '₹240', isCurrent: true },
                      { id: 'thu', day: 'T', label: 'Thu', h: 'h-5', val: '₹110' },
                      { id: 'fri', day: 'F', label: 'Fri', h: 'h-9', val: '₹180' },
                      { id: 'sat', day: 'S', label: 'Sat', h: 'h-4', val: '₹90' },
                      { id: 'sun', day: 'S', label: 'Sun', h: 'h-2', val: '₹40' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSpotDay(item.id);
                        }}
                        type="button"
                        className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
                        title={`${item.label}: ${item.val}`}
                      >
                        <div
                          className={`w-4 rounded-t-sm transition-all ${item.h} ${
                            selectedSpotDay === item.id
                              ? 'bg-indigo-600'
                              : item.isCurrent
                              ? 'bg-indigo-600'
                              : 'bg-gray-100 group-hover:bg-indigo-200'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-semibold uppercase ${
                            selectedSpotDay === item.id
                              ? 'text-indigo-600 font-bold'
                              : 'text-gray-400'
                          }`}
                        >
                          {item.day}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Career & Academic Side-by-Side Dual Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Career Snapshot */}
                <div
                  onClick={() => onNavigateTab('academics')}
                  className="bg-white rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3 cursor-pointer hover:border-gray-300 border border-gray-200 transition-all"
                >
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                      <span className="material-symbols-outlined text-[18px]">work</span>
                    </div>
                    <span className="text-[10px] text-gray-500 block uppercase tracking-widest pt-1 font-semibold">
                      Career Target
                    </span>
                    <span className="text-base font-semibold text-[#1a1a1a] block leading-tight tracking-tight">
                      Full-Stack Dev
                    </span>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-gray-500 text-xs mb-1.5">
                      <span>Readiness</span>
                      <span className="text-indigo-600 font-bold">74%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: '74%' }} />
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold mt-2.5">
                      <span className="material-symbols-outlined text-[13px]">near_me</span> 8 open roles
                    </span>
                  </div>
                </div>

                {/* Academic Performance Snapshot */}
                <div
                  onClick={() => onNavigateTab('insights')}
                  className="bg-white rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3 cursor-pointer hover:border-gray-300 border border-gray-200 transition-all"
                >
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                      <span className="material-symbols-outlined text-[18px]">school</span>
                    </div>
                    <span className="text-[10px] text-gray-500 block uppercase tracking-widest pt-1 font-semibold">
                      Current GPA
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-light text-[#1a1a1a] tracking-tight">3.82</span>
                      <span className="text-xs text-gray-400">/ 4.0</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs text-gray-700 font-medium">92% consistency</span>
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mt-1">Risk: Minimal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nearby Services & Campus Essentials Responsive Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-[18px]">explore</span>
            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Nearby Student Spots</h3>
          </div>
          <button
            onClick={() => onNavigateTab('explore')}
            className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
            type="button"
          >
            University District →
          </button>
        </div>

        {/* Scrollable Horizontal Carousel on Mobile, Grid on Tablet/Desktop */}
        <div className="flex gap-3 overflow-x-auto pb-2 pt-0.5 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:overflow-visible">
          {spots.slice(0, 4).map((spot) => (
            <div
              key={spot.id}
              onClick={() => onNavigateTab('explore')}
              className="shrink-0 w-44 sm:w-auto bg-white rounded-2xl p-3 shadow-xs space-y-2 cursor-pointer hover:border-gray-300 transition-all active:scale-[0.98] border border-gray-200"
            >
              <div className="h-28 sm:h-32 w-full rounded-xl overflow-hidden relative">
                <img
                  className="w-full h-full object-cover"
                  src={spot.imageUrl}
                  alt={spot.name}
                  loading="lazy"
                />
                <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-white/90 backdrop-blur-sm text-[#1a1a1a] text-[10px] font-bold shadow-xs">
                  {spot.distance}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-[#1a1a1a] block truncate">
                  {spot.name}
                </span>
                <span className="text-[10px] text-gray-500 block truncate uppercase tracking-wider mt-0.5">
                  {spot.tags[0] || spot.categoryLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Encouragement Footer Badge */}
      <div className="py-2 flex items-center justify-center gap-2 text-gray-400 text-xs">
        <span className="material-symbols-outlined text-[16px] text-indigo-600">check_circle</span>
        <span>You're on track to wrap up assignments by 4:00 PM today.</span>
      </div>
    </div>
  );
};
