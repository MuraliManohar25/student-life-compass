import React from 'react';
import { NavTab } from '../types';
import { APP_LOGO_URL, ALEX_AVATAR_URL } from '../data/mockData';

interface HeaderProps {
  currentTab: NavTab;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

const TAB_TITLES: Record<NavTab, string> = {
  home: 'Home',
  academics: 'Academics',
  finance: 'Finance',
  explore: 'Explore',
  insights: 'Insights'
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenSearch,
  onOpenNotifications,
  onOpenProfile
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      <div className="max-w-max-content-width mx-auto h-16 px-4 flex items-center justify-between gap-3">
        {/* Brand and Current Section Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-xs shrink-0">
            S
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate leading-tight">
              Student Compass
            </span>
            <span className="text-[17px] font-semibold text-[#1a1a1a] tracking-tight truncate leading-tight">
              {TAB_TITLES[currentTab]}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            aria-label="Search"
            onClick={onOpenSearch}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-[#1a1a1a] hover:bg-gray-100 transition-colors cursor-pointer active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          <button
            aria-label="Notifications"
            onClick={onOpenNotifications}
            className="w-9 h-9 relative flex items-center justify-center rounded-lg text-gray-500 hover:text-[#1a1a1a] hover:bg-gray-100 transition-colors cursor-pointer active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
          </button>

          <button
            aria-label="Student Profile"
            onClick={onOpenProfile}
            className="w-9 h-9 flex items-center justify-center rounded-lg ml-0.5 hover:opacity-90 transition-transform active:scale-95 cursor-pointer ring-1 ring-gray-200"
            type="button"
          >
            <img
              alt="Profile"
              className="w-7 h-7 rounded-md object-cover shadow-xs"
              src={ALEX_AVATAR_URL}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
