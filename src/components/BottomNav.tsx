import React from "react";
import {
  LayoutDashboard,
  Carrot,
  ChefHat,
  Bookmark,
  User as UserIcon
} from "lucide-react";
import { ActiveTab } from "../types";

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  leftoversCount?: number;
  activeCount?: number;
  savedCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  leftoversCount,
  activeCount,
  savedCount = 0
}) => {
  const count = activeCount ?? leftoversCount ?? 0;
  const items = [
    { id: "dashboard" as ActiveTab, label: "Home", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "leftovers" as ActiveTab, label: "Leftovers", icon: <Carrot className="w-5 h-5" />, badge: count },
    { id: "chef" as ActiveTab, label: "AI Chef", icon: <ChefHat className="w-6 h-6" />, primary: true },
    { id: "saved" as ActiveTab, label: "Saved", icon: <Bookmark className="w-5 h-5" />, badge: savedCount },
    { id: "profile" as ActiveTab, label: "Profile", icon: <UserIcon className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {items.map((item) => {
        const isActive = activeTab === item.id;
        if (item.primary) {
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center -mt-5 relative group"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 border-2 border-white dark:border-zinc-900 transition-transform active:scale-95">
                {item.icon}
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg relative transition-colors ${
              isActive
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
