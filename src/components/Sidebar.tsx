import React from "react";
import {
  LayoutDashboard,
  Carrot,
  ChefHat,
  Bookmark,
  History,
  User as UserIcon,
  Sparkles,
  Camera,
  PlusCircle,
  Leaf
} from "lucide-react";
import { ActiveTab } from "../types";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  leftoversCount?: number;
  activeLeftoversCount?: number;
  savedCount?: number;
  wasteReducedKg?: number;
  onOpenScanner?: () => void;
  onOpenAddIngredient?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  leftoversCount,
  activeLeftoversCount,
  savedCount = 0,
  wasteReducedKg,
  onOpenScanner,
  onOpenAddIngredient
}) => {
  const count = activeLeftoversCount ?? leftoversCount ?? 0;
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: "leftovers",
      label: "My Leftovers",
      icon: <Carrot className="w-5 h-5" />,
      badge: count
    },
    {
      id: "chef",
      label: "AI Chef",
      icon: <ChefHat className="w-5 h-5 text-emerald-500" />
    },
    {
      id: "saved",
      label: "Saved Recipes",
      icon: <Bookmark className="w-5 h-5" />,
      badge: savedCount
    },
    {
      id: "history",
      label: "Recipe History",
      icon: <History className="w-5 h-5" />
    },
    {
      id: "profile",
      label: "Profile",
      icon: <UserIcon className="w-5 h-5" />
    }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-4 shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <ChefHat className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight flex items-center gap-1.5">
            Leftover Chef
          </h1>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Zero Waste Kitchen AI
          </p>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 gap-2 mb-5 px-1">
        <button
          id="sidebar-add-btn"
          onClick={onOpenAddIngredient}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Food</span>
        </button>

        <button
          id="sidebar-scan-btn"
          onClick={onOpenScanner}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
        >
          <Camera className="w-4 h-4 text-emerald-600" />
          <span>Scan Photo</span>
        </button>
      </div>

      {/* Main Navigation */}
      <div className="space-y-1 flex-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Menu
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25 font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? "text-white" : ""}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? "bg-white text-emerald-700"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Environmental Impact Banner */}
      <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-zinc-800/80 dark:to-zinc-800/40 p-3 rounded-xl border border-emerald-100/80 dark:border-zinc-700/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span>Eat Better, Waste Less</span>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Every leftover transformed into a meal cuts kitchen waste and saves money.
          </p>
        </div>
      </div>
    </aside>
  );
};
