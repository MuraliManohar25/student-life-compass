import React, { useState } from 'react';
import { StudentSpot } from '../types';

interface ExploreScreenProps {
  spots: StudentSpot[];
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ spots }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'radar'>('list');
  const [activeSpotModal, setActiveSpotModal] = useState<StudentSpot | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Spots', icon: 'apps' },
    { id: 'food', label: 'Food', icon: 'restaurant' },
    { id: 'study', label: 'Study Spots', icon: 'school' },
    { id: 'movies', label: 'Movies', icon: 'movie' },
    { id: 'essentials', label: 'Essentials', icon: 'local_pharmacy' },
    { id: 'transport', label: 'Transport', icon: 'directions_subway' },
    { id: 'career', label: 'Internships', icon: 'work' }
  ];

  const filteredSpots = spots.filter((spot) => {
    const matchesCategory =
      selectedCategory === 'all' || spot.category === selectedCategory;
    const matchesSearch =
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      spot.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSpotAction = (spot: StudentSpot) => {
    let msg = '';
    if (spot.actionType === 'navigate') {
      msg = `Opening step-by-step walking directions to ${spot.name} (${spot.distance})...`;
    } else if (spot.actionType === 'book_bms') {
      msg = `Redirecting to BookMyShow with student discount pass (₹180 ID applied) for ${spot.name}!`;
    } else if (spot.actionType === 'call') {
      msg = `Calling campus desk at ${spot.name}: +1 (206) 543-1000...`;
    } else if (spot.actionType === 'rapido') {
      msg = `Opening student campus bike hail at ${spot.name} (Fare estimated: ₹28)...`;
    } else if (spot.actionType === 'refill') {
      msg = `LPG cylinder hostel booking submitted for delivery in 24h!`;
    } else {
      msg = `Opened ${spot.name}`;
    }
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  return (
    <div className="flex flex-col w-full px-4 space-y-4 max-w-max-content-width mx-auto pb-4 pt-1">
      {/* Search and Location Header */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-indigo-600 text-[18px]">near_me</span>
            <span className="text-xs font-semibold text-[#1a1a1a]">
              Near North Campus • 500m radius
            </span>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              type="button"
              aria-label="List view"
            >
              <span className="material-symbols-outlined text-[16px]">view_list</span>
            </button>
            <button
              onClick={() => setViewMode('radar')}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                viewMode === 'radar'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              type="button"
              aria-label="Map radar view"
            >
              <span className="material-symbols-outlined text-[16px]">radar</span>
            </button>
          </div>
        </div>

        {/* Search Bar with integrated filter icon */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-gray-400">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified cafes, quiet spots, pharmacies..."
            className="w-full h-11 pl-11 pr-10 rounded-xl bg-white border border-gray-200 text-xs text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:border-indigo-600 shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer text-xs hover:bg-gray-200"
              type="button"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Scroller */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-0.5">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action Toast Notification */}
      {actionFeedback && (
        <div className="p-3 rounded-2xl bg-primary text-on-primary text-[12px] font-medium flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span className="flex-1">{actionFeedback}</span>
        </div>
      )}

      {/* CAMPUS RADAR CARD (Visible in Radar mode or as interactive widget) */}
      {viewMode === 'radar' && (
        <div className="relative overflow-hidden rounded-3xl bg-surface-container-highest p-5 shadow-sm text-center space-y-4 border border-outline-variant/20">
          <div className="flex items-center justify-between text-left">
            <div>
              <span className="text-[11px] uppercase font-bold text-secondary tracking-wider">
                Live Radar
              </span>
              <h3 className="text-[16px] font-bold text-on-surface">Campus Surroundings</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
              6 Active Beacons
            </span>
          </div>

          {/* Simulated Pulsing Radar Stage */}
          <div className="relative w-64 h-64 mx-auto rounded-full border border-primary/20 bg-surface-container flex items-center justify-center overflow-hidden">
            {/* Concentric rings */}
            <div className="absolute w-48 h-48 rounded-full border border-dashed border-primary/25"></div>
            <div className="absolute w-32 h-32 rounded-full border border-primary/30"></div>
            <div className="absolute w-16 h-16 rounded-full border border-primary/40"></div>

            {/* Sweep radar beam */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/10 to-transparent rounded-full animate-spin"></div>

            {/* Center User Pin */}
            <div className="relative z-10 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center ring-4 ring-primary-fixed shadow-md">
              <span className="w-2 h-2 rounded-full bg-white"></span>
            </div>

            {/* Beacon 1: Library */}
            <button
              onClick={() => setActiveSpotModal(spots[0])}
              className="absolute top-12 left-20 p-1.5 rounded-full bg-surface-container-lowest text-primary shadow-md hover:scale-110 transition-transform cursor-pointer"
              title="University Library"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">school</span>
            </button>

            {/* Beacon 2: Green Leaf */}
            <button
              onClick={() => setActiveSpotModal(spots[1])}
              className="absolute bottom-16 right-16 p-1.5 rounded-full bg-surface-container-lowest text-secondary shadow-md hover:scale-110 transition-transform cursor-pointer"
              title="Green Leaf Cafe"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">restaurant</span>
            </button>

            {/* Beacon 3: Metro */}
            <button
              onClick={() => setActiveSpotModal(spots[4])}
              className="absolute top-20 right-14 p-1.5 rounded-full bg-surface-container-lowest text-outline shadow-md hover:scale-110 transition-transform cursor-pointer"
              title="Metro Hub"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">directions_subway</span>
            </button>
          </div>

          <p className="text-[12px] text-on-surface-variant">
            Pulsing spots within walking distance from Computer Science Hall. Tap any beacon to view details.
          </p>
        </div>
      )}

      {/* Compass Proactive Spot Tip */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-secondary-fixed/40 via-surface-container-low to-primary-fixed/30 flex items-start gap-2.5 border border-outline-variant/15">
        <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
          tips_and_updates
        </span>
        <div className="text-[12px] leading-relaxed text-on-surface-variant">
          <strong className="text-on-surface">Compass Spot Tip:</strong> Odegaard Library 2nd floor quiet
          cubicles have lowest footfall between 2:00 PM and 5:00 PM today.
        </div>
      </div>

      {/* VERIFIED SPOTS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-[17px] font-bold text-on-surface">Verified Student Spots</h2>
          <span className="text-[11px] text-on-surface-variant font-medium">
            {filteredSpots.length} results
          </span>
        </div>

        {filteredSpots.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 space-y-2">
            <span className="material-symbols-outlined text-[32px] text-gray-400">location_off</span>
            <p className="text-xs font-semibold text-[#1a1a1a]">No matching spots found</p>
            <p className="text-xs text-gray-500">
              Try clearing filters or search for another landmark.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
              type="button"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredSpots.map((spot) => (
            <div
              key={spot.id}
              className="p-4 rounded-2xl bg-white shadow-xs flex flex-col space-y-3 border border-gray-200 hover:border-gray-300 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 shadow-xs relative border border-gray-100">
                  <img
                    className="w-full h-full object-cover"
                    src={spot.imageUrl}
                    alt={spot.name}
                    loading="lazy"
                  />
                  {spot.extraBadge && (
                    <span className="absolute bottom-1 left-1 right-1 text-center px-1 py-0.5 rounded bg-white/90 backdrop-blur-xs text-[#1a1a1a] text-[9px] font-bold truncate shadow-xs">
                      {spot.extraBadge}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="text-sm font-semibold text-[#1a1a1a] truncate">{spot.name}</h3>
                    <div className="flex items-center gap-0.5 bg-gray-50 px-1.5 py-0.5 rounded text-[11px] font-bold text-gray-700 border border-gray-100 shrink-0">
                      <span className="material-symbols-outlined text-[13px] text-amber-500">star</span>
                      <span>{spot.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-0.5 font-medium text-indigo-600">
                      <span className="material-symbols-outlined text-[13px]">near_me</span>
                      {spot.distance}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{spot.categoryLabel}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {spot.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-gray-50 border border-gray-100 text-gray-600 text-[10px] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status / Alert line and CTA button */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500 truncate pr-2">
                  {spot.alert ? (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      {spot.alert}
                    </span>
                  ) : (
                    spot.crowdInfo
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveSpotModal(spot)}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
                    type="button"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleSpotAction(spot)}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow-xs hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                    type="button"
                  >
                    <span>{spot.actionLabel}</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SPOT DETAILS MODAL */}
      {activeSpotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3.5 border border-outline-variant/20 animate-in zoom-in-95 duration-150">
            <div className="h-36 w-full rounded-2xl overflow-hidden relative">
              <img
                className="w-full h-full object-cover"
                src={activeSpotModal.imageUrl}
                alt={activeSpotModal.name}
              />
              <button
                onClick={() => setActiveSpotModal(null)}
                aria-label="Close dialog"
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center text-on-surface cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
              <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-[11px] font-bold">
                {activeSpotModal.distance}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[17px] font-bold text-on-surface">{activeSpotModal.name}</h3>
                <span className="text-[12px] font-bold text-primary flex items-center gap-0.5">
                  ★ {activeSpotModal.rating}
                </span>
              </div>
              <p className="text-[12px] text-on-surface-variant mt-0.5">
                Verified campus partner • Special rates with University ID
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {activeSpotModal.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface text-[11px] font-medium"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low text-[12px] text-on-surface-variant space-y-1">
              <div className="flex justify-between">
                <span>Crowd Level:</span>
                <span className="font-semibold text-on-surface">{activeSpotModal.crowdInfo}</span>
              </div>
              {activeSpotModal.extraBadge && (
                <div className="flex justify-between">
                  <span>Student Perk:</span>
                  <span className="font-semibold text-tertiary-container">
                    {activeSpotModal.extraBadge}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setActiveSpotModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-surface-container text-on-surface text-[12px] font-semibold cursor-pointer"
                type="button"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  const s = activeSpotModal;
                  setActiveSpotModal(null);
                  handleSpotAction(s);
                }}
                className="flex-[2] py-2.5 rounded-xl bg-primary text-on-primary text-[12px] font-bold flex items-center justify-center gap-1 cursor-pointer hover:bg-primary-container"
                type="button"
              >
                <span>{activeSpotModal.actionLabel}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
