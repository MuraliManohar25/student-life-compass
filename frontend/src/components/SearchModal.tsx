import React, { useState } from 'react';
import { NavTab } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (tab: NavTab) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const quickItems = [
    { title: 'DBMS Normalization Lab & BCNF', category: 'Academics', tab: 'academics' as NavTab, icon: 'school' },
    { title: 'October Safe Budget Remaining (₹2,500)', category: 'Finance', tab: 'finance' as NavTab, icon: 'account_balance_wallet' },
    { title: 'University Library Quiet Zone', category: 'Explore', tab: 'explore' as NavTab, icon: 'location_on' },
    { title: 'Calculus III Vector Integrals Revision', category: 'Academics', tab: 'academics' as NavTab, icon: 'school' },
    { title: 'Green Leaf Cafe Special Thali ₹120', category: 'Explore', tab: 'explore' as NavTab, icon: 'restaurant' },
    { title: 'Predicted Hot Question: Q3(b) 10 Marks', category: 'Academics', tab: 'academics' as NavTab, icon: 'psychology' }
  ];

  const results = quickItems.filter((i) =>
    i.title.toLowerCase().includes(query.toLowerCase()) ||
    i.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-4 pt-16">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-4 space-y-3 border border-gray-200 animate-in zoom-in-95 duration-150">
        {/* Search input bar */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
          <span className="material-symbols-outlined text-[20px] text-indigo-600">search</span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, spots, budget, PYQs..."
            className="w-full bg-transparent text-xs text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="w-6 h-6 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors cursor-pointer text-xs"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Results list */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
            {query ? 'Matching Results' : 'Suggested Campus Shortcuts'}
          </span>

          {results.map((item) => (
            <button
              key={item.title}
              onClick={() => {
                onSelectResult(item.tab);
                onClose();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-gray-50 flex items-center justify-between text-left transition-colors cursor-pointer group"
              type="button"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gray-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#1a1a1a] truncate">{item.title}</p>
                  <span className="text-[11px] text-gray-400">{item.category}</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover:text-indigo-600 transition-colors">
                chevron_right
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
