import React from "react";
import {
  X,
  Heart,
  ChefHat,
  Clock,
  Users,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Sparkles,
  ArrowLeft,
  Share2
} from "lucide-react";
import confetti from "canvas-confetti";
import { Recipe, UserProfile } from "../types";

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  userProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onToggleSave: (recipe: Recipe) => void;
  isSaved: boolean;
  onCookRecipe: (recipe: Recipe) => void;
  onGenerateAnother: () => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  userProfile,
  isOpen,
  onClose,
  onToggleSave,
  isSaved,
  onCookRecipe,
  onGenerateAnother
}) => {
  if (!isOpen || !recipe) return null;

  // Check allergy conflict
  const allergyConflicts = (userProfile?.foodAllergies || []).filter((allergen) => {
    const allergenLower = allergen.toLowerCase();
    const inAdditional = recipe.additionalIngredients?.some((i) =>
      i.toLowerCase().includes(allergenLower)
    );
    const inLeftovers = recipe.leftoverIngredientsUsed?.some((i) =>
      i.toLowerCase().includes(allergenLower)
    );
    const inWarnings = recipe.allergyWarnings?.some((w) =>
      w.toLowerCase().includes(allergenLower)
    );
    return inAdditional || inLeftovers || inWarnings;
  });

  const handleCookCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    onCookRecipe(recipe);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md z-10">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Recipes</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSave(recipe)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isSaved
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-600"
                  : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>{isSaved ? "Saved" : "Save Recipe"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Title & Metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                {recipe.cuisine}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                Difficulty: {recipe.difficulty}
              </span>
              {recipe.dietaryCompatibility?.map((diet) => (
                <span
                  key={diet}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300"
                >
                  {diet}
                </span>
              ))}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {recipe.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
              {recipe.description}
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 mt-4">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Prep Time</span>
                <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">{recipe.prepTime}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Cook Time</span>
                <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">{recipe.cookTime}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Servings</span>
                <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">{recipe.servings} people</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center col-span-3 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Calories</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">{recipe.calories} kcal*</span>
              </div>
            </div>
          </div>

          {/* Allergy Safety Alert (Prominent Warning) */}
          {allergyConflicts.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">⚠ Allergy Alert</h4>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                  This recipe may contain an ingredient that conflicts with your allergy preferences:{" "}
                  <strong>{allergyConflicts.join(", ")}</strong>. Please review all ingredients carefully before cooking.
                </p>
              </div>
            </div>
          )}

          {/* Leftover Utilization Banner */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-zinc-800/40 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Leftover Utilization Score
                  </h4>
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                    {recipe.leftoverUtilizationScore}%
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-white/80 dark:bg-zinc-800 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                {recipe.leftoverIngredientsUsed?.length || 0} Leftovers Rescued
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              “This recipe uses most of the ingredients already available in your kitchen and requires only a few additional ingredients.”
            </p>
            {recipe.wasteReductionExplanation && (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-2 italic font-medium">
                Impact: {recipe.wasteReductionExplanation}
              </p>
            )}
          </div>

          {/* Ingredients Section: Split Leftovers vs Additional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Leftover Ingredients Used */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Leftover Ingredients</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Available in Kitchen
                </span>
              </div>
              <ul className="space-y-2">
                {recipe.leftoverIngredientsUsed?.map((item, idx) => (
                  <li key={idx} className="text-xs flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional Pantry Ingredients */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <span>Additional Ingredients</span>
                </h4>
                <span className="text-[10px] font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                  Basic Pantry
                </span>
              </div>
              <ul className="space-y-2">
                {recipe.additionalIngredients?.map((item, idx) => (
                  <li key={idx} className="text-xs flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <span className="text-zinc-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cooking Instructions */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-emerald-600" />
              <span>Step-by-Step Cooking Instructions</span>
            </h4>
            <ol className="space-y-3">
              {recipe.instructions?.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Nutritional Breakdown (Estimated) */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Estimated Nutritional Values
              </h4>
              <span className="text-[10px] text-zinc-400 italic">
                *Estimated per serving
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-400 block">Calories</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{recipe.calories} kcal</span>
              </div>
              <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-400 block">Protein</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{recipe.protein}</span>
              </div>
              <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-400 block">Carbs</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{recipe.carbohydrates}</span>
              </div>
              <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-400 block">Fat</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{recipe.fat}</span>
              </div>
              <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-zinc-400 block">Fiber</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{recipe.fiber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onGenerateAnother}
            className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition-colors flex items-center gap-1.5"
          >
            <ChefHat className="w-4 h-4" />
            <span>Generate Another</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSave(recipe)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                isSaved
                  ? "bg-rose-50 border-rose-300 text-rose-600"
                  : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50"
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>{isSaved ? "Saved" : "Save Recipe"}</span>
            </button>

            <button
              id="cook-recipe-btn"
              type="button"
              onClick={handleCookCelebration}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2 active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Cook & Rescue Leftovers</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
