import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getMyProfile,
  getBudgetSummary,
  updateMyProfile,
  ProfileOut,
  BudgetSummaryResponse,
  ApiError,
} from '../lib/api';
import { UserAvatar } from './UserAvatar';
import { getAvatar, setAvatar, clearAvatar, fileToAvatarDataUrl } from '../lib/avatar';

interface ProfileScreenProps {
  onBack: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileOut | null>(null);
  const [budget, setBudget] = useState<BudgetSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [college, setCollege] = useState('');
  const [major, setMajor] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [currentGpa, setCurrentGpa] = useState('');
  const [targetGpa, setTargetGpa] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedTick, setSavedTick] = useState(false);

  const [idCardOpen, setIdCardOpen] = useState(false);
  const [avatarTick, setAvatarTick] = useState(0);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const userId = user?.id as string | number | undefined;
  const displayName = user?.full_name || 'Student';
  const email = user?.email || '';

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [p, b] = await Promise.all([getMyProfile(), getBudgetSummary()]);
      setProfile(p);
      setBudget(b);
      setCollege(p.college || '');
      setMajor(p.major || '');
      setTargetRole(p.target_role || '');
      setCurrentGpa(String(p.current_gpa ?? ''));
      setTargetGpa(String(p.target_gpa ?? ''));
    } catch {
      setLoadError('Could not load your profile. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAvatarPick = async (file: File | undefined) => {
    if (!file) return;
    setAvatarError(null);
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file (JPG or PNG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be under 5 MB.');
      return;
    }
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setAvatar(dataUrl, userId);
      setAvatarTick((t) => t + 1);
    } catch {
      setAvatarError('Could not read that image. Try another file.');
    }
  };

  const handleRemoveAvatar = () => {
    clearAvatar(userId);
    clearAvatar();
    setAvatarTick((t) => t + 1);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateMyProfile({
        college: college.trim(),
        major: major.trim(),
        current_gpa: Number(currentGpa) || 0,
        target_gpa: Number(targetGpa) || 0,
        target_role: targetRole.trim(),
        sleep_hours: profile.sleep_hours,
        monthly_budget: budget?.monthly_budget ?? 0,
        skills: profile.skills || [],
      });
      const p = await getMyProfile();
      setProfile(p);
      setEditing(false);
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 1500);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 space-y-3 max-w-3xl mx-auto w-full" aria-label="Loading profile">
        <div className="h-6 w-40 rounded bg-gray-100 animate-pulse" />
        <div className="rounded-2xl bg-white border border-gray-200 p-4 flex gap-4">
          <div className="w-20 h-20 rounded-xl bg-gray-100 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 rounded bg-gray-100 animate-pulse" />
            <div className="h-4 w-48 rounded bg-gray-100 animate-pulse" />
            <div className="h-4 w-40 rounded bg-gray-100 animate-pulse" />
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 p-4 h-40 animate-pulse" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="px-4 py-10 max-w-md mx-auto text-center">
        <span className="material-symbols-outlined text-4xl text-gray-300">person_off</span>
        <h2 className="mt-2 text-lg font-semibold text-on-surface">Profile unavailable</h2>
        <p className="mt-1 text-sm text-on-surface-variant">{loadError}</p>
        <div className="mt-4 flex gap-2 justify-center">
          <button onClick={load} type="button" className="px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
            Retry
          </button>
          <button onClick={onBack} type="button" className="px-4 h-10 rounded-xl bg-gray-100 text-sm font-semibold hover:bg-gray-200">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const gpa = profile?.current_gpa ?? 0;
  const hasAvatar = !!getAvatar(userId);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6">
      {/* Top context row (matches design: Account Hub / Student Profile) */}
      <div className="py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} aria-label="Go back" type="button" className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors active:scale-95">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Account Hub</span>
            <h1 className="text-lg font-semibold text-on-surface leading-tight">Student Profile</h1>
          </div>
        </div>
        <button onClick={() => setEditing((e) => !e)} aria-label="Edit profile" type="button" className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container transition-colors active:scale-90">
          <span className="material-symbols-outlined text-[20px]">{editing ? 'close' : 'edit'}</span>
        </button>
      </div>

      <div className="space-y-3">
        {/* Identity card */}
        <section className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <UserAvatar name={displayName} userId={userId} size="xl" refreshKey={avatarTick} />
              <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5 shadow-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </span>
              {/* Upload affordance */}
              <button
                onClick={() => fileRef.current?.click()}
                aria-label="Update profile picture"
                title="Update profile picture"
                type="button"
                className="absolute inset-0 rounded-xl bg-black/0 hover:bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined text-[22px]">photo_camera</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleAvatarPick(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-lg font-semibold truncate">{displayName}</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />Enrolled
                </span>
              </div>
              <p className="text-sm text-indigo-600 font-medium mt-0.5">{profile?.cohort_standing ? `#${profile.cohort_standing}` : email ? `#${email.split('@')[0]}` : ''}</p>
              <p className="text-sm text-on-surface-variant truncate mt-0.5">
                {major || 'Add your major'} • {targetRole || 'Add a career goal'}
              </p>
              <p className="text-xs text-outline flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[13px]">location_on</span>
                {college || 'Add your college'}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => fileRef.current?.click()} type="button" className="text-xs font-semibold text-indigo-600 hover:underline">
                  {hasAvatar ? 'Change photo' : 'Upload photo'}
                </button>
                {hasAvatar && (
                  <button onClick={handleRemoveAvatar} type="button" className="text-xs font-medium text-gray-500 hover:underline">
                    Remove
                  </button>
                )}
              </div>
              {avatarError && <p className="mt-1 text-[11px] text-red-600">{avatarError}</p>}
            </div>
          </div>

          {/* Contact rows */}
          <div className="mt-4 rounded-xl bg-surface-container-low p-2 space-y-1 text-sm text-on-surface-variant">
            <div className="flex items-center justify-between px-1 py-1">
              <span className="flex items-center gap-2 truncate"><span className="material-symbols-outlined text-[16px] text-indigo-600">mail</span><span className="truncate">{email || 'No email'}</span></span>
              <span className="text-[11px] text-outline shrink-0">Official</span>
            </div>
            <div className="flex items-center justify-between px-1 py-1">
              <span className="flex items-center gap-2 truncate"><span className="material-symbols-outlined text-[16px] text-emerald-600">apartment</span><span className="truncate">{college || 'College not set'}</span></span>
              <span className="text-[11px] text-outline shrink-0">Campus</span>
            </div>
            <div className="flex items-center justify-between px-1 py-1">
              <span className="flex items-center gap-2 truncate"><span className="material-symbols-outlined text-[16px] text-outline">calendar_month</span><span className="truncate">{profile?.cohort_standing || 'Standing not set'}</span></span>
              <span className="text-[11px] text-outline shrink-0">Cohort</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => setEditing((e) => !e)} type="button" className="h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-indigo-700 active:scale-[0.98]">
              <span className="material-symbols-outlined text-[18px]">edit</span>{editing ? 'Cancel' : 'Edit Profile'}
            </button>
            <button onClick={() => setIdCardOpen(true)} type="button" className="h-10 rounded-xl bg-surface-container text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-surface-container-high active:scale-[0.98]">
              <span className="material-symbols-outlined text-[18px] text-indigo-600">badge</span>View Student ID Card
            </button>
          </div>

          {editing && (
            <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
              {[
                { label: 'College', value: college, set: setCollege, ph: 'Your college' },
                { label: 'Major', value: major, set: setMajor, ph: 'Your major' },
                { label: 'Career goal', value: targetRole, set: setTargetRole, ph: 'e.g. Backend Developer' },
              ].map((f) => (
                <label key={f.label} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-gray-600 shrink-0 w-24">{f.label}</span>
                  <input value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.ph} className="flex-1 min-w-0 h-9 px-2 rounded-lg bg-gray-50 border border-gray-200 font-medium text-sm focus:outline-none focus:border-indigo-600" />
                </label>
              ))}
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-gray-600">Current GPA</span>
                  <input value={currentGpa} onChange={(e) => setCurrentGpa(e.target.value)} inputMode="decimal" className="w-20 h-9 text-center rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-indigo-600" />
                </label>
                <label className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-gray-600">Target GPA</span>
                  <input value={targetGpa} onChange={(e) => setTargetGpa(e.target.value)} inputMode="decimal" className="w-20 h-9 text-center rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-indigo-600" />
                </label>
              </div>
              {saveError && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{saveError}</p>}
              <button onClick={handleSave} disabled={saving} type="button" className="w-full py-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-1.5">
                {savedTick ? (<><span className="material-symbols-outlined text-[18px]">check</span><span>Saved!</span></>) : (<span>{saving ? 'Saving…' : 'Save & Apply'}</span>)}
              </button>
            </div>
          )}
        </section>

        {/* Academic credentials */}
        <section className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Academic Credentials</h3>
            <span className="text-[11px] text-indigo-600 font-semibold">{profile?.cohort_standing || 'Enrolled'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface-container-low rounded-xl p-3">
              <span className="text-[11px] text-outline">Cumulative GPA</span>
              <div className="mt-1"><span className="text-lg font-bold">{gpa.toFixed(2)}</span><span className="text-sm text-outline ml-1">/ 4.00</span></div>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                <span className="material-symbols-outlined text-[14px]">verified</span>{gpa >= 2.0 ? 'Good Standing' : 'Needs attention'}
              </div>
            </div>
            <div className="bg-surface-container-low rounded-xl p-3">
              <span className="text-[11px] text-outline">Monthly Budget</span>
              <div className="mt-1"><span className="text-lg font-bold">₹{budget?.monthly_budget.toFixed(0) ?? '0'}</span></div>
              <div className="mt-1.5 w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(100, budget?.utilization_percentage ?? 0)}%` }} />
              </div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600"><span className="material-symbols-outlined text-[18px]">school</span></div>
              <div><p className="text-sm font-semibold">{targetRole || 'Set a career goal'}</p><p className="text-[11px] text-on-surface-variant">Target role • Match {profile?.market_match_index?.toFixed(0) ?? '0'}%</p></div>
            </div>
          </div>
        </section>

        {/* Emergency & security */}
        <section className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 space-y-2">
          <h3 className="text-base font-semibold">Emergency &amp; Security</h3>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-red-600"><span className="material-symbols-outlined text-[18px]">emergency</span></div>
              <div><p className="text-sm font-semibold">Signed in as</p><p className="text-[11px] text-on-surface-variant truncate">{email}</p></div>
            </div>
            <span className="text-[11px] text-outline font-medium">Primary</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600"><span className="material-symbols-outlined text-[18px]">verified_user</span></div>
              <div><p className="text-sm font-semibold">Verified account</p><p className="text-[11px] text-on-surface-variant">Session secured with token auth</p></div>
            </div>
            <span className="material-symbols-outlined text-emerald-700 text-[18px]">shield</span>
          </div>
        </section>

        {/* Account actions */}
        <section className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 space-y-2">
          <button onClick={onBack} type="button" className="w-full h-10 rounded-xl bg-surface-container text-sm font-medium flex items-center justify-center gap-2 hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-[18px]">switch_account</span>Back to Dashboard
          </button>
          <button onClick={() => { logout(); }} type="button" className="w-full h-10 rounded-xl bg-red-50 text-red-600 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-100">
            <span className="material-symbols-outlined text-[18px]">logout</span>Log Out
          </button>
        </section>

        <p className="text-center py-1 text-[11px] text-outline">Student Compass Academic • Campus Node</p>
      </div>

      {/* Student ID card modal */}
      {idCardOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIdCardOpen(false)}>
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl space-y-4 text-center relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center" onClick={() => setIdCardOpen(false)} aria-label="Close ID card" type="button">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
            <div>
              <span className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider">Student Compass</span>
              <h4 className="text-lg font-semibold">Official Student Card</h4>
            </div>
            <div className="mx-auto w-32 h-32 bg-gray-50 rounded-2xl flex flex-col items-center justify-center gap-2 border border-gray-100">
              <UserAvatar name={displayName} userId={userId} size="lg" refreshKey={avatarTick} />
              <span className="font-mono text-[11px] text-gray-500 font-semibold tracking-widest">{email.split('@')[0] || 'STUDENT'}</span>
            </div>
            <div>
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-[11px] text-on-surface-variant">{major || college || 'Enrolled student'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
