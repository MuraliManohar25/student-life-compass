import React, { useState, useEffect, useRef } from 'react';
import { AIMessage } from '../types';
import { useAuth } from '../context/AuthContext';
import { askAi, getDashboard, getMyProfile, ApiError } from '../lib/api';

interface CompassAIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToPlanner?: (title: string) => Promise<boolean> | boolean;
  onOpenStudyGuide?: () => void;
}

const WELCOME_MESSAGE: AIMessage = {
  id: 'welcome',
  sender: 'ai',
  text: "Hi! I'm Compass AI. Ask me about your schedule, budget, placement prep, or anything else in your dashboard.",
  timestamp: 'Just now'
};

export const CompassAIDrawer: React.FC<CompassAIDrawerProps> = ({
  isOpen,
  onClose,
  onAddToPlanner,
  onOpenStudyGuide
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIMessage[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Modules');
  const [isThinking, setIsThinking] = useState(false);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<string>('Loading your live snapshot...');
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Pull real dashboard context whenever the drawer is opened so the
  // AI has up-to-date numbers instead of hardcoded placeholders.
  useEffect(() => {
    if (!isOpen) return;
    getDashboard()
      .then((d) => {
        setSnapshot(
          `Intelligence ${d.intelligence_score} • ₹${d.remaining_budget.toFixed(0)} Budget • ${d.placement_odds}% Placement Odds`
        );
      })
      .catch(() => setSnapshot('Live snapshot unavailable right now.'));
  }, [isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Quiet study cafes under ₹150 nearby',
    'How will scoring 85+ on DBMS affect my CGPA?',
    'Filter clothing under ₹800 before month-end',
    'Review internship matches for Docker'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    const userMsg: AIMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      // Pull fresh profile + dashboard data so Gemini answers with the
      // student's real GPA, budget, and target role instead of guessing.
      const [dashboard, profile] = await Promise.allSettled([getDashboard(), getMyProfile()]);

      const context: Record<string, unknown> = { active_module_filter: activeFilter };
      if (dashboard.status === 'fulfilled') {
        context.dashboard = {
          intelligence_score: dashboard.value.intelligence_score,
          remaining_budget: dashboard.value.remaining_budget,
          daily_budget_limit: dashboard.value.daily_budget_limit,
          academic_index: dashboard.value.academic_index,
          placement_odds: dashboard.value.placement_odds,
          tasks: dashboard.value.tasks,
        };
      }
      if (profile.status === 'fulfilled') {
        context.profile = {
          major: profile.value.major,
          current_gpa: profile.value.current_gpa,
          target_gpa: profile.value.target_gpa,
          target_role: profile.value.target_role,
        };
      }

      const { reply } = await askAi(text, context);

      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: 'Just now',
        richContent: undefined
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong reaching Compass AI. Please try again.';
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, sender: 'ai', text: message, timestamp: 'Just now' }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleAddStudyBlock = async () => {
    if (!onAddToPlanner) return;
    const ok = await onAddToPlanner('DBMS: Relational Algebra & Normalization (Odegaard 2nd Floor)');
    setActionSuccessToast(
      ok
        ? 'Added 3-Hour DBMS study session to your Saturday planner!'
        : 'Could not save the study session. Check your connection and try again.'
    );
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setActionSuccessToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-stretch justify-center lg:justify-end bg-on-background/55 backdrop-blur-xs transition-all">
      <div className="bg-surface-container-lowest w-full max-w-lg lg:max-w-md h-[92vh] lg:h-full rounded-t-3xl lg:rounded-none lg:rounded-l-3xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant/20 animate-in slide-in-from-bottom lg:slide-in-from-right duration-200">
        {/* Drag Handle & Header */}
        <div className="p-4 pb-2 border-b border-outline-variant/15 flex flex-col items-center bg-surface-container-low/50">
          <div className="w-12 h-1.5 rounded-full bg-outline-variant/60 mb-2"></div>

          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-[17px] font-bold text-on-surface">Ask Compass AI</h2>
                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
                </div>
                <p className="text-[11px] text-on-surface-variant font-medium">
                  {user?.full_name || 'Student'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant cursor-pointer transition-colors"
              type="button"
              aria-label="Close drawer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Module Filter Chips */}
          <div className="w-full flex gap-1.5 overflow-x-auto no-scrollbar pt-3 pb-1">
            {['All Modules', 'Academics', 'Finance & Dining', 'Explore Spots', 'Prep Readiness'].map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-colors cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-primary-container text-on-primary'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                  type="button"
                >
                  {filter}
                </button>
              ))}
          </div>

          {/* Live Snapshot Status Pill */}
          <div className="w-full mt-2 py-1.5 px-3 rounded-xl bg-primary-fixed/40 flex items-center justify-between text-[11px] text-on-primary-fixed">
            <span className="flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">sensors</span>
              Live Snapshot: {snapshot}
            </span>
          </div>
        </div>

        {/* Action Toast */}
        {actionSuccessToast && (
          <div className="m-3 p-2.5 rounded-xl bg-primary text-on-primary text-[12px] font-semibold flex items-center gap-2 shadow-md">
            <span className="material-symbols-outlined text-[16px]">check</span>
            <span>{actionSuccessToast}</span>
          </div>
        )}

        {/* Chat Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Message bubble */}
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-[13px] leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-primary-container text-on-primary rounded-br-xs'
                    : 'bg-surface-container-low text-on-surface rounded-bl-xs border border-outline-variant/15'
                }`}
              >
                {msg.text && <p>{msg.text}</p>}

              </div>
              <span className="text-[10px] text-outline mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-on-surface-variant text-[12px] bg-surface-container-low p-3 rounded-2xl w-fit">
              <span className="material-symbols-outlined text-[16px] animate-spin text-primary">
                progress_activity
              </span>
              <span>Synthesizing across timetable, syllabus, and budget...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-surface-container-low border-t border-outline-variant/15">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant text-[11px] font-medium whitespace-nowrap shadow-xs transition-colors cursor-pointer border border-outline-variant/15"
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-surface-container-lowest border-t border-outline-variant/20 flex items-center gap-2">
          <button
            aria-label="Voice prompt"
            onClick={() => {
              setActionSuccessToast('Voice input is not available yet — please type your question below.');
              if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
              toastTimeoutRef.current = setTimeout(() => setActionSuccessToast(null), 3000);
            }}
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant cursor-pointer transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">mic</span>
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Ask about exam weightage, cafes, or budget..."
            className="flex-1 h-10 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/15 text-[13px] text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            aria-label="Send message"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              inputText.trim()
                ? 'bg-primary text-on-primary shadow-xs hover:bg-primary-container'
                : 'bg-surface-container text-outline cursor-not-allowed'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
