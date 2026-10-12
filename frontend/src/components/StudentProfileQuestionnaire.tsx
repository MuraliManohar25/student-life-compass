import React, { useState } from 'react';
import {
  CollegeSelector,
  SelectedCollege,
} from './CollegeSelector';
import {
  submitQuestionnaire,
  searchUniversities,
  UniversityOut,
  QuestionnairePayload,
} from '../lib/api';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Chandigarh',
  'Puducherry',
  'Jammu and Kashmir',
  'Ladakh',
];

const COURSE_OPTIONS = [
  'B.Tech / B.E.',
  'Degree / B.Sc. / B.Com. / B.A.',
  'Diploma',
  'Medical / Allied Health',
  'Other',
];

const BRANCH_SUGGESTIONS: Record<string, string[]> = {
  'B.Tech / B.E.': [
    'Computer Science & Engineering (CSE)',
    'CSE (Artificial Intelligence & Machine Learning)',
    'CSE (Data Science)',
    'Information Technology (IT)',
    'Electronics & Communication Engineering (ECE)',
    'Electrical & Electronics Engineering (EEE)',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
  ],
  'Degree / B.Sc. / B.Com. / B.A.': [
    'B.Sc Computer Science',
    'B.Sc Mathematics / Statistics / Physics',
    'B.Com General / Accounting & Finance',
    'B.Com Computer Applications',
    'B.A Economics / Political Science',
    'BBA / Management Studies',
    'B.Sc Biotechnology / Chemistry',
  ],
  'Diploma': [
    'Diploma in Computer Engineering',
    'Diploma in Mechanical Engineering',
    'Diploma in Electrical & Electronics',
    'Diploma in Civil Engineering',
    'Diploma in Electronics & Communication',
  ],
  'Medical / Allied Health': [
    'MBBS (Medicine & Surgery)',
    'BDS (Dental Surgery)',
    'B.Pharm (Pharmacy)',
    'B.Sc Nursing',
    'BPT (Physiotherapy)',
  ],
};

const YEAR_OPTIONS = [
  '1st year',
  '2nd year',
  '3rd year',
  '4th year',
  'Other',
];

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

interface StudentProfileQuestionnaireProps {
  onComplete: () => void;
}

export const StudentProfileQuestionnaire: React.FC<StudentProfileQuestionnaireProps> = ({
  onComplete,
}) => {
  // Questionnaire step (1 to 5: 1=College/Location, 2=Course/Branch, 3=Year/Sem, 4=Affiliation, 5=Review)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Q1 & Q2: College & Location
  const [selectedCollege, setSelectedCollege] = useState<SelectedCollege | null>(null);
  const [state, setState] = useState<string>('Telangana');
  const [district, setDistrict] = useState<string>('');
  const [city, setCity] = useState<string>('');

  // Q3 & Q4: Course & Branch
  const [course, setCourse] = useState<string>('B.Tech / B.E.');
  const [branch, setBranch] = useState<string>('');
  const [customBranch, setCustomBranch] = useState<string>('');

  // Q5 & Q6: Year & Semester
  const [academicYear, setAcademicYear] = useState<string>('1st year');
  const [semester, setSemester] = useState<string>('');

  // Q7: Affiliated University
  const [universityId, setUniversityId] = useState<string | null>(null);
  const [universityName, setUniversityName] = useState<string>('');
  const [isAffiliationVerified, setIsAffiliationVerified] = useState<boolean>(false);
  const [evidenceUrl, setEvidenceUrl] = useState<string>('');
  const [univSearchQuery, setUnivSearchQuery] = useState<string>('');
  const [univSearchResults, setUnivSearchResults] = useState<UniversityOut[]>([]);
  const [isSearchingUniv, setIsSearchingUniv] = useState<boolean>(false);
  const [showUnivDropdown, setShowUnivDropdown] = useState<boolean>(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // When college is selected in Q1, auto-populate Q2 and Q7 if available
  const handleCollegeChange = (col: SelectedCollege) => {
    setSelectedCollege(col);
    if (col.state) setState(col.state);
    if (col.district) setDistrict(col.district);
    if (col.city) setCity(col.city);

    // Q7 Affiliation
    if (col.affiliated_university) {
      setUniversityId(col.affiliated_university.university_id || null);
      setUniversityName(col.affiliated_university.university_name || '');
      setIsAffiliationVerified(col.affiliated_university.verification_status === 'verified');
      setEvidenceUrl(col.affiliated_university.evidence_url || '');
    } else {
      setUniversityId(null);
      setUniversityName('');
      setIsAffiliationVerified(false);
      setEvidenceUrl('');
    }
  };

  // Search universities for manual Q7 selection
  const handleSearchUniversities = async (q: string) => {
    setUnivSearchQuery(q);
    setShowUnivDropdown(true);
    if (!q.trim()) {
      setUnivSearchResults([]);
      return;
    }
    setIsSearchingUniv(true);
    try {
      const resp = await searchUniversities({ q: q.trim(), limit: 8 });
      setUnivSearchResults(resp.universities || []);
    } catch {
      setUnivSearchResults([]);
    } finally {
      setIsSearchingUniv(false);
    }
  };

  const handleSelectUniversity = (univ: UniversityOut) => {
    setUniversityId(univ.id);
    setUniversityName(univ.name);
    // Student input is unverified until certified
    setIsAffiliationVerified(false);
    setShowUnivDropdown(false);
    setUnivSearchQuery('');
  };

  const effectiveBranch = branch === 'Other' || !branch ? customBranch : branch;

  // Validation per step
  const canProceedStep1 = selectedCollege?.name?.trim() && state.trim() && district.trim();
  const canProceedStep2 = course.trim() && effectiveBranch.trim();
  const canProceedStep3 = academicYear.trim(); // Semester is optional
  const canProceedStep4 = true; // University is optional

  const handleNext = () => {
    setErrorMsg(null);
    if (currentStep === 1 && !canProceedStep1) {
      setErrorMsg('Please select your college and enter state and district.');
      return;
    }
    if (currentStep === 2 && !canProceedStep2) {
      setErrorMsg('Please select your course and specify your branch.');
      return;
    }
    if (currentStep === 3 && !canProceedStep3) {
      setErrorMsg('Please select your current year of study.');
      return;
    }
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload: QuestionnairePayload = {
        college_id: selectedCollege?.id || null,
        college_name: selectedCollege?.name || 'Independent Institution',
        state: state.trim(),
        district: district.trim(),
        city: city.trim(),
        course: course.trim(),
        branch: effectiveBranch.trim(),
        academic_year: academicYear.trim(),
        semester: semester.trim(),
        university_id: universityId || null,
        university_name: universityName.trim(),
      };

      await submitQuestionnaire(payload);
      onComplete();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save student profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsHeader = [
    { num: 1, title: 'College & Location' },
    { num: 2, title: 'Program & Branch' },
    { num: 3, title: 'Year & Semester' },
    { num: 4, title: 'University' },
    { num: 5, title: 'Review & Confirm' },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl border border-white/20">
              S
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Complete Your Student Profile</h1>
              <p className="text-indigo-200 text-xs sm:text-sm mt-0.5">
                Answer these 7 quick questions to personalize your academic timetable, syllabus, and campus tools.
              </p>
            </div>
          </div>

          {/* Step Progress Indicators */}
          <div className="mt-6 flex items-center justify-between gap-2 border-t border-white/10 pt-4">
            {stepsHeader.map((s) => (
              <div
                key={s.num}
                className="flex items-center gap-1.5 flex-1 min-w-0"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                    s.num === currentStep
                      ? 'bg-white text-indigo-700 shadow-md ring-2 ring-white/50'
                      : s.num < currentStep
                      ? 'bg-indigo-400/80 text-white'
                      : 'bg-white/20 text-white/70'
                  }`}
                >
                  {s.num < currentStep ? '✓' : s.num}
                </div>
                <span
                  className={`text-[11px] font-semibold truncate hidden md:inline ${
                    s.num === currentStep ? 'text-white' : 'text-indigo-200/70'
                  }`}
                >
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Q1 & Q2 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Question 1 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <label className="text-sm font-bold text-gray-900">
                    What is your college name? <span className="text-rose-500">*</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mb-2.5">
                  Select your verified institution from the College Master Dataset, or submit for verification if missing.
                </p>
                <CollegeSelector
                  value={selectedCollege}
                  onChange={handleCollegeChange}
                  required
                />
              </div>

              {/* Question 2 */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <label className="text-sm font-bold text-gray-900">
                    Where is your college located? <span className="text-rose-500">*</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Populated automatically from your institution. You can adjust if needed.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      State <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      District <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Hyderabad / Rangareddy"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      City / Town
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Gandipet / Hyderabad"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Q3 & Q4 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Question 3 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <label className="text-sm font-bold text-gray-900">
                    What course are you studying? <span className="text-rose-500">*</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Select your primary degree or program track.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {COURSE_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCourse(c);
                        setBranch('');
                        setCustomBranch('');
                      }}
                      className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                        course === c
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs ring-1 ring-indigo-600'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                      }`}
                    >
                      <span>{c}</span>
                      {course === c && (
                        <span className="material-symbols-outlined text-indigo-600 text-[18px]">
                          check_circle
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 4 */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  <label className="text-sm font-bold text-gray-900">
                    What is your branch or specialization? <span className="text-rose-500">*</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Choose from listed specializations or enter custom text.
                </p>

                {BRANCH_SUGGESTIONS[course] && (
                  <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                    {BRANCH_SUGGESTIONS[course].map((b) => (
                      <div
                        key={b}
                        onClick={() => {
                          setBranch(b);
                          setCustomBranch('');
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                          branch === b
                            ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 ring-1 ring-indigo-600'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span>{b}</span>
                        {branch === b && (
                          <span className="material-symbols-outlined text-[16px] text-indigo-600">
                            check
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {BRANCH_SUGGESTIONS[course]
                      ? 'Or enter custom branch/specialization:'
                      : 'Enter your branch or specialization:'}
                  </label>
                  <input
                    type="text"
                    value={customBranch}
                    onChange={(e) => {
                      setCustomBranch(e.target.value);
                      setBranch('Other');
                    }}
                    placeholder="e.g. Robotics & Automation, Cyber Security, etc."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Q5 & Q6 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Question 5 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                    5
                  </span>
                  <label className="text-sm font-bold text-gray-900">
                    Which year are you studying in? <span className="text-rose-500">*</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Select your current enrolled academic year.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {YEAR_OPTIONS.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setAcademicYear(y)}
                      className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                        academicYear === y
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs ring-1 ring-indigo-600'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 6 */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                      6
                    </span>
                    <label className="text-sm font-bold text-gray-900">
                      Which semester are you in?
                    </label>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Optional
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  You can select your current semester or skip this question without blocking progression.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {SEMESTER_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSemester(semester === s ? '' : s)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                        semester === s
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600 font-bold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600 bg-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {semester ? `Selected: ${semester}` : 'No semester selected.'}
                  </span>
                  {semester && (
                    <button
                      type="button"
                      onClick={() => setSemester('')}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Clear / Skip
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Q7 */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                    7
                  </span>
                  <label className="text-sm font-bold text-gray-900">
                    What is your affiliated university?
                  </label>
                </div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Optional
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Verified affiliations are automatically displayed from official regulatory accreditation records.
                If unknown or not listed, you can search or skip.
              </p>

              {/* Automatic Verified Display */}
              {isAffiliationVerified && universityName ? (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <span className="material-symbols-outlined text-[20px] text-emerald-600">
                      verified
                    </span>
                    <span>Verified Affiliated University</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{universityName}</p>
                  <p className="text-xs text-emerald-700">
                    This affiliation was verified from official accreditation evidence in the Master Dataset.
                  </p>
                  {evidenceUrl && (
                    <a
                      href={evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:underline"
                    >
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                      View Evidence Source
                    </a>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {universityName ? (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-amber-800 block">
                          Selected University (Pending Administrative Review):
                        </span>
                        <span className="text-sm font-bold text-gray-900">{universityName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUniversityId(null);
                          setUniversityName('');
                        }}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <span className="material-symbols-outlined text-[18px]">search</span>
                        </span>
                        <input
                          type="text"
                          value={univSearchQuery}
                          onChange={(e) => handleSearchUniversities(e.target.value)}
                          onFocus={() => setShowUnivDropdown(true)}
                          placeholder="Search university by name (e.g. Osmania, JNTUH, Anna University)..."
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                        />
                      </div>

                      {showUnivDropdown && univSearchResults.length > 0 && (
                        <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto divide-y divide-gray-100">
                          {univSearchResults.map((u) => (
                            <div
                              key={u.id}
                              onClick={() => handleSelectUniversity(u)}
                              className="p-3 hover:bg-indigo-50 cursor-pointer text-left transition-colors"
                            >
                              <div className="text-xs font-bold text-gray-900">{u.name}</div>
                              <div className="text-[11px] text-gray-500 mt-0.5">
                                {[u.city, u.state].filter(Boolean).join(', ')} • {u.university_type}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {showUnivDropdown && isSearchingUniv && (
                        <div className="p-3 text-center text-xs text-gray-400">
                          Searching universities...
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-600 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-gray-400 shrink-0 mt-0.5">
                      info
                    </span>
                    <span>
                      If your college is autonomous, deemed, or you do not know its affiliated university,
                      you can simply leave this blank and proceed.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: REVIEW & CONFIRM */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Review & Confirm Profile</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Please review your responses before saving. You can edit them anytime via Profile Settings.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-gray-200/90 divide-y divide-gray-200/80">
                {/* Q1 College */}
                <div className="p-3.5 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      1. College Name
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {selectedCollege?.name || 'Not provided'}
                    </span>
                    {selectedCollege?.aishe_code && (
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold">
                        {selectedCollege.aishe_code}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-indigo-600 hover:underline shrink-0"
                  >
                    Edit
                  </button>
                </div>

                {/* Q2 Location */}
                <div className="p-3.5 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      2. College Location
                    </span>
                    <span className="text-xs font-semibold text-gray-800">
                      {[city, district, state].filter(Boolean).join(', ') || 'Not provided'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-indigo-600 hover:underline shrink-0"
                  >
                    Edit
                  </button>
                </div>

                {/* Q3 Course */}
                <div className="p-3.5 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      3. Course
                    </span>
                    <span className="text-xs font-bold text-gray-900">{course}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-semibold text-indigo-600 hover:underline shrink-0"
                  >
                    Edit
                  </button>
                </div>

                {/* Q4 Branch */}
                <div className="p-3.5 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      4. Branch / Specialization
                    </span>
                    <span className="text-xs font-bold text-gray-900">{effectiveBranch}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-semibold text-indigo-600 hover:underline shrink-0"
                  >
                    Edit
                  </button>
                </div>

                {/* Q5 Year */}
                <div className="p-3.5 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      5. Year of Study
                    </span>
                    <span className="text-xs font-bold text-gray-900">{academicYear}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs font-semibold text-indigo-600 hover:underline shrink-0"
                  >
                    Edit
                  </button>
                </div>

                {/* Q6 Semester */}
                <div className="p-3.5 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      6. Current Semester
                    </span>
                    <span className="text-xs font-semibold text-gray-800">
                      {semester || 'Not specified (Optional)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs font-semibold text-indigo-600 hover:underline shrink-0"
                  >
                    Edit
                  </button>
                </div>

                {/* Q7 University */}
                <div className="p-3.5 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                      7. Affiliated University
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-semibold text-gray-800">
                        {universityName || 'Not specified / Autonomous'}
                      </span>
                      {universityName && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            isAffiliationVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isAffiliationVerified ? 'Verified' : 'Unverified'}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="text-xs font-semibold text-indigo-600 hover:underline shrink-0"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Continue</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Confirm & Complete Profile</span>
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
