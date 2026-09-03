import { LeftoverIngredient, UserProfile } from "./types";

export const SAMPLE_INGREDIENTS: Omit<LeftoverIngredient, "id" | "createdAt">[] = [
  {
    name: "Cooked Rice",
    quantity: "2",
    unit: "cups",
    priority: "use_first",
    status: "active",
    category: "Grain",
    expiryDate: "Today"
  },
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
    name: "Onion",
    quantity: "2",
    unit: "pieces",
    priority: "normal",
    status: "active",
    category: "Produce",
    expiryDate: "5 days"
  },
  {
    name: "Carrot",
    quantity: "2",
    unit: "pieces",
    priority: "soon",
    status: "active",
    category: "Produce",
    expiryDate: "2 days"
  },
  {
    name: "Capsicum",
    quantity: "1",
    unit: "piece",
    priority: "soon",
    status: "active",
    category: "Produce",
    expiryDate: "2 days"
  },
  {
    name: "Paneer",
    quantity: "200",
    unit: "g",
    priority: "use_first",
    status: "active",
    category: "Dairy",
    expiryDate: "Today"
  }
];

export const CUISINES = [
  "Any",
  "Indian",
  "Italian",
  "Chinese",
  "Japanese",
  "Mexican",
  "Mediterranean",
  "American",
  "Thai"
];

export const DIETARY_OPTIONS = [
  "Any",
  "Vegetarian",
  "Vegan",
  "Eggetarian",
  "Non-Vegetarian",
  "Jain",
  "Gluten-Free",
  "Keto"
];

export const COOKING_TIMES = [
  "Under 15 minutes",
  "15–30 minutes",
  "30–60 minutes",
  "Any"
];

export const DIFFICULTY_LEVELS = [
  "Any",
  "Easy",
  "Medium",
  "Advanced"
];

export const HEALTH_GOALS = [
  "Balanced",
  "High Protein",
  "Low Calorie",
  "Low Sodium",
  "Comfort Food",
  "No Preference"
];

export const COMMON_ALLERGIES = [
  "Peanuts",
  "Dairy",
  "Gluten / Wheat",
  "Shellfish",
  "Soy",
  "Eggs",
  "Tree Nuts",
  "Fish",
  "Sesame",
  "Mustard"
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  uid: "",
  displayName: "Eco Chef",
  email: "demo@leftoverchef.ai",
  cuisinePreferences: ["Indian", "Italian"],
  dietaryPreference: "Vegetarian",
  foodAllergies: [],
  cookingSkill: "Intermediate",
  typicalCookingTime: "15–30 minutes",
  healthGoals: ["Balanced", "High Protein"]
};

export const INITIAL_MOCK_LEFTOVERS: LeftoverIngredient[] = [
  {
    id: "init-1",
    name: "Cooked Rice",
    quantity: "2",
    unit: "cups",
    priority: "use_first",
    status: "active",
    category: "Grain",
    expiryDate: "Today",
    createdAt: new Date().toISOString()
  },
  {
    id: "init-2",
    name: "Tomato",
    quantity: "3",
    unit: "pieces",
    priority: "use_first",
    status: "active",
    category: "Produce",
    expiryDate: "1 day",
    createdAt: new Date().toISOString()
  },
  {
    id: "init-3",
    name: "Onion",
    quantity: "2",
    unit: "pieces",
    priority: "normal",
    status: "active",
    category: "Produce",
    expiryDate: "5 days",
    createdAt: new Date().toISOString()
  },
  {
    id: "init-4",
    name: "Carrot",
    quantity: "2",
    unit: "pieces",
    priority: "soon",
    status: "active",
    category: "Produce",
    expiryDate: "2 days",
    createdAt: new Date().toISOString()
  },
  {
    id: "init-5",
    name: "Paneer",
    quantity: "200",
    unit: "g",
    priority: "use_first",
    status: "active",
    category: "Dairy",
    expiryDate: "Today",
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_MOCK_STATS = {
  leftoversAdded: 14,
  recipesGenerated: 9,
  ingredientsSaved: 23,
  wasteReductionScore: 84,
  wasteReducedKg: 7.2,
  moneySavedUSD: 48.5,
  recipesCooked: 6,
  co2AvoidedKg: 15.8
};

export const SAMPLE_RECIPES = [
  {
    id: "sample-rec-1",
    title: "Golden Leftover Rice & Vegetable Pulao",
    description: "A fragrant, comforting one-pan spiced rice dish that repurposes day-old cooked rice with crispy sautéed carrots, onions, and succulent pan-seared paneer cubes.",
    cuisine: "Indian",
    difficulty: "Easy" as const,
    prepTime: "10 mins",
    cookTime: "15 mins",
    servings: 2,
    leftoverIngredientsUsed: ["Cooked Rice", "Carrot", "Onion", "Paneer"],
    additionalIngredients: ["Cumin seeds", "Turmeric powder", "Ghee or oil", "Salt to taste"],
    instructions: [
      "Heat 1 tablespoon of oil or ghee in a wide skillet over medium heat.",
      "Add cumin seeds and let them sizzle. Add finely chopped onions and sauté until translucent.",
      "Add diced carrots and cook for 3-4 minutes until slightly tender.",
      "Add cubed paneer and a pinch of turmeric and salt; gently toss for 2 minutes.",
      "Gently fold in the cooked leftover rice, breaking up clumps with a wooden spatula.",
      "Cover and steam on low heat for 3 minutes until steaming hot. Serve with fresh lemon juice."
    ],
    calories: 420,
    protein: "14g",
    carbohydrates: "58g",
    fat: "12g",
    fiber: "4g",
    allergyWarnings: ["Contains Dairy (Paneer)"],
    dietaryCompatibility: ["Vegetarian", "Gluten-Free"],
    leftoverUtilizationScore: 92,
    wasteReductionExplanation: "Uses 4 leftover items (Rice, Carrot, Onion, Paneer) avoiding kitchen spoilage and preventing 0.8kg of food waste."
  },
  {
    id: "sample-rec-2",
    title: "Rustic Tomato-Basil Skillet Risotto Style",
    description: "Rich pan-simmered rice in sweet blistered tomato puree, caramelized onions, and savory herbs.",
    cuisine: "Italian",
    difficulty: "Easy" as const,
    prepTime: "5 mins",
    cookTime: "12 mins",
    servings: 2,
    leftoverIngredientsUsed: ["Cooked Rice", "Tomato", "Onion"],
    additionalIngredients: ["Olive oil", "Garlic", "Dried oregano", "Black pepper", "Salt"],
    instructions: [
      "Dice tomatoes and sauté with minced garlic and chopped onion in olive oil.",
      "Simmer until tomatoes soften into a glossy, rich sauce (approx 5-6 minutes).",
      "Stir in leftover cooked rice and a splash of warm water.",
      "Simmer for 4 minutes until rice absorbs the tomato juices and turns creamy.",
      "Season with oregano, freshly cracked black pepper, and serve hot."
    ],
    calories: 380,
    protein: "7g",
    carbohydrates: "62g",
    fat: "8g",
    fiber: "5g",
    allergyWarnings: [],
    dietaryCompatibility: ["Vegetarian", "Vegan", "Gluten-Free"],
    leftoverUtilizationScore: 88,
    wasteReductionExplanation: "Rescues ripe tomatoes and day-old rice before shelf life ends."
  }
];
