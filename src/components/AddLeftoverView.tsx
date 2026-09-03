import React, { useState } from "react";
import {
  Plus,
  Trash2,
  ChefHat,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Tag,
  Check,
  Camera
} from "lucide-react";
import { LeftoverIngredient, PriorityLevel, ActiveTab } from "../types";

export interface AddLeftoverViewProps {
  onSaveIngredients?: (items: Omit<LeftoverIngredient, "id" | "createdAt">[]) => void;
  onAnalyzeDirectly?: (items: Omit<LeftoverIngredient, "id" | "createdAt">[]) => void;
  setActiveTab?: (tab: ActiveTab) => void;
  onSave?: (item: Omit<LeftoverIngredient, "id" | "createdAt">) => void;
  onOpenScanner?: () => void;
}

export const AddLeftoverView: React.FC<AddLeftoverViewProps> = ({
  onSaveIngredients,
  onAnalyzeDirectly,
  setActiveTab,
  onSave,
  onOpenScanner
}) => {
  // Input fields for current ingredient being added
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("pieces");
  const [priority, setPriority] = useState<PriorityLevel>("normal");
  const [expiryDate, setExpiryDate] = useState("");
  const [category, setCategory] = useState("Produce");

  // Queue of ingredients to add
  const [ingredientQueue, setIngredientQueue] = useState<
    Omit<LeftoverIngredient, "id" | "createdAt">[]
  >([
    {
      name: "Tomato",
      quantity: "3",
      unit: "pieces",
      priority: "use_first",
      status: "active",
      category: "Produce",
      expiryDate: "1 day"
    },
    {
      name: "Cooked Rice",
      quantity: "2",
      unit: "cups",
      priority: "normal",
      status: "active",
      category: "Grain",
      expiryDate: "2 days"
    },
    {
      name: "Paneer",
      quantity: "200",
      unit: "g",
      priority: "normal",
      status: "active",
      category: "Dairy",
      expiryDate: "3 days"
    }
  ]);

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAddToQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError("Please enter an ingredient name.");
      return;
    }

    const newItem: Omit<LeftoverIngredient, "id" | "createdAt"> = {
      name: name.trim(),
      quantity: quantity.trim() || "1",
      unit: unit.trim() || "item",
      priority,
      status: "active",
      category: category.trim() || "General",
      expiryDate: expiryDate.trim() || undefined
    };

    setIngredientQueue([...ingredientQueue, newItem]);
    setName("");
    setQuantity("1");
    setExpiryDate("");
    setPriority("normal");
    setValidationError(null);
  };

  const handleRemoveQueueItem = (index: number) => {
    setIngredientQueue(ingredientQueue.filter((_, idx) => idx !== index));
  };

  const handleTogglePriority = (index: number) => {
    setIngredientQueue(
      ingredientQueue.map((item, idx) => {
        if (idx === index) {
          const nextPriority: PriorityLevel =
            item.priority === "normal"
              ? "use_first"
              : item.priority === "use_first"
              ? "soon"
              : "normal";
          return { ...item, priority: nextPriority };
        }
        return item;
      })
    );
  };

  const handleSaveToPantry = () => {
    if (ingredientQueue.length === 0) {
      setValidationError("Please add at least one ingredient to save.");
      return;
    }
    if (typeof onSaveIngredients === "function") {
      onSaveIngredients(ingredientQueue);
    } else if (typeof onSave === "function") {
      ingredientQueue.forEach((item) => onSave(item));
    }
    if (typeof setActiveTab === "function") {
      setActiveTab("leftovers");
    }
  };

  const handleAnalyzeIngredients = () => {
    if (ingredientQueue.length === 0) {
      setValidationError("Please add at least one leftover ingredient to analyze.");
      return;
    }
    if (typeof onAnalyzeDirectly === "function") {
      onAnalyzeDirectly(ingredientQueue);
    } else {
      if (typeof onSaveIngredients === "function") {
        onSaveIngredients(ingredientQueue);
      } else if (typeof onSave === "function") {
        ingredientQueue.forEach((item) => onSave(item));
      }
      if (typeof setActiveTab === "function") {
        setActiveTab("chef");
      }
    }
  };

  const commonUnits = [
    "pieces",
    "cups",
    "g",
    "kg",
    "tbsp",
    "tsp",
    "slices",
    "bunch",
    "cloves",
    "handful"
  ];

  const quickCategories = [
    "Produce",
    "Grain",
    "Dairy",
    "Protein",
    "Bakery",
    "Condiment"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Add Leftover Ingredients
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Catalog food items from your fridge or pantry. Flag perishable items as "Use First" to prioritize them in recipe generation.
          </p>
        </div>

        {onOpenScanner && (
          <button
            id="switch-to-scanner-btn"
            type="button"
            onClick={onOpenScanner}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-zinc-200 dark:border-zinc-700"
          >
            <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Scan with AI Camera</span>
          </button>
        )}
      </div>

      {validationError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Input Form Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
        <form onSubmit={handleAddToQueue} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Ingredient Name */}
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Ingredient Name *
              </label>
              <input
                id="ingredient-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setValidationError(null);
                }}
                placeholder="e.g. Tomato, Boiled Potatoes, Spinach"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Quantity */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Quantity
              </label>
              <input
                id="ingredient-qty-input"
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 2, 250"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Unit */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Unit
              </label>
              <select
                id="ingredient-unit-select"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {commonUnits.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority / Urgency */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Priority Status
              </label>
              <select
                id="ingredient-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2.5 rounded-xl text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="use_first">🔥 Use First (Urgent)</option>
                <option value="soon">⏳ Use Soon (2-3 days)</option>
                <option value="normal">🌿 Normal (Stable)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            {/* Category */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {quickCategories.slice(0, 4).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      category === cat
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Expiry / Days Left */}
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Approx. Shelf Life / Note (Optional)
              </label>
              <input
                id="ingredient-expiry-input"
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="e.g. 1-2 days, Cooked yesterday"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Add Button */}
            <div className="sm:col-span-3">
              <button
                id="add-ingredient-to-queue-btn"
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add to List</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Staged Ingredient Queue Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Ingredients Ready to Add ({ingredientQueue.length})
            </h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Review, toggle priority, and analyze
            </span>
          </div>
        </div>

        {ingredientQueue.length === 0 ? (
          <div className="py-8 text-center text-zinc-400 dark:text-zinc-600 text-xs">
            No ingredients in current batch. Use the form above to add items.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 uppercase font-semibold">
                  <th className="pb-3 pl-2">Ingredient</th>
                  <th className="pb-3">Quantity</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Notes</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {ingredientQueue.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 pl-2 font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.name}
                    </td>
                    <td className="py-3 text-zinc-600 dark:text-zinc-300">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => handleTogglePriority(idx)}
                        title="Click to toggle priority level"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-transform active:scale-95 ${
                          item.priority === "use_first"
                            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200"
                            : item.priority === "soon"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {item.priority === "use_first" && <Flame className="w-3 h-3" />}
                        {item.priority === "soon" && <Clock className="w-3 h-3" />}
                        <span>
                          {item.priority === "use_first"
                            ? "Use First"
                            : item.priority === "soon"
                            ? "Use Soon"
                            : "Normal"}
                        </span>
                      </button>
                    </td>
                    <td className="py-3 text-xs text-zinc-500">
                      {item.expiryDate || "—"}
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveQueueItem(idx)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Remove from batch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Submission Action Buttons */}
        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            id="save-pantry-only-btn"
            type="button"
            onClick={handleSaveToPantry}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save to Kitchen Shelf Only</span>
          </button>

          <button
            id="analyze-my-ingredients-btn"
            type="button"
            onClick={handleAnalyzeIngredients}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
          >
            <ChefHat className="w-5 h-5" />
            <span>Analyze My Ingredients</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
