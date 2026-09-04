import React, { useState } from 'react';
import { ShoppingItem } from '../types';

interface FinanceScreenProps {
  shoppingItems: ShoppingItem[];
  onToggleShoppingItem: (id: string) => void;
}

export const FinanceScreen: React.FC<FinanceScreenProps> = ({
  shoppingItems,
  onToggleShoppingItem
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('wed');
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);

  const baseBalance = 2500;
  const selectedItemsTotal = shoppingItems
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.price, 0);

  const projectedBalance = baseBalance - selectedItemsTotal;

  const handleConfirmReservation = () => {
    setReserveSuccess(true);
    setTimeout(() => {
      setReserveSuccess(false);
      setShowReserveModal(false);
    }, 1800);
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 space-y-6 max-w-[1400px] mx-auto pb-6 pt-1 lg:pt-2">
      {/* 2-Column Responsive Dashboard Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Allowance Balance & Category Outflow */}
        <div className="lg:col-span-5 space-y-6">
          {/* SECTION 1: ALLOWANCE BALANCE CARD */}
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-xs p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  October Allowance
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-light text-[#1a1a1a] tracking-tight">₹2,500</span>
                  <span className="text-xs text-gray-400 font-normal">remaining</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                On Track
              </span>
            </div>

            {/* Vital metadata strip */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">calendar_today</span>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Billing Cycle</span>
                  <span className="text-xs font-semibold text-[#1a1a1a]">9 days left</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">speed</span>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Daily Safe Limit</span>
                  <span className="text-xs font-semibold text-[#1a1a1a]">₹277 / day</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: CATEGORY OUTFLOW */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-4 space-y-3 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-on-surface">Category Outflow</h2>
              <span className="text-[11px] text-primary font-bold">October</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-surface-container-low space-y-1">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-primary text-[18px]">restaurant</span>
                  <span className="text-[11px] font-bold text-on-surface-variant">47%</span>
                </div>
                <span className="text-[11px] text-on-surface-variant block font-medium">Food & Mess</span>
                <span className="text-[15px] font-bold text-on-surface block">₹2,100</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low space-y-1">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-secondary text-[18px]">menu_book</span>
                  <span className="text-[11px] font-bold text-on-surface-variant">21%</span>
                </div>
                <span className="text-[11px] text-on-surface-variant block font-medium">Stationery & Books</span>
                <span className="text-[15px] font-bold text-on-surface block">₹950</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low space-y-1">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-tertiary text-[18px]">movie</span>
                  <span className="text-[11px] font-bold text-on-surface-variant">18%</span>
                </div>
                <span className="text-[11px] text-on-surface-variant block font-medium">Entertainment</span>
                <span className="text-[15px] font-bold text-on-surface block">₹800</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low space-y-1">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-outline text-[18px]">directions_subway</span>
                  <span className="text-[11px] font-bold text-on-surface-variant">14%</span>
                </div>
                <span className="text-[11px] text-on-surface-variant block font-medium">Metro & Commute</span>
                <span className="text-[15px] font-bold text-on-surface block">₹650</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Monthly Spend Pulse & Smart Campus Shopping */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 2: MONTHLY SPEND PULSE */}
          <div className="bg-white rounded-2xl shadow-xs p-6 space-y-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Monthly Spend Pulse</h2>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                Allocated: <strong className="text-[#1a1a1a]">₹7,000</strong>
              </span>
            </div>

            {/* Progress Bar with Split Targets */}
            <div className="space-y-2">
              <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden flex">
                <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: '64%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>Spent: ₹4,500</span>
                <span className="text-indigo-600 font-semibold">36% Safe</span>
                <span>Target: ₹7,000</span>
              </div>
            </div>

            {/* Daily Pace Visual Bars */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="font-semibold text-[#1a1a1a]">This Week's Pace</span>
                <span>Avg: ₹155/day</span>
              </div>
              <div className="flex items-end justify-between px-2 h-16 pt-2">
                {[
                  { id: 'mon', day: 'M', label: 'Mon', h: 'h-6', val: '₹130' },
                  { id: 'tue', day: 'T', label: 'Tue', h: 'h-8', val: '₹170' },
                  { id: 'wed', day: 'W', label: 'Wed', h: 'h-12', val: '₹240', isCurrent: true },
                  { id: 'thu', day: 'T', label: 'Thu', h: 'h-5', val: '₹110' },
                  { id: 'fri', day: 'F', label: 'Fri', h: 'h-9', val: '₹180' },
                  { id: 'sat', day: 'S', label: 'Sat', h: 'h-4', val: '₹90' },
                  { id: 'sun', day: 'S', label: 'Sun', h: 'h-2', val: '₹40' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedDay(item.id)}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
                    type="button"
                    title={`${item.label}: ${item.val}`}
                  >
                    <div
                      className={`w-4 rounded-t-sm transition-all ${item.h} ${
                        selectedDay === item.id
                          ? 'bg-indigo-600'
                          : item.isCurrent
                          ? 'bg-indigo-600'
                          : 'bg-gray-100 group-hover:bg-indigo-200'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-semibold uppercase ${
                        selectedDay === item.id
                          ? 'text-indigo-600 font-bold'
                          : 'text-gray-400'
                      }`}
                    >
                      {item.day}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Spending Nudge */}
            <div className="p-3 rounded-xl bg-surface-container-low flex items-start gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                auto_awesome
              </span>
              <p className="text-[12px] text-on-surface-variant leading-relaxed">
                Mess & snacks were <span className="font-semibold text-on-surface">15% higher this Thursday</span>.
                Keeping tomorrow’s canteen run under ₹180 preserves your weekend surplus.
              </p>
            </div>
          </div>

          {/* SECTION 4: SMART CAMPUS SHOPPING */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <h2 className="text-[17px] font-bold text-on-surface">Smart Campus Shopping</h2>
                </div>
                <p className="text-[12px] text-on-surface-variant">
                  Filtered strictly for your ₹2,500 safe limit
                </p>
              </div>
              <span className="text-[11px] bg-secondary-fixed text-on-secondary-fixed font-bold px-2 py-0.5 rounded-full">
                AI Vetted
              </span>
            </div>

            {/* Shopping Items List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shoppingItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between space-y-3 transition-all border ${
                    item.selected
                      ? 'border-primary/40 bg-surface-container-low/40'
                      : 'border-outline-variant/15'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container shrink-0 shadow-xs">
                      <img
                        className="w-full h-full object-cover"
                        src={item.imageUrl}
                        alt={item.name}
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="text-[13px] font-bold text-on-surface truncate">{item.name}</h3>
                        <span className="text-[13px] font-bold text-primary shrink-0">₹{item.price}</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <span className="text-[10px] text-outline uppercase tracking-wider font-semibold">
                      {item.budgetImpact}
                    </span>
                    <button
                      onClick={() => onToggleShoppingItem(item.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        item.selected
                          ? 'bg-primary-container text-on-primary shadow-xs'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                      type="button"
                    >
                      {item.selected ? '✓ Included' : '+ Add'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Simulated Balance Post-Purchase Sticky Simulation Card */}
            <div className="p-4 rounded-2xl bg-surface-container-low shadow-sm space-y-3 border border-outline-variant/20 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-on-surface-variant">
                  Simulated Balance Post-Purchase
                </span>
                <span
                  className={`text-[17px] font-bold ${
                    projectedBalance >= 500 ? 'text-primary' : 'text-error'
                  }`}
                >
                  ₹{projectedBalance >= 0 ? projectedBalance : 0}
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    projectedBalance >= 500 ? 'bg-primary' : 'bg-error'
                  }`}
                  style={{
                    width: `${Math.max(0, Math.min(100, (projectedBalance / baseBalance) * 100))}%`
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                <span>
                  {selectedItemsTotal > 0
                    ? `${shoppingItems.filter((i) => i.selected).length} items selected (₹${selectedItemsTotal})`
                    : 'No items selected'}
                </span>
                <span className="font-semibold text-tertiary-container">
                  {projectedBalance >= 500 ? 'Safe buffer remaining' : 'Approaching limit'}
                </span>
              </div>

              <button
                onClick={() => setShowReserveModal(true)}
                disabled={selectedItemsTotal === 0}
                className={`w-full py-3 rounded-xl text-[13px] font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedItemsTotal > 0
                    ? 'bg-primary text-on-primary hover:bg-primary-container active:scale-[0.99]'
                    : 'bg-surface-container text-outline cursor-not-allowed'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                <span>Review Campus Reserve (₹{selectedItemsTotal})</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* RESERVE CONFIRMATION MODAL */}
      {showReserveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 border border-outline-variant/20 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-primary uppercase tracking-wider">
                Campus Hold Reservation
              </span>
              <button
                onClick={() => setShowReserveModal(false)}
                className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer hover:bg-surface-container-high"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-[16px] font-bold text-on-surface">Lock Student Price for 48 Hours?</h3>
              <p className="text-[12px] text-on-surface-variant leading-relaxed">
                Items will be held at University Store & Partner senior hubs with guaranteed student pricing.
                No immediate payment deducted from allowance.
              </p>
            </div>

            <div className="bg-surface-container-low rounded-xl p-3 space-y-1.5 text-[12px]">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Hold Total</span>
                <span className="font-bold text-on-surface">₹{selectedItemsTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Projected Remaining Safe Balance</span>
                <span className="font-bold text-primary">₹{projectedBalance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Hold Validity</span>
                <span className="font-semibold text-tertiary">48 Hours (Free Cancellation)</span>
              </div>
            </div>

            <div className="pt-1 flex gap-2">
              <button
                onClick={() => setShowReserveModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-container text-on-surface text-[12px] font-semibold cursor-pointer"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReservation}
                className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-[12px] font-semibold cursor-pointer flex items-center justify-center gap-1 hover:bg-primary-container"
                type="button"
              >
                {reserveSuccess ? (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Reserved!</span>
                  </>
                ) : (
                  <span>Confirm Hold</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
