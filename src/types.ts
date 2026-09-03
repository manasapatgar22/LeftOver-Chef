export type PriorityLevel = 'use_first' | 'soon' | 'normal';
export type IngredientStatus = 'active' | 'used';
export type RecipeDifficulty = 'Easy' | 'Medium' | 'Advanced';

export interface LeftoverIngredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  priority: PriorityLevel;
  expiryDate?: string;
  status: IngredientStatus;
  category?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  cuisinePreferences: string[];
  dietaryPreference: string;
  foodAllergies: string[];
  cookingSkill: string;
  typicalCookingTime: string;
  healthGoals: string[];
  updatedAt?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  difficulty: RecipeDifficulty;
  prepTime: string;
  cookTime: string;
  servings: number;
  leftoverIngredientsUsed: string[];
  additionalIngredients: string[];
  instructions: string[];
  calories: number;
  protein: string;
  carbohydrates: string;
  fat: string;
  fiber: string;
  allergyWarnings: string[];
  dietaryCompatibility: string[];
  leftoverUtilizationScore: number;
  wasteReductionExplanation: string;
  savedAt?: string;
}

export interface RecipeHistoryItem {
  id: string;
  recipeId?: string;
  recipeTitle: string;
  date: string;
  ingredientsUsed: string[];
  recipe: Recipe;
  leftoverUtilizationScore: number;
  createdAt: string;
}

export interface WasteStats {
  leftoversAdded: number;
  recipesGenerated: number;
  ingredientsSaved: number;
  wasteReductionScore: number;
  wasteReducedKg: number;
  moneySavedUSD: number;
  recipesCooked: number;
  co2AvoidedKg: number;
  updatedAt?: string;
}

export interface ChefPreferences {
  cuisine: string;
  diet: string;
  cookingTime: string;
  difficulty: string;
  healthGoal: string;
}

export interface DetectedFoodItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  priority: PriorityLevel;
  category: string;
  confidence: number;
}

export type ActiveTab =
  | 'dashboard'
  | 'leftovers'
  | 'chef'
  | 'saved'
  | 'history'
  | 'profile'
  | 'scanner'
  | 'add_leftover';
