import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  auth,
  fetchUserLeftovers,
  addLeftoverToFirestore,
  updateLeftoverInFirestore,
  deleteLeftoverFromFirestore,
  fetchUserStats,
  updateUserStatsInFirestore,
  fetchSavedRecipes,
  saveRecipeToFirestore,
  deleteSavedRecipeFromFirestore,
  fetchRecipeHistory,
  saveRecipeHistory,
  fetchUserProfile,
  saveUserProfile,
  signOutUser
} from "./firebase/config";
import {
  LeftoverIngredient,
  Recipe,
  WasteStats,
  RecipeHistoryItem,
  UserProfile,
  ActiveTab,
  ChefPreferences
} from "./types";
import {
  INITIAL_MOCK_LEFTOVERS,
  INITIAL_MOCK_STATS,
  SAMPLE_RECIPES,
  SAMPLE_INGREDIENTS
} from "./constants";

// Layout & View Components
import { Sidebar } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import { BottomNav } from "./components/BottomNav";
import { AuthModal } from "./components/AuthModal";
import { DashboardView } from "./components/DashboardView";
import { AddLeftoverView } from "./components/AddLeftoverView";
import { ScannerView } from "./components/ScannerView";
import { AiChefView } from "./components/AiChefView";
import { LeftoversView } from "./components/LeftoversView";
import { SavedRecipesView } from "./components/SavedRecipesView";
import { HistoryView } from "./components/HistoryView";
import { ProfileView } from "./components/ProfileView";
import { RecipeDetailModal } from "./components/RecipeDetailModal";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function App() {
  // Authentication & User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [darkMode, setDarkMode] = useState(false);

  // App Data States
  const [leftovers, setLeftovers] = useState<LeftoverIngredient[]>(INITIAL_MOCK_LEFTOVERS);
  const [stats, setStats] = useState<WasteStats>(INITIAL_MOCK_STATS);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(SAMPLE_RECIPES.slice(0, 1));
  const [recipeHistory, setRecipeHistory] = useState<RecipeHistoryItem[]>([
    {
      id: "hist-1",
      recipeId: SAMPLE_RECIPES[0].id,
      recipeTitle: SAMPLE_RECIPES[0].title,
      date: "Today, 12:30 PM",
      ingredientsUsed: ["Cooked Rice", "Tomato", "Carrot", "Onion"],
      leftoverUtilizationScore: 92,
      recipe: SAMPLE_RECIPES[0]
    }
  ]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    uid: "guest-user",
    displayName: "Eco Home Chef",
    email: "chef@leftoverchef.ai",
    cuisinePreferences: ["Indian", "Italian"],
    dietaryPreference: "Vegetarian",
    foodAllergies: [],
    cookingSkill: "Intermediate",
    typicalCookingTime: "15–30 minutes",
    healthGoals: ["Balanced", "High Protein"]
  });

  // AI Generation & Recipe Detail
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>(SAMPLE_RECIPES);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);

  // In-App Toast Feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Load User Data from Firestore
          const [loadedLeftovers, loadedStats, loadedSaved, loadedHistory, loadedProfile] =
            await Promise.all([
              fetchUserLeftovers(user.uid),
              fetchUserStats(user.uid),
              fetchSavedRecipes(user.uid),
              fetchRecipeHistory(user.uid),
              fetchUserProfile(user.uid)
            ]);

          if (loadedLeftovers.length > 0) setLeftovers(loadedLeftovers);
          if (loadedStats) setStats(loadedStats);
          if (loadedSaved.length > 0) setSavedRecipes(loadedSaved);
          if (loadedHistory.length > 0) setRecipeHistory(loadedHistory);
          if (loadedProfile) {
            setUserProfile((prev) => ({
              ...prev,
              ...loadedProfile,
              uid: user.uid,
              displayName: loadedProfile.displayName || user.displayName || prev.displayName,
              email: loadedProfile.email || user.email || prev.email,
              cuisinePreferences:
                Array.isArray(loadedProfile.cuisinePreferences) && loadedProfile.cuisinePreferences.length > 0
                  ? loadedProfile.cuisinePreferences
                  : prev.cuisinePreferences || ["Indian", "Italian"],
              dietaryPreference: loadedProfile.dietaryPreference || prev.dietaryPreference || "Vegetarian",
              foodAllergies: Array.isArray(loadedProfile.foodAllergies)
                ? loadedProfile.foodAllergies
                : prev.foodAllergies || [],
              cookingSkill: loadedProfile.cookingSkill || prev.cookingSkill || "Intermediate",
              typicalCookingTime: loadedProfile.typicalCookingTime || prev.typicalCookingTime || "15–30 minutes",
              healthGoals:
                Array.isArray(loadedProfile.healthGoals) && loadedProfile.healthGoals.length > 0
                  ? loadedProfile.healthGoals
                  : prev.healthGoals || ["Balanced", "High Protein"]
            }));
          } else {
            setUserProfile((prev) => ({
              ...prev,
              uid: user.uid,
              displayName: user.displayName || prev.displayName,
              email: user.email || prev.email
            }));
          }
        } catch (err) {
          console.warn("Firestore data initialization warning:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Dark Mode Toggle Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const activeUid = currentUser?.uid || userProfile.uid;

  // 1. Add Leftover Action
  const handleSaveLeftover = async (newIngredient: Omit<LeftoverIngredient, "id" | "createdAt">) => {
    try {
      const savedItem = await addLeftoverToFirestore(activeUid, newIngredient);
      setLeftovers((prev) => [savedItem, ...prev]);
      showToast(`Added "${savedItem.name}" to your leftover pantry.`);
      setActiveTab("leftovers");
    } catch (err) {
      console.error("Error saving leftover:", err);
      // Fallback local save
      const fallbackItem: LeftoverIngredient = {
        ...newIngredient,
        id: `local-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      setLeftovers((prev) => [fallbackItem, ...prev]);
      showToast(`Added "${fallbackItem.name}" to kitchen pantry.`);
      setActiveTab("leftovers");
    }
  };

  // 1b. Batch Save Leftovers
  const handleSaveBatchLeftovers = async (
    items: Omit<LeftoverIngredient, "id" | "createdAt">[]
  ) => {
    try {
      const addedList: LeftoverIngredient[] = [];
      for (const item of items) {
        const saved = await addLeftoverToFirestore(activeUid, item);
        addedList.push(saved);
      }
      setLeftovers((prev) => [...addedList, ...prev]);
      showToast(`Added ${addedList.length} ingredients to your leftover pantry.`);
    } catch (err) {
      console.error("Error batch saving leftovers:", err);
      const fallbackList: LeftoverIngredient[] = items.map((item, idx) => ({
        ...item,
        id: `batch-${Date.now()}-${idx}`,
        createdAt: new Date().toISOString()
      }));
      setLeftovers((prev) => [...fallbackList, ...prev]);
      showToast(`Added ${fallbackList.length} ingredients to kitchen pantry.`);
    }
  };

  // 1c. Direct Analyze Leftover Queue
  const handleAnalyzeDirectly = async (
    items: Omit<LeftoverIngredient, "id" | "createdAt">[]
  ) => {
    await handleSaveBatchLeftovers(items);
    showToast(`Ingredients saved! Opening AI Chef for recipe generation...`);
    setActiveTab("chef");
  };

  // 2. Multimodal Scanner Batch Import
  const handleUseScannedIngredients = async (
    scannedItems: Omit<LeftoverIngredient, "id" | "createdAt">[]
  ) => {
    try {
      const addedList: LeftoverIngredient[] = [];
      for (const item of scannedItems) {
        const saved = await addLeftoverToFirestore(activeUid, item);
        addedList.push(saved);
      }
      setLeftovers((prev) => [...addedList, ...prev]);
      showToast(`Successfully added ${addedList.length} scanned ingredients! Launching AI Chef...`);
      setActiveTab("chef");
    } catch (err) {
      const fallbackList: LeftoverIngredient[] = scannedItems.map((item, idx) => ({
        ...item,
        id: `scan-${Date.now()}-${idx}`,
        createdAt: new Date().toISOString()
      }));
      setLeftovers((prev) => [...fallbackList, ...prev]);
      showToast(`Added ${fallbackList.length} ingredients to kitchen!`);
      setActiveTab("chef");
    }
  };

  const handleLoadSampleIngredients = async () => {
    try {
      const addedList: LeftoverIngredient[] = [];
      for (const item of SAMPLE_INGREDIENTS) {
        const saved = await addLeftoverToFirestore(activeUid, item);
        addedList.push(saved);
      }
      setLeftovers((prev) => [...addedList, ...prev]);
      showToast(`Loaded ${addedList.length} sample leftover ingredients!`);
    } catch (err) {
      const fallbackList: LeftoverIngredient[] = SAMPLE_INGREDIENTS.map((item, idx) => ({
        ...item,
        id: `sample-${Date.now()}-${idx}`,
        createdAt: new Date().toISOString()
      }));
      setLeftovers((prev) => [...fallbackList, ...prev]);
      showToast(`Loaded ${fallbackList.length} sample leftover ingredients!`);
    }
  };

  // 3. Update Leftover Status or Details
  const handleToggleStatus = async (id: string, currentStatus: "active" | "used") => {
    const nextStatus = currentStatus === "active" ? "used" : "active";
    try {
      await updateLeftoverInFirestore(activeUid, id, { status: nextStatus });
    } catch (err) {
      console.warn("Status update fallback local:", err);
    }
    setLeftovers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );
    showToast(
      nextStatus === "used"
        ? "Ingredient marked as rescued/used!"
        : "Ingredient restored to active pantry."
    );
  };

  const handleUpdateLeftover = async (id: string, updates: Partial<LeftoverIngredient>) => {
    try {
      await updateLeftoverInFirestore(activeUid, id, updates);
    } catch (err) {
      console.warn("Update fallback local:", err);
    }
    setLeftovers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    showToast("Ingredient details updated.");
  };

  const handleDeleteLeftover = async (id: string) => {
    try {
      await deleteLeftoverFromFirestore(activeUid, id);
    } catch (err) {
      console.warn("Delete fallback local:", err);
    }
    setLeftovers((prev) => prev.filter((item) => item.id !== id));
    showToast("Ingredient deleted from pantry.");
  };

  // 4. Generate Recipes with Gemini AI
  const handleGenerateRecipes = async (
    selectedIngredients: LeftoverIngredient[],
    preferences: ChefPreferences
  ) => {
    setIsGeneratingRecipes(true);
    try {
      const payload = {
        leftovers: selectedIngredients,
        cuisine: preferences.cuisine,
        diet: preferences.diet,
        allergies: userProfile.foodAllergies,
        cookingTime: preferences.cookingTime,
        difficulty: preferences.difficulty,
        healthGoal: preferences.healthGoal
      };

      const response = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to generate recipes from server.");
      }

      const data = await response.json();
      if (Array.isArray(data.recipes) && data.recipes.length > 0) {
        setGeneratedRecipes(data.recipes);

        // Save top recipe into history
        const topRecipe = data.recipes[0];
        const historyItem: Omit<RecipeHistoryItem, "id"> = {
          recipeId: topRecipe.id,
          recipeTitle: topRecipe.title,
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }),
          ingredientsUsed: topRecipe.leftoverIngredientsUsed,
          leftoverUtilizationScore: topRecipe.leftoverUtilizationScore,
          recipe: topRecipe,
          createdAt: new Date().toISOString()
        };

        const savedHistory = await saveRecipeHistory(activeUid, historyItem);
        setRecipeHistory((prev) => [savedHistory, ...prev]);

        showToast(`Gemini AI generated ${data.recipes.length} customized recipes!`);
      } else {
        throw new Error("No recipes returned from AI.");
      }
    } catch (err: any) {
      console.error("AI Recipe generation error:", err);
      showToast(
        err.message || "Gemini generation failed. Loaded fallback recipes.",
        "info"
      );
      // Graceful fallback with contextual sample recipes
      setGeneratedRecipes(SAMPLE_RECIPES);
    } finally {
      setIsGeneratingRecipes(false);
    }
  };

  // 5. Save / Unsave Recipe Action
  const handleToggleSaveRecipe = async (recipeOrId: Recipe | string) => {
    const recipeId = typeof recipeOrId === "string" ? recipeOrId : recipeOrId.id;
    const isAlreadySaved = savedRecipes.some((r) => r.id === recipeId);
    if (isAlreadySaved) {
      const existing = savedRecipes.find((r) => r.id === recipeId);
      try {
        await deleteSavedRecipeFromFirestore(activeUid, recipeId);
      } catch (err) {
        console.warn("Delete saved recipe fallback:", err);
      }
      setSavedRecipes((prev) => prev.filter((r) => r.id !== recipeId));
      showToast(
        existing ? `Removed "${existing.title}" from saved recipes.` : "Recipe removed from saved recipes.",
        "info"
      );
    } else {
      const fullRecipe =
        typeof recipeOrId === "string"
          ? generatedRecipes.find((r) => r.id === recipeId) || selectedRecipe
          : recipeOrId;
      if (!fullRecipe) return;
      try {
        await saveRecipeToFirestore(activeUid, fullRecipe);
      } catch (err) {
        console.warn("Save recipe fallback:", err);
      }
      setSavedRecipes((prev) => [fullRecipe, ...prev]);
      showToast(`Saved "${fullRecipe.title}" to your recipes!`);
    }
  };

  // 6. Cook Recipe & Track Waste Reduction (Section 14)
  const handleCookRecipe = async (recipe: Recipe) => {
    // 1. Mark leftover ingredients that match as used
    const usedNames = (recipe.leftoverIngredientsUsed || []).map((n) => n.toLowerCase());
    const updatedLeftovers = leftovers.map((item) => {
      if (usedNames.some((u) => item.name.toLowerCase().includes(u))) {
        // Mark as used in Firestore
        updateLeftoverInFirestore(activeUid, item.id, { status: "used" }).catch(() => {});
        return { ...item, status: "used" as const };
      }
      return item;
    });
    setLeftovers(updatedLeftovers);

    // 2. Update Food Waste Reduction Score
    const itemsRescued = recipe.leftoverIngredientsUsed?.length || 3;
    const additionalKg = Math.round(itemsRescued * 0.35 * 10) / 10;
    const additionalMoney = Math.round(itemsRescued * 2.8 * 10) / 10;
    const additionalCO2 = Math.round(additionalKg * 2.2 * 10) / 10;

    const newStats: WasteStats = {
      leftoversAdded: stats?.leftoversAdded ?? 14,
      recipesGenerated: stats?.recipesGenerated ?? 9,
      ingredientsSaved: (stats?.ingredientsSaved ?? 23) + itemsRescued,
      wasteReductionScore: Math.min(99, (stats?.wasteReductionScore ?? 84) + 2),
      wasteReducedKg: Math.round(((stats?.wasteReducedKg ?? 7.2) + additionalKg) * 10) / 10,
      moneySavedUSD: Math.round(((stats?.moneySavedUSD ?? 48.5) + additionalMoney) * 10) / 10,
      recipesCooked: (stats?.recipesCooked ?? 6) + 1,
      co2AvoidedKg: Math.round(((stats?.co2AvoidedKg ?? 15.8) + additionalCO2) * 10) / 10
    };

    setStats(newStats);
    await updateUserStatsInFirestore(activeUid, newStats).catch(() => {});

    showToast(
      `🎉 Cooked "${recipe.title}"! Rescued +${additionalKg} kg food and saved +$${additionalMoney}!`,
      "success"
    );
    setIsDetailModalOpen(false);
  };

  // 7. Profile Save Action
  const handleSaveProfile = async (updated: Partial<UserProfile>) => {
    const fullProfile: UserProfile = {
      ...userProfile,
      ...updated
    };
    setUserProfile(fullProfile);
    await saveUserProfile(activeUid, fullProfile);
    showToast("Profile and dietary preferences updated successfully.");
  };

  // 8. Sign Out
  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    showToast("Signed out successfully.", "info");
  };

  // 9. Instant Guest Fallback Handler
  const handleContinueAsGuest = () => {
    setUserProfile({
      uid: `guest-${Date.now()}`,
      displayName: "Guest Chef",
      email: "guest@leftoverchef.ai",
      cuisinePreferences: ["Italian", "Asian", "Mexican"],
      dietaryPreference: "None",
      foodAllergies: [],
      cookingSkill: "Intermediate",
      typicalCookingTime: "15–30 minutes",
      healthGoals: ["Balanced", "Eco-Friendly"]
    });
    showToast("Signed in as Guest Chef! You have full access to leftovers and recipes.", "success");
    setIsAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <TopNav
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || "login");
          setIsAuthModalOpen(true);
        }}
        onSignOut={handleSignOut}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onLoadDemo={handleLoadSampleIngredients}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Body with Sidebar and Viewport */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeLeftoversCount={leftovers.filter((i) => i.status === "active").length}
          savedCount={savedRecipes.length}
          wasteReducedKg={stats?.wasteReducedKg ?? 7.2}
          onOpenAddIngredient={() => setActiveTab("add_leftover")}
          onOpenScanner={() => setActiveTab("scanner")}
        />

        {/* Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 max-w-full overflow-x-hidden">
          {activeTab === "dashboard" && (
            <DashboardView
              stats={stats}
              leftovers={leftovers}
              setActiveTab={setActiveTab}
              onOpenAddIngredient={() => setActiveTab("add_leftover")}
              onOpenScanner={() => setActiveTab("scanner")}
              onLoadSampleIngredients={handleLoadSampleIngredients}
              onDeleteLeftover={handleDeleteLeftover}
              onToggleStatus={handleToggleStatus}
            />
          )}

          {activeTab === "add_leftover" && (
            <AddLeftoverView
              onSave={handleSaveLeftover}
              onSaveIngredients={handleSaveBatchLeftovers}
              onAnalyzeDirectly={handleAnalyzeDirectly}
              setActiveTab={setActiveTab}
              onOpenScanner={() => setActiveTab("scanner")}
            />
          )}

          {activeTab === "scanner" && (
            <ScannerView
              onUseIngredients={handleUseScannedIngredients}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "chef" && (
            <AiChefView
              leftovers={leftovers}
              userProfile={userProfile}
              generatedRecipes={generatedRecipes}
              onGenerateRecipes={handleGenerateRecipes}
              onSelectRecipe={(recipe) => {
                setSelectedRecipe(recipe);
                setIsDetailModalOpen(true);
              }}
              onToggleSaveRecipe={handleToggleSaveRecipe}
              isSaved={(id) => savedRecipes.some((r) => r.id === id)}
              isLoading={isGeneratingRecipes}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "leftovers" && (
            <LeftoversView
              leftovers={leftovers}
              onAddLeftover={() => setActiveTab("add_leftover")}
              onOpenScanner={() => setActiveTab("scanner")}
              onDeleteLeftover={handleDeleteLeftover}
              onToggleStatus={handleToggleStatus}
              onUpdateLeftover={handleUpdateLeftover}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "saved" && (
            <SavedRecipesView
              savedRecipes={savedRecipes}
              onSelectRecipe={(recipe) => {
                setSelectedRecipe(recipe);
                setIsDetailModalOpen(true);
              }}
              onDeleteSavedRecipe={handleToggleSaveRecipe}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "history" && (
            <HistoryView
              history={recipeHistory}
              onSelectRecipe={(recipe) => {
                setSelectedRecipe(recipe);
                setIsDetailModalOpen(true);
              }}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "profile" && (
            <ProfileView
              userProfile={userProfile}
              onSaveProfile={handleSaveProfile}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeCount={leftovers.filter((i) => i.status === "active").length}
      />

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        userProfile={userProfile}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onToggleSave={handleToggleSaveRecipe}
        isSaved={selectedRecipe ? savedRecipes.some((r) => r.id === selectedRecipe.id) : false}
        onCookRecipe={handleCookRecipe}
        onGenerateAnother={() => {
          setIsDetailModalOpen(false);
          setActiveTab("chef");
        }}
      />

      {/* Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={() => {
          showToast("Successfully signed in with Firebase!");
        }}
        onSuccess={() => {
          showToast("Successfully signed in with Firebase!");
        }}
        onContinueAsGuest={handleContinueAsGuest}
      />

      {/* Floating In-App Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-xs sm:text-sm font-semibold backdrop-blur-md ${
              toast.type === "success"
                ? "bg-emerald-600/95 text-white border-emerald-500 shadow-emerald-900/20"
                : toast.type === "error"
                ? "bg-rose-600/95 text-white border-rose-500 shadow-rose-900/20"
                : "bg-zinc-800/95 text-white border-zinc-700 shadow-zinc-900/20"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
