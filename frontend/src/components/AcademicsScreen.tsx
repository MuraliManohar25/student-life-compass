import React, { useState } from 'react';
import { AcademicSubTab, ScheduleBlock, TaskItem } from '../types';

interface AcademicsScreenProps {
  tasks: TaskItem[];
  schedule: ScheduleBlock[];
  onAddScheduleItem: (item: ScheduleBlock) => void;
  initialSubTab?: AcademicSubTab;
}

export const AcademicsScreen: React.FC<AcademicsScreenProps> = ({
  tasks,
  schedule,
  onAddScheduleItem,
  initialSubTab = 'sequencer'
}) => {
  const [activeTab, setActiveTab] = useState<AcademicSubTab>(initialSubTab);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [activeDay, setActiveDay] = useState(16);
  const [practiceDrillActive, setPracticeDrillActive] = useState(false);
  const [cheatsheetAdded, setCheatsheetAdded] = useState(false);

  // New task form state
  const [taskType, setTaskType] = useState('Assignment');
  const [taskTitle, setTaskTitle] = useState('DBMS Assignment: Normalization & Functional Dependencies');
  const [courseModule, setCourseModule] = useState('CS-304: Database Systems');
  const [deadline, setDeadline] = useState('Tomorrow, Oct 17 • 11:59 PM');
  const [duration, setDuration] = useState('2h');
  const [difficulty, setDifficulty] = useState('Hard');
  const [priority, setPriority] = useState('Urgent');
  const [autoSequence, setAutoSequence] = useState(true);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const newBlock: ScheduleBlock = {
      id: `task-${Date.now()}`,
      timeRange: '04:00 PM - 06:00 PM',
      title: taskTitle,
      location: `${courseModule} • AI Scheduled`,
      status: autoSequence ? 'AI Sequenced' : 'Scheduled',
      weightBadge: autoSequence ? '95% PYQ Weight' : undefined,
      urgent: priority === 'Urgent'
    };
    onAddScheduleItem(newBlock);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full px-4 space-y-4 max-w-max-content-width mx-auto pb-4 pt-1">
      {/* Sub-Header & Segmented Hub Navigation Bar */}
      <div className="w-full overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl min-w-max border border-gray-200">
          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-white text-indigo-700 shadow-xs border border-gray-200'
                : 'text-gray-500 hover:text-[#1a1a1a]'
            }`}
            type="button"
          >
            Study Planner
          </button>
          <button
            onClick={() => setActiveTab('sequencer')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'sequencer'
                ? 'bg-white text-indigo-700 shadow-xs border border-gray-200'
                : 'text-gray-500 hover:text-[#1a1a1a]'
            }`}
            type="button"
          >
            Smart Sequencer
          </button>
          <button
            onClick={() => setActiveTab('pyqs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'pyqs'
                ? 'bg-white text-indigo-700 shadow-xs border border-gray-200'
                : 'text-gray-500 hover:text-[#1a1a1a]'
            }`}
            type="button"
          >
            PYQs & Insights
          </button>
          <button
            onClick={() => setActiveTab('stepguide')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'stepguide'
                ? 'bg-white text-indigo-700 shadow-xs border border-gray-200'
                : 'text-gray-500 hover:text-[#1a1a1a]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">school</span>
            <span>AI Step Guide</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: SMART SEQUENCER ("What Should I Do First?") */}
      {activeTab === 'sequencer' && (
        <div className="space-y-4">
          {/* Ambient Hero Header & Progress Ring Status Card */}
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-xs p-6 border border-gray-200">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-200/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                  <span>Mid-Semester Window</span>
                </div>
                <h2 className="text-xl font-semibold text-[#1a1a1a] tracking-tight pt-0.5">
                  Mid-Sem in 14 Days
                </h2>
                <p className="text-xs text-gray-500">
                  Syllabus pacing is 68% optimal. 4 core milestones remaining.
                </p>
              </div>

              {/* Ring chart SVG with Delight badge */}
              <div className="relative flex-shrink-0 w-16 h-16 flex items-center justify-center">
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
                    strokeDasharray="68, 100"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-indigo-600">68%</span>
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                    Ready
                  </span>
                </div>
              </div>
            </div>

            {/* Micro streak reminder */}
            <div className="mt-4 pt-1 flex items-center justify-between text-xs bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-600 text-[18px]">
                  local_fire_department
                </span>
                <span className="text-[#1a1a1a] font-medium">5-day revision streak</span>
              </div>
              <span className="text-indigo-600 font-semibold">+120 XP earned</span>
            </div>
          </div>

          {/* SECTION 1: SMART TASK SEQUENCER */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <h3 className="text-[17px] font-bold text-on-surface">What Should I Do First?</h3>
              </div>
              <span className="text-[11px] text-primary font-bold">AI Prioritized</span>
            </div>

            {/* Explanatory Pill / Prompt Assist */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container text-on-surface-variant">
              <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">
                auto_awesome
              </span>
              <p className="text-[12px] leading-relaxed">
                Ordered dynamically by <span className="font-semibold text-on-surface">deadline proximity</span>,{' '}
                <span className="font-semibold text-on-surface">exam weightage (40%)</span>, and active focus energy.
              </p>
            </div>

            {/* Sequenced Tasks Stack */}
            <div className="space-y-2.5">
              {/* Task 1: High Priority (Active focus) */}
              <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col space-y-2.5 transition-all border border-outline-variant/15 hover:border-primary/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[11px] font-bold">
                        High Priority
                      </span>
                      <span className="text-[11px] text-error font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">timer</span> Due Tomorrow
                      </span>
                      <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span> 2h est.
                      </span>
                    </div>
                    <h4 className="text-[16px] font-bold text-on-surface pt-0.5">
                      DBMS Assignment: Relational Algebra
                    </h4>
                    <p className="text-[12px] text-on-surface-variant">
                      Nearest deadline + 15% overall course weight. Unlocks SQL Labs.
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[13px] shrink-0">
                    #1
                  </div>
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('stepguide')}
                    className="flex-1 py-2 px-3 rounded-xl bg-primary-container text-on-primary text-[13px] font-semibold shadow-xs hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                    Accept & Start (2h)
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="py-2 px-3 rounded-xl bg-surface-container text-on-surface text-[13px] font-medium hover:bg-surface-container-high transition-colors flex items-center gap-1 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">update</span>
                    Reschedule
                  </button>
                </div>
              </div>

              {/* Task 2: Medium Priority */}
              <div
                onClick={() => setActiveTab('pyqs')}
                className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center justify-between gap-3 cursor-pointer hover:border-primary/30 border border-outline-variant/15 transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-primary-fixed-variant text-[11px] font-bold">
                      Medium Priority
                    </span>
                    <span className="text-[11px] text-on-surface-variant">Exam in 4 days</span>
                    <span className="text-[11px] text-on-surface-variant">1.5h</span>
                  </div>
                  <h4 className="text-[13px] font-bold text-on-surface">
                    Calculus III: Vector Integrals Revision
                  </h4>
                  <p className="text-[12px] text-on-surface-variant">
                    Calculus III PYQ priority • High occurrence in Section B
                  </p>
                </div>
                <button
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shrink-0"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>

              {/* Task 3: Python DSA */}
              <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center justify-between gap-3 border border-outline-variant/15">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-medium">
                      Routine
                    </span>
                    <span className="text-[11px] text-on-surface-variant">Due in 5 days</span>
                    <span className="text-[11px] text-on-surface-variant">1h</span>
                  </div>
                  <h4 className="text-[13px] font-bold text-on-surface">
                    Python Data Structures Practice
                  </h4>
                  <p className="text-[12px] text-on-surface-variant">
                    Trees & Graphs review with 4 mock platform challenges
                  </p>
                </div>
                <button
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shrink-0"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>
          </section>

          {/* Previous Year Papers Preview & Topic Analysis */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <h3 className="text-[17px] font-bold text-on-surface">Previous Year Papers & Trends</h3>
              </div>
              <button
                onClick={() => setActiveTab('pyqs')}
                className="text-[11px] text-primary font-bold hover:underline cursor-pointer"
                type="button"
              >
                View All (42)
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm space-y-3.5 border border-outline-variant/15">
              {/* Breadcrumb Dropdown Mock Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] font-semibold">
                <button className="px-2.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface flex items-center gap-1">
                  <span>CS Eng</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                </button>
                <span className="text-outline-variant font-bold">/</span>
                <button className="px-2.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface flex items-center gap-1">
                  <span>Sem 6</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                </button>
                <span className="text-outline-variant font-bold">/</span>
                <button className="px-2.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface flex items-center gap-1 font-bold">
                  <span>DBMS</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                </button>
                <span className="text-outline-variant font-bold">/</span>
                <button className="px-2.5 py-1.5 rounded-lg bg-primary-fixed text-on-primary-fixed font-bold flex items-center gap-1">
                  <span>2023 End-Sem</span>
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </button>
              </div>

              {/* Topic Frequency Analytic Bar Chart */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-on-surface-variant text-[11px]">
                  <span className="font-bold text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-secondary text-[16px]">insights</span>
                    Topic Recurrence (Last 5 Years)
                  </span>
                  <span>Exam Probability</span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {/* Item 1: Normalization */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium text-on-surface">Normalization (3NF / BCNF)</span>
                      <span className="font-bold text-primary">95%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>

                  {/* Item 2: Transactions */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium text-on-surface">Transactions & Concurrency Control</span>
                      <span className="font-bold text-primary">82%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                      <div className="h-full bg-primary-container rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>

                  {/* Item 3: SQL Queries */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium text-on-surface">Complex Joins & Subqueries</span>
                      <span className="font-bold text-primary">75%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                      <div className="h-full bg-secondary-container rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  {/* Item 4: Indexing */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium text-on-surface">B-Trees & Hash Indexing</span>
                      <span className="font-semibold text-on-surface-variant">50%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                      <div className="h-full bg-outline-variant rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PYQ Document Actions Strip */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('stepguide')}
                    className="py-1.5 px-3 rounded-lg bg-primary-container text-on-primary text-[13px] font-semibold flex items-center gap-1.5 shadow-xs active:scale-95 transition-transform cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    <span>View PDF</span>
                  </button>
                  <button
                    onClick={() => alert('Downloading official 2023 End-Sem solved question paper (PDF 4.2 MB)...')}
                    className="py-1.5 px-3 rounded-lg bg-surface-container text-on-surface text-[13px] font-medium flex items-center gap-1.5 hover:bg-surface-container-high transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Download</span>
                  </button>
                </div>
                <button
                  onClick={() => alert('Bookmarked 2023 End-Sem paper for fast review!')}
                  className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                  title="Bookmark Paper"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">bookmark_border</span>
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 3: CAREER COMPASS & MILESTONES */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
                <h3 className="text-[17px] font-bold text-on-surface">Career Compass & Milestones</h3>
              </div>
              <span className="text-[11px] text-tertiary font-bold">Backend Track</span>
            </div>

            {/* Roadmap Visual Node Path Card */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm space-y-3 border border-outline-variant/15">
              <div className="flex items-center justify-between">
                <h4 className="text-[13px] font-bold text-on-surface">Target: Summer SWE '25</h4>
                <span className="text-[11px] text-on-surface-variant">Step 2 of 4</span>
              </div>

              {/* Visual Node Path */}
              <div className="relative py-2">
                <div className="grid grid-cols-4 gap-2 text-center relative z-10">
                  {/* Node 1: Completed */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </div>
                    <span className="text-[11px] font-bold text-on-surface">Skills</span>
                    <span className="text-[10px] text-on-surface-variant leading-tight">Python, SQL</span>
                  </div>

                  {/* Node 2: In-Progress / Gap */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center ring-2 ring-primary-fixed shadow-xs">
                      <span className="material-symbols-outlined text-[18px]">lock_open</span>
                    </div>
                    <span className="text-[11px] font-bold text-primary">Skill Gap</span>
                    <span className="text-[10px] text-on-surface-variant leading-tight">Docker, System</span>
                  </div>

                  {/* Node 3: Upcoming */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">school</span>
                    </div>
                    <span className="text-[11px] font-medium text-on-surface-variant">Learning</span>
                    <span className="text-[10px] text-on-surface-variant leading-tight">FastAPI Lab</span>
                  </div>

                  {/* Node 4: Target Goal */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                    </div>
                    <span className="text-[11px] font-medium text-on-surface-variant">Internship</span>
                    <span className="text-[10px] text-on-surface-variant leading-tight">Summer '25</span>
                  </div>
                </div>

                {/* Horizontal Track Line */}
                <div className="absolute top-6 left-8 right-8 h-0.5 bg-surface-container-high -z-0"></div>
                <div className="absolute top-6 left-8 w-1/3 h-0.5 bg-tertiary -z-0"></div>
              </div>

              {/* Recommended Mini Action from Mentor */}
              <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-secondary">
                    <span className="material-symbols-outlined text-[20px]">lightbulb</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-on-surface truncate">
                      Docker Fundamentals Module
                    </p>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      Closes your SWE gap • 4 micro-lessons
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => alert('Starting Docker Fundamentals Module for Alex!')}
                  className="px-3 py-1 rounded-lg bg-secondary text-on-secondary text-[11px] font-bold hover:opacity-90 shrink-0 cursor-pointer"
                  type="button"
                >
                  Start
                </button>
              </div>
            </div>

            {/* Real-time Internship Match Card */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm space-y-3 border border-outline-variant/15">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    className="w-12 h-12 rounded-xl object-cover bg-surface-container shrink-0 shadow-xs"
                    alt="Startup logo"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFRsEDtNYr2iS0rAHzZuQchd9mjoW290m6oUvMaMg_dvKVdCkXSYXe9dhOtVwKL4m-zVhloa_WwhQdr-EP8O5GFJsiEi4lJqDe2RYP1lsFTT_z-_4UdFNrSCgtO6BGTXZCItywKwTJ0Ut_cfRZqk_Y05o_3MW6jWueRVxCbY1mpGkiwu1aeSIEMM2WN8oc8LcvAt4KmqL1gN9dhr0dtwusX6j9y6MDR_kbAFjBTlnNHPq5aVU0jbT6"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
                        87% Match
                      </span>
                      <span className="text-[11px] text-on-surface-variant">Verified</span>
                    </div>
                    <h4 className="text-[13px] font-bold text-on-surface truncate mt-0.5">
                      Software Engineering Intern
                    </h4>
                    <p className="text-[12px] text-on-surface-variant truncate">
                      CloudTech Innovations • Bengaluru Tech Park
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => alert('Saved Software Engineering Intern role to your bookmarks.')}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shrink-0 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
                </button>
              </div>

              {/* Internship specs line */}
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant bg-surface-container-low px-3 py-2 rounded-xl">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">payments</span>
                  <span className="font-bold text-on-surface">₹25,000 / mo</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span>1.4 km from campus</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">work_history</span>
                  <span>2 Mos</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => alert('1-Click application sent with UW transcript & verified GitHub profile!')}
                  className="flex-1 py-2 px-3 rounded-xl bg-primary-container text-on-primary text-[13px] font-semibold shadow-xs hover:opacity-95 transition-all text-center cursor-pointer"
                  type="button"
                >
                  Apply Now (1-Click)
                </button>
                <button
                  onClick={() => alert('Opening verified role requirements: Docker, FastAPI, PostgreSQL.')}
                  className="py-2 px-3 rounded-xl bg-surface-container text-on-surface text-[13px] font-medium hover:bg-surface-container-high transition-colors cursor-pointer"
                  type="button"
                >
                  View Details
                </button>
              </div>
            </div>
          </section>

          {/* Delightful Study Nudge Card with illustration photo */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-container p-4 flex items-center gap-4 border border-outline-variant/15">
            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                Study Buddy AI
              </span>
              <h4 className="text-[17px] font-bold text-on-surface">
                Ready for a 25-min Pomodoro?
              </h4>
              <p className="text-[12px] text-on-surface-variant">
                We queued 4 practice questions from DBMS Unit 3 based on your weakest topic.
              </p>
              <div className="pt-1">
                <button
                  onClick={() => setActiveTab('stepguide')}
                  className="px-3 py-1.5 rounded-xl bg-secondary text-on-secondary text-[13px] font-medium inline-flex items-center gap-1 shadow-xs active:scale-95 transition-transform cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">timer</span>
                  <span>Launch Focus Session</span>
                </button>
              </div>
            </div>
            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDXlgWjSCgkyfTQ8zMmWhzBfjt74DvNoRekncLL_vLZF5HOr-iwu1eDxxMFiI5v0jvE9yQOcfGEHvnEnwfTNujWk7G3UY0d2yeOXhwY-4Jj6o2E_cQqb0U9hFFIDNxk8MPCmJsWPdI0XLw8dv0K1BFoDOyCxGfppQjoI-Ofm3Aj2eNPyRPdZVoL1HCOA5R2GLaIKNJkNAU1ovNK9F_wjzz7wm6cuDRwIy0bCnBh23BwWaOZIUQ3ihy"
                alt="Cozy study desk"
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: STUDY PLANNER (Week View & Timeline) */}
      {activeTab === 'planner' && (
        <div className="space-y-4">
          {/* Month Header & Weekday Scroller */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-4 space-y-3 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-bold text-on-surface">October 2024</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary text-[11px] font-semibold">
                  Week 7
                </span>
              </div>
              <div className="flex items-center gap-1 text-on-surface-variant">
                <button
                  aria-label="Previous week"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button
                  aria-label="Next week"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* 7-Day Strip */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {[
                { day: 'M', date: 14, dotColor: 'bg-tertiary' },
                { day: 'T', date: 15, dotColor: 'bg-secondary' },
                { day: 'W', date: 16, isToday: true },
                { day: 'T', date: 17, dotColor: 'bg-error' },
                { day: 'F', date: 18, dotColor: 'bg-tertiary' },
                { day: 'S', date: 19 },
                { day: 'S', date: 20, dotColor: 'bg-secondary' }
              ].map((d) => {
                const isSelected = activeDay === d.date;
                return (
                  <button
                    key={d.date}
                    onClick={() => setActiveDay(d.date)}
                    className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                    type="button"
                  >
                    <span className="text-[11px] font-semibold opacity-80">{d.day}</span>
                    <span className="text-[14px] font-bold mt-0.5">{d.date}</span>
                    <div className="flex gap-0.5 mt-1.5 h-1">
                      {isSelected ? (
                        <>
                          <span className="w-1 h-1 rounded-full bg-tertiary-fixed"></span>
                          <span className="w-1 h-1 rounded-full bg-secondary-fixed"></span>
                          <span className="w-1 h-1 rounded-full bg-error-container"></span>
                        </>
                      ) : d.dotColor ? (
                        <span className={`w-1 h-1 rounded-full ${d.dotColor}`} />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Workload Intensity Indicator */}
            <div className="flex items-center justify-between pt-1 bg-surface-container-low px-3 py-2 rounded-xl">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="material-symbols-outlined text-[16px] text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  bolt
                </span>
                <span className="text-[11px] text-on-surface truncate font-medium">
                  Oct {activeDay}: 4.5 hrs planned • 2 deadlines approaching
                </span>
              </div>
              <span className="text-[11px] text-primary font-bold shrink-0">78% Load</span>
            </div>
          </div>

          {/* Scheduled Timeline Blocks */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Scheduled Timeline
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-primary text-[12px] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Schedule New Task</span>
              </button>
            </div>

            {schedule.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm flex items-start gap-3 relative overflow-hidden border border-outline-variant/15"
              >
                <div
                  className={`w-1.5 self-stretch rounded-full shrink-0 ${
                    item.status === 'Completed'
                      ? 'bg-tertiary'
                      : item.urgent || item.status === 'Urgent'
                      ? 'bg-error'
                      : 'bg-secondary'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      {item.timeRange}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                        item.status === 'Completed'
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                          : item.urgent || item.status === 'Urgent'
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-secondary-fixed text-on-secondary-fixed'
                      }`}
                    >
                      {item.status === 'Completed' ? (
                        <>
                          <span className="material-symbols-outlined text-[12px]">check</span> Completed
                        </>
                      ) : item.urgent || item.status === 'Urgent' ? (
                        <>
                          <span className="material-symbols-outlined text-[12px]">priority_high</span> Urgent
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[12px]">psychology</span>{' '}
                          {item.weightBadge || 'AI Sequenced'}
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-[15px] font-bold text-on-surface mt-1 truncate">{item.title}</p>
                  <p className="text-[12px] text-on-surface-variant">{item.location}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3 rounded-2xl bg-primary-container text-on-primary text-[13px] font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-primary transition-all active:scale-[0.99]"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
            <span>+ Add Task to Daily Sequence</span>
          </button>
        </div>
      )}

      {/* VIEW 3: PYQS & INSIGHTS (Course CS-304 Hub) */}
      {activeTab === 'pyqs' && (
        <div className="space-y-4">
          {/* Course Hero Banner & Meta Card */}
          <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm p-4 space-y-3 relative overflow-hidden border border-outline-variant/15">
            <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-secondary-fixed/30 pointer-events-none blur-2xl"></div>
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-primary/10 text-primary text-[11px] px-2 py-0.5 rounded-full font-bold">
                    Core CS
                  </span>
                  <span className="bg-surface-container-high text-on-surface-variant text-[11px] px-2 py-0.5 rounded-full font-medium">
                    4 Credits
                  </span>
                </div>
                <h1 className="text-[18px] font-bold text-on-surface tracking-tight leading-snug">
                  CS-304: Database Management Systems
                </h1>
                <p className="text-[12px] text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">school</span>
                  Prof. Harrington • Department of Computing
                </p>
              </div>

              {/* Overall Readiness Radial Badge */}
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-container-low min-w-[72px] shrink-0">
                <div className="relative w-11 h-11 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container-highest"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-primary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="68, 100"
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-bold text-primary">68%</span>
                </div>
                <span className="text-[10px] text-on-surface font-bold mt-1">On Track</span>
              </div>
            </div>

            {/* Milestone alert banner */}
            <div className="flex items-center justify-between bg-surface-container-high/70 px-3 py-2 rounded-xl">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-secondary text-[20px]">timer</span>
                <div className="truncate">
                  <span className="text-[12px] font-bold text-on-surface">Mid-Sem: 14 Days Away</span>
                  <span className="text-[11px] text-on-surface-variant ml-1.5">(40% Weightage)</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                chevron_right
              </span>
            </div>
          </div>

          {/* Compass AI Exam Pattern Synthesis Card */}
          <div className="w-full bg-gradient-to-br from-secondary/10 via-surface-container-lowest to-primary/5 rounded-2xl p-4 shadow-sm space-y-3 relative overflow-hidden border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-secondary text-on-secondary flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                </div>
                <span className="text-[11px] uppercase tracking-wider text-secondary font-bold">
                  Compass AI Intelligence
                </span>
              </div>
              <span className="text-[11px] bg-surface-container-lowest px-2 py-0.5 rounded-full text-on-surface-variant shadow-xs font-medium">
                5-Yr Recurrence
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-[17px] font-bold text-on-surface">
                Unit 3 Dominates Mid-Term Scoring
              </h2>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                Normalization & BCNF accounts for{' '}
                <span className="text-primary font-bold">28–32 marks</span> in every mid-term exam since 2019.
                Mastering 3NF decomposition guarantees the passing threshold alone.
              </p>
            </div>

            {/* Quick CTA Drill */}
            <div className="pt-1">
              <button
                onClick={() => {
                  setPracticeDrillActive(true);
                  setTimeout(() => setPracticeDrillActive(false), 2000);
                }}
                className="w-full h-11 bg-primary text-on-primary text-[13px] font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs hover:bg-primary-container transition-all active:scale-[0.99] cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                <span>
                  {practiceDrillActive
                    ? 'Generating 30-Min Drill with 5 PYQs...'
                    : 'Generate 30-Min High-Yield Practice Drill'}
                </span>
              </button>
            </div>
          </div>

          {/* High-Probability Question Spotlight Card */}
          <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm p-4 space-y-3 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                <span className="text-[11px] uppercase tracking-wide text-secondary font-bold">
                  Predicted Hot Question
                </span>
              </div>
              <span className="text-[11px] bg-error-container text-on-error-container font-bold px-2 py-0.5 rounded-full">
                88% Probability
              </span>
            </div>

            <div className="space-y-1.5 bg-surface-container-low p-3.5 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-primary font-bold">Q3(b) • Mid-Sem Expected</span>
                <span className="text-[11px] text-on-surface-variant font-medium">10 Marks</span>
              </div>
              <p className="text-[13px] text-on-surface font-mono leading-relaxed select-all">
                Given relation R(A, B, C, D, E) with FDs: A → BC, CD → E, B → D. Determine all candidate keys
                and decompose R into BCNF while checking dependency preservation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                onClick={() => setShowSolutionModal(true)}
                className="h-10 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                <span>Reveal Solution</span>
              </button>
              <button
                onClick={() => setActiveTab('stepguide')}
                className="h-10 rounded-xl bg-secondary-container text-on-secondary-container text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                <span>AI Step Guide</span>
              </button>
            </div>
          </div>

          {/* Topic Recurrence Matrix */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <div>
                <h2 className="text-[17px] font-bold text-on-surface">Topic Recurrence Matrix</h2>
                <p className="text-[12px] text-on-surface-variant">
                  Weighted against 10 semester question papers
                </p>
              </div>
              <span className="text-[11px] text-primary font-bold">4 Units Total</span>
            </div>

            {/* Topic 1: Critical Revision */}
            <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm p-4 space-y-3 border border-outline-variant/15">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-error-container text-on-error-container text-[11px] px-2 py-0.5 rounded-full font-bold">
                      Needs Revision
                    </span>
                    <span className="text-[11px] text-on-surface-variant">Avg: 18–22 Marks</span>
                  </div>
                  <h3 className="text-[15px] text-on-surface font-bold leading-snug">
                    Normalization & Functional Dependencies
                  </h3>
                  <p className="text-[12px] text-on-surface-variant">
                    1NF, 2NF, 3NF, BCNF, Minimal Covers
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[18px] font-bold text-primary">95%</div>
                  <div className="text-[11px] text-on-surface-variant">9 of 10 Papers</div>
                </div>
              </div>

              {/* Mastery bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-on-surface-variant">Your Mastery</span>
                  <span className="text-error font-bold">45% Completed</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full rounded-full bg-error" style={{ width: '45%' }}></div>
                </div>
              </div>

              {/* Recurring types tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="bg-surface-container text-on-surface text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>
                  Lossless Join Proofs
                </span>
                <span className="bg-surface-container text-on-surface text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>
                  Candidate Key Algorithm
                </span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setActiveTab('stepguide')}
                  className="h-9 rounded-xl bg-primary text-on-primary text-[12px] font-semibold flex items-center justify-center gap-1 cursor-pointer hover:bg-primary-container"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">quiz</span>
                  <span>Practice 6 PYQs</span>
                </button>
                <button
                  onClick={() => {
                    setCheatsheetAdded(true);
                    alert('Saved Unit 3 Cheatsheet with candidate key algorithms to your offline store!');
                  }}
                  className="h-9 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">menu_book</span>
                  <span>{cheatsheetAdded ? 'Saved Cheatsheet' : 'Cheatsheet'}</span>
                </button>
              </div>
            </div>

            {/* Topic 2: Proficient */}
            <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm p-4 space-y-3 border border-outline-variant/15">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-tertiary-fixed text-on-tertiary-fixed text-[11px] px-2 py-0.5 rounded-full font-bold">
                      Proficient
                    </span>
                    <span className="text-[11px] text-on-surface-variant">Avg: 14–16 Marks</span>
                  </div>
                  <h3 className="text-[15px] text-on-surface font-bold leading-snug">
                    Transactions & ACID Concurrency
                  </h3>
                  <p className="text-[12px] text-on-surface-variant">
                    2PL Locking, Conflict & View Serializability
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[18px] font-bold text-primary">82%</div>
                  <div className="text-[11px] text-on-surface-variant">8 of 10 Papers</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-on-surface-variant">Your Mastery</span>
                  <span className="text-tertiary-container font-bold">80% Strong</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full rounded-full bg-tertiary-fixed-dim" style={{ width: '80%' }}></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-tertiary-container">
                    history_edu
                  </span>
                  Precedence Graphs tested 7x
                </span>
                <button
                  onClick={() => alert('Launching 10-Minute Concurrency Quick Quiz...')}
                  className="h-8 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-medium flex items-center gap-1 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  <span>10m Quiz</span>
                </button>
              </div>
            </div>
          </div>

          {/* Past Papers Verified Repository */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between px-0.5">
              <div>
                <h2 className="text-[17px] font-bold text-on-surface">Verified University Papers</h2>
                <p className="text-[12px] text-on-surface-variant">
                  With faculty mark schemes & topper solutions
                </p>
              </div>
              <button
                onClick={() => alert('Showing all 12 archive exam papers with rubrics.')}
                className="text-[12px] text-primary font-bold flex items-center cursor-pointer hover:underline"
                type="button"
              >
                View All (12)
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm p-3.5 flex items-center justify-between gap-2 border border-outline-variant/15">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">picture_as_pdf</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-on-surface truncate">
                        2023 End-Sem Solutions
                      </span>
                      <span className="bg-tertiary-fixed text-on-tertiary-fixed text-[10px] px-1.5 py-0.2 rounded font-bold">
                        Topper Key
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      Solved by Grade A+ Peer • PDF 4.2 MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => alert('Downloading 2023 End-Sem Solutions PDF...')}
                    aria-label="Download Paper"
                    className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('stepguide')}
                    aria-label="View Paper"
                    className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: AI STEP GUIDE (BCNF Decomposition) */}
      {activeTab === 'stepguide' && (
        <div className="space-y-4">
          <section className="w-full -mx-4 px-4 py-2 bg-surface-container-low flex items-center justify-between rounded-xl">
            <button
              onClick={() => setActiveTab('pyqs')}
              className="inline-flex items-center gap-1.5 text-primary hover:text-on-primary-fixed transition-colors font-semibold text-[13px] cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to DBMS PYQs</span>
            </button>
            <div className="flex items-center gap-1 text-on-surface-variant text-[11px]">
              <span className="uppercase tracking-wider font-semibold">CS-304</span>
              <span className="inline-block w-1 h-1 rounded-full bg-outline-variant"></span>
              <span className="text-secondary font-bold">Predictive Hit</span>
            </div>
          </section>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">stars</span>
                10 Marks
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                88% Recurrence
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Topper Verified
              </span>
            </div>
            <h1 className="text-[20px] text-on-surface font-bold tracking-tight">
              AI Step Guide: BCNF Decomposition & Candidate Keys
            </h1>
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              Master candidate key closure calculation and lossless decomposition mechanics under strict
              university exam rubrics.
            </p>
          </div>

          {/* Problem Statement Box */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-2 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-primary font-bold">
                Problem Statement
              </span>
              <span className="text-[11px] text-on-surface-variant">Dec 2023 End-Sem Q3(a)</span>
            </div>
            <div className="bg-surface-container-low rounded-xl p-3 font-mono text-on-surface text-[13px] leading-relaxed select-all">
              <p className="font-bold text-primary mb-1">R(A, B, C, D, E)</p>
              <p className="text-on-surface-variant">F = &#123; A → BC, CD → E, B → D &#125;</p>
              <div className="mt-2 text-on-surface text-[12px] font-sans">
                Determine all candidate keys, verify BCNF compliance, decompose R into BCNF, and test for
                lossless join and functional dependency preservation.
              </div>
            </div>
          </div>

          {/* Score Rubric Blueprint */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-3 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-on-surface font-bold">Evaluation Rubric</span>
              <span className="text-[11px] text-primary font-bold">10/10 Score Blueprint</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="bg-surface-container-low rounded-xl p-2 flex flex-col">
                <span className="text-[12px] font-bold text-primary">2 Marks</span>
                <span className="text-[10px] text-on-surface-variant truncate">Keys & Closure</span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-2 flex flex-col">
                <span className="text-[12px] font-bold text-primary">3 Marks</span>
                <span className="text-[10px] text-on-surface-variant truncate">Violation Test</span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-2 flex flex-col">
                <span className="text-[12px] font-bold text-primary">3 Marks</span>
                <span className="text-[10px] text-on-surface-variant truncate">Decomposition</span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-2 flex flex-col">
                <span className="text-[12px] font-bold text-primary">2 Marks</span>
                <span className="text-[10px] text-on-surface-variant truncate">Join & Preserv.</span>
              </div>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden flex">
              <div className="bg-primary h-full w-[20%]"></div>
              <div className="bg-secondary h-full w-[30%]"></div>
              <div className="bg-primary-container h-full w-[30%]"></div>
              <div className="bg-tertiary-container h-full w-[20%]"></div>
            </div>
          </div>

          {/* STEP 1: Candidate Keys */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-3 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-[12px] flex items-center justify-center font-bold">
                  1
                </span>
                <h2 className="text-[15px] text-on-surface font-bold">
                  Attribute Closures & Candidate Keys
                </h2>
              </div>
              <span className="text-[11px] bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full font-bold">
                2 Marks
              </span>
            </div>
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              Find minimal superkeys by computing closures of independent attributes. Observe that attribute{' '}
              <strong className="text-on-surface">A</strong> never appears on any RHS, hence{' '}
              <strong className="text-on-surface">A must be part of every candidate key</strong>.
            </p>
            <div className="bg-surface-container-low rounded-xl p-3 space-y-2 text-[12px] font-mono leading-relaxed">
              <div>
                <span className="font-bold text-primary">(A)⁺: </span>
                <span>
                  {'{A}'} → using A → BC → {'{A, B, C}'} → using B → D → {'{A, B, C, D}'} → using CD → E →{' '}
                  <strong className="text-on-surface">{'{A, B, C, D, E}'}</strong>
                </span>
              </div>
              <div className="text-on-surface-variant">
                <span className="font-bold text-outline">(B)⁺: </span>
                <span>{'{B, D}'} (Cannot derive A, C, E)</span>
              </div>
              <div className="text-on-surface-variant">
                <span className="font-bold text-outline">(CD)⁺: </span>
                <span>{'{C, D, E}'} (Cannot derive A, B)</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high">
              <span className="text-[13px] text-on-surface font-semibold">Determined Candidate Key:</span>
              <span className="px-3 py-1 rounded-full bg-primary text-on-primary font-mono text-[13px] font-bold">
                {'{ A }'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-error-container text-on-error-container flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[20px] shrink-0 text-error">warning</span>
              <div className="space-y-0.5">
                <span className="text-[12px] font-bold block">Exam Trap Warning</span>
                <p className="text-[11px] leading-snug">
                  Even though CD derives E, <strong>CD is not a candidate key</strong> because it cannot
                  generate {'{A, B}'}. Candidate keys must derive the entire relation.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 2: BCNF Violation Testing */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-3 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-[12px] flex items-center justify-center font-bold">
                  2
                </span>
                <h2 className="text-[15px] text-on-surface font-bold">BCNF Violation Testing</h2>
              </div>
              <span className="text-[11px] bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full font-bold">
                3 Marks
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low">
              <span className="text-[11px] text-primary font-bold block uppercase">BCNF Condition</span>
              <p className="text-[12px] text-on-surface mt-0.5">
                For every non-trivial functional dependency <strong>X → Y</strong>,{' '}
                <strong>X must be a superkey</strong> of R.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
                  <span className="font-mono text-[13px] font-bold text-on-surface">A → BC</span>
                </div>
                <span className="text-[11px] text-on-tertiary-fixed bg-tertiary-fixed px-2 py-0.5 rounded-full font-semibold">
                  A is Superkey • Holds
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-error">cancel</span>
                  <span className="font-mono text-[13px] font-bold text-on-surface">CD → E</span>
                </div>
                <span className="text-[11px] text-on-error-container bg-error-container px-2 py-0.5 rounded-full font-semibold">
                  CD not Superkey • Fails
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-error-container/40">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-error">cancel</span>
                  <span className="font-mono text-[13px] font-bold text-on-surface">B → D</span>
                </div>
                <span className="text-[11px] text-on-error-container bg-error-container px-2 py-0.5 rounded-full font-bold">
                  Violator Chosen • Fails
                </span>
              </div>
            </div>
            <p className="text-[12px] text-on-surface-variant italic">
              Decision: Decompose using the violation <strong>B → D</strong> where (B)⁺ = {'{B, D}'}.
            </p>
          </div>

          {/* STEP 3: Stepwise BCNF Decomposition */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-3 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-[12px] flex items-center justify-center font-bold">
                  3
                </span>
                <h2 className="text-[15px] text-on-surface font-bold">Stepwise BCNF Decomposition</h2>
              </div>
              <span className="text-[11px] bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full font-bold">
                3 Marks
              </span>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-surface-container-low space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-primary">Sub-relation R1</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-semibold">
                    In BCNF
                  </span>
                </div>
                <p className="font-mono text-[13px] text-on-surface font-bold">
                  R1 = (B ∪ D) = <strong>R1(B, D)</strong>
                </p>
                <p className="text-[12px] text-on-surface-variant">
                  FD: B → D. Since B is the candidate key of R1, R1 is in BCNF.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-primary">Sub-relation R2</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold">
                    Needs Recurse Check
                  </span>
                </div>
                <p className="font-mono text-[13px] text-on-surface font-bold">
                  R2 = (R - D) = <strong>R2(A, B, C, E)</strong>
                </p>
                <p className="text-[12px] text-on-surface-variant">
                  Projected FDs on R2: A → BC. Notice CD → E loses attribute D and becomes inactive inside R2
                  directly.
                </p>
                <div className="p-2.5 rounded-lg bg-surface-container-high text-[11px] text-on-surface leading-snug">
                  Candidate key for R2 is <strong>{'{ A }'}</strong> since (A)⁺ in R2 covers {'{A, B, C, E}'}.
                  The remaining FD is A → BC where LHS {'{A}'} is a superkey. Therefore, R2 is now in BCNF.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-primary-fixed/40 space-y-1">
                <span className="text-[11px] uppercase font-bold text-primary">Final Decomposed Schemas</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <div className="px-3 py-1.5 rounded-xl bg-surface-container-lowest shadow-xs flex items-center gap-1.5 border border-outline-variant/15">
                    <span className="font-mono text-[13px] font-bold text-on-surface">R1(<u>B</u>, D)</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-surface-container-lowest shadow-xs flex items-center gap-1.5 border border-outline-variant/15">
                    <span className="font-mono text-[13px] font-bold text-on-surface">
                      R2(<u>A</u>, B, C, E)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: Lossless Join & Dependency Check */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-3 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-[12px] flex items-center justify-center font-bold">
                  4
                </span>
                <h2 className="text-[15px] text-on-surface font-bold">
                  Lossless Join & Dependency Check
                </h2>
              </div>
              <span className="text-[11px] bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full font-bold">
                2 Marks
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-surface-container-low space-y-1">
                <div className="flex items-center gap-1.5 text-tertiary">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span className="text-[13px] font-bold">Lossless Join Property: PRESERVED</span>
                </div>
                <p className="text-[12px] text-on-surface-variant leading-relaxed">
                  R1 ∩ R2 = {'{B, D}'} ∩ {'{A, B, C, E}'} = <strong>{'{B}'}</strong>. Since{' '}
                  <strong>{'{B}'} → D</strong> holds in R1, {'{B}'} is a candidate key for R1. By theorem, if R1
                  ∩ R2 is a superkey of R1 or R2, the decomposition is guaranteed lossless.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-error-container/30 space-y-1">
                <div className="flex items-center gap-1.5 text-error">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span className="text-[13px] font-bold">Dependency Preservation: NOT PRESERVED</span>
                </div>
                <p className="text-[12px] text-on-surface leading-snug">
                  The FD <strong>CD → E cannot be enforced</strong> directly in R1(B, D) or R2(A, B, C, E) without
                  computing a join.
                </p>
                <div className="mt-1 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-[11px] font-mono">
                  (F1 ∪ F2)⁺ ≠ F⁺ • (Loss of CD → E)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-secondary-fixed/50 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-secondary shrink-0">
                  tips_and_updates
                </span>
                <p className="text-[12px] text-on-secondary-fixed leading-snug">
                  <strong>Crucial Exam Note:</strong> Write explicitly: "BCNF does NOT guarantee functional
                  dependency preservation, unlike 3NF." This sentence directly unlocks the final 1.5 marks.
                </p>
              </div>
            </div>
          </div>

          {/* Prompt Assist for Step Guide */}
          <div className="bg-surface-container rounded-2xl p-4 space-y-2 border border-outline-variant/15">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">psychology_alt</span>
              <span className="text-[15px] text-on-surface font-bold">Got Stuck on a Step?</span>
            </div>
            <p className="text-[12px] text-on-surface-variant">
              Ask Compass AI to explain how to project functional dependencies into sub-schemas or test other
              initial violation paths.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => alert('Compass AI: We picked B → D because B is a single attribute violation, making the sub-schema R1(B, D) immediately minimal and easy to verify!')}
                className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary text-[11px] font-semibold shadow-xs hover:bg-surface-container-high transition-colors cursor-pointer"
                type="button"
              >
                Why pick B → D before CD → E?
              </button>
              <button
                onClick={() => alert('Compass AI: 3NF preserves all functional dependencies but may allow transitive dependencies on non-prime attributes; BCNF eliminates all anomalies but can lose FDs.')}
                className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary text-[11px] font-semibold shadow-xs hover:bg-surface-container-high transition-colors cursor-pointer"
                type="button"
              >
                Show 3NF vs BCNF comparison table
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => alert('Loading new 10-Mark Practice problem from 2022 End-Sem paper...')}
              className="w-full h-12 rounded-xl bg-primary text-on-primary text-[13px] font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">edit_note</span>
              <span>Try Similar 10-Mark Practice Problem</span>
            </button>
            <button
              onClick={() => alert('Added BCNF Proof Cheat-sheet to your revision pack!')}
              className="w-full h-11 rounded-xl bg-surface-container-high text-on-surface text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">bookmark_add</span>
              <span>Add to My DBMS Revision Cheatsheet</span>
            </button>
          </div>
        </div>
      )}

      {/* SCHEDULE NEW TASK MODAL / SHEET */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-on-background/50 backdrop-blur-xs p-0 sm:p-4 transition-all">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto border border-outline-variant/20 animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-1.5 rounded-full bg-outline-variant/60 mb-3 sm:hidden"></div>
              <div className="flex items-start justify-between w-full">
                <div>
                  <h2 className="text-[20px] font-bold text-on-surface">Schedule New Task</h2>
                  <div className="flex items-center gap-1 text-primary mt-0.5">
                    <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                    <p className="text-[12px] text-on-surface-variant">
                      AI will automatically sequence this by exam weightage
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close task form"
                  className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              {/* Task Category Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Task Type
                </label>
                <div className="flex gap-2 overflow-x-auto py-0.5 no-scrollbar">
                  {['Assignment', 'Exam Prep', 'Milestone', 'Revision', 'Reading'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTaskType(t)}
                      className={`px-3 py-1.5 rounded-full text-[12px] font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                        taskType === t
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                      }`}
                    >
                      <span>{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Title */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Task Title
                </label>
                <div className="bg-surface-container-low rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-outline-variant/15 focus-within:border-primary">
                  <span className="material-symbols-outlined text-primary text-[20px]">task_alt</span>
                  <input
                    className="w-full bg-transparent text-[14px] text-on-surface placeholder:text-outline focus:outline-none"
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Course & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Course / Module
                  </label>
                  <div className="bg-surface-container-low rounded-xl px-3 py-2.5 flex items-center justify-between border border-outline-variant/15">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></span>
                      <input
                        type="text"
                        value={courseModule}
                        onChange={(e) => setCourseModule(e.target.value)}
                        className="bg-transparent text-[13px] font-semibold text-on-surface focus:outline-none truncate w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Target Deadline
                  </label>
                  <div className="bg-surface-container-low rounded-xl px-3 py-2.5 flex items-center justify-between border border-outline-variant/15">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-error text-[18px]">event_busy</span>
                      <input
                        type="text"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="bg-transparent text-[13px] text-on-surface focus:outline-none truncate w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Estimated Focus Time */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Estimated Focus Time
                  </label>
                  <span className="text-[11px] text-primary font-semibold">Sequenced into 2 blocks</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {['30m', '1h', '2h', '3h', 'Custom'].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDuration(dur)}
                      className={`py-2 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer ${
                        duration === dur
                          ? 'bg-primary-container text-on-primary shadow-xs'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Difficulty
                  </label>
                  <div className="bg-surface-container-low p-1 rounded-xl flex gap-1">
                    {['Easy', 'Med', 'Hard'].map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={`flex-1 py-1 text-center text-[11px] font-semibold rounded-lg cursor-pointer ${
                          difficulty === diff
                            ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                            : 'text-on-surface-variant'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Priority
                  </label>
                  <div className="bg-surface-container-low p-1 rounded-xl flex gap-1">
                    {['Urgent', 'Normal', 'Low'].map((pri) => (
                      <button
                        key={pri}
                        type="button"
                        onClick={() => setPriority(pri)}
                        className={`flex-1 py-1 text-center text-[11px] font-semibold rounded-lg cursor-pointer ${
                          priority === pri
                            ? 'bg-error-container text-on-error-container shadow-xs'
                            : 'text-on-surface-variant'
                        }`}
                      >
                        {pri}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Smart AI Link Toggle */}
              <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between border border-outline-variant/15">
                <div className="flex items-start gap-2.5 min-w-0 pr-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-on-surface">Auto-Sequence with PYQ Match</span>
                      <span className="px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">
                        AI
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      Injects past-year question patterns directly into blocks
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSequence(!autoSequence)}
                  className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors shrink-0 cursor-pointer ${
                    autoSequence ? 'bg-primary-container' : 'bg-surface-container-highest'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-surface-container-lowest shadow transform transition-transform ${
                      autoSequence ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                  className="flex-1 py-3 px-4 rounded-xl bg-surface-container text-on-surface-variant text-[13px] font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 px-4 rounded-xl bg-primary-container text-on-primary text-[13px] font-semibold shadow-md hover:bg-primary transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                  <span>Schedule & Add</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK SOLUTION MODAL */}
      {showSolutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-3 border border-outline-variant/20 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-primary uppercase tracking-wider">
                Solution Snapshot
              </span>
              <button
                onClick={() => setShowSolutionModal(false)}
                className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer hover:bg-surface-container-high"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <h3 className="text-[16px] font-bold text-on-surface">Candidate Key & Decomposed Schemas</h3>
            <div className="bg-surface-container-low rounded-xl p-3 text-[13px] font-mono space-y-1.5">
              <p className="text-primary font-bold">Candidate Key: {'{ A }'}</p>
              <p className="text-on-surface">R1(<u>B</u>, D) with FD: B → D [In BCNF]</p>
              <p className="text-on-surface">R2(<u>A</u>, B, C, E) with FD: A → BC [In BCNF]</p>
              <p className="text-error font-sans text-[11px] pt-1">
                Notice: Lossless join is preserved, but dependency CD → E is NOT preserved.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  setShowSolutionModal(false);
                  setActiveTab('stepguide');
                }}
                className="py-2 px-4 rounded-xl bg-primary text-on-primary text-[12px] font-semibold cursor-pointer hover:bg-primary-container"
                type="button"
              >
                Open Full Step Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
