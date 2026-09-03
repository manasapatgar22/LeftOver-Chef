import React from "react";
import {
  ChefHat,
  Leaf,
  Sparkles,
  LogOut,
  LogIn,
  User as UserIcon,
  Sun,
  Moon
} from "lucide-react";
import { User } from "firebase/auth";
import { ActiveTab, WasteStats } from "../types";

interface TopNavProps {
  currentUser: User | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  stats?: WasteStats;
  onOpenAuth: (mode?: "login" | "signup") => void;
  onSignOut: () => void;
  onLoadDemo: () => void;
  darkMode?: boolean;
  toggleDarkMode?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  stats,
  onOpenAuth,
  onSignOut,
  onLoadDemo,
  darkMode = false,
  toggleDarkMode
}) => {
  const tabTitles: Record<ActiveTab, string> = {
    dashboard: "Kitchen Dashboard",
    leftovers: "My Stored Leftovers",
    chef: "AI Smart Recipe Generator",
    saved: "Saved Recipe Book",
    history: "Recipe Generation History",
    profile: "Dietary & Kitchen Profile",
    scanner: "Multimodal Food Scanner",
    add_leftover: "Add Kitchen Leftovers"
  };

  const wasteScore = stats?.wasteReductionScore ?? 84;

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-3 flex items-center justify-between transition-colors">
      {/* Title / Mobile Brand */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <ChefHat className="w-5 h-5" />
          </div>
          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
            Leftover Chef
          </span>
        </div>

        <div className="hidden md:block">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {tabTitles[activeTab]}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Smart leftover management powered by Gemini AI
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Waste Reduction Score Pill */}
        <div
          title="Overall Leftover Utilization & Food Waste Reduction Score"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold"
        >
          <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Waste Reduction: {wasteScore}%</span>
        </div>

        {/* Try Demo Button */}
        <button
          id="top-demo-btn"
          onClick={onLoadDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Try Demo</span>
        </button>

        {/* Dark Mode Toggle */}
        {toggleDarkMode && (
          <button
            id="theme-toggle-btn"
            onClick={toggleDarkMode}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* User Account / Profile */}
        {currentUser ? (
          <div className="flex items-center gap-2">
            <button
              id="top-profile-btn"
              onClick={() => setActiveTab("profile")}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Open Profile"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                {(currentUser.displayName?.[0] || currentUser.email?.[0] || "U").toUpperCase()}
              </div>
              <span className="hidden lg:inline text-xs font-medium text-zinc-700 dark:text-zinc-300 max-w-[100px] truncate">
                {currentUser.displayName || currentUser.email?.split("@")[0] || "User"}
              </span>
            </button>

            <button
              id="logout-btn"
              onClick={onSignOut}
              className="p-1.5 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            id="login-trigger-btn"
            onClick={() => onOpenAuth("login")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
