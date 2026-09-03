import React, { useState } from "react";
import {
  Carrot,
  Plus,
  Flame,
  Clock,
  CheckCircle2,
  Trash2,
  ChefHat,
  Search,
  Filter,
  RotateCcw,
  Edit2,
  Save,
  X,
  Sparkles
} from "lucide-react";
import { LeftoverIngredient, PriorityLevel, ActiveTab } from "../types";

interface LeftoversViewProps {
  leftovers: LeftoverIngredient[];
  onAddLeftover: () => void;
  onOpenScanner: () => void;
  onDeleteLeftover: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: "active" | "used") => void;
  onUpdateLeftover: (id: string, updates: Partial<LeftoverIngredient>) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const LeftoversView: React.FC<LeftoversViewProps> = ({
  leftovers,
  onAddLeftover,
  onOpenScanner,
  onDeleteLeftover,
  onToggleStatus,
  onUpdateLeftover,
  setActiveTab
}) => {
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "used">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editQty, setEditQty] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editPriority, setEditPriority] = useState<PriorityLevel>("normal");

  const startEdit = (item: LeftoverIngredient) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditQty(item.quantity);
    setEditUnit(item.unit);
    setEditPriority(item.priority);
  };

  const saveEdit = (id: string) => {
    onUpdateLeftover(id, {
      name: editName.trim() || "Ingredient",
      quantity: editQty.trim() || "1",
      unit: editUnit.trim() || "pieces",
      priority: editPriority
    });
    setEditingId(null);
  };

  const filteredItems = leftovers.filter((item) => {
    if (filterStatus === "active" && item.status !== "active") return false;
    if (filterStatus === "used" && item.status !== "used") return false;
    if (searchQuery.trim()) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const activeCount = leftovers.filter((i) => i.status === "active").length;
  const usedCount = leftovers.filter((i) => i.status === "used").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>My Kitchen Leftovers</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
              {activeCount} active
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Keep track of food in your fridge to use before expiration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScanner}
            className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            📷 Scan Food
          </button>
          <button
            onClick={onAddLeftover}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Leftover</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl w-full sm:w-auto text-xs">
          <button
            onClick={() => setFilterStatus("active")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex-1 sm:flex-initial ${
              filterStatus === "active"
                ? "bg-white dark:bg-zinc-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus("used")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex-1 sm:flex-initial ${
              filterStatus === "used"
                ? "bg-white dark:bg-zinc-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Rescued / Used ({usedCount})
          </button>
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex-1 sm:flex-initial ${
              filterStatus === "all"
                ? "bg-white dark:bg-zinc-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            All ({leftovers.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Leftover Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-3">
            <Carrot className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">
            No ingredients found
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
            {searchQuery
              ? "No items match your search."
              : filterStatus === "used"
              ? "You haven't marked any leftovers as used yet. Once you cook recipes, they'll appear here."
              : "Your kitchen shelf is currently empty."}
          </p>
          <button
            onClick={onAddLeftover}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
          >
            + Add Leftovers Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isEditing = editingId === item.id;
            const isUrgent = item.priority === "use_first";
            const isSoon = item.priority === "soon";
            const isUsed = item.status === "used";

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isUsed
                    ? "bg-zinc-50/50 dark:bg-zinc-800/20 border-zinc-200 dark:border-zinc-800/80 opacity-70"
                    : isUrgent
                    ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60"
                    : isSoon
                    ? "bg-amber-50/30 dark:bg-amber-950/15 border-amber-200 dark:border-amber-900/40"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                }`}
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs font-bold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                        className="w-16 px-2 py-1 rounded-lg text-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                        className="flex-1 px-2 py-1 rounded-lg text-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                      />
                    </div>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as PriorityLevel)}
                      className="w-full px-2 py-1 rounded-lg text-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    >
                      <option value="use_first">Use First</option>
                      <option value="soon">Use Soon</option>
                      <option value="normal">Normal</option>
                    </select>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1 text-zinc-400 hover:text-zinc-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(item.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className={`text-sm font-bold text-zinc-900 dark:text-zinc-100 ${isUsed ? "line-through text-zinc-400" : ""}`}>
                            {item.name}
                          </h4>
                          <span className="text-xs text-zinc-500 font-medium mt-0.5 block">
                            Quantity: {item.quantity} {item.unit}
                          </span>
                        </div>

                        {isUsed ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            Rescued / Used
                          </span>
                        ) : isUrgent ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5" />
                            Use First
                          </span>
                        ) : isSoon ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            Use Soon
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                            Normal
                          </span>
                        )}
                      </div>

                      {item.expiryDate && (
                        <p className="text-[11px] text-zinc-400 mt-2">
                          Status note: {item.expiryDate}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <button
                        onClick={() => onToggleStatus(item.id, item.status)}
                        className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-semibold flex items-center gap-1 text-xs"
                      >
                        {isUsed ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore to Active</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark as Used</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                          title="Edit ingredient"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteLeftover(item.id)}
                          className="p-1 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Launch AI Chef Floating / Fixed Banner */}
      {activeCount > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-emerald-900/10">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <ChefHat className="w-5 h-5 text-amber-300" />
            <div>
              <p className="text-xs font-bold">
                You have {activeCount} active leftover ingredients in your kitchen
              </p>
              <p className="text-[11px] text-emerald-100">
                Ready to turn them into an appetizing zero-waste meal?
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("chef")}
            className="px-4 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Generate Recipes Now</span>
          </button>
        </div>
      )}
    </div>
  );
};
