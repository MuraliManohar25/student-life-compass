import React, { useState } from "react";
import { authApi, profileApi } from "../services/api";

interface AuthViewProps {
  onAuthSuccess: (token: string, isNewUser: boolean, profileComplete: boolean) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password || (!isLogin && !fullName)) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const data = await authApi.login(email, password);
        const token = data.access_token;
        // Check if user profile is already completed
        try {
          const profile = await profileApi.getProfile();
          const isComplete = Boolean(profile.college && profile.college.trim() !== "");
          onAuthSuccess(token, false, isComplete);
        } catch {
          onAuthSuccess(token, false, false);
        }
      } else {
        const data = await authApi.signup(email, password, fullName);
        const token = data.access_token;
        // Fresh signup -> route to onboarding
        onAuthSuccess(token, true, false);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || "Authentication failed. Please check your credentials.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131314] text-[#e5e2e3] font-['Inter',sans-serif] flex items-center justify-center p-4 selection:bg-[#4f46e5]/30">
      <div className="w-full max-w-md glass-card p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 bg-gradient-to-b from-white/[0.04] to-transparent">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#4f46e5] text-[#dad7ff] mx-auto flex items-center justify-center shadow-lg shadow-[#4f46e5]/30 mb-3">
            <span className="material-symbols-outlined fill-1 text-2xl">auto_awesome</span>
          </div>
          <h1 className="font-headline font-black text-2xl sm:text-3xl text-white">
            Student Life Compass
          </h1>
          <p className="text-xs text-[#c7c4d8]">
            AI-Powered Student Operating System
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setErrorMsg("");
            }}
            className={`flex-1 py-2 font-bold rounded-lg transition-all ${
              isLogin ? "bg-[#4f46e5] text-white shadow" : "text-[#c7c4d8] hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setErrorMsg("");
            }}
            className={`flex-1 py-2 font-bold rounded-lg transition-all ${
              !isLogin ? "bg-[#4f46e5] text-white shadow" : "text-[#c7c4d8] hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs text-[#c7c4d8] font-medium">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f46e5] transition-all"
                required
              />
            </div>
          )}

          <div>
            <label className="text-xs text-[#c7c4d8] font-medium">Student Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@university.edu"
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f46e5] transition-all"
              required
            />
          </div>

          <div>
            <label className="text-xs text-[#c7c4d8] font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f46e5] transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#4f46e5] text-white font-bold text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#4f46e5]/25 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            ) : isLogin ? (
              <>
                <span>Sign In</span>
                <span className="material-symbols-outlined text-sm">login</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-[#c7c4d8] text-center opacity-70">
          Protected by JWT Token Security & Encrypted Password Hashing.
        </p>
      </div>
    </div>
  );
};
