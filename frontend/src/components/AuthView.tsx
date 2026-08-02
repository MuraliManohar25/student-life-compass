import React, { useState } from "react";
import { authApi, profileApi } from "../services/api";

interface AuthViewProps {
  onAuthSuccess: (token: string, isNewUser: boolean, profileComplete: boolean) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Forgot password states
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<"request" | "reset">("request");

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const data = await authApi.forgotPassword(email);
      if (data.reset_token) {
        setResetToken(data.reset_token);
        setResetStep("reset");
        setSuccessMsg("Reset token generated. Enter your new password below.");
      } else {
        setSuccessMsg("If an account exists, a reset link has been sent to your email.");
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || "Failed to process request.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!resetToken || !newPassword) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(resetToken, newPassword);
      setSuccessMsg("Password reset successfully! You can now sign in with your new password.");
      setResetStep("request");
      setResetToken("");
      setNewPassword("");
      setShowForgotPassword(false);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || "Failed to reset password.";
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

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center font-medium">
            {successMsg}
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
            <label className="text-xs text-[#c7c4d8] font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
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

        {/* Forgot Password Link */}
        {isLogin && !showForgotPassword && (
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="w-full text-xs text-[#c3c0ff] hover:text-white transition-colors"
          >
            Forgot password?
          </button>
        )}

        {/* Forgot Password Form */}
        {showForgotPassword && (
          <div className="border-t border-white/10 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Reset Password</h3>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetStep("request");
                  setResetToken("");
                  setNewPassword("");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-xs text-[#c7c4d8] hover:text-white"
              >
                Cancel
              </button>
            </div>

            {resetStep === "request" ? (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <label className="text-xs text-[#c7c4d8] font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f46e5] transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#c3c0ff] text-[#131314] font-bold text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <span className="material-symbols-outlined text-sm">send</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label className="text-xs text-[#c7c4d8] font-medium">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f46e5] transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <span className="material-symbols-outlined text-sm">check</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        <p className="text-[11px] text-[#c7c4d8] text-center opacity-70">
          Protected by JWT Token Security & Encrypted Password Hashing.
        </p>
      </div>
    </div>
  );
};
