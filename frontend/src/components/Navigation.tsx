import React, { useState, useEffect, useRef } from "react";
import { NavTab } from "../types";
import { notificationsApi, authApi } from "../services/api";
import { GlobalSearchEngine, GroupedSearchResult, SearchResultItem } from "../services/globalSearchEngine";

interface NotifItem {
  id: number;
  title: string;
  message: string;
  category: string;
  is_read: boolean;
}

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenAskAi: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenAskAi,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GroupedSearchResult[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Bug #7 — notification bell state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const DEMO_NOTIFICATIONS: NotifItem[] = [
    { id: 1, title: "Exam Alert", message: "Operating Systems Mid-Term in 48 hours.", category: "Exam", is_read: false },
    { id: 2, title: "Budget Advisory", message: "Daily spend target is ₹200. Stay on track!", category: "Budget", is_read: false },
    { id: 3, title: "Placement Opportunity", message: "Stripe software intern application deadline approaching.", category: "Placement", is_read: false },
  ];

  // Debounced search engine execution (275ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        const res = GlobalSearchEngine.search(searchQuery, activeTab);
        setSearchResults(res);
      } else {
        setSearchResults([]);
      }
    }, 275);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectSearchResult = (item: SearchResultItem) => {
    setSearchQuery("");
    setSearchFocused(false);
    if (item.moduleName === "AI Assistant") {
      onOpenAskAi();
    } else {
      setActiveTab(item.moduleTab);
    }
  };

  const handleBellClick = async () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening && notifications.length === 0) {
      setNotifLoading(true);
      try {
        const data = await notificationsApi.getAll();
        if (Array.isArray(data) && data.length > 0) {
          setNotifications(data);
        } else {
          setNotifications(DEMO_NOTIFICATIONS);
        }
      } catch {
        setNotifications(DEMO_NOTIFICATIONS);
      } finally {
        setNotifLoading(false);
      }
    }
  };

  const handleMarkRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await notificationsApi.markRead(id);
    } catch { /* offline state */ }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const categoryIcon: Record<string, string> = {
    Exam: "school",
    Budget: "payments",
    Placement: "work",
    default: "notifications",
  };

  const mainNavItems: { id: NavTab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "career-mentor", label: "Career Mentor", icon: "psychology" },
    { id: "intelligence-score", label: "Performance Report", icon: "insights" },
    { id: "study-planner", label: "Study Planner", icon: "event_note" },
    { id: "budget", label: "Budget", icon: "payments" },
    { id: "nearby-places", label: "Nearby Places", icon: "map" },
    { id: "risk-prediction", label: "Risk Prediction", icon: "warning" },
  ];

  return (
    <>
      {/* Top Navigation Bar for Dashboard/App Views */}
      {activeTab !== "landing" && (
        <header className="fixed top-0 left-0 md:left-64 right-0 z-40 h-16 flex justify-between items-center px-4 md:px-6 bg-[#131314]/70 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#c7c4d8] hover:text-white hover:bg-white/5"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            {/* Global Real-Time Search Bar */}
            <div className="relative hidden sm:block" ref={searchRef}>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c7c4d8] text-sm">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder="Search DBMS, Budget, Library, Hackathon..."
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-xs text-[#e5e2e3] w-64 md:w-80 focus:outline-none focus:border-[#4f46e5]/80 focus:bg-white/10 transition-all"
              />

              {/* Grouped Search Results Popover */}
              {searchFocused && searchQuery.trim().length > 0 && (
                <div className="absolute left-0 top-11 w-96 max-h-96 overflow-y-auto bg-[#1a1a22] border border-white/15 rounded-2xl shadow-2xl shadow-black/80 z-50 p-2 space-y-3">
                  {searchResults.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#c7c4d8]">
                      <span className="material-symbols-outlined text-[#c7c4d8] text-2xl mb-1 block">search_off</span>
                      No matching results found.
                    </div>
                  ) : (
                    searchResults.map((group) => (
                      <div key={group.moduleName} className="space-y-1">
                        <div className="px-3 py-1 flex items-center justify-between border-b border-white/10">
                          <span className="text-[10px] font-bold text-[#c3c0ff] uppercase tracking-wider">
                            {group.moduleName}
                          </span>
                          <span className="text-[9px] text-[#c7c4d8]">
                            {group.items.length} result(s)
                          </span>
                        </div>

                        <div className="space-y-1 pt-1">
                          {group.items.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleSelectSearchResult(item)}
                              className="p-2.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-between gap-3 group/item border border-transparent hover:border-white/10"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-[#4f46e5]/20 text-[#c3c0ff] flex items-center justify-center shrink-0 border border-[#4f46e5]/30">
                                  <span className="material-symbols-outlined text-sm">{item.icon}</span>
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-white group-hover/item:text-[#c3c0ff] transition-colors truncate">
                                    {item.title}
                                  </h4>
                                  <p className="text-[10px] text-[#c7c4d8] truncate">{item.description}</p>
                                </div>
                              </div>

                              <button className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[#c3c0ff] font-bold shrink-0 hover:bg-[#4f46e5] hover:text-white transition-all flex items-center gap-1">
                                <span>Open</span>
                                <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={onOpenAskAi}
              className="p-2 rounded-full hover:bg-white/5 text-[#c3c0ff] transition-colors relative active:scale-95 flex items-center gap-1.5 bg-white/5 border border-white/10 px-3"
            >
              <span className="material-symbols-outlined text-sm fill-1">auto_awesome</span>
              <span className="text-xs font-medium hidden sm:inline">Ask AI</span>
            </button>

            {/* Bug #7 — Notification Bell with dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                id="notification-bell-btn"
                onClick={handleBellClick}
                className="p-2 rounded-full hover:bg-white/5 text-[#c7c4d8] transition-colors relative active:scale-95"
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined text-lg">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#c3c0ff] rounded-full border-2 border-[#131314] animate-pulse" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-[#1a1a1e] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-[#c3c0ff] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {notifLoading ? (
                      <div className="flex items-center justify-center py-8 text-[#c7c4d8] text-xs gap-2">
                        <span className="material-symbols-outlined text-sm animate-spin">autorenew</span>
                        Loading…
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#c7c4d8]">No notifications yet.</div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-white/5 hover:bg-white/5 transition-colors ${n.is_read ? "opacity-50" : ""}`}
                        >
                          <div className={`w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center mt-0.5 ${n.category === "Exam" ? "bg-amber-500/20 text-amber-300" : n.category === "Budget" ? "bg-emerald-500/20 text-emerald-300" : "bg-[#4f46e5]/20 text-[#c3c0ff]"}`}>
                            <span className="material-symbols-outlined text-sm">{categoryIcon[n.category] || categoryIcon.default}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white leading-tight">{n.title}</p>
                            <p className="text-[11px] text-[#c7c4d8] mt-0.5 leading-relaxed">{n.message}</p>
                          </div>
                          {!n.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c3c0ff] flex-shrink-0 mt-1.5" />
                          )}
                        </button>
                      ))
                    )}
                  </div>

                  {unreadCount === 0 && notifications.length > 0 && (
                    <div className="px-4 py-2 text-center text-[10px] text-emerald-400">
                      ✓ All caught up!
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              onClick={() => setActiveTab("intelligence-score")}
              className="flex items-center gap-2 ml-1 pl-3 border-l border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="text-right hidden lg:block">
                <p className="text-xs font-bold leading-tight text-[#e5e2e3]">Student Profile</p>
                <p className="text-[10px] text-[#c7c4d8] uppercase tracking-wider">Account Active</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#4f46e5]/20 border border-[#4f46e5]/30 flex items-center justify-center text-[#c3c0ff]">
                <span className="material-symbols-outlined text-lg">account_circle</span>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Side Navigation Bar */}
      {activeTab !== "landing" && (
        <aside
          className={`fixed left-0 top-0 h-screen flex flex-col py-6 bg-[#131314] border-r border-white/10 w-64 z-50 transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="px-6 mb-8 flex items-center justify-between">
            <div>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="font-headline font-black text-xl text-[#c3c0ff] tracking-tight hover:opacity-90 transition-opacity text-left block"
              >
                Compass AI
              </button>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#c7c4d8] opacity-60">
                Premium Tier
              </p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 rounded-lg text-[#c7c4d8] hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {mainNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "text-[#c3c0ff] border-l-4 border-[#4f46e5] bg-[#4f46e5]/10 shadow-sm"
                      : "text-[#c7c4d8] hover:bg-white/5 hover:text-[#e5e2e3]"
                  }`}
                >
                  <span className={`material-symbols-outlined text-lg ${isActive ? "fill-1" : ""}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-4 pb-2 px-4">
              <p className="text-[10px] font-semibold text-[#918fa1] uppercase tracking-wider">
                Utilities & Config
              </p>
            </div>

            <button
              onClick={() => {
                onOpenAskAi();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#c7c4d8] hover:bg-white/5 hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-lg">smart_toy</span>
              <span>AI Assistant</span>
            </button>

            {/* Bug #9 — Settings nav item */}
            <button
              onClick={() => {
                setActiveTab("settings");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "settings"
                  ? "text-[#c3c0ff] border-l-4 border-[#4f46e5] bg-[#4f46e5]/10 shadow-sm"
                  : "text-[#c7c4d8] hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={`material-symbols-outlined text-lg ${activeTab === "settings" ? "fill-1" : ""}`}>settings</span>
              <span>Settings</span>
            </button>


            <button
              onClick={() => {
                authApi.logout();
                setActiveTab("auth");
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-300 hover:bg-red-500/10 transition-all"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span>Sign Out</span>
            </button>
          </nav>

          <div className="mt-auto px-4 pt-4">
            <button
              onClick={onOpenAskAi}
              className="w-full py-3 rounded-xl bg-[#4f46e5] text-[#dad7ff] font-headline font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#4f46e5]/20"
            >
              <span className="material-symbols-outlined text-sm fill-1">auto_awesome</span>
              <span>Ask AI</span>
            </button>
          </div>
        </aside>
      )}
    </>
  );
};
