import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getAcademicCompass,
  searchAcademicResources,
  toggleSaveAcademicResource,
  AcademicCompassResponse,
  AcademicResourceOut,
  StudentSubjectInfo,
} from '../lib/api';
import { AcademicOnboardingModal } from './AcademicOnboardingModal';

interface AcademicCompassScreenProps {
  onOpenTools: (subTab?: 'planner' | 'sequencer' | 'pyqs' | 'stepguide' | 'resources') => void;
  onOpenProfile?: () => void;
}

const RESOURCE_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  notes: { label: 'Lecture Notes', icon: 'description', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  textbook: { label: 'Textbook', icon: 'menu_book', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  video: { label: 'Video Lecture', icon: 'smart_display', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  tutorial: { label: 'Tutorial', icon: 'terminal', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  pyq: { label: 'PYQ Paper', icon: 'quiz', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  syllabus: { label: 'Official Syllabus', icon: 'verified', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

const PROVENANCE_BADGES: Record<string, { label: string; bg: string }> = {
  official: { label: 'Official Institution', bg: 'bg-emerald-600 text-white' },
  curated: { label: 'Curated Academic', bg: 'bg-indigo-600 text-white' },
  external: { label: 'External Discovery', bg: 'bg-amber-600 text-white' },
};

export const AcademicCompassScreen: React.FC<AcademicCompassScreenProps> = ({
  onOpenTools,
  onOpenProfile,
}) => {
  // Main data state
  const [compassData, setCompassData] = useState<AcademicCompassResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active Subject Selection Filter
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('All');

  // Search & Catalog Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [sourceCategoryFilter, setSourceCategoryFilter] = useState<string>('All');
  const [semesterFilter, setSemesterFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [catalogPage, setCatalogPage] = useState<number>(1);
  const [catalogTotalPages, setCatalogTotalPages] = useState<number>(1);
  const [catalogLoading, setCatalogLoading] = useState<boolean>(false);
  const [catalogResources, setCatalogResources] = useState<AcademicResourceOut[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);

  // Profile Editor Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Action toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial compass data
  const loadCompass = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAcademicCompass();
      setCompassData(data);
    } catch (err: any) {
      setError(err.message || 'Could not load your Academic Compass. Please check connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompass();
  }, [loadCompass]);

  // Fetch / update catalog items based on filters
  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const res = await searchAcademicResources({
        q: searchQuery,
        subject_code: selectedSubjectCode,
        semester: semesterFilter,
        resource_type: typeFilter,
        source_category: sourceCategoryFilter,
        sort_by: sortBy,
        page: catalogPage,
        limit: 12,
      });
      setCatalogResources(res.resources || []);
      setCatalogTotalPages(res.total_pages || 1);
    } catch {
      // Fallback: don't wipe previous list on silent background query
    } finally {
      setCatalogLoading(false);
    }
  }, [searchQuery, selectedSubjectCode, semesterFilter, typeFilter, sourceCategoryFilter, sortBy, catalogPage]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // Toggle bookmark save on a resource
  const handleToggleSave = async (resource: AcademicResourceOut) => {
    try {
      const res = await toggleSaveAcademicResource(resource.id);
      showToast(res.message);

      // Optimistically update compass recommendations
      setCompassData((prev) => {
        if (!prev) return prev;
        const updatedRecs = prev.recommendations.map((r) =>
          r.id === resource.id ? { ...r, saved: res.saved, saved_id: res.saved_id } : r
        );
        return { ...prev, recommendations: updatedRecs };
      });

      // Optimistically update catalog resources
      setCatalogResources((prev) =>
        prev.map((r) =>
          r.id === resource.id ? { ...r, saved: res.saved, saved_id: res.saved_id } : r
        )
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update bookmark.');
    }
  };

  // Find currently selected subject details
  const activeSubject = useMemo(() => {
    if (!compassData || selectedSubjectCode === 'All') return null;
    return compassData.subjects.find((s) => s.code === selectedSubjectCode) || null;
  }, [compassData, selectedSubjectCode]);

  // Filtered catalog resources (handling showSavedOnly client-side filter)
  const displayedCatalogResources = useMemo(() => {
    if (showSavedOnly) {
      return catalogResources.filter((r) => r.saved);
    }
    return catalogResources;
  }, [catalogResources, showSavedOnly]);

  if (loading && !compassData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 space-y-4">
        <div className="w-12 h-12 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-xs font-semibold text-gray-500">
          Personalizing your Academic Compass & syllabus materials...
        </span>
      </div>
    );
  }

  if (error && !compassData) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl border border-red-100 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[24px]">error</span>
        </div>
        <h2 className="text-base font-bold text-gray-900">Failed to Load Academic Compass</h2>
        <p className="text-xs text-gray-500">{error}</p>
        <button
          onClick={loadCompass}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const student = compassData?.student_summary;
  const subjects = compassData?.subjects || [];
  const recommendations = compassData?.recommendations || [];

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 space-y-8 max-w-[1400px] mx-auto pb-16 pt-2">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 p-3.5 rounded-2xl bg-slate-900 text-white text-xs font-medium flex items-center gap-2.5 shadow-xl border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: Academic Compass Header */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-indigo-700/50">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold tracking-wide uppercase backdrop-blur-md border border-white/15">
                <span className="material-symbols-outlined text-[16px] text-indigo-300">explore</span>
                <span>Academic Compass</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 text-[11px] font-medium border border-indigo-400/30">
                Personalized Discovery
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {student?.full_name?.split(' ')[0] || 'Student'}!
            </h1>

            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              Your personalized academic resource discovery hub. We analyze your degree, enrolled syllabus,
              subject proficiencies, and learning preferences to surface high-yield study materials.
            </p>

            {/* Context Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px]">
              <span className="px-3 py-1 rounded-xl bg-white/10 font-semibold text-white border border-white/10">
                {student?.degree || 'B.Tech'}
              </span>
              <span className="px-3 py-1 rounded-xl bg-white/10 font-medium text-indigo-200 border border-white/10">
                {student?.branch || 'Computer Science & Engineering'}
              </span>
              <span className="px-3 py-1 rounded-xl bg-indigo-500/30 font-semibold text-white border border-indigo-400/30">
                {student?.semester || '5th Semester'}
              </span>
              <span className="px-3 py-1 rounded-xl bg-white/10 text-indigo-200 border border-white/10">
                {student?.curriculum || 'Autonomous R22'}
              </span>
            </div>
          </div>

          {/* Action Buttons: Edit Profile & Academic Tools Access */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all cursor-pointer shadow-xs active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => onOpenTools('planner')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all cursor-pointer shadow-md hover:shadow-indigo-500/25 active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">construction</span>
              <span>Academic Tools</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] bg-white text-indigo-900 font-extrabold uppercase">
                5 Tools
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: My Academic Profile Summary */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-[20px]">badge</span>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              My Academic Profile Summary
            </h2>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer inline-flex items-center gap-1"
          >
            <span>Update Preferences</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Enrolled Semester & Scheme */}
          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
              Program & Term
            </span>
            <span className="text-sm font-bold text-gray-900 block truncate">
              {student?.semester || '5th Semester'}
            </span>
            <span className="text-[11px] text-gray-500 block truncate">
              {student?.curriculum || 'Autonomous R22'}
            </span>
          </div>

          {/* Card 2: Subjects Focus */}
          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
              Active Subjects
            </span>
            <span className="text-sm font-bold text-gray-900 block">
              {subjects.length} Enrolled Courses
            </span>
            <span className="text-[11px] text-amber-700 font-semibold block">
              {student?.improvement_subjects?.length || 0} flagged for focus
            </span>
          </div>

          {/* Card 3: Academic Target */}
          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
              Target Target
            </span>
            <span className="text-sm font-bold text-indigo-700 block">
              {student?.target_gpa?.toFixed(1) || '8.5'} / 10.0 GPA
            </span>
            <span className="text-[11px] text-gray-500 block truncate">
              {student?.target_role || 'Software Engineer'}
            </span>
          </div>

          {/* Card 4: Learning Preference */}
          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
              Preferred Format
            </span>
            <span className="text-sm font-bold text-gray-900 block capitalize truncate">
              {student?.preferred_formats?.slice(0, 2).join(' & ') || 'Notes & Videos'}
            </span>
            <span className="text-[11px] text-gray-500 block">
              {student?.daily_study_hours || 3} hrs/day • {student?.preferred_language || 'English'}
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: My Subjects */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-[22px]">auto_stories</span>
              <span>My Subjects & Syllabus Modules</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select a subject to inspect syllabus units and filter verified learning resources.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedSubjectCode('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedSubjectCode === 'All'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Subjects
            </button>
          </div>
        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {subjects.map((subj) => {
            const isSelected = selectedSubjectCode === subj.code;
            return (
              <div
                key={subj.code}
                onClick={() => setSelectedSubjectCode(subj.code)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-400/30 shadow-xs'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {subj.code}
                    </span>
                    {subj.needs_improvement && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-tight">
                        Needs Focus
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">
                    {subj.name}
                  </h3>

                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <span>{subj.credits} Credits</span>
                    <span>•</span>
                    <span className="capitalize">{subj.proficiency}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">{subj.resource_count} resources</span>
                  <span
                    className={`font-semibold ${
                      isSelected ? 'text-indigo-700' : 'text-gray-400'
                    }`}
                  >
                    {isSelected ? 'Active Filter' : 'Filter by this'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Subject Unit Deep-Dive Banner */}
        {activeSubject && (
          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">
                  Active Syllabus Focus: {activeSubject.code} — {activeSubject.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-indigo-700 font-semibold border border-indigo-200">
                  {activeSubject.topics?.length || 5} Units / Modules
                </span>
              </div>
              <p className="text-xs text-indigo-950/80">
                Showing vetted materials for: {activeSubject.topics?.join(' • ') || 'Core units & topics'}.
              </p>
            </div>
            <button
              onClick={() => setSelectedSubjectCode('All')}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 px-3 py-1.5 rounded-xl bg-white border border-indigo-200 shrink-0 self-start md:self-center cursor-pointer shadow-xs"
            >
              Clear Subject Filter
            </button>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: Recommended for You */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-[22px]">recommend</span>
              <span>Recommended for You</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Curated based on your enrolled subjects, priority improvement areas, and preferred formats.
            </p>
          </div>

          <span className="text-xs text-gray-500 font-medium">
            {recommendations.length} personalized recommendations
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
            <span className="material-symbols-outlined text-gray-400 text-[32px]">folder_open</span>
            <p className="text-xs font-semibold text-gray-600">No active recommendations for this filter.</p>
            <p className="text-[11px] text-gray-400">Try adjusting your subjects or resetting filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recommendations.map((res) => {
              const typeMeta = RESOURCE_TYPE_LABELS[res.resource_type] || RESOURCE_TYPE_LABELS.notes;
              const provMeta = PROVENANCE_BADGES[res.source_category || 'curated'] || PROVENANCE_BADGES.curated;

              return (
                <div
                  key={res.id}
                  className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-indigo-300 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${typeMeta.color}`}>
                        <span className="material-symbols-outlined text-[13px]">{typeMeta.icon}</span>
                        <span>{typeMeta.label}</span>
                      </span>

                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${provMeta.bg}`}>
                        {provMeta.label}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                        {res.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-1">
                        <span className="font-semibold text-indigo-700">{res.subject_code}</span>
                        <span>•</span>
                        <span className="truncate">{res.institution_or_publisher || res.institution_name}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {res.description}
                    </p>

                    {/* Why Recommended Pill */}
                    {res.why_recommended && (
                      <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-indigo-600 text-[15px] shrink-0 mt-0.5">
                          psychology
                        </span>
                        <span className="text-[11px] text-indigo-950 font-medium leading-tight">
                          {res.why_recommended}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions: Open Resource & Bookmark */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>Open Resource</span>
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleToggleSave(res)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        res.saved
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                          : 'bg-white border-gray-200 text-gray-400 hover:text-gray-700'
                      }`}
                      title={res.saved ? 'Saved to bookmarks' : 'Save bookmark'}
                      aria-label="Save resource"
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={res.saved ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        bookmark
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: Browse and Discover Resources */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-[22px]">travel_explore</span>
            <span>Browse & Discover Academic Resources</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Filter through our verified catalog of textbooks, lecture notes, video series, previous-year question papers, and official syllabus ordinances.
          </p>
        </div>

        {/* Search Bar & Primary Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search Input */}
          <div className="md:col-span-5 relative">
            <span className="material-symbols-outlined text-gray-400 text-[18px] absolute left-3.5 top-3">
              search
            </span>
            <input
              type="text"
              placeholder="Search by topic, unit, keyword, or book title..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCatalogPage(1);
              }}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-gray-200 bg-gray-50/70 text-xs font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCatalogPage(1);
                }}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Subject Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedSubjectCode}
              onChange={(e) => {
                setSelectedSubjectCode(e.target.value);
                setCatalogPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 bg-gray-50/70 text-xs font-medium text-gray-800 focus:bg-white focus:border-indigo-600 outline-none"
            >
              <option value="All">All Enrolled Subjects</option>
              {subjects.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Resource Type Filter */}
          <div className="md:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCatalogPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 bg-gray-50/70 text-xs font-medium text-gray-800 focus:bg-white focus:border-indigo-600 outline-none"
            >
              <option value="All">All Formats</option>
              <option value="notes">Lecture Notes</option>
              <option value="textbook">Textbooks</option>
              <option value="video">Video Lectures</option>
              <option value="tutorial">Tutorials</option>
              <option value="pyq">PYQ Papers</option>
              <option value="syllabus">Official Syllabus</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 bg-gray-50/70 text-xs font-medium text-gray-800 focus:bg-white focus:border-indigo-600 outline-none"
            >
              <option value="relevance">Most Relevant</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Title (A-Z)</option>
              <option value="newest">Newest Added</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">
              Source:
            </span>
            {['All', 'official', 'curated', 'external'].map((cat) => {
              const active = sourceCategoryFilter === cat;
              const labels: Record<string, string> = {
                All: 'All Sources',
                official: 'Official Institution',
                curated: 'Curated Academic',
                external: 'External Discovery',
              };
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSourceCategoryFilter(cat);
                    setCatalogPage(1);
                  }}
                  className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {labels[cat]}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSavedOnly((prev) => !prev)}
              className={`px-3 py-1 rounded-xl text-[11px] font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                showSavedOnly
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">bookmark</span>
              <span>Saved Only</span>
            </button>
          </div>
        </div>

        {/* Results Catalog Grid */}
        {catalogLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-12 bg-gray-200 rounded w-full" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : displayedCatalogResources.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[24px]">search_off</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900">No Academic Resources Found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              We couldn't find matches for your active query and filters. Try clearing your search text or switching the format filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubjectCode('All');
                setTypeFilter('All');
                setSourceCategoryFilter('All');
                setShowSavedOnly(false);
                setCatalogPage(1);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedCatalogResources.map((res) => {
              const typeMeta = RESOURCE_TYPE_LABELS[res.resource_type] || RESOURCE_TYPE_LABELS.notes;
              const provMeta = PROVENANCE_BADGES[res.source_category || 'curated'] || PROVENANCE_BADGES.curated;

              return (
                <div
                  key={res.id}
                  className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${typeMeta.color}`}>
                        <span className="material-symbols-outlined text-[13px]">{typeMeta.icon}</span>
                        <span>{typeMeta.label}</span>
                      </span>

                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${provMeta.bg}`}>
                        {provMeta.label}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                      {res.title}
                    </h4>

                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <span className="font-semibold text-indigo-700">{res.subject_code}</span>
                      <span>•</span>
                      <span className="truncate">{res.institution_or_publisher || res.institution_name}</span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>Open Link</span>
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleToggleSave(res)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        res.saved
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                          : 'bg-white border-gray-200 text-gray-400 hover:text-gray-700'
                      }`}
                      title={res.saved ? 'Saved' : 'Save'}
                      aria-label="Save resource"
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={res.saved ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        bookmark
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {catalogTotalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Page {catalogPage} of {catalogTotalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCatalogPage((p) => Math.max(1, p - 1))}
                disabled={catalogPage <= 1}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCatalogPage((p) => Math.min(catalogTotalPages, p + 1))}
                disabled={catalogPage >= catalogTotalPages}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: Academic Profile and Resource Controls */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-400 text-[22px]">settings_suggest</span>
            <span>Academic Profile & Resource Controls</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Manage your personal settings, adjust subject enrollments, review saved bookmarks, or launch dedicated academic tools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Action 1: Edit Academic Profile */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Edit Academic Profile</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Degree, Year, Branch & Scheme</span>
            </div>
          </button>

          {/* Action 2: Manage My Subjects */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Manage My Subjects</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Add or remove enrolled courses</span>
            </div>
          </button>

          {/* Action 3: Saved Resources */}
          <button
            type="button"
            onClick={() => {
              setShowSavedOnly(true);
              const el = document.getElementById('browse-resources');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">bookmark</span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Saved Resources</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">View bookmarked materials</span>
            </div>
          </button>

          {/* Action 4: Update Learning Preferences */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Update Preferences</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Format, study hours & language</span>
            </div>
          </button>

          {/* Action 5: Explore Academic Tools */}
          <button
            type="button"
            onClick={() => onOpenTools('planner')}
            className="p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-md"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">construction</span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Explore Academic Tools</span>
              <span className="text-[10px] text-indigo-100 block mt-0.5">Planner, Sequencer, PYQs, AI Guide</span>
            </div>
          </button>
        </div>
      </section>

      {/* Profile Editor Modal */}
      {isEditModalOpen && (
        <AcademicOnboardingModal
          isOpen={isEditModalOpen}
          mode="edit"
          initialData={student ? {
            ...student,
            subjects_list: subjects,
            learning_preferences: {
              preferred_formats: student.preferred_formats,
              daily_study_hours: student.daily_study_hours,
              preferred_language: student.preferred_language,
            },
            academic_goals: {
              target_gpa: student.target_gpa,
              upcoming_exams: student.upcoming_exams,
              improvement_subjects: student.improvement_subjects,
              career_interests: student.career_interests,
            },
          } : undefined}
          onClose={() => setIsEditModalOpen(false)}
          onComplete={() => {
            setIsEditModalOpen(false);
            showToast('Academic profile and recommendations updated!');
            loadCompass();
            loadCatalog();
          }}
        />
      )}
    </div>
  );
};
