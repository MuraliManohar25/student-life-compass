import React, { useState, useEffect, useRef } from 'react';
import {
  CollegeOut,
  searchColleges,
  submitMissingCollege,
  MissingCollegePayload,
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

export interface SelectedCollege {
  id?: string | null;
  name: string;
  city?: string;
  district?: string;
  state?: string;
  aishe_code?: string;
  affiliated_university?: {
    university_id: string;
    university_name: string;
    relationship_type: string;
    verification_status: string;
    evidence_url?: string;
  } | null;
  is_custom_submission?: boolean;
}

interface CollegeSelectorProps {
  value: SelectedCollege | null;
  onChange: (college: SelectedCollege) => void;
  required?: boolean;
}

export const CollegeSelector: React.FC<CollegeSelectorProps> = ({
  value,
  onChange,
  required = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(value?.name || '');
  const [results, setResults] = useState<CollegeOut[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showMissingModal, setShowMissingModal] = useState(false);

  // Missing college form state
  const [missingName, setMissingName] = useState('');
  const [missingState, setMissingState] = useState('Telangana');
  const [missingDistrict, setMissingDistrict] = useState('');
  const [missingCity, setMissingCity] = useState('');
  const [missingClaimedUniv, setMissingClaimedUniv] = useState('');
  const [missingWebsite, setMissingWebsite] = useState('');
  const [isSubmittingMissing, setIsSubmittingMissing] = useState(false);
  const [missingSuccessMsg, setMissingSuccessMsg] = useState<string | null>(null);
  const [missingErrorMsg, setMissingErrorMsg] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value?.name && value.name !== searchTerm) {
      setSearchTerm(value.name);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const resp = await searchColleges({ q: searchTerm.trim(), limit: 10 });
        setResults(resp.colleges || []);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen]);

  const handleSelect = (college: CollegeOut) => {
    setSearchTerm(college.name);
    setIsOpen(false);
    onChange({
      id: college.id,
      name: college.name,
      city: college.city || '',
      district: college.district || '',
      state: college.state || '',
      aishe_code: college.aishe_code,
      affiliated_university: college.affiliated_university || null,
      is_custom_submission: false,
    });
  };

  const handleClear = () => {
    setSearchTerm('');
    setIsOpen(true);
    onChange({
      id: null,
      name: '',
      city: '',
      district: '',
      state: '',
      aishe_code: undefined,
      affiliated_university: null,
      is_custom_submission: false,
    });
    inputRef.current?.focus();
  };

  const handleOpenMissingModal = () => {
    setMissingName(searchTerm.trim());
    setMissingSuccessMsg(null);
    setMissingErrorMsg(null);
    setShowMissingModal(true);
    setIsOpen(false);
  };

  const handleSubmitMissing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!missingName.trim() || !missingState.trim()) {
      setMissingErrorMsg('College name and state are required.');
      return;
    }
    setIsSubmittingMissing(true);
    setMissingErrorMsg(null);
    try {
      const payload: MissingCollegePayload = {
        submitted_name: missingName.trim(),
        state: missingState.trim(),
        district: missingDistrict.trim(),
        city: missingCity.trim(),
        claimed_university: missingClaimedUniv.trim(),
        official_website: missingWebsite.trim(),
      };
      await submitMissingCollege(payload);
      setMissingSuccessMsg('Submitted for review! We have selected this college for your profile.');
      
      const newCollege: SelectedCollege = {
        id: null,
        name: missingName.trim(),
        city: missingCity.trim(),
        district: missingDistrict.trim(),
        state: missingState.trim(),
        affiliated_university: missingClaimedUniv.trim()
          ? {
              university_id: '',
              university_name: missingClaimedUniv.trim(),
              relationship_type: 'claimed_affiliation',
              verification_status: 'unverified',
            }
          : null,
        is_custom_submission: true,
      };

      onChange(newCollege);
      setSearchTerm(missingName.trim());

      setTimeout(() => {
        setShowMissingModal(false);
      }, 1400);
    } catch (err: any) {
      setMissingErrorMsg(err.message || 'Could not submit report. Please try again.');
    } finally {
      setIsSubmittingMissing(false);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <span className="material-symbols-outlined text-[20px]">account_balance</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          required={required}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by college name or AISHE code (e.g. CBIT, C-19754)..."
          className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent shadow-xs transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Selected Verified Status Card */}
      {value?.name && !isOpen && (
        <div className="mt-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200/80 flex flex-col gap-1.5 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900 flex items-center gap-1.5 truncate">
              <span className="material-symbols-outlined text-[16px] text-indigo-600">verified</span>
              {value.name}
            </span>
            {value.aishe_code && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-200">
                {value.aishe_code}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-[11px]">
            <span>
              {[value.city, value.district, value.state].filter(Boolean).join(', ') || 'Location details linked'}
            </span>
          </div>

          {value.affiliated_university?.university_name && (
            <div className="mt-1 pt-1.5 border-t border-gray-200 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">Affiliation:</span>
              <span
                className={`text-[11px] font-semibold flex items-center gap-1 ${
                  value.affiliated_university.verification_status === 'verified'
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {value.affiliated_university.verification_status === 'verified' ? 'check_circle' : 'pending'}
                </span>
                {value.affiliated_university.university_name}
                {value.affiliated_university.verification_status === 'verified' ? ' (Verified)' : ' (Unverified)'}
              </span>
            </div>
          )}

          {value.is_custom_submission && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Submitted for administrative verification. Master dataset remains untouched.
            </div>
          )}
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto divide-y divide-gray-100">
          {isLoading && (
            <div className="p-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              Searching College Master Dataset...
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <>
              <div className="px-3 py-2 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>Verified Master Institutions</span>
                <span>{results.length} results</span>
              </div>
              {results.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className="p-3 hover:bg-indigo-50/60 cursor-pointer transition-colors text-left group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700">
                      {c.name}
                    </span>
                    {c.aishe_code && (
                      <span className="shrink-0 px-2 py-0.5 rounded-md bg-gray-100 group-hover:bg-indigo-100 text-gray-600 group-hover:text-indigo-800 font-mono text-[10px] font-bold">
                        {c.aishe_code}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    <span>{[c.city, c.district, c.state].filter(Boolean).join(', ')}</span>
                  </div>
                  {c.affiliated_university?.university_name && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          c.affiliated_university.verification_status === 'verified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          {c.affiliated_university.verification_status === 'verified' ? 'verified' : 'help'}
                        </span>
                        Affiliated to: {c.affiliated_university.university_name}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {!isLoading && results.length === 0 && (
            <div className="p-4 text-center text-xs text-gray-500">
              No matching colleges found in master dataset.
            </div>
          )}

          {/* Missing College Fallback Prompt */}
          <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-2">
            <span className="text-xs text-gray-600 font-medium">Can&apos;t find your college?</span>
            <button
              type="button"
              onClick={handleOpenMissingModal}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg border border-indigo-200 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              Submit for Review
            </button>
          </div>
        </div>
      )}

      {/* Missing College Submission Modal */}
      {showMissingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setShowMissingModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">add_business</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Submit Missing College</h3>
                <p className="text-xs text-gray-500">
                  Submit your college for review without creating an unverified master record.
                </p>
              </div>
            </div>

            {missingSuccessMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {missingSuccessMsg}
              </div>
            )}

            {missingErrorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {missingErrorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitMissing} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  College Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={missingName}
                  onChange={(e) => setMissingName(e.target.value)}
                  placeholder="e.g. Government Degree College, Nizamabad"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={missingState}
                    onChange={(e) => setMissingState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={missingDistrict}
                    onChange={(e) => setMissingDistrict(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  City / Town
                </label>
                <input
                  type="text"
                  value={missingCity}
                  onChange={(e) => setMissingCity(e.target.value)}
                  placeholder="e.g. Hyderabad / Gandipet"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Claimed Affiliated University (Optional)
                </label>
                <input
                  type="text"
                  value={missingClaimedUniv}
                  onChange={(e) => setMissingClaimedUniv(e.target.value)}
                  placeholder="e.g. Osmania University"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Official Website (Optional)
                </label>
                <input
                  type="url"
                  value={missingWebsite}
                  onChange={(e) => setMissingWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowMissingModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMissing}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingMissing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit & Select College'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
