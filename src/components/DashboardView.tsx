import React from "react";
import {
  PlusCircle,
  Camera,
  Sparkles,
  ChefHat,
  ArrowRight,
  Clock,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Flame,
  Award,
  TrendingUp,
  Leaf
} from "lucide-react";
import { LeftoverIngredient, WasteStats, ActiveTab } from "../types";

interface DashboardViewProps {
  leftovers: LeftoverIngredient[];
  stats?: WasteStats;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddIngredient: () => void;
  onOpenScanner: () => void;
  onLoadSampleIngredients: () => void;
  onDeleteLeftover: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: "active" | "used") => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leftovers,
  stats,
  setActiveTab,
  onOpenAddIngredient,
  onOpenScanner,
  onLoadSampleIngredients,
  onDeleteLeftover,
  onToggleStatus
}) => {
  const activeLeftovers = leftovers.filter((i) => i.status === "active");
  const useFirstCount = activeLeftovers.filter((i) => i.priority === "use_first").length;
  const wasteScore = stats?.wasteReductionScore ?? 84;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Hero Header Section */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Powered Food Waste Reduction</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            What's Left in Your Kitchen?
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base font-normal mb-6 leading-relaxed">
            Turn your leftovers into something delicious. Minimize kitchen food waste, reduce grocery bills, and cook restaurant-quality meals.
          </p>

          {/* Large Interactive Call-to-Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dashboard-add-ingredients-btn"
              onClick={onOpenAddIngredient}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-sm shadow-md transition-all active:scale-98"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>+ Add Ingredients</span>
            </button>

            <button
              id="dashboard-scan-food-btn"
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/30 hover:bg-emerald-500/40 text-white border border-white/20 font-bold text-sm backdrop-blur-md transition-all active:scale-98"
            >
              <Camera className="w-4 h-4 text-emerald-200" />
              <span>📷 Scan Food</span>
            </button>

            <button
              id="dashboard-try-samples-btn"
              onClick={onLoadSampleIngredients}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-300/30 font-semibold text-sm transition-all"
              title="Loads Cooked Rice, Tomato, Onion, Carrot, Capsicum, Paneer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Try Sample Ingredients</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real Firestore Dashboard Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Leftovers Added
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {stats?.leftoversAdded ?? leftovers.length}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {activeLeftovers.length} active in pantry
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Recipes Generated
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {stats?.recipesGenerated ?? 0}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Custom culinary variations
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Ingredients Saved
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {stats?.ingredientsSaved ?? leftovers.filter(i => i.status === "used").length}
          </div>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">
            Rescued from disposal
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Waste Reduction Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {wasteScore}%
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${wasteScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Kitchen Leftovers Shelf */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Active Kitchen Leftovers
              </h2>
              {useFirstCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-500" />
                  {useFirstCount} Urgent (Use First)
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Ingredients currently ready for AI recipe generation
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeLeftovers.length > 0 && (
              <button
                id="dashboard-generate-now-btn"
                onClick={() => setActiveTab("chef")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm shadow-emerald-600/20"
              >
                <ChefHat className="w-4 h-4" />
                <span>Cook with AI Chef ({activeLeftovers.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              id="dashboard-view-all-leftovers-btn"
              onClick={() => setActiveTab("leftovers")}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Manage All
            </button>
          </div>
        </div>

        {activeLeftovers.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Leaf className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 mb-1">
              Your Leftover Shelf is Empty
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-5">
              Add whatever ingredients you have in your fridge or pantry, or try our one-click sample ingredients.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                id="empty-try-sample-btn"
                onClick={onLoadSampleIngredients}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Load Sample Leftovers
              </button>
              <button
                id="empty-add-btn"
                onClick={onOpenAddIngredient}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                + Add Custom Ingredient
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeLeftovers.map((item) => {
              const isUrgent = item.priority === "use_first";
              const isSoon = item.priority === "soon";

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isUrgent
                      ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/50"
                      : isSoon
                      ? "bg-amber-50/30 dark:bg-amber-950/15 border-amber-200/70 dark:border-amber-900/40"
                      : "bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {item.name}
                        </span>
                        {item.category && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                        Qty: {item.quantity} {item.unit}
                      </div>
                    </div>

                    {isUrgent ? (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5" />
                        Use First
                      </span>
                    ) : isSoon ? (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        Use Soon
                      </span>
                    ) : (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300">
                        Normal
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-700/40 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onToggleStatus(item.id, item.status)}
                      className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-medium flex items-center gap-1 text-[11px]"
                      title="Mark as cooked/used in recipe"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Used</span>
                    </button>

                    <button
                      onClick={() => onDeleteLeftover(item.id)}
                      className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1"
                      title="Remove ingredient"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Practical Quick Workflow Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-5 border border-emerald-200/80 dark:border-emerald-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
              Ready to generate recipes with your leftovers?
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Gemini AI analyzes combinations, respects dietary restrictions, and provides nutritional estimates.
            </p>
          </div>
        </div>

        <button
          id="dashboard-goto-chef-banner"
          onClick={() => setActiveTab("chef")}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <span>Open AI Chef</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
