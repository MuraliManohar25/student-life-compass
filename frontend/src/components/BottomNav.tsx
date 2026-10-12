import React from 'react';
import { NavTab } from '../types';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs: Array<{ id: NavTab; label: string; icon: string }> = [
    { id: 'home', label: 'Home', icon: 'dashboard' },
    { id: 'academics', label: 'Academics', icon: 'school' },
    { id: 'finance', label: 'Finance', icon: 'account_balance_wallet' },
    { id: 'explore', label: 'Explore', icon: 'explore' },
    { id: 'insights', label: 'Insights', icon: 'trending_up' }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 w-full z-40 bg-white/95 backdrop-blur-md shadow-xs border-t border-gray-200 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-[1400px] mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-12 transition-all cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'text-indigo-600 font-medium'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
              type="button"
            >
              <span
                className="material-symbols-outlined text-[22px] transition-transform duration-150"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {tab.icon}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold leading-none">{tab.label}</span>
              {isActive && (
                <span className="w-4 h-0.5 rounded-full bg-indigo-600" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
