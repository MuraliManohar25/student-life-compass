import React, { useState } from "react";
import { authApi, profileApi } from "../services/api";

interface AuthViewProps {
  onAuthSuccess: (token: string, isNewUser: boolean, profileComplete: boolean) => void;
}

type AuthMode = "login" | "register" | "forgot_password";

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  // Shared fields
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  // Register-only
  const [fullName, setFullName]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]       = useState(false);

  // Forgot password
  const [resetToken, setResetToken]   = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep]     = useState<"request" | "reset">("request");

  // UI state
  const [loading, setLoading]     = useState(false);
  const [errorMsg, setErrorMsg]   = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const clearMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const switchMode = (mode: AuthMode) => {
    clearMessages();
    setAuthMode(mode);
  };

  // -------------------------------------------------------------------------
  // Register
  // -------------------------------------------------------------------------
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.register(email.trim(), password, fullName.trim());
      setSuccessMsg(
        data.message || "Account created successfully. Please sign in."
      );
      // Reset register fields and switch to login
      setFullName("");
      setConfirmPassword("");
      setPassword("");
      setEmail(email.trim()); // keep email pre-filled for convenience
      setAuthMode("login");
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        "Registration failed. Please check your details and try again.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Login
  // -------------------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim() || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.login(email.trim(), password);
      const token = data.access_token;

      // Determine onboarding status
      let onboardingDone = Boolean(data.onboarding_completed);
      if (!onboardingDone) {
        try {
          const statusRes = await profileApi.getOnboardingStatus();
          onboardingDone = Boolean(statusRes.onboarding_completed);
        } catch {
          try {
            const p = await profileApi.getProfile();
            onboardingDone = Boolean(p.college && p.college.trim() !== "");
          } catch {
            onboardingDone = false;
          }
        }
      }

      onAuthSuccess(token, false, onboardingDone);
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        "Authentication failed. Please check your credentials.";
      setErrorMsg(detail);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Forgot Password
  // -------------------------------------------------------------------------
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.forgotPassword(email.trim());
      if (data.reset_token) {
        setResetToken(data.reset_token);
        setResetStep("reset");
        setSuccessMsg("Reset token generated. Enter your new password below.");
      } else {
        setSuccessMsg("If an account exists, a reset code has been sent.");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!resetToken || !newPassword) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(resetToken, newPassword);
      setSuccessMsg("Password reset successfully! You can now sign in.");
      setResetStep("request");
      setResetToken("");
      setNewPassword("");
      setAuthMode("login");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#131314] text-[#e5e2e3] font-['Inter',sans-serif] flex items-center justify-center p-4 selection:bg-[#4f46e5]/30">
      <div className="w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-md">

        {/* ---- Branding ---- */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#4f46e5] text-[#dad7ff] mx-auto flex items-center justify-center shadow-lg shadow-[#4f46e5]/30 mb-3">
            <span className="material-symbols-outlined fill-1 text-2xl">auto_awesome</span>
          </div>
          <h1 className="font-headline font-black text-2xl sm:text-3xl text-white">
            Student Life Compass
          </h1>
          <p className="text-xs text-[#c7c4d8]">AI-Powered Student Operating System</p>
        </div>

        {/* ---- Login / Register Tabs ---- */}
        {(authMode === "login" || authMode === "register") && (
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
            <button
              id="auth-tab-signin"
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                authMode === "login"
                  ? "bg-[#4f46e5] text-white shadow"
                  : "text-[#c7c4d8] hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              id="auth-tab-register"
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                authMode === "register"
                  ? "bg-[#4f46e5] text-white shadow"
                  : "text-[#c7c4d8] hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* ---- Error Message ---- */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-center font-medium flex items-start gap-2">
            <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ---- Success Message ---- */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center font-medium flex items-start gap-2">
            <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================================================================
            LOGIN FORM
        ================================================================ */}
        {authMode === "login" && (
          <form id="login-form" onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-[#c7c4d8] font-medium">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                autoComplete="email"
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#4f46e5] transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs text-[#c7c4d8] font-medium">Password</label>
              <div className="relative mt-1">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#4f46e5] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#918fa1] hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#4f46e5] text-white font-bold text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#4f46e5]/25 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-sm">login</span>
                </>
              )}
            </button>

            <button
              id="login-forgot-password"
              type="button"
              onClick={() => switchMode("forgot_password")}
              className="w-full text-xs text-[#c3c0ff] hover:text-white transition-colors text-center pt-1 block"
            >
              Forgot password?
            </button>
          </form>
        )}

        {/* ================================================================
            REGISTER FORM
        ================================================================ */}
        {authMode === "register" && (
          <form id="register-form" onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-[#c7c4d8] font-medium">Full Name</label>
              <input
                id="register-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Johnson"
                autoComplete="name"
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#4f46e5] transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs text-[#c7c4d8] font-medium">Email</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                autoComplete="email"
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#4f46e5] transition-all"
                required
              />
              <p className="text-[10px] text-[#918fa1] mt-1">
                Any valid email provider accepted (Gmail, Yahoo, Outlook, etc.)
              </p>
            </div>

            <div>
              <label className="text-xs text-[#c7c4d8] font-medium">Password</label>
              <div className="relative mt-1">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#4f46e5] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#918fa1] hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-[#c7c4d8] font-medium">Confirm Password</label>
              <input
                id="register-confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                className={`w-full mt-1 bg-white/5 border rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-all ${
                  confirmPassword && confirmPassword !== password
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/10 focus:border-[#4f46e5]"
                }`}
                required
              />
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[10px] text-red-400 mt-1">Passwords do not match.</p>
              )}
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#4f46e5] text-white font-bold text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#4f46e5]/25 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="material-symbols-outlined text-sm">person_add</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ================================================================
            FORGOT PASSWORD
        ================================================================ */}
        {authMode === "forgot_password" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Reset Password</h3>
              <button
                id="forgot-password-cancel"
                type="button"
                onClick={() => {
                  setResetStep("request");
                  setResetToken("");
                  setNewPassword("");
                  switchMode("login");
                }}
                className="text-xs text-[#c7c4d8] hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>

            {resetStep === "request" ? (
              <form id="forgot-password-form" onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <label className="text-xs text-[#c7c4d8] font-medium">Email</label>
                  <input
                    id="forgot-password-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#4f46e5] transition-all"
                    required
                  />
                </div>
                <button
                  id="forgot-password-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#c3c0ff] text-[#131314] font-bold text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
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
              <form id="reset-password-form" onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label className="text-xs text-[#c7c4d8] font-medium">New Password</label>
                  <input
                    id="reset-password-new"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#4f46e5] transition-all"
                    required
                  />
                </div>
                <button
                  id="reset-password-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
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

        <p className="text-[11px] text-[#c7c4d8] text-center opacity-60">
          Secured with JWT authentication &amp; bcrypt password hashing.
        </p>
      </div>
    </div>
  );
};
