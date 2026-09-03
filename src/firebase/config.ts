import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as fbSignOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "firebase/firestore";
import appConfig from "../../firebase-applet-config.json";
import {
  LeftoverIngredient,
  UserProfile,
  Recipe,
  RecipeHistoryItem,
  WasteStats
} from "../types";

// Firebase App Initialization
const firebaseConfig = {
  apiKey: appConfig.apiKey,
  authDomain: appConfig.authDomain,
  projectId: appConfig.projectId,
  storageBucket: appConfig.storageBucket,
  messagingSenderId: appConfig.messagingSenderId,
  appId: appConfig.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with named database if provided
export const db = appConfig.firestoreDatabaseId
  ? getFirestore(app, appConfig.firestoreDatabaseId)
  : getFirestore(app);

// Zero-Crash Payload Hygiene: strictly strip undefined values before Firestore writes
export function stripUndefined<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, value) => (value === undefined ? null : value))
  );
}

// ================= USER PROFILE =================
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, "users", uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<UserProfile>;
      return {
        uid,
        displayName: data.displayName || "Eco Chef",
        email: data.email || "",
        cuisinePreferences:
          Array.isArray(data.cuisinePreferences) && data.cuisinePreferences.length > 0
            ? data.cuisinePreferences
            : ["Indian", "Italian"],
        dietaryPreference: data.dietaryPreference || "Vegetarian",
        foodAllergies: Array.isArray(data.foodAllergies) ? data.foodAllergies : [],
        cookingSkill: data.cookingSkill || "Intermediate",
        typicalCookingTime: data.typicalCookingTime || "15–30 minutes",
        healthGoals:
          Array.isArray(data.healthGoals) && data.healthGoals.length > 0
            ? data.healthGoals
            : ["Balanced", "High Protein"],
        updatedAt: data.updatedAt
      };
    }
    return null;
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return null;
  }
}

export async function saveUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
  const userDocRef = doc(db, "users", uid);
  const cleanData = stripUndefined({
    ...profile,
    uid,
    updatedAt: new Date().toISOString()
  });
  await setDoc(userDocRef, cleanData, { merge: true });
}

// ================= LEFTOVER INGREDIENTS =================
export async function fetchUserLeftovers(uid: string): Promise<LeftoverIngredient[]> {
  try {
    const colRef = collection(db, "users", uid, "leftovers");
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const items: LeftoverIngredient[] = [];
    snap.forEach((d) => {
      items.push({ ...(d.data() as LeftoverIngredient), id: d.id });
    });
    return items;
  } catch (err) {
    console.error("Error fetching leftovers:", err);
    return [];
  }
}

export async function addOrUpdateLeftover(uid: string, item: LeftoverIngredient): Promise<void> {
  const docRef = doc(db, "users", uid, "leftovers", item.id);
  const cleanData = stripUndefined({
    ...item,
    updatedAt: new Date().toISOString()
  });
  await setDoc(docRef, cleanData, { merge: true });
}

export async function deleteLeftoverDoc(uid: string, id: string): Promise<void> {
  const docRef = doc(db, "users", uid, "leftovers", id);
  await deleteDoc(docRef);
}

export async function markLeftoverStatusDoc(uid: string, id: string, status: "active" | "used"): Promise<void> {
  const docRef = doc(db, "users", uid, "leftovers", id);
  await updateDoc(docRef, {
    status,
    updatedAt: new Date().toISOString()
  });
}

// ================= SAVED RECIPES =================
export async function fetchSavedRecipes(uid: string): Promise<Recipe[]> {
  try {
    const colRef = collection(db, "users", uid, "savedRecipes");
    const q = query(colRef, orderBy("savedAt", "desc"));
    const snap = await getDocs(q);
    const items: Recipe[] = [];
    snap.forEach((d) => {
      items.push({ ...(d.data() as Recipe), id: d.id });
    });
    return items;
  } catch (err) {
    console.error("Error fetching saved recipes:", err);
    return [];
  }
}

export async function saveRecipeDoc(uid: string, recipe: Recipe): Promise<void> {
  const docRef = doc(db, "users", uid, "savedRecipes", recipe.id);
  const cleanData = stripUndefined({
    ...recipe,
    savedAt: recipe.savedAt || new Date().toISOString()
  });
  await setDoc(docRef, cleanData, { merge: true });
}

export async function deleteSavedRecipeDoc(uid: string, id: string): Promise<void> {
  const docRef = doc(db, "users", uid, "savedRecipes", id);
  await deleteDoc(docRef);
}

// ================= RECIPE HISTORY =================
export async function fetchRecipeHistory(uid: string): Promise<RecipeHistoryItem[]> {
  try {
    const colRef = collection(db, "users", uid, "recipeHistory");
    const q = query(colRef, orderBy("createdAt", "desc"), limit(50));
    const snap = await getDocs(q);
    const items: RecipeHistoryItem[] = [];
    snap.forEach((d) => {
      items.push({ ...(d.data() as RecipeHistoryItem), id: d.id });
    });
    return items;
  } catch (err) {
    console.error("Error fetching recipe history:", err);
    return [];
  }
}

export async function addRecipeHistoryDoc(uid: string, item: RecipeHistoryItem): Promise<void> {
  const docRef = doc(db, "users", uid, "recipeHistory", item.id);
  const cleanData = stripUndefined(item);
  await setDoc(docRef, cleanData);
}

// ================= STATS =================
export const DEFAULT_USER_STATS: WasteStats = {
  leftoversAdded: 14,
  recipesGenerated: 9,
  ingredientsSaved: 23,
  wasteReductionScore: 84,
  wasteReducedKg: 7.2,
  moneySavedUSD: 48.5,
  recipesCooked: 6,
  co2AvoidedKg: 15.8
};

export async function fetchUserStats(uid: string): Promise<WasteStats> {
  try {
    const docRef = doc(db, "users", uid, "stats", "summary");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        leftoversAdded: typeof data?.leftoversAdded === "number" ? data.leftoversAdded : DEFAULT_USER_STATS.leftoversAdded,
        recipesGenerated: typeof data?.recipesGenerated === "number" ? data.recipesGenerated : DEFAULT_USER_STATS.recipesGenerated,
        ingredientsSaved: typeof data?.ingredientsSaved === "number" ? data.ingredientsSaved : DEFAULT_USER_STATS.ingredientsSaved,
        wasteReductionScore: typeof data?.wasteReductionScore === "number" ? data.wasteReductionScore : DEFAULT_USER_STATS.wasteReductionScore,
        wasteReducedKg: typeof data?.wasteReducedKg === "number" ? data.wasteReducedKg : DEFAULT_USER_STATS.wasteReducedKg,
        moneySavedUSD: typeof data?.moneySavedUSD === "number" ? data.moneySavedUSD : DEFAULT_USER_STATS.moneySavedUSD,
        recipesCooked: typeof data?.recipesCooked === "number" ? data.recipesCooked : DEFAULT_USER_STATS.recipesCooked,
        co2AvoidedKg: typeof data?.co2AvoidedKg === "number" ? data.co2AvoidedKg : DEFAULT_USER_STATS.co2AvoidedKg
      };
    }
  } catch (err) {
    console.error("Error fetching stats:", err);
  }
  return { ...DEFAULT_USER_STATS };
}

export async function updateUserStatsDoc(uid: string, updates: Partial<WasteStats>): Promise<void> {
  try {
    const docRef = doc(db, "users", uid, "stats", "summary");
    const cleanData = stripUndefined({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleanData, { merge: true });
  } catch (err) {
    console.error("Error updating stats:", err);
  }
}

// Friendly functional wrappers for App.tsx
export async function addLeftoverToFirestore(
  uid: string,
  item: Omit<LeftoverIngredient, "id" | "createdAt">
): Promise<LeftoverIngredient> {
  const newId = `leftover-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const fullItem: LeftoverIngredient = {
    ...item,
    id: newId,
    createdAt: new Date().toISOString()
  };
  await addOrUpdateLeftover(uid, fullItem);
  return fullItem;
}

export async function updateLeftoverInFirestore(
  uid: string,
  id: string,
  updates: Partial<LeftoverIngredient>
): Promise<void> {
  const docRef = doc(db, "users", uid, "leftovers", id);
  const cleanData = stripUndefined({
    ...updates,
    updatedAt: new Date().toISOString()
  });
  await updateDoc(docRef, cleanData);
}

export const deleteLeftoverFromFirestore = deleteLeftoverDoc;
export const updateUserStatsInFirestore = updateUserStatsDoc;
export const saveRecipeToFirestore = saveRecipeDoc;
export const deleteSavedRecipeFromFirestore = deleteSavedRecipeDoc;

export async function saveRecipeHistory(
  uid: string,
  item: Omit<RecipeHistoryItem, "id" | "createdAt">
): Promise<RecipeHistoryItem> {
  const newId = `history-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const fullHistory: RecipeHistoryItem = {
    ...item,
    id: newId,
    createdAt: new Date().toISOString()
  };
  await addRecipeHistoryDoc(uid, fullHistory);
  return fullHistory;
}

export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  fbSignOut,
  onAuthStateChanged,
  type User
};
