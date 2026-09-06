import React, { useEffect, useState } from 'react';
import { generateNotifications, getNotifications, markNotificationRead, NotificationRecord } from '../lib/api';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAcademics: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onNavigateToAcademics
}) => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    generateNotifications().catch(() => undefined).finally(() => getNotifications().then(setNotifications).catch(() => setNotifications([])).finally(() => setLoading(false)));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-4 pt-16">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-5 space-y-3.5 border border-gray-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-indigo-600">notifications</span>
            <h3 className="text-sm font-semibold text-[#1a1a1a]">Campus Activity & Alerts</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close notifications"
            className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer text-xs"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {loading && <p className="p-4 text-center text-xs text-gray-500">Loading activity…</p>}
          {!loading && notifications.length === 0 && <p className="p-4 text-center text-xs text-gray-500">No notifications yet. Alerts are created from deadlines and budget activity.</p>}
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                markNotificationRead(item.id).catch(() => undefined);
                if (item.category === 'Academic') {
                  onNavigateToAcademics();
                }
                onClose();
              }}
              className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100/70 transition-colors cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.category === 'Academic'
                        ? 'bg-rose-500'
                        : item.category === 'Budget'
                        ? 'bg-emerald-500'
                        : 'bg-indigo-600'
                    }`}
                  />
                  <span className="text-xs font-semibold text-[#1a1a1a]">{item.title}</span>
                </div>
                <span className="text-[10px] text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-gray-500 leading-snug">{item.message}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-colors cursor-pointer"
          type="button"
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
};
