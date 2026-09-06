import React, { useState } from "react";
import { profileApi } from "../services/api";

interface OnboardingViewProps {
  onComplete: () => void;
}

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const PROGRAMMING_LANGUAGES = [
  "Python",
  "Java",
  "C++",
  "C",
  "JavaScript",
  "TypeScript",
  "SQL",
  "Go",
  "Rust",
  "Other"
];

const TECHNICAL_SKILLS = [
  "Web Development",
  "App Development",
  "AI/ML",
  "Data Science",
  "Cloud",
  "Cybersecurity",
  "Data Structures",
  "Database",
  "Git/GitHub",
  "DevOps"
];

const CAREER_GOALS = [
  "Software Developer",
  "AI/ML Engineer",
  "Data Scientist",
  "Web Developer",
  "App Developer",
  "Core Engineering",
  "Government Job",
  "Higher Studies",
  "Entrepreneurship",
  "Not Sure"
];

const TARGET_COMPANY_TYPES = [
  "Product Based",
  "Service Based",
  "Startup",
  "Government",
  "Any Good Opportunity"
];

const STUDY_TIMES = ["Morning", "Afternoon", "Evening", "Night"];

const LEARNING_METHODS = ["Video", "Reading", "Practice", "Projects", "Mixed"];

const EXPENSE_CATEGORIES = [
  "Food",
  "Travel",
  "Hostel",
  "Education",
  "Entertainment",
  "Shopping",
  "Other"
];

const PLACEMENT_LEVELS = ["Beginner", "Intermediate", "Advanced"];

const BIGGEST_CHALLENGES = [
  "Academics",
  "Time Management",
  "Financial Management",
  "Career Confusion",
  "Skill Gap",
  "Placement Preparation",
  "Stress/Workload",
  "Other"
];

const COMPASS_HELP_TOPICS = [
  "Study Planning",
  "Career Guidance",
  "Budget Management",
  "Placement Preparation",
  "Risk Prediction",
  "Skill Development",
  "AI Assistance"
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 8;

  // Step 1: Basic Information
  const [fullName, setFullName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [course, setCourse] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("1st Year");

  // Step 2: Academic Information
  const [cgpa, setCgpa] = useState("8.5");
  const [backlogs, setBacklogs] = useState("0");
  const [strongSubjects, setStrongSubjects] = useState<string[]>(["Operating Systems"]);
  const [weakSubjects, setWeakSubjects] = useState<string[]>(["Computer Networks"]);
  const [strongSubInput, setStrongSubInput] = useState("");
  const [weakSubInput, setWeakSubInput] = useState("");

  // Step 3: Skills
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["Python", "SQL"]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Web Development", "AI/ML"]);

  // Step 4: Career Goal
  const [careerGoal, setCareerGoal] = useState("Software Developer");
  const [targetCompanyType, setTargetCompanyType] = useState("Product Based");

  // Step 5: Study Habits
  const [studyHours, setStudyHours] = useState("3.5");
  const [preferredStudyTime, setPreferredStudyTime] = useState("Evening");
  const [learningMethod, setLearningMethod] = useState("Projects");

  // Step 6: Budget Information
  const [monthlyBudget, setMonthlyBudget] = useState("5000");
  const [monthlyExpenses, setMonthlyExpenses] = useState("3200");
  const [selectedExpenseCats, setSelectedExpenseCats] = useState<string[]>(["Food", "Travel", "Hostel"]);

  // Step 7: Placement
  const [placementPrep, setPlacementPrep] = useState("Yes");
  const [placementLevel, setPlacementLevel] = useState("Intermediate");
  const [targetRole, setTargetRole] = useState("Software Engineer");

  // Step 8: Personal Goals
  const [biggestChallenge, setBiggestChallenge] = useState("Time Management");
  const [selectedHelpTopics, setSelectedHelpTopics] = useState<string[]>([
    "Study Planning",
    "Career Guidance",
    "Placement Preparation",
    "AI Assistance"
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const toggleMultiSelect = (item: string, currentList: string[], setList: (items: string[]) => void) => {
    if (currentList.includes(item)) {
      setList(currentList.filter((x) => x !== item));
    } else {
      setList([...currentList, item]);
    }
  };

  const addSubject = (type: "strong" | "weak") => {
    if (type === "strong") {
      if (strongSubInput.trim() && !strongSubjects.includes(strongSubInput.trim())) {
        setStrongSubjects([...strongSubjects, strongSubInput.trim()]);
        setStrongSubInput("");
      }
    } else {
      if (weakSubInput.trim() && !weakSubjects.includes(weakSubInput.trim())) {
        setWeakSubjects([...weakSubjects, weakSubInput.trim()]);
        setWeakSubInput("");
      }
    }
  };

  const removeSubject = (type: "strong" | "weak", name: string) => {
    if (type === "strong") {
      setStrongSubjects(strongSubjects.filter((s) => s !== name));
    } else {
      setWeakSubjects(weakSubjects.filter((s) => s !== name));
    }
  };

  const validateCurrentStep = (): boolean => {
    setErrorMsg("");

    if (currentStep === 1) {
      if (!collegeName.trim() || !course.trim() || !branch.trim()) {
        setErrorMsg("Please fill in your College Name, Course, and Branch.");
        return false;
      }
    } else if (currentStep === 2) {
      const gpaNum = parseFloat(cgpa);
      if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 10) {
        setErrorMsg("CGPA must be a valid number between 0.0 and 10.0.");
        return false;
      }
      const bLog = parseInt(backlogs);
      if (isNaN(bLog) || bLog < 0) {
        setErrorMsg("Backlogs must be a non-negative number.");
        return false;
      }
    } else if (currentStep === 3) {
      if (selectedLanguages.length === 0) {
        setErrorMsg("Please select at least one programming language.");
        return false;
      }
    } else if (currentStep === 5) {
      const hrs = parseFloat(studyHours);
      if (isNaN(hrs) || hrs < 0 || hrs > 24) {
        setErrorMsg("Study hours must be between 0 and 24 hours per day.");
        return false;
      }
    } else if (currentStep === 6) {
      const budget = parseFloat(monthlyBudget);
      const expenses = parseFloat(monthlyExpenses);
      if (isNaN(budget) || budget < 0 || isNaN(expenses) || expenses < 0) {
        setErrorMsg("Budget and expense amounts cannot be negative.");
        return false;
      }
    } else if (currentStep === 7) {
      if (!targetRole.trim()) {
        setErrorMsg("Please enter your target job/internship role.");
        return false;
      }
    } else if (currentStep === 8) {
      if (selectedHelpTopics.length === 0) {
        setErrorMsg("Please select at least one area Student Life Compass can help with.");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setErrorMsg("");
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      await profileApi.submitOnboarding({
        full_name: fullName.trim() || undefined,
        college_name: collegeName.trim(),
        course: course.trim(),
        branch: branch.trim(),
        year,
        cgpa: parseFloat(cgpa) || 8.0,
        backlogs: parseInt(backlogs) || 0,
        strong_subjects: strongSubjects,
        weak_subjects: weakSubjects,
        programming_languages: selectedLanguages,
        technical_skills: selectedSkills,
        career_goal: careerGoal,
        target_company_type: targetCompanyType,
        study_hours: parseFloat(studyHours) || 3.0,
        preferred_study_time: preferredStudyTime,
        learning_method: learningMethod,
        monthly_budget: parseFloat(monthlyBudget) || 5000.0,
        monthly_expenses: parseFloat(monthlyExpenses) || 0.0,
        major_expense_categories: selectedExpenseCats,
        placement_preparation: placementPrep,
        placement_level: placementLevel,
        target_role: targetRole.trim() || careerGoal,
        biggest_challenge: biggestChallenge,
        compass_help: selectedHelpTopics,
      });

      onComplete();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || "Failed to submit student onboarding data. Please check your answers.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131314] text-[#e5e2e3] font-['Inter',sans-serif] py-10 px-4 md:px-8 max-w-4xl mx-auto flex flex-col justify-center space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-3 bg-gradient-to-r from-[#4f46e5]/20 via-transparent to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-[#c3c0ff] uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4f46e5] animate-ping" />
            FIRST-TIME STUDENT SETUP
          </span>
          <span className="text-xs font-mono font-bold text-[#c3c0ff]">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <h1 className="font-headline font-black text-2xl sm:text-3xl text-white">
          Complete Your Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#c7c4d8]">
          Configure your academic standing, career trajectory, and study rhythm to calibrate your personalized dashboard.
        </p>

        {/* Multi-step progress bar */}
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-gradient-to-r from-[#4f46e5] to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-center font-medium">
          {errorMsg}
        </div>
      )}

      {/* Main Form Container */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
        {/* STEP 1: BASIC INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="font-headline font-bold text-lg text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c3c0ff]">badge</span>
              <span>Step 1 — Basic Information</span>
            </h2>

            <div>
              <label className="text-xs text-[#c7c4d8]">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
              />
            </div>

            <div>
              <label className="text-xs text-[#c7c4d8]">College / University Name *</label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. National Institute of Technology"
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#c7c4d8]">Course / Degree *</label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. B.Tech / B.E."
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[#c7c4d8]">Branch / Major *</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Computer Science and Engineering"
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#c7c4d8] block mb-2">Current Year *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {YEAR_OPTIONS.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setYear(yr)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      year === yr
                        ? "bg-[#4f46e5] text-white border-[#4f46e5] shadow-lg shadow-[#4f46e5]/20"
                        : "bg-white/5 border-white/10 text-[#c7c4d8] hover:border-white/20"
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ACADEMIC INFORMATION */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="font-headline font-bold text-lg text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c3c0ff]">school</span>
              <span>Step 2 — Academic Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#c7c4d8]">Current CGPA (0.0 – 10.0) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  placeholder="8.5"
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[#c7c4d8]">Backlogs / Active Arrears</label>
                <input
                  type="number"
                  min="0"
                  value={backlogs}
                  onChange={(e) => setBacklogs(e.target.value)}
                  placeholder="0"
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
                />
              </div>
            </div>

            {/* Strong Subjects */}
            <div>
              <label className="text-xs text-[#c7c4d8]">Strong Subjects</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={strongSubInput}
                  onChange={(e) => setStrongSubInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubject("strong"); } }}
                  placeholder="e.g. Data Structures, DBMS"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
                />
                <button
                  type="button"
                  onClick={() => addSubject("strong")}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#c3c0ff] rounded-xl border border-white/10"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {strongSubjects.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-1.5"
                  >
                    <span>{s}</span>
                    <button type="button" onClick={() => removeSubject("strong", s)} className="hover:text-white">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Weak Subjects */}
            <div>
              <label className="text-xs text-[#c7c4d8]">Weak Subjects (Areas Needing Improvement)</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={weakSubInput}
                  onChange={(e) => setWeakSubInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubject("weak"); } }}
                  placeholder="e.g. Computer Networks, Microprocessors"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
                />
                <button
                  type="button"
                  onClick={() => addSubject("weak")}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#c3c0ff] rounded-xl border border-white/10"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {weakSubjects.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-1.5"
                  >
                    <span>{s}</span>
                    <button type="button" onClick={() => removeSubject("weak", s)} className="hover:text-white">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SKILLS */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h2 className="font-headline font-bold text-lg text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c3c0ff]">code</span>
              <span>Step 3 — Skills Inventory</span>
            </h2>

            <div>
              <label className="text-xs text-[#c7c4d8] block mb-2 font-medium">
                Programming Languages Known (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {PROGRAMMING_LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleMultiSelect(lang, selectedLanguages, setSelectedLanguages)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? "bg-[#4f46e5] text-white border-[#4f46e5] shadow-sm"
                          : "bg-white/5 border-white/10 text-[#c7c4d8] hover:border-white/20"
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs text-[#c7c4d8] block mb-2 font-medium">
                Technical Skills & Frameworks (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {TECHNICAL_SKILLS.map((sk) => {
                  const isSelected = selectedSkills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => toggleMultiSelect(sk, selectedSkills, setSelectedSkills)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                          : "bg-white/5 border-white/10 text-[#c7c4d8] hover:border-white/20"
                      }`}
                    >
                      {sk}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: CAREER GOAL */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="font-headline font-bold text-lg text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c3c0ff]">trending_up</span>
              <span>Step 4 — Career Aspirations</span>
            </h2>

            <div>
              <label className="text-xs text-[#c7c4d8] block mb-2 font-medium">What is your main career goal?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CAREER_GOALS.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setCareerGoal(goal)}
                    className={`p-3 text-left rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                      careerGoal === goal
                        ? "bg-[#4f46e5] text-white border-[#4f46e5] shadow-lg shadow-[#4f46e5]/20"
                        : "bg-white/5 border-white/10 text-[#c7c4d8] hover:border-white/20"
                    }`}
                  >
                    <span>{goal}</span>
                    {careerGoal === goal && <span className="material-symbols-outlined text-sm">check</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-[#c7c4d8] block mb-2 font-medium">Target Company Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {TARGET_COMPANY_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTargetCompanyType(type)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      targetCompanyType === type
                        ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                        : "bg-white/5 border-white/10 text-[#c7c4d8] hover:border-white/20"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: STUDY HABITS */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="font-headline font-bold text-lg text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c3c0ff]">schedule</span>
              <span>Step 5 — Study Habits & Rhythm</span>
            </h2>

            <div>
              <label className="text-xs text-[#c7c4d8]">Average Study Hours Per Day (Self-Study)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={studyHours}
                onChange={(e) => setStudyHours(e.target.value)}
                placeholder="3.5"
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
              />
            </div>

            <div>
              <label className="text-xs text-[#c7c4d8] block mb-2 font-medium">Preferred Study Time</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {STUDY_TIMES.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setPreferredStudyTime(time)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      preferredStudyTime === time
                        ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                        : "bg-white/5 border-white/10 text-[#c7c4d8] hover:border-white/20"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-[#c7c4d8] block mb-2 font-medium">Preferred Learning Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {LEARNING_METHODS.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setLearningMethod(method)}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition-all ${
                      learningMethod === method
                        ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                        : "bg-white/5 border-white/10 text-[#c7c4d8] hover:border-white/20"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: FINANCIAL / BUDGET */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h2 className="font-headline font-bold text-lg text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">payments</span>
              <span>Step 6 — Financial Runway</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#c7c4d8]">Monthly Personal Budget (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="5000"
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs text-[#c7c4d8]">Average Monthly Expenses (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(e.target.value)}
                  placeholder="3200"
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#c7c4d8] block mb-2 font-medium">Major Expense Categories</label>
              <div className="flex flex-wrap gap-2">
                {EXPENSE_CATEGORIES.map((cat) => {
                  const isSelected = selectedExpenseCats.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleMultiSelect(cat, selectedExpenseCats, setSelectedExpenseCats)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                          : "bg-white/5 border-white/10 text-[#c7c4d8] hover:border-white/20"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: PLACEMENT */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <h2 className="font-headline font-bold text-lg text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c3c0ff]">work</span>
              <span>Step 7 — Placement Readiness</span>
            </h2>

            <div>
              <label className="text-xs text-[#c7c4d8] block mb-2 font-medium">
                Are you currently preparing for campus or off-campus placements?
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                {["Yes", "No"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setPlacementPrep(opt)}
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      placementPrep === opt
                        ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                        : "bg-white/5 border-white/10 text-[#c7c4d8] hover:border-white/20"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-[#c7c4d8] block mb-2 font-medium">Placement Preparation Level</label>
              <div className="grid grid-cols-3 gap-2.5">
                {PLACEMENT_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPlacementLevel(lvl)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      placementLevel === lvl
                        ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                        : "bg-white/5 border-white/10 text-[#c7c4d8] hover:border-white/20"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-[#c7c4d8]">Target Job Role *</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Junior Backend Engineer, SDE 1"
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
                required
              />
            </div>
          </div>
        )}

        {/* STEP 8: PERSONAL GOALS & CHALLENGES */}
        {currentStep === 8 && (
          <div className="space-y-5">
            <h2 className="font-headline font-bold text-lg text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c3c0ff]">psychology</span>
              <span>Step 8 — Challenges & Desired Assistance</span>
            </h2>

            <div>
              <label className="text-xs text-[#c7c4d8] block mb-2 font-medium">What is your biggest current challenge?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BIGGEST_CHALLENGES.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setBiggestChallenge(ch)}
                    className={`p-3 text-left rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                      biggestChallenge === ch
                        ? "bg-[#4f46e5] text-white border-[#4f46e5] shadow-lg shadow-[#4f46e5]/20"
                        : "bg-white/5 border-white/10 text-[#c7c4d8] hover:border-white/20"
                    }`}
                  >
                    <span>{ch}</span>
                    {biggestChallenge === ch && <span className="material-symbols-outlined text-sm">check</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-[#c7c4d8] block mb-2 font-medium">
                What do you want Student Life Compass to help you with? (Multi-choice)
              </label>
              <div className="flex flex-wrap gap-2">
                {COMPASS_HELP_TOPICS.map((topic) => {
                  const isSelected = selectedHelpTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleMultiSelect(topic, selectedHelpTopics, setSelectedHelpTopics)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-[#4f46e5] to-emerald-500 text-white border-transparent shadow-sm"
                          : "bg-white/5 border-white/10 text-[#c7c4d8] hover:border-white/20"
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={loading}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-[#c7c4d8] hover:text-white transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-[#4f46e5] hover:brightness-110 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-[#4f46e5]/25 flex items-center gap-1.5 ml-auto"
            >
              <span>Next Step</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-7 py-3 bg-gradient-to-r from-[#4f46e5] to-emerald-500 hover:brightness-110 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-xl shadow-[#4f46e5]/30 flex items-center gap-2 ml-auto"
            >
              {loading ? (
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              ) : (
                <>
                  <span>Save Profile & Launch Dashboard</span>
                  <span className="material-symbols-outlined text-sm">rocket_launch</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
