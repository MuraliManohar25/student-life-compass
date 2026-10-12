import React from 'react';
import { StudentSpot } from '../types';
import { getDirectionsUrl } from '../services/directionsService';

interface PlaceCardProps {
  spot: StudentSpot;
  userLat?: number;
  userLon?: number;
  isSelected?: boolean;
  isSaved?: boolean;
  isSaveBusy?: boolean;
  onSelectCard?: (spot: StudentSpot) => void;
  onToggleSave?: (spot: StudentSpot) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  spot,
  userLat,
  userLon,
  isSelected,
  isSaved,
  isSaveBusy,
  onSelectCard,
  onToggleSave,
}) => {
  const directionsUrl = getDirectionsUrl({
    userLat,
    userLon,
    destLat: spot.lat ?? 0,
    destLon: spot.lon ?? 0,
    destName: spot.name,
  });

  // Price badge display logic
  const renderPriceBadge = () => {
    if (spot.priceStatus === 'free') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
          <span>💰</span> FREE
        </span>
      );
    }
    if (spot.priceStatus === 'paid') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 text-[11px] font-bold border border-indigo-200 flex items-center gap-1">
          <span>💳</span> PAID
        </span>
      );
    }
    return (
      <span className="text-[11px] text-gray-500 italic">
        Price: Information unavailable
      </span>
    );
  };

  // Opening status display logic
  const renderOpeningStatus = () => {
    if (spot.openStatus === 'open') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          OPEN
        </span>
      );
    }
    if (spot.openStatus === 'closed') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          CLOSED
        </span>
      );
    }
    return (
      <span className="text-[11px] text-gray-400 font-medium">
        Hours unavailable
      </span>
    );
  };

  // Real-time availability display logic (Strictly never fabricated)
  const renderAvailabilityStatus = () => {
    if (spot.availabilityStatus === 'available') {
      return (
        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
          🟢 AVAILABLE
        </span>
      );
    }
    if (spot.availabilityStatus === 'full') {
      return (
        <span className="text-[11px] text-rose-700 font-semibold flex items-center gap-1">
          🔴 FULL
        </span>
      );
    }
    return (
      <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
        ⚪ Availability: Unknown
      </span>
    );
  };

  return (
    <div
      onClick={() => onSelectCard && onSelectCard(spot)}
      className={`p-4 rounded-2xl bg-white shadow-xs flex flex-col justify-between space-y-3 border transition-all cursor-pointer ${
        isSelected
          ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-md bg-indigo-50/20'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Spot Image */}
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

        {/* Spot Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <h3 className="text-sm font-bold text-[#1a1a1a] truncate leading-tight">
              📍 {spot.name}
            </h3>
            <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] font-bold text-amber-800 border border-amber-200 shrink-0">
              <span>★</span>
              <span>{spot.rating}</span>
            </div>
          </div>

          {/* Distance and Category */}
          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
            <span className="font-semibold text-indigo-600 flex items-center gap-0.5">
              📏 {spot.distance}
            </span>
            <span>•</span>
            <span className="capitalize font-medium">{spot.categoryLabel}</span>
          </div>

          {/* Address if available */}
          {spot.address && (
            <p className="text-[11px] text-gray-500 mt-0.5 truncate flex items-center gap-1">
              <span>📍</span> {spot.address}
            </p>
          )}

          {/* Status Badges Row */}
          <div className="flex flex-wrap items-center gap-2 mt-2 pt-1 border-t border-gray-100">
            {renderPriceBadge()}
            {renderOpeningStatus()}
          </div>
        </div>
      </div>

      {/* Footer Row: Real-time availability & Action buttons */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">{renderAvailabilityStatus()}</div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Bookmark Button */}
          {onToggleSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(spot);
              }}
              disabled={isSaveBusy}
              aria-label={isSaved ? 'Remove bookmark' : 'Bookmark spot'}
              title={isSaved ? 'Remove bookmark' : 'Bookmark spot'}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 ${
                isSaved
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSaved ? 'bookmark' : 'bookmark_border'}
              </span>
            </button>
          )}

          {/* Directions Button */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
          >
            <span>➡️ Directions</span>
          </a>
        </div>
      </div>
    </div>
  );
};
