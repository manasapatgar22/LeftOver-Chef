import React, { useState, useEffect } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  auth,
  googleProvider,
  saveUserProfile
} from "../firebase/config";
import { ChefHat, X, Mail, Lock, ShieldCheck, AlertCircle } from "lucide-react";

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
  onSuccess?: () => void;
  initialMode?: "login" | "signup";
  onContinueAsGuest?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onSuccess,
  initialMode = "login",
  onContinueAsGuest
}) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsSignUp(initialMode === "signup");
    setError(null);
    setIsOperationNotAllowed(false);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleAuthCompleted = () => {
    if (typeof onAuthSuccess === "function") {
      try {
        onAuthSuccess();
      } catch (cbErr) {
        console.warn("onAuthSuccess callback error:", cbErr);
      }
    }
    if (typeof onSuccess === "function") {
      try {
        onSuccess();
      } catch (cbErr) {
        console.warn("onSuccess callback error:", cbErr);
      }
    }
    onClose();
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsOperationNotAllowed(false);
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        try {
          await saveUserProfile(res.user.uid, {
            displayName: res.user.displayName || "Eco Chef",
            email: res.user.email || "",
            cuisinePreferences: ["Indian", "Italian"],
            dietaryPreference: "Vegetarian",
            foodAllergies: [],
            cookingSkill: "Intermediate",
            typicalCookingTime: "15–30 minutes",
            healthGoals: ["Balanced", "High Protein"]
          });
        } catch (saveErr) {
          console.warn("Firestore saveUserProfile error:", saveErr);
        }
      }
      handleAuthCompleted();
    } catch (err: any) {
      console.error("Google sign in error:", err);
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        // Voluntarily cancelled by user
      } else if (err.code === "auth/operation-not-allowed") {
        setIsOperationNotAllowed(true);
        setError(
          "Google sign-in provider is not enabled in Firebase Console. You can enable it under Authentication > Sign-in method, or continue with Instant Guest mode below."
        );
      } else if (err.code === "auth/unauthorized-domain") {
        setIsOperationNotAllowed(true);
        setError("This domain is not authorized in Firebase OAuth settings. You can continue instantly using Guest / Demo mode.");
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsOperationNotAllowed(false);
      if (isSignUp) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        if (res.user) {
          try {
            await saveUserProfile(res.user.uid, {
              displayName: displayName.trim() || email.split("@")[0],
              email,
              cuisinePreferences: ["Indian", "Italian"],
              dietaryPreference: "Vegetarian",
              foodAllergies: [],
              cookingSkill: "Intermediate",
              typicalCookingTime: "15–30 minutes",
              healthGoals: ["Balanced", "High Protein"]
            });
          } catch (saveErr) {
            console.warn("Firestore saveUserProfile error:", saveErr);
          }
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      handleAuthCompleted();
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === "auth/operation-not-allowed") {
        setIsOperationNotAllowed(true);
        setError(
          "Email/Password sign-in is currently disabled in your Firebase project. To use email auth, enable the 'Email/Password' provider in the Firebase Console under Authentication > Sign-in method. In the meantime, you can use Instant Guest Access below."
        );
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsOperationNotAllowed(false);
      try {
        const res = await signInAnonymously(auth);
        if (res.user) {
          try {
            await saveUserProfile(res.user.uid, {
              displayName: "Guest Chef",
              email: "guest@leftoverchef.ai",
              cuisinePreferences: ["Italian", "Asian", "Mexican"],
              dietaryPreference: "None",
              foodAllergies: [],
              cookingSkill: "Intermediate",
              typicalCookingTime: "15–30 minutes",
              healthGoals: ["Balanced", "Eco-Friendly"]
            });
          } catch (saveErr) {
            console.warn("Could not save guest profile to Firestore:", saveErr);
          }
        }
      } catch (anonErr: any) {
        console.warn("Firebase anonymous auth disabled or restricted in console; activating local guest session:", anonErr);
        if (onContinueAsGuest) {
          onContinueAsGuest();
          handleAuthCompleted();
          return;
        }
      }
      handleAuthCompleted();
    } catch (err: any) {
      console.error("Guest login error:", err);
      if (onContinueAsGuest) {
        onContinueAsGuest();
        handleAuthCompleted();
      } else {
        setError(err.message || "Could not start guest session.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          id="close-auth-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 mb-3">
            <ChefHat className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {isSignUp ? "Create Leftover Chef Account" : "Welcome Back to Leftover Chef"}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {isSignUp
              ? "Start saving food and generating smart AI recipes"
              : "Sign in to access your stored ingredients and recipes"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
            {isOperationNotAllowed && (
              <div className="mt-1 pt-2 border-t border-rose-200/60 dark:border-rose-900/60 flex items-center justify-between">
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Skip auth setup for now:</span>
                <button
                  type="button"
                  id="auth-error-guest-fallback"
                  onClick={() => {
                    if (onContinueAsGuest) onContinueAsGuest();
                    handleAuthCompleted();
                  }}
                  className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors shadow-xs"
                >
                  Continue as Guest
                </button>
              </div>
            )}
          </div>
        )}

        {/* Federated Google Sign In Button */}
        <button
          id="google-signin-btn"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-semibold text-zinc-800 dark:text-zinc-200 transition-colors shadow-xs mb-3 disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>Continue with Google</span>
        </button>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
          <span className="shrink-0 mx-3 text-[11px] uppercase tracking-wider text-zinc-400">
            or with email
          </span>
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3 mt-1">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Your Name
              </label>
              <input
                id="auth-name-input"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full px-3 py-2 rounded-xl text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-md shadow-emerald-600/20 disabled:opacity-60"
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up & Start Cooking" : "Sign In"}
          </button>
        </form>

        {/* Guest Demo Option */}
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-2">
          <button
            id="auth-guest-btn"
            type="button"
            onClick={handleGuestSignIn}
            disabled={loading}
            className="w-full py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant Guest Access (No password required)</span>
          </button>

          <div className="text-center mt-1">
            <button
              id="toggle-signup-login"
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setIsOperationNotAllowed(false);
              }}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up free"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
