import React from 'react';

interface CompassAIFABProps {
  onClick: () => void;
  isOpen: boolean;
}

export const CompassAIFAB: React.FC<CompassAIFABProps> = ({ onClick, isOpen }) => {
  if (isOpen) return null;

  return (
    <aside className="fixed bottom-20 right-4 z-40">
      <button
        onClick={onClick}
        className="flex items-center gap-2 pl-3.5 pr-4 h-11 rounded-xl bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-all duration-200 active:scale-95 cursor-pointer group border border-indigo-500/30"
        type="button"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <span className="material-symbols-outlined text-[19px] transition-transform group-hover:rotate-12">
          psychology
        </span>
        <span className="text-[13px] font-medium tracking-wide">Ask Compass AI</span>
      </button>
    </aside>
  );
};
