import React from 'react';
import { NavTab } from '../types';
import { ALEX_AVATAR_URL } from '../data/mockData';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
  onOpenNotifications,
  onOpenProfile
}) => {
  const tabs: Array<{ id: NavTab; label: string; icon: string; badge?: string }> = [
    { id: 'home', label: 'Dashboard', icon: 'dashboard' },
    { id: 'academics', label: 'Academics', icon: 'school', badge: 'AI' },
    { id: 'finance', label: 'Finance & Dining', icon: 'account_balance_wallet' },
    { id: 'explore', label: 'Explore Spots', icon: 'explore' },
    { id: 'insights', label: 'Insights & Risk', icon: 'trending_up', badge: 'New' }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-white border-r border-gray-200 z-30 p-4 justify-between select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xs shrink-0">
            S
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[17px] font-bold text-[#1a1a1a] tracking-tight truncate leading-tight">
              Student Compass
            </span>
            <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider truncate leading-tight mt-0.5">
              UW Seattle
            </span>
          </div>
        </div>

        {/* Action Buttons: Search & Notifications */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenSearch}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>Search</span>
          </button>
          <button
            onClick={onOpenNotifications}
            className="relative flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            <span>Alerts</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          <span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
            Main Menu
          </span>
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Student Profile Card */}
      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={onOpenProfile}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer text-left"
          type="button"
        >
          <img
            alt="Profile"
            className="w-9 h-9 rounded-lg object-cover ring-1 ring-gray-200 shrink-0"
            src={ALEX_AVATAR_URL}
          />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-[#1a1a1a] block truncate">
              Alex Rivers
            </span>
            <span className="text-[10px] text-gray-500 block truncate">
              CS • Sem 6 • 3.82 GPA
            </span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-gray-400">
            chevron_right
          </span>
        </button>
      </div>
    </aside>
  );
};
