import React, { useState } from "react";
import {
  Bookmark,
  Heart,
  Eye,
  Trash2,
  Clock,
  ChefHat,
  Search,
  Leaf,
  Sparkles
} from "lucide-react";
import { Recipe, ActiveTab } from "../types";

interface SavedRecipesViewProps {
  savedRecipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onDeleteSavedRecipe: (recipeId: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const SavedRecipesView: React.FC<SavedRecipesViewProps> = ({
  savedRecipes,
  onSelectRecipe,
  onDeleteSavedRecipe,
  setActiveTab
}) => {
  const [search, setSearch] = useState("");

  const filtered = savedRecipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Saved Recipes</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold">
              {savedRecipes.length} saved
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Your personalized collection of leftover-rescue recipes saved to Firestore
          </p>
        </div>

        {savedRecipes.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search saved recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>

      {savedRecipes.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 mb-1">
            No saved recipes yet
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-5">
            Whenever you generate recipes with AI Chef, click the heart icon to save them here for easy access.
          </p>
          <button
            onClick={() => setActiveTab("chef")}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-2"
          >
            <ChefHat className="w-4 h-4" />
            <span>Generate Recipes with AI Chef</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-zinc-500 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          No saved recipes matched "{search}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {recipe.cuisine}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{recipe.cookTime}</span>
                  </div>
                </div>

                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-1">
                  {recipe.title}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                  {recipe.description}
                </p>

                {/* Utilization Pill */}
                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl p-2.5 border border-emerald-100 dark:border-emerald-900/50 mb-4 flex items-center justify-between text-xs">
                  <span className="text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    Leftover Utilization
                  </span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                    {recipe.leftoverUtilizationScore}%
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectRecipe(recipe)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteSavedRecipe(recipe.id)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-zinc-200 dark:border-zinc-800 transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
