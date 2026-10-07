import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, ArrowRight, LogOut, CheckCircle2, Shield, Heart, Info, AlertTriangle, Sparkles } from 'lucide-react';
import { authService } from '../../services/firebase/authService.ts';
import { firebaseEnabled } from '../../services/firebase/firebaseClient.ts';
import { sound } from '../../utils/audio.ts';
import { User as FirebaseUser } from 'firebase/auth';

interface CaregiverLoginProps {
  onBack: () => void;
  onSuccess?: () => void;
  onLaunchSetup?: () => void;
}

export const CaregiverLogin: React.FC<CaregiverLoginProps> = ({
  onBack,
  onSuccess,
  onLaunchSetup,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(authService.getCurrentUser());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showFirebaseTip, setShowFirebaseTip] = useState(false);

  useEffect(() => {
    const unsub = authService.onAuthChange((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGoogleLoading(true);

    try {
      await authService.loginWithGoogle();
      sound.playChime('success');
      setSuccessMsg('Signed in with Google successfully.');
      if (onSuccess) {
        setTimeout(() => onSuccess(), 600);
      }
    } catch (err: unknown) {
      sound.playChime('alert');
      const msg = err instanceof Error ? err.message : 'Google authentication failed';
      if (msg.includes('auth/popup-closed-by-user')) {
        setErrorMsg('Sign-in window was closed. Please try again.');
      } else if (msg.includes('auth/cancelled-popup-request')) {
        setErrorMsg('Authentication request was cancelled.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowFirebaseTip(false);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegisterMode) {
        await authService.register(email, password, displayName);
        sound.playChime('success');
        setSuccessMsg('Caregiver profile & circle created successfully!');
        if (onLaunchSetup) {
          setTimeout(() => onLaunchSetup(), 600);
        } else if (onSuccess) {
          setTimeout(() => onSuccess(), 600);
        }
      } else {
        await authService.login(email, password);
        sound.playChime('success');
        setSuccessMsg('Signed in successfully. Care circle restored.');
        if (onSuccess) {
          setTimeout(() => onSuccess(), 600);
        }
      }
    } catch (err: unknown) {
      sound.playChime('alert');
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      if (msg.includes('auth/operation-not-allowed')) {
        setErrorMsg('Email/Password sign-in is disabled in this Firebase project.');
        setShowFirebaseTip(true);
      } else if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        setErrorMsg('Invalid email or password.');
      } else if (msg.includes('auth/email-already-in-use')) {
        setErrorMsg('An account with this email already exists. Please switch to Sign In.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      sound.playChime('gentle');
      setSuccessMsg('Signed out.');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-[#00524d] text-white flex items-center justify-center shadow-md mb-3">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#1E293B] dark:text-slate-100">
          Caregiver Portal (C-01)
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Cloud Sync & Family Care Circle Account
        </p>
      </div>

      {/* Authenticated State Card */}
      {currentUser ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-[#E2DCD5] dark:border-slate-700 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-[#E8F5E9] dark:bg-emerald-950/60 text-[#2D6A4F] dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
            Active Caregiver Session
          </p>
          <h3 className="text-lg font-bold text-[#1E293B] dark:text-slate-100">
            {currentUser.displayName || 'Primary Caregiver'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-mono text-xs">
            {currentUser.email}
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={onSuccess || onBack}
              className="w-full py-3 px-4 rounded-xl bg-[#00524d] text-white font-bold text-sm hover:bg-[#003d39] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
              type="button"
            >
              <span>Go to Caregiver Home (C-03)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onLaunchSetup && (
              <button
                onClick={onLaunchSetup}
                className="w-full py-2.5 px-4 rounded-xl border border-teal-200 dark:border-teal-800 text-[#00524d] dark:text-[#5eead4] font-semibold text-xs hover:bg-teal-50 dark:hover:bg-slate-750 transition-all cursor-pointer flex items-center justify-center gap-2"
                type="button"
              >
                <span>Run Setup Wizard (C-02)</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 font-medium text-xs hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer flex items-center justify-center gap-2 mt-1"
              type="button"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out (Clear Session)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Form Card */
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-[#E2DCD5] dark:border-slate-700 shadow-sm">
          {/* Local demo never signs in to or creates accounts in a Firebase project. */}
          <button
            onClick={onBack}
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-750 dark:to-teal-950/40 border border-teal-300 dark:border-teal-700/80 text-[#00524d] dark:text-[#5eead4] font-bold text-xs hover:border-[#00524d] transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 mb-3"
          >
            <Sparkles className="w-4 h-4" />
            <span>Continue in Local Demo (PIN Gate)</span>
          </button>

          {!firebaseEnabled && (
            <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              Cloud sign-in is unavailable until you add your Firebase web configuration to <code>.env.local</code> and restart the server.
            </p>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            type="button"
            className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-3 disabled:opacity-50 mb-4"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleLoading ? 'Connecting with Google...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 dark:border-slate-700 w-full"></div>
            <span className="bg-white dark:bg-slate-800 px-3 text-xs text-slate-400 font-medium uppercase tracking-wider absolute">
              or email
            </span>
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-4">
            <button
              onClick={() => {
                setIsRegisterMode(false);
                setErrorMsg(null);
                setShowFirebaseTip(false);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                !isRegisterMode
                  ? 'bg-white dark:bg-slate-800 text-[#00524d] dark:text-[#5eead4] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              type="button"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsRegisterMode(true);
                setErrorMsg(null);
                setShowFirebaseTip(false);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isRegisterMode
                  ? 'bg-white dark:bg-slate-800 text-[#00524d] dark:text-[#5eead4] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              type="button"
            >
              Register (New Account)
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">{errorMsg}</div>
              </div>

              {showFirebaseTip && (
                <div className="mt-2.5 pt-2.5 border-t border-red-200 dark:border-red-900/60 text-[11px] leading-relaxed text-red-800 dark:text-red-200">
                  <p className="font-semibold mb-1">Recommended quick solution:</p>
                  <p className="mb-2">
                    Enable Email/Password in Firebase Authentication, or use local demo mode without cloud sync.
                  </p>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Caregiver Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ananya Borah"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00524d]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="caregiver@family.org"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00524d]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00524d]"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Must be at least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#00524d] text-white font-bold text-sm hover:bg-[#003d39] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Processing...' : isRegisterMode ? 'Register & Setup Circle (C-02)' : 'Sign In to Circle (C-03)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
            <button
              onClick={onBack}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
              type="button"
            >
              Continue in Local Household Mode (PIN Gate)
            </button>
          </div>
        </div>
      )}

      {/* Info notice */}
      <div className="mt-6 flex items-start gap-2 text-xs text-slate-400 dark:text-slate-500 px-2">
        <Heart className="w-4 h-4 shrink-0 text-[#00524d] dark:text-[#5eead4] mt-0.5" />
        <span>
Configure your own Firebase project to sign in and sync care data. Local PIN mode stays on this device.
        </span>
      </div>
    </div>
  );
};
