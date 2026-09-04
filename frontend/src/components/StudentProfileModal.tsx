import React, { useState, useEffect, useRef } from 'react';
import { ALEX_AVATAR_URL } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose
}) => {
  const [targetGpa, setTargetGpa] = useState('3.85');
  const [dailyCap, setDailyCap] = useState('350');
  const [discoveryRadius, setDiscoveryRadius] = useState(2.5);
  const [stepByStepMode, setStepByStepMode] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [savedToast, setSavedToast] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleSave = () => {
    setSavedToast(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-gray-200 animate-in zoom-in-95 duration-150">
        {/* Header with Close */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Student Profile & Settings
          </span>
          <button
            onClick={onClose}
            aria-label="Close profile"
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Student Identity Card */}
        <div className="p-4 rounded-xl bg-gray-50 flex items-center gap-3.5 border border-gray-100">
          <div className="relative">
            <img
              src={ALEX_AVATAR_URL}
              alt={user?.full_name || 'Student'}
              className="w-16 h-16 rounded-full object-cover shadow-xs ring-2 ring-indigo-200"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[10px] text-white font-bold">
                check
              </span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-semibold text-[#1a1a1a] truncate">
                {user?.full_name || 'Student'}
              </h3>
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-200/50">
                Verified
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate">{user?.email || 'student@university.edu'}</p>
            <p className="text-xs text-indigo-600 font-semibold">Profile details coming next</p>
          </div>
        </div>

        {/* Vital Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">CGPA</span>
            <span className="text-xs font-semibold text-indigo-600">3.82 / 4.0</span>
          </div>
          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Monthly Cap</span>
            <span className="text-xs font-semibold text-[#1a1a1a]">₹7,000</span>
          </div>
          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Attendance</span>
            <span className="text-xs font-semibold text-emerald-600">89% Safe</span>
          </div>
        </div>

        {/* Academic & Career Preferences */}
        <div className="space-y-3 pt-1">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Academic & Career Focus
          </h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Target Semester GPA</span>
              <input
                type="text"
                value={targetGpa}
                onChange={(e) => setTargetGpa(e.target.value)}
                className="w-16 h-8 text-center rounded-lg bg-gray-50 border border-gray-200 font-semibold text-[#1a1a1a] text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Daily Discretionary Limit</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-[#1a1a1a]">₹</span>
                <input
                  type="text"
                  value={dailyCap}
                  onChange={(e) => setDailyCap(e.target.value)}
                  className="w-16 h-8 text-center rounded-lg bg-gray-50 border border-gray-200 font-semibold text-[#1a1a1a] text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Campus Discovery Radius Slider */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#1a1a1a]">Campus Discovery Radius</span>
            <span className="font-bold text-indigo-600">{discoveryRadius} km</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={discoveryRadius}
            onChange={(e) => setDiscoveryRadius(parseFloat(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-wider font-medium">
            <span>500m (Walking)</span>
            <span>2.5 km (Campus)</span>
            <span>10 km (Metro)</span>
          </div>
        </div>

        {/* Compass AI Preferences */}
        <div className="space-y-2.5 pt-1">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Compass AI Preferences
          </h4>

          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="min-w-0 pr-2">
              <span className="text-xs font-semibold text-[#1a1a1a] block">
                Detailed Step-by-Step Proofs
              </span>
              <span className="text-[11px] text-gray-500 block truncate">
                Generate full exam rubrics & minimal closure tables
              </span>
            </div>
            <button
              onClick={() => setStepByStepMode(!stepByStepMode)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                stepByStepMode ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
              type="button"
            >
              <span
                className={`w-5 h-5 rounded-full bg-white block shadow transform transition-transform ${
                  stepByStepMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="min-w-0 pr-2">
              <span className="text-xs font-semibold text-[#1a1a1a] block">
                8:00 PM Daily PYQ Drill Alert
              </span>
              <span className="text-[11px] text-gray-500 block truncate">
                High-yield question pushed to notification center
              </span>
            </div>
            <button
              onClick={() => setDailyReminder(!dailyReminder)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                dailyReminder ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
              type="button"
            >
              <span
                className={`w-5 h-5 rounded-full bg-white block shadow transform transition-transform ${
                  dailyReminder ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            type="button"
          >
            {savedToast ? (
              <>
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>Preferences Saved!</span>
              </>
            ) : (
              <span>Save & Apply Preferences</span>
            )}
          </button>

          <button
            onClick={() => alert('Downloading Semester CS-304 + Calculus Cheatsheet PDF...')}
            className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Semester Cheatsheet PDF</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
