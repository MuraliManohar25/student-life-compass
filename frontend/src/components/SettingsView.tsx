import React, { useState, useEffect } from "react";

const LS_SETTINGS_KEY = "compass_settings";

interface Settings {
  showLandingOnLoad: boolean;
  enableNotifications: boolean;
  showAiQuickInsight: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  showLandingOnLoad: true,
  enableNotifications: true,
  showAiQuickInsight: true,
};

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem(LS_SETTINGS_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const toggle = (key: keyof Settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    setSaved(false);
  };

  interface ToggleRowProps {
    id: string;
    label: string;
    description: string;
    icon: string;
    iconBg: string;
    iconColor: string;
    value: boolean;
    onChange: () => void;
  }

  const ToggleRow = ({ id, label, description, icon, iconBg, iconColor, value, onChange }: ToggleRowProps) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}>
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
        <div>
          <p className="text-xs font-bold text-white">{label}</p>
          <p className="text-[11px] text-[#c7c4d8] mt-0.5">{description}</p>
        </div>
      </div>
      <button
        id={id}
        onClick={onChange}
        role="switch"
        aria-checked={value}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none ${value ? "bg-[#4f46e5]" : "bg-white/10 border border-white/20"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${value ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-4xl mx-auto space-y-8">
      <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-[#4f46e5]/15 via-transparent to-transparent">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#c3c0ff] uppercase">PREFERENCES</span>
          <h1 className="font-headline font-black text-2xl sm:text-3xl text-white mt-0.5">Settings</h1>
          <p className="text-xs text-[#c7c4d8] mt-1">Customize your Compass AI experience. Changes are saved automatically.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Saved!
            </span>
          )}
          <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-[#4f46e5] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">save</span>
            Save Settings
          </button>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#4f46e5]/20 text-[#c3c0ff] flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">tune</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-base text-white">App Preferences</h2>
            <p className="text-[10px] text-[#c7c4d8]">Control the app startup and core behaviour</p>
          </div>
        </div>
        <div className="space-y-3">
          <ToggleRow id="toggle-show-landing" label="Show landing page on load" description="When enabled, the public landing page is shown first when you open the app." icon="home" iconBg="bg-cyan-500/20" iconColor="text-cyan-400" value={settings.showLandingOnLoad} onChange={() => toggle("showLandingOnLoad")} />
          <ToggleRow id="toggle-enable-notifications" label="Enable notification bell" description="Show the notification bell and unread dot in the top navigation bar." icon="notifications" iconBg="bg-amber-500/20" iconColor="text-amber-400" value={settings.enableNotifications} onChange={() => toggle("enableNotifications")} />
          <ToggleRow id="toggle-ai-quick-insight" label="Show AI Quick Insight button" description="Display the Quick AI Insight shortcut on the dashboard header." icon="auto_awesome" iconBg="bg-[#4f46e5]/20" iconColor="text-[#c3c0ff]" value={settings.showAiQuickInsight} onChange={() => toggle("showAiQuickInsight")} />
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">storage</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-base text-white">Data &amp; Storage</h2>
            <p className="text-[10px] text-[#c7c4d8]">Your tasks and events are stored in your browser</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[10px] text-[#c7c4d8] uppercase tracking-wider">Tasks Storage</p>
            <p className="text-sm font-bold text-white mt-1">localStorage</p>
            <p className="text-[11px] text-emerald-400 mt-0.5">Persisted across sessions</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[10px] text-[#c7c4d8] uppercase tracking-wider">Events Storage</p>
            <p className="text-sm font-bold text-white mt-1">localStorage</p>
            <p className="text-[11px] text-emerald-400 mt-0.5">Persisted across sessions</p>
          </div>
        </div>
        <button id="clear-local-data-btn" onClick={() => { localStorage.removeItem("compass_task_engine_v1"); localStorage.removeItem("compass_performance_metrics_v1"); localStorage.removeItem("compass_study_planner_v3"); localStorage.removeItem("compass_performance_engine_v4"); localStorage.removeItem("compass_tasks"); localStorage.removeItem("compass_timeline_events"); window.location.reload(); }} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#c7c4d8] hover:text-white hover:bg-white/10 transition-all">
          Clear Tasks &amp; Events (reload to defaults)
        </button>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#4f46e5]/20 text-[#c3c0ff] flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">info</span>
          </div>
          <h2 className="font-headline font-bold text-base text-white">About Compass AI</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <p className="text-[10px] text-[#c7c4d8] uppercase tracking-wider">Version</p>
            <p className="text-sm font-bold text-white">1.0.0</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <p className="text-[10px] text-[#c7c4d8] uppercase tracking-wider">Backend</p>
            <p className="text-sm font-bold text-white">FastAPI + SQLite</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <p className="text-[10px] text-[#c7c4d8] uppercase tracking-wider">Frontend</p>
            <p className="text-sm font-bold text-white">React + Vite + TypeScript</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">Source Code</p>
            <p className="text-[11px] text-[#c7c4d8]">github.com/MuraliManohar25/student-life-compass</p>
          </div>
          <a href="https://github.com/MuraliManohar25/student-life-compass" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-[#c3c0ff] hover:bg-white/10 transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            Open
          </a>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-red-500/20 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">warning</span>
          </div>
          <h2 className="font-headline font-bold text-base text-red-300">Reset</h2>
        </div>
        <p className="text-xs text-[#c7c4d8]">Restore all settings to their default values. This does not delete your tasks or timeline events.</p>
        <button id="reset-settings-btn" onClick={handleReset} className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold hover:bg-red-500/20 transition-all">
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};
