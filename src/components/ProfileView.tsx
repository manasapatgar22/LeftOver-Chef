import React, { useState } from "react";
import {
  User as UserIcon,
  Save,
  Check,
  AlertTriangle,
  Heart,
  ChefHat,
  Clock,
  Flame,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { UserProfile } from "../types";
import {
  CUISINES,
  DIETARY_OPTIONS,
  COOKING_TIMES,
  HEALTH_GOALS,
  COMMON_ALLERGIES
} from "../constants";

interface ProfileViewProps {
  userProfile: UserProfile;
  onSaveProfile: (updated: Partial<UserProfile>) => Promise<void>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  onSaveProfile
}) => {
  const [displayName, setDisplayName] = useState(userProfile.displayName || "Eco Chef");
  const [dietaryPreference, setDietaryPreference] = useState(userProfile.dietaryPreference || "Vegetarian");
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>(
    userProfile.cuisinePreferences || ["Indian", "Italian"]
  );
  const [foodAllergies, setFoodAllergies] = useState<string[]>(userProfile.foodAllergies || []);
  const [customAllergyInput, setCustomAllergyInput] = useState("");
  const [cookingSkill, setCookingSkill] = useState(userProfile.cookingSkill || "Intermediate");
  const [typicalCookingTime, setTypicalCookingTime] = useState(
    userProfile.typicalCookingTime || "15–30 minutes"
  );
  const [healthGoals, setHealthGoals] = useState<string[]>(
    userProfile.healthGoals || ["Balanced", "High Protein"]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleCuisine = (cuisine: string) => {
    if (cuisine === "Any") {
      setCuisinePreferences(["Any"]);
      return;
    }
    const filtered = cuisinePreferences.filter((c) => c !== "Any");
    if (filtered.includes(cuisine)) {
      setCuisinePreferences(filtered.filter((c) => c !== cuisine));
    } else {
      setCuisinePreferences([...filtered, cuisine]);
    }
  };

  const toggleAllergy = (allergy: string) => {
    if (foodAllergies.includes(allergy)) {
      setFoodAllergies(foodAllergies.filter((a) => a !== allergy));
    } else {
      setFoodAllergies([...foodAllergies, allergy]);
    }
  };

  const addCustomAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAllergyInput.trim()) return;
    if (!foodAllergies.includes(customAllergyInput.trim())) {
      setFoodAllergies([...foodAllergies, customAllergyInput.trim()]);
    }
    setCustomAllergyInput("");
  };

  const toggleHealthGoal = (goal: string) => {
    if (healthGoals.includes(goal)) {
      setHealthGoals(healthGoals.filter((g) => g !== goal));
    } else {
      setHealthGoals([...healthGoals, goal]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onSaveProfile({
        displayName,
        dietaryPreference,
        cuisinePreferences,
        foodAllergies,
        cookingSkill,
        typicalCookingTime,
        healthGoals
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save profile error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* View Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span>Dietary & Kitchen Profile</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          These settings directly instruct Chef AI when generating recipes and checking allergen conflicts.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile preferences saved to Cloud Firestore! Chef AI is updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-emerald-600" />
            <span>Personal Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Account Email
              </label>
              <input
                type="email"
                disabled
                value={userProfile.email || "demo@leftoverchef.ai"}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Dietary & Allergy Safety Section (Crucial) */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Dietary Preferences & Allergy Safety</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Primary Diet
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIETARY_OPTIONS.map((diet) => (
                <button
                  key={diet}
                  type="button"
                  onClick={() => setDietaryPreference(diet)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                    dietaryPreference === diet
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  {diet}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Food Allergies (Strictly Checked Against All Recipes)</span>
              </label>
              <span className="text-[11px] text-zinc-400">
                {foodAllergies.length} active guards
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mb-3">
              Recipes containing or potentially containing these allergens will display an immediate high-visibility warning.
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_ALLERGIES.map((allergy) => {
                const isSelected = foodAllergies.includes(allergy);
                return (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      isSelected
                        ? "bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-700 dark:text-rose-300 font-bold shadow-2xs"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {isSelected ? "⚠ " : ""}{allergy}
                  </button>
                );
              })}
            </div>

            {/* Custom Allergy Addition */}
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add custom allergy (e.g. Sesame, Kiwi)"
                value={customAllergyInput}
                onChange={(e) => setCustomAllergyInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl text-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={addCustomAllergy}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 text-white dark:bg-zinc-700 text-xs font-semibold"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Cuisines & Cooking Habits */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-emerald-600" />
            <span>Cuisines & Cooking Habits</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Favorite Cuisine Styles (Select multiple)
            </label>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map((c) => {
                const isSelected = cuisinePreferences.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCuisine(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      isSelected
                        ? "bg-emerald-500 text-white border-emerald-500 font-semibold shadow-xs"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Cooking Skill Level
              </label>
              <select
                value={cookingSkill}
                onChange={(e) => setCookingSkill(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Beginner">Beginner (Simple techniques)</option>
                <option value="Intermediate">Intermediate (Comfortable with pan-frying & spices)</option>
                <option value="Advanced">Advanced (Multi-pan, delicate timings)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Typical Cooking Time
              </label>
              <select
                value={typicalCookingTime}
                onChange={(e) => setTypicalCookingTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {COOKING_TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Nutritional & Health Goals
            </label>
            <div className="flex flex-wrap gap-2">
              {HEALTH_GOALS.map((goal) => {
                const isSelected = healthGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleHealthGoal(goal)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      isSelected
                        ? "bg-teal-600 text-white border-teal-600 font-semibold shadow-xs"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            id="save-profile-btn"
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 active:scale-98 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving Profile..." : "Save Preferences to Cloud"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
