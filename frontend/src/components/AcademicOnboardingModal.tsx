import React, { useState, useEffect } from 'react';
import { CollegeSelector, SelectedCollege } from './CollegeSelector';
import {
  submitAcademicOnboarding,
  updateAcademicProfile,
  AcademicOnboardingPayload,
  StudentSubjectInfo,
} from '../lib/api';

const DEGREE_OPTIONS = [
  'B.Tech / B.E.',
  'B.Sc Computer Science / IT',
  'BCA (Computer Applications)',
  'Diploma in Engineering',
  'M.Tech / M.E. / MS',
  'Other',
];

const BRANCH_OPTIONS: Record<string, string[]> = {
  'B.Tech / B.E.': [
    'Computer Science & Engineering (CSE)',
    'CSE (AI & Machine Learning)',
    'CSE (Data Science)',
    'Information Technology (IT)',
    'Electronics & Communication (ECE)',
    'Electrical & Electronics (EEE)',
    'Mechanical Engineering',
    'Civil Engineering',
  ],
  'B.Sc Computer Science / IT': [
    'B.Sc Computer Science',
    'B.Sc Information Technology',
    'B.Sc Data Science & Analytics',
    'B.Sc Mathematics & Computing',
  ],
  'BCA (Computer Applications)': [
    'General BCA',
    'BCA with Cloud Computing',
    'BCA with AI & Data Science',
  ],
  'Diploma in Engineering': [
    'Diploma in Computer Engineering',
    'Diploma in Electronics & Communication',
    'Diploma in Electrical Engineering',
  ],
  'M.Tech / M.E. / MS': [
    'M.Tech Computer Science & Engineering',
    'M.Tech Artificial Intelligence',
    'M.Tech Software Engineering',
  ],
};

const YEAR_OPTIONS = ['1st year', '2nd year', '3rd year', '4th year'];

const SEMESTER_OPTIONS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
];

const CURRICULUM_OPTIONS = [
  'Autonomous R22 Regulation',
  'AICTE Model Curriculum (2024)',
  'CBCS University Framework',
  'State Board Scheme',
  'Other Autonomous Scheme',
];

const PRE_POPULATED_SUBJECTS: Record<string, Array<{ code: string; name: string; credits: number }>> = {
  '5th Semester': [
    { code: 'CS-304', name: 'Database Management Systems', credits: 4 },
    { code: 'CS-302', name: 'Operating Systems', credits: 4 },
    { code: 'CS-303', name: 'Computer Networks', credits: 3 },
    { code: 'CS-401', name: 'Artificial Intelligence & Machine Learning', credits: 4 },
    { code: 'CS-306', name: 'Web Technologies & Cloud Systems', credits: 3 },
  ],
  '3rd Semester': [
    { code: 'CS-301', name: 'Data Structures & Algorithms', credits: 4 },
    { code: 'MA-201', name: 'Discrete Mathematics & Linear Algebra', credits: 4 },
    { code: 'CS-202', name: 'Digital Logic & Computer Organization', credits: 3 },
    { code: 'CS-203', name: 'Object Oriented Programming with Java', credits: 3 },
  ],
  default: [
    { code: 'CS-304', name: 'Database Management Systems', credits: 4 },
    { code: 'CS-302', name: 'Operating Systems', credits: 4 },
    { code: 'CS-303', name: 'Computer Networks', credits: 3 },
    { code: 'CS-401', name: 'Artificial Intelligence & Machine Learning', credits: 4 },
    { code: 'CS-306', name: 'Web Technologies & Cloud Systems', credits: 3 },
  ],
};

const FORMAT_OPTIONS = [
  { id: 'notes', label: 'Lecture Notes & Summaries', icon: 'description', desc: 'Concise, high-yield faculty & topper notes' },
  { id: 'textbook', label: 'Standard Textbooks', icon: 'menu_book', desc: 'Reference books with theoretical rigor' },
  { id: 'video', label: 'Video Lectures (NPTEL/MIT)', icon: 'smart_display', desc: 'In-depth conceptual video series' },
  { id: 'tutorial', label: 'Interactive Tutorials', icon: 'terminal', desc: 'Hands-on practice & lab exercises' },
  { id: 'pyq', label: 'Previous Year Papers', icon: 'quiz', desc: 'Past exam papers with step-by-step solutions' },
  { id: 'syllabus', label: 'Official Syllabus Guides', icon: 'verified', desc: 'Curriculum ordinance and weightage tables' },
];

const CAREER_INTEREST_OPTIONS = [
  'AI & Machine Learning',
  'Backend Engineering',
  'Cloud Architecture & DevOps',
  'Full-Stack Web Development',
  'Cybersecurity & Network Defense',
  'Data Science & Analytics',
  'Systems & Embedded Software',
];

interface AcademicOnboardingModalProps {
  isOpen?: boolean;
  mode?: 'onboarding' | 'edit';
  initialData?: any;
  onComplete: () => void;
  onClose?: () => void;
}

export const AcademicOnboardingModal: React.FC<AcademicOnboardingModalProps> = ({
  isOpen = true,
  mode = 'onboarding',
  initialData,
  onComplete,
  onClose,
}) => {
  const [step, setStep] = useState<number>(1);

  // Step 1: Academic Profile
  const [degree, setDegree] = useState<string>('B.Tech / B.E.');
  const [branch, setBranch] = useState<string>('Computer Science & Engineering (CSE)');
  const [customBranch, setCustomBranch] = useState<string>('');
  const [selectedCollege, setSelectedCollege] = useState<SelectedCollege | null>(null);
  const [academicYear, setAcademicYear] = useState<string>('3rd year');
  const [semester, setSemester] = useState<string>('5th Semester');
  const [curriculum, setCurriculum] = useState<string>('Autonomous R22 Regulation');
  const [enrolledSubjects, setEnrolledSubjects] = useState<Array<{ code: string; name: string; credits: number }>>([]);
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);

  // Step 2: Academic Goals
  const [targetGpa, setTargetGpa] = useState<number>(8.5);
  const [upcomingExams, setUpcomingExams] = useState<Array<{ subject: string; name: string; date: string }>>([
    { subject: 'Database Management Systems', name: 'Mid-Term Exam 1', date: '2026-11-15' },
    { subject: 'Operating Systems', name: 'Lab Practical Assessment', date: '2026-11-22' },
  ]);
  const [newExamSubject, setNewExamSubject] = useState('');
  const [newExamName, setNewExamName] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [showAddExam, setShowAddExam] = useState(false);
  const [improvementSubjects, setImprovementSubjects] = useState<string[]>(['CS-304']);
  const [academicTargets, setAcademicTargets] = useState<string[]>(['Target GPA: 8.5+', 'Clear All Units Early']);
  const [careerInterests, setCareerInterests] = useState<string[]>(['AI & Machine Learning', 'Backend Engineering']);

  // Step 3: Learning Preferences
  const [preferredFormats, setPreferredFormats] = useState<string[]>(['notes', 'videos', 'textbooks']);
  const [subjectProficiencies, setSubjectProficiencies] = useState<Record<string, string>>({
    'CS-304': 'Beginner',
    'CS-302': 'Intermediate',
    'CS-303': 'Intermediate',
    'CS-401': 'Beginner',
    'CS-306': 'Advanced',
  });
  const [preferredLanguage, setPreferredLanguage] = useState<string>('English');
  const [dailyStudyHours, setDailyStudyHours] = useState<number>(3.0);
  const [learningStyle, setLearningStyle] = useState<string>('Visual & High-Yield Notes');

  // Submission & Validation States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize data on mount or when initialData changes
  useEffect(() => {
    if (initialData) {
      if (initialData.degree) setDegree(initialData.degree);
      if (initialData.branch) setBranch(initialData.branch);
      if (initialData.academic_year) setAcademicYear(initialData.academic_year);
      if (initialData.semester) setSemester(initialData.semester);
      if (initialData.curriculum) setCurriculum(initialData.curriculum);
      if (initialData.target_gpa) setTargetGpa(Number(initialData.target_gpa));
      if (initialData.college) {
        setSelectedCollege({ name: initialData.college, id: initialData.college_id || null });
      }
      if (initialData.subjects_list && initialData.subjects_list.length > 0) {
        setEnrolledSubjects(initialData.subjects_list);
      } else if (initialData.subjects && initialData.subjects.length > 0) {
        setEnrolledSubjects(initialData.subjects);
      } else {
        const def = PRE_POPULATED_SUBJECTS[initialData.semester] || PRE_POPULATED_SUBJECTS.default;
        setEnrolledSubjects(def);
      }
      if (initialData.learning_preferences) {
        if (initialData.learning_preferences.preferred_formats) {
          setPreferredFormats(initialData.learning_preferences.preferred_formats);
        }
        if (initialData.learning_preferences.daily_study_hours) {
          setDailyStudyHours(Number(initialData.learning_preferences.daily_study_hours));
        }
        if (initialData.learning_preferences.subject_proficiencies) {
          setSubjectProficiencies(initialData.learning_preferences.subject_proficiencies);
        }
      }
      if (initialData.academic_goals) {
        if (initialData.academic_goals.improvement_subjects) {
          setImprovementSubjects(initialData.academic_goals.improvement_subjects);
        }
        if (initialData.academic_goals.upcoming_exams) {
          setUpcomingExams(initialData.academic_goals.upcoming_exams);
        }
        if (initialData.academic_goals.career_interests) {
          setCareerInterests(initialData.academic_goals.career_interests);
        }
      }
    } else {
      // Default initial subjects
      const def = PRE_POPULATED_SUBJECTS[semester] || PRE_POPULATED_SUBJECTS.default;
      setEnrolledSubjects(def);
    }
  }, [initialData]);

  // Adjust pre-populated subjects when semester changes if list empty or user requests
  const handleSemesterChange = (newSem: string) => {
    setSemester(newSem);
    if (enrolledSubjects.length === 0 || mode === 'onboarding') {
      const def = PRE_POPULATED_SUBJECTS[newSem] || PRE_POPULATED_SUBJECTS.default;
      setEnrolledSubjects(def);
    }
  };

  const effectiveBranch = branch === 'Other' || !branch ? customBranch : branch;

  // Validation
  const validateStep = (s: number): boolean => {
    setErrorMsg(null);
    if (s === 1) {
      if (!degree.trim()) {
        setErrorMsg('Please select your degree/course.');
        return false;
      }
      if (!effectiveBranch.trim()) {
        setErrorMsg('Please select or specify your branch/specialization.');
        return false;
      }
      if (!semester.trim()) {
        setErrorMsg('Please select your current semester.');
        return false;
      }
      if (enrolledSubjects.length === 0) {
        setErrorMsg('Please add at least one subject to personalize recommendations.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 4) setStep(step + 1);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (step > 1) setStep(step - 1);
  };

  const handleToggleFormat = (fmtId: string) => {
    setPreferredFormats((prev) =>
      prev.includes(fmtId) ? prev.filter((f) => f !== fmtId) : [...prev, fmtId]
    );
  };

  const handleToggleImprovement = (code: string) => {
    setImprovementSubjects((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleToggleCareer = (interest: string) => {
    setCareerInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleProficiencyChange = (code: string, level: string) => {
    setSubjectProficiencies((prev) => ({
      ...prev,
      [code]: level,
    }));
  };

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    const code = newSubjectCode.trim() || `CS-${Math.floor(100 + Math.random() * 899)}`;
    const added = {
      code: code.toUpperCase(),
      name: newSubjectName.trim(),
      credits: 3,
    };
    setEnrolledSubjects((prev) => [...prev, added]);
    setSubjectProficiencies((prev) => ({ ...prev, [added.code]: 'Intermediate' }));
    setNewSubjectCode('');
    setNewSubjectName('');
    setShowAddSubject(false);
  };

  const handleRemoveSubject = (code: string) => {
    setEnrolledSubjects((prev) => prev.filter((s) => s.code !== code));
    setImprovementSubjects((prev) => prev.filter((c) => c !== code));
  };

  const handleAddExam = () => {
    if (!newExamSubject.trim() || !newExamName.trim()) return;
    setUpcomingExams((prev) => [
      ...prev,
      {
        subject: newExamSubject.trim(),
        name: newExamName.trim(),
        date: newExamDate || '2026-11-30',
      },
    ]);
    setNewExamSubject('');
    setNewExamName('');
    setNewExamDate('');
    setShowAddExam(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload: AcademicOnboardingPayload = {
        profile: {
          degree: degree.trim(),
          branch: effectiveBranch.trim(),
          college_id: selectedCollege?.id || null,
          college_name: selectedCollege?.name || 'Autonomous Engineering College',
          university_id: selectedCollege?.affiliated_university?.university_id || null,
          university_name: selectedCollege?.affiliated_university?.university_name || '',
          academic_year: academicYear.trim(),
          semester: semester.trim(),
          curriculum: curriculum.trim(),
          subjects: enrolledSubjects,
        },
        goals: {
          target_gpa: targetGpa,
          upcoming_exams: upcomingExams,
          improvement_subjects: improvementSubjects,
          academic_targets: academicTargets,
          career_interests: careerInterests,
        },
        preferences: {
          preferred_formats: preferredFormats,
          subject_proficiencies: subjectProficiencies,
          preferred_language: preferredLanguage,
          daily_study_hours: dailyStudyHours,
          learning_style: learningStyle,
        },
      };

      await submitAcademicOnboarding(payload);
      onComplete();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save academic profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 p-6 sm:p-7 text-white shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl border border-white/20">
                <span className="material-symbols-outlined text-[22px]">explore</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {mode === 'edit' ? 'Update Academic Profile' : 'Personalize Your Academic Compass'}
                </h1>
                <p className="text-indigo-200 text-xs sm:text-sm mt-0.5">
                  {mode === 'edit'
                    ? 'Adjust your subjects, semester, target goals, and resource preferences.'
                    : '4 quick steps to configure student-wise syllabus and resource discovery.'}
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                type="button"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Stepper Wizard Bar */}
          <div className="mt-6 grid grid-cols-4 gap-2 pt-4 border-t border-white/15">
            {[
              { num: 1, label: 'Academic Profile' },
              { num: 2, label: 'Academic Goals' },
              { num: 3, label: 'Preferences' },
              { num: 4, label: 'Review & Save' },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (validateStep(step)) setStep(s.num);
                }}
                className={`flex items-center gap-2 p-1.5 rounded-lg text-left transition-all ${
                  step === s.num
                    ? 'bg-white/20 text-white font-semibold'
                    : step > s.num
                    ? 'text-indigo-200 hover:text-white cursor-pointer'
                    : 'text-white/40 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    step === s.num
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : step > s.num
                      ? 'bg-emerald-400 text-emerald-950'
                      : 'bg-white/20 text-white/70'
                  }`}
                >
                  {step > s.num ? (
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  ) : (
                    s.num
                  )}
                </div>
                <span className="text-[11px] truncate hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span className="flex-1 font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Scrollable Step Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* STEP 1: Academic Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 text-[20px]">school</span>
                  <span>Step 1: Degree, Institution & Enrolled Subjects</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Specify your active academic program so the discovery engine aligns with your syllabus.
                </p>
              </div>

              {/* Degree & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Degree / Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                  >
                    {DEGREE_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Current Academic Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Branch / Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                >
                  {(BRANCH_OPTIONS[degree] || BRANCH_OPTIONS['B.Tech / B.E.']).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value="Other">Other / Specialized Track</option>
                </select>
                {branch === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter your exact specialization (e.g. Mechatronics)"
                    value={customBranch}
                    onChange={(e) => setCustomBranch(e.target.value)}
                    className="mt-2 w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-800"
                  />
                )}
              </div>

              {/* Semester & Curriculum */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Current Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => handleSemesterChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                  >
                    {SEMESTER_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Curriculum / Syllabus Scheme <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    value={curriculum}
                    onChange={(e) => setCurriculum(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                  >
                    {CURRICULUM_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* College & University Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  College / University <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <CollegeSelector
                  value={selectedCollege}
                  onChange={(col) => setSelectedCollege(col)}
                  placeholder="Search college name or AISHE code..."
                />
              </div>

              {/* Subjects List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-700">
                    Enrolled Subjects ({enrolledSubjects.length}) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddSubject(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Add Custom Subject</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {enrolledSubjects.map((s) => (
                    <div
                      key={s.code}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white transition-all shadow-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/50">
                          {s.code}
                        </span>
                        <h4 className="text-xs font-semibold text-gray-900 truncate mt-1">{s.name}</h4>
                        <span className="text-[10px] text-gray-500">{s.credits} Credits</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(s.code)}
                        className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                        title="Remove subject"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>

                {showAddSubject && (
                  <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2 mt-2">
                    <span className="text-xs font-bold text-indigo-900 block">Add New Subject</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Code (e.g. CS-305)"
                        value={newSubjectCode}
                        onChange={(e) => setNewSubjectCode(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium"
                      />
                      <input
                        type="text"
                        placeholder="Subject Name (e.g. Software Eng)"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="sm:col-span-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddSubject(false)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddSubject}
                        className="px-3.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow-xs"
                      >
                        Add to Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Academic Goals */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 text-[20px]">flag</span>
                  <span>Step 2: Academic Goals & Target Focus</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Identify subjects needing improvement, upcoming examinations, and career target disciplines.
                </p>
              </div>

              {/* Target GPA */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-800 block">Target Semester GPA</span>
                    <span className="text-[11px] text-gray-500">Benchmark your academic target performance</span>
                  </div>
                  <span className="text-base font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                    {targetGpa.toFixed(1)} / 10.0
                  </span>
                </div>
                <input
                  type="range"
                  min="6.0"
                  max="10.0"
                  step="0.1"
                  value={targetGpa}
                  onChange={(e) => setTargetGpa(Number.parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Subjects Needing Improvement */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Subjects Needing Improvement / Focus <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-gray-500 mb-2.5">
                  The discovery engine prioritizes high-yield lecture notes and foundational tutorials for these subjects.
                </p>
                <div className="flex flex-wrap gap-2">
                  {enrolledSubjects.map((s) => {
                    const isSelected = improvementSubjects.includes(s.code);
                    return (
                      <button
                        key={s.code}
                        type="button"
                        onClick={() => handleToggleImprovement(s.code)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px] text-amber-600">
                          {isSelected ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                        <span>{s.name} ({s.code})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming Examinations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-700">
                    Upcoming Examinations & Academic Deadlines
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddExam(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Add Examination</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {upcomingExams.map((exam, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-gray-900 block">{exam.name}</span>
                        <span className="text-[11px] text-gray-500">
                          {exam.subject} • Target Date: {exam.date}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUpcomingExams((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>

                {showAddExam && (
                  <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2">
                    <span className="text-xs font-bold text-indigo-900 block">Add Examination</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Subject (e.g. DBMS)"
                        value={newExamSubject}
                        onChange={(e) => setNewExamSubject(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium"
                      />
                      <input
                        type="text"
                        placeholder="Exam Name (e.g. Midterm 1)"
                        value={newExamName}
                        onChange={(e) => setNewExamName(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium"
                      />
                      <input
                        type="date"
                        value={newExamDate}
                        onChange={(e) => setNewExamDate(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddExam(false)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddExam}
                        className="px-3.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white"
                      >
                        Save Exam
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Career Interests */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Career Interests & Applied Disciplines
                </label>
                <div className="flex flex-wrap gap-2">
                  {CAREER_INTEREST_OPTIONS.map((interest) => {
                    const isSelected = careerInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleToggleCareer(interest)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Learning Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 text-[20px]">tune</span>
                  <span>Step 3: Learning Preferences & Proficiency</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Tell us how you study best so recommendations favor your preferred format and language.
                </p>
              </div>

              {/* Preferred Formats */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Preferred Learning Formats <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FORMAT_OPTIONS.map((fmt) => {
                    const isSelected = preferredFormats.includes(fmt.id);
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => handleToggleFormat(fmt.id)}
                        className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/60 border-indigo-400/80 shadow-xs ring-1 ring-indigo-400'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">{fmt.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-gray-900 block">{fmt.label}</span>
                          <span className="text-[11px] text-gray-500 block leading-tight mt-0.5">
                            {fmt.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject Proficiency Matrix */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-700">
                  Current Proficiency Level Per Subject
                </label>
                <div className="space-y-2">
                  {enrolledSubjects.map((s) => {
                    const currentLvl = subjectProficiencies[s.code] || 'Intermediate';
                    return (
                      <div
                        key={s.code}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-gray-200 bg-white gap-2"
                      >
                        <div>
                          <span className="text-xs font-semibold text-gray-900">{s.name}</span>
                          <span className="text-[10px] text-gray-500 ml-2">({s.code})</span>
                        </div>
                        <div className="flex items-center gap-1.5 self-start sm:self-auto">
                          {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => {
                            const isLvl = currentLvl === lvl;
                            return (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => handleProficiencyChange(s.code, lvl)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                  isLvl
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {lvl}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Available Study Time & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-700">Daily Available Study Time</label>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {dailyStudyHours} hrs / day
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="6.0"
                    step="0.5"
                    value={dailyStudyHours}
                    onChange={(e) => setDailyStudyHours(Number.parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Preferred Language
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800"
                  >
                    <option value="English">English</option>
                    <option value="Bilingual">Bilingual (English + Regional)</option>
                    <option value="Hindi">Hindi / Vernacular</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review and Save */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 text-[20px]">assignment_turned_in</span>
                  <span>Step 4: Review Academic Profile & Generate Discovery</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Verify your academic parameters before saving. You can adjust these anytime from My Academic Profile.
                </p>
              </div>

              {/* Review Card 1: Academic Profile */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-indigo-600">school</span>
                    <span>1. Academic Profile</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Program</span>
                    <span className="font-semibold text-gray-800">{degree}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Branch</span>
                    <span className="font-semibold text-gray-800">{effectiveBranch}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Semester</span>
                    <span className="font-semibold text-gray-800">{semester} ({academicYear})</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 block text-[10px] uppercase">Curriculum</span>
                    <span className="font-semibold text-gray-800">{curriculum}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Enrolled Subjects</span>
                    <span className="font-semibold text-indigo-700">{enrolledSubjects.length} Subjects</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {enrolledSubjects.map((s) => (
                    <span
                      key={s.code}
                      className="text-[11px] px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700 font-medium"
                    >
                      {s.code}: {s.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Review Card 2: Academic Goals */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-amber-600">flag</span>
                    <span>2. Academic Goals</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Target GPA</span>
                    <span className="font-semibold text-indigo-700">{targetGpa.toFixed(1)} / 10.0</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Focus Subjects</span>
                    <span className="font-semibold text-amber-700">
                      {improvementSubjects.length > 0 ? improvementSubjects.join(', ') : 'None specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Upcoming Exams</span>
                    <span className="font-semibold text-gray-800">{upcomingExams.length} Scheduled</span>
                  </div>
                </div>
                {careerInterests.length > 0 && (
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase mb-1">Career Interests</span>
                    <div className="flex flex-wrap gap-1.5">
                      {careerInterests.map((ci) => (
                        <span
                          key={ci}
                          className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200/50 text-indigo-700 font-medium"
                        >
                          {ci}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Review Card 3: Learning Preferences */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-indigo-600">tune</span>
                    <span>3. Learning Preferences</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Preferred Formats</span>
                    <span className="font-semibold text-gray-800 capitalize">
                      {preferredFormats.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Daily Study Time</span>
                    <span className="font-semibold text-gray-800">{dailyStudyHours} Hours/Day</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Language</span>
                    <span className="font-semibold text-gray-800">{preferredLanguage}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Continue</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Configuring Personalized Compass...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Save & Generate Recommendations</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
