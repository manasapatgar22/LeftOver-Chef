import React, { useState, useEffect } from "react";
import {
  ChefHat,
  Sparkles,
  Flame,
  Clock,
  Heart,
  Eye,
  ArrowUpDown,
  Filter,
  CheckSquare,
  Square,
  AlertTriangle,
  Leaf,
  PlusCircle
} from "lucide-react";
import {
  LeftoverIngredient,
  Recipe,
  ChefPreferences,
  UserProfile,
  ActiveTab
} from "../types";
import {
  CUISINES,
  DIETARY_OPTIONS,
  COOKING_TIMES,
  DIFFICULTY_LEVELS,
  HEALTH_GOALS
} from "../constants";
import { GeminiLoading } from "./GeminiLoading";

interface AiChefViewProps {
  leftovers: LeftoverIngredient[];
  userProfile: UserProfile;
  generatedRecipes: Recipe[];
  onGenerateRecipes: (
    selectedIngredients: LeftoverIngredient[],
    preferences: ChefPreferences
  ) => Promise<void>;
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleSaveRecipe: (recipe: Recipe) => void;
  isSaved: (recipeId: string) => boolean;
  isLoading: boolean;
  setActiveTab: (tab: ActiveTab) => void;
}

export const AiChefView: React.FC<AiChefViewProps> = ({
  leftovers,
  userProfile,
  generatedRecipes,
  onGenerateRecipes,
  onSelectRecipe,
  onToggleSaveRecipe,
  isSaved,
  isLoading,
  setActiveTab
}) => {
  const activeLeftovers = leftovers.filter((i) => i.status === "active");

  // Selection of ingredients to include
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    // By default, select all active leftovers
    if (activeLeftovers.length > 0 && selectedIds.length === 0) {
      setSelectedIds(activeLeftovers.map((i) => i.id));
    }
  }, [leftovers]);

  // Chef preferences state initialized from user profile
  const [preferences, setPreferences] = useState<ChefPreferences>({
    cuisine: (userProfile?.cuisinePreferences && userProfile.cuisinePreferences[0]) || "Any",
    diet: userProfile?.dietaryPreference || "Vegetarian",
    cookingTime: userProfile?.typicalCookingTime || "15–30 minutes",
    difficulty: "Easy",
    healthGoal: (userProfile?.healthGoals && userProfile.healthGoals[0]) || "Balanced"
  });

  // Sync with profile updates if preferences have not been manually set
  useEffect(() => {
    if (userProfile) {
      setPreferences((prev) => ({
        cuisine: prev.cuisine !== "Any" ? prev.cuisine : (userProfile.cuisinePreferences?.[0] || "Any"),
        diet: prev.diet || userProfile.dietaryPreference || "Vegetarian",
        cookingTime: prev.cookingTime || userProfile.typicalCookingTime || "15–30 minutes",
        difficulty: prev.difficulty || "Easy",
        healthGoal: prev.healthGoal || userProfile.healthGoals?.[0] || "Balanced"
      }));
    }
  }, [userProfile]);

  // Sorting & filtering state for results
  const [sortBy, setSortBy] = useState<"utilization" | "fastest" | "calories">("utilization");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");

  const toggleSelectIngredient = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === activeLeftovers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(activeLeftovers.map((i) => i.id));
    }
  };

  const handleGenerate = () => {
    const chosenIngredients = activeLeftovers.filter((i) => selectedIds.includes(i.id));
    if (chosenIngredients.length === 0) return;
    onGenerateRecipes(chosenIngredients, preferences);
  };

  // Sort and filter recipes
  const processedRecipes = [...generatedRecipes]
    .filter((r) => difficultyFilter === "All" || r.difficulty === difficultyFilter)
    .sort((a, b) => {
      if (sortBy === "utilization") {
        return (b.leftoverUtilizationScore || 0) - (a.leftoverUtilizationScore || 0);
      }
      if (sortBy === "fastest") {
        const getMinutes = (str: string) => parseInt(str.replace(/\D/g, ""), 10) || 20;
        return getMinutes(a.cookTime) - getMinutes(b.cookTime);
      }
      if (sortBy === "calories") {
        return (a.calories || 400) - (b.calories || 400);
      }
      return 0;
    });

  const selectedCount = selectedIds.length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* View Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Core AI Culinary Intelligence</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          AI Chef Recipe Generator
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Pick the leftovers to rescue, tune your dietary and cuisine preferences, and let Chef AI craft tailored, waste-minimizing recipes.
        </p>
      </div>

      {/* Control Box: Leftover Selector + Preferences Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Leftover Selection */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Select Leftovers to Use ({selectedCount}/{activeLeftovers.length})
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Select ingredients to formulate recipes around
                </p>
              </div>

              {activeLeftovers.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  {selectedCount === activeLeftovers.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>

            {activeLeftovers.length === 0 ? (
              <div className="py-10 text-center text-xs text-zinc-500 space-y-3">
                <p>No active leftovers found in your kitchen.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab("add_leftover")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Ingredients First</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {activeLeftovers.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isUrgent = item.priority === "use_first";

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSelectIngredient(item.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all select-none ${
                        isSelected
                          ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 font-medium"
                          : "bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-400 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {item.name}
                          </span>
                          <span className="text-zinc-500 ml-1.5">
                            ({item.quantity} {item.unit})
                          </span>
                        </div>
                      </div>

                      {isUrgent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center gap-1 shrink-0">
                          <Flame className="w-2.5 h-2.5" />
                          Use First
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span>Rescue target: {selectedCount} items</span>
            <button
              onClick={() => setActiveTab("add_leftover")}
              className="text-emerald-600 hover:underline font-medium text-[11px]"
            >
              + Add more food
            </button>
          </div>
        </div>

        {/* Right Column: Culinary & Dietary Preferences */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Culinary Preferences
            </h3>
            <p className="text-[11px] text-zinc-500 mb-4">
              Personalize taste, preparation time, and nutritional intent
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Cuisine */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Cuisine Style
                </label>
                <select
                  id="chef-cuisine-select"
                  value={preferences.cuisine}
                  onChange={(e) => setPreferences({ ...preferences, cuisine: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {CUISINES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Diet */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Dietary Preference
                </label>
                <select
                  id="chef-diet-select"
                  value={preferences.diet}
                  onChange={(e) => setPreferences({ ...preferences, diet: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {DIETARY_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cooking Time */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Target Cooking Time
                </label>
                <select
                  id="chef-time-select"
                  value={preferences.cookingTime}
                  onChange={(e) => setPreferences({ ...preferences, cookingTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {COOKING_TIMES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Cooking Difficulty
                </label>
                <select
                  id="chef-difficulty-select"
                  value={preferences.difficulty}
                  onChange={(e) => setPreferences({ ...preferences, difficulty: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {DIFFICULTY_LEVELS.map((dl) => (
                    <option key={dl} value={dl}>
                      {dl}
                    </option>
                  ))}
                </select>
              </div>

              {/* Health Goal */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Health & Nutritional Goal
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {HEALTH_GOALS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, healthGoal: goal })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        preferences.healthGoal === goal
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Allergy Notice */}
            {(userProfile?.foodAllergies?.length ?? 0) > 0 && (
              <div className="mt-3 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Active Allergies Guard: {(userProfile.foodAllergies || []).join(", ")}</span>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              id="chef-generate-recipes-btn"
              type="button"
              onClick={handleGenerate}
              disabled={isLoading || selectedCount === 0}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2.5 active:scale-98"
            >
              <ChefHat className="w-5 h-5" />
              <span>
                {isLoading ? "Generating with Gemini..." : `👨🍳 Generate Recipes (${selectedCount} Leftovers)`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading Experience */}
      {isLoading && <GeminiLoading />}

      {/* Section 8: Recipe Results */}
      {!isLoading && generatedRecipes.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                <span>AI Suggested Recipes</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                  {processedRecipes.length} recipes
                </span>
              </h3>
              <p className="text-xs text-zinc-500">
                Sorted to maximize food waste reduction and leftover reuse
              </p>
            </div>

            {/* Sort & Filter Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setSortBy("utilization")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    sortBy === "utilization"
                      ? "bg-white dark:bg-zinc-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                  }`}
                >
                  Highest Leftover %
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("fastest")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    sortBy === "fastest"
                      ? "bg-white dark:bg-zinc-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                  }`}
                >
                  Fastest
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("calories")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    sortBy === "calories"
                      ? "bg-white dark:bg-zinc-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                  }`}
                >
                  Lowest Cal
                </button>
              </div>

              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Recipe Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {processedRecipes.map((recipe) => {
              const saved = isSaved(recipe.id);
              const totalItemsCount = selectedCount || activeLeftovers.length || 6;
              const usedCount = recipe.leftoverIngredientsUsed?.length || 4;

              // Check allergy conflicts with user profile
              const userAllergies = userProfile?.foodAllergies || [];
              const allergyConflict =
                userAllergies.length > 0 &&
                recipe.allergyWarnings?.some((warn) =>
                  userAllergies.some((allergen) =>
                    warn.toLowerCase().includes(allergen.toLowerCase())
                  )
                );

              return (
                <div
                  key={recipe.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Tags */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {recipe.cuisine}
                      </span>

                      <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{recipe.cookTime}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1">
                      {recipe.title}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                      {recipe.description}
                    </p>

                    {/* Allergy Warning Alert if triggered */}
                    {allergyConflict && (
                      <div className="mb-3 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-700 dark:text-rose-300 flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>⚠ Allergy Alert: Contains {userAllergies.join(", ")}</span>
                      </div>
                    )}

                    {/* Utilization Score Card */}
                    <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl p-3 border border-emerald-100 dark:border-emerald-900/50 mb-4">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                          <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                          Leftover Utilization
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          {recipe.leftoverUtilizationScore}%
                        </span>
                      </div>

                      <div className="w-full bg-emerald-200/50 dark:bg-emerald-900/50 h-1.5 rounded-full overflow-hidden mb-1.5">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${recipe.leftoverUtilizationScore}%` }}
                        />
                      </div>

                      <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        Uses <span className="font-bold text-emerald-700 dark:text-emerald-300">{usedCount}</span> of your leftovers
                      </div>
                    </div>

                    {/* Nutrition Preview */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-4 px-1">
                      <span>Calories: <strong className="text-zinc-800 dark:text-zinc-200">{recipe.calories} kcal</strong></span>
                      <span>Difficulty: <strong className="text-zinc-800 dark:text-zinc-200">{recipe.difficulty}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectRecipe(recipe)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Recipe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleSaveRecipe(recipe)}
                      className={`p-2 rounded-xl border transition-colors ${
                        saved
                          ? "bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                      title={saved ? "Remove from saved" : "Save recipe"}
                    >
                      <Heart className={`w-4 h-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
