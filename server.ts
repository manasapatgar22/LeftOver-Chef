import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Top-level Request Deserialization (Ordering Guarantee)
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// Initialize Gemini SDK lazily or safely
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new GoogleGenAI({ apiKey });
}

// Resilient Model Fallback Ladder
const MODEL_FALLBACK_LADDER = [
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.7-flash"
];

async function generateWithModelFallback(
  fn: (ai: GoogleGenAI, model: string) => Promise<any>
): Promise<any> {
  const ai = getGeminiClient();
  let lastError: any = null;

  for (const modelName of MODEL_FALLBACK_LADDER) {
    try {
      return await fn(ai, modelName);
    } catch (err: any) {
      console.warn(`[Gemini Fallback] Model ${modelName} failed:`, err?.message || err);
      lastError = err;
      // Recoverable error conditions: 404, 429, 500, 503, RESOURCE_EXHAUSTED, UNAVAILABLE
      const status = err?.status || err?.statusCode;
      const msg = (err?.message || "").toLowerCase();
      const isRecoverable =
        status === 404 ||
        status === 429 ||
        status === 500 ||
        status === 503 ||
        msg.includes("resource_exhausted") ||
        msg.includes("unavailable") ||
        msg.includes("overloaded") ||
        msg.includes("not found");

      if (!isRecoverable && MODEL_FALLBACK_LADDER.indexOf(modelName) === MODEL_FALLBACK_LADDER.length - 1) {
        break;
      }
    }
  }

  throw lastError || new Error("All Gemini models in fallback ladder failed.");
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Recipe Generation Endpoint
app.post("/api/recipes/generate", async (req, res) => {
  try {
    const body = (req.body && typeof req.body === "object") ? req.body : {};
    const rawIngredients = Array.isArray(body.ingredients) ? body.ingredients : [];
    const preferences = (body.preferences && typeof body.preferences === "object") ? body.preferences : {};

    if (rawIngredients.length === 0) {
      return res.status(400).json({
        error: "At least one leftover ingredient is required to generate recipes."
      });
    }

    // Sanitize input ingredients (prevent prompt injection, truncate strings)
    const sanitizedIngredients = rawIngredients.map((item: any) => ({
      name: String(item.name || "").trim().slice(0, 80),
      quantity: String(item.quantity || "some").trim().slice(0, 40),
      unit: String(item.unit || "").trim().slice(0, 20),
      priority: item.priority === "use_first" ? "use_first" : (item.priority === "soon" ? "soon" : "normal")
    })).filter(i => i.name.length > 0);

    if (sanitizedIngredients.length === 0) {
      return res.status(400).json({
        error: "No valid ingredients provided."
      });
    }

    const cuisine = String(preferences.cuisine || "Any").slice(0, 40);
    const diet = String(preferences.diet || "Any").slice(0, 40);
    const cookingTime = String(preferences.cookingTime || "Any").slice(0, 40);
    const difficulty = String(preferences.difficulty || "Any").slice(0, 40);
    const healthGoal = String(preferences.healthGoal || "Balanced").slice(0, 40);
    const allergies = Array.isArray(preferences.allergies)
      ? preferences.allergies.map((a: any) => String(a).slice(0, 40)).filter(Boolean)
      : [];

    const systemPrompt = `You are "Chef AI" inside Leftover Chef, an expert culinary assistant dedicated to reducing household food waste.
Your mission is to formulate creative, practical, and highly appetizing recipes designed primarily around the user's leftover ingredients.

CRITICAL DIRECTIVES:
1. LEFTOVERS ARE PRIMARY: The user's leftover ingredients must be the foundation of each recipe. Maximize the proportion of user leftovers used.
2. MINIMIZE PANTRY ADDITIONS: Only require common household basics (like salt, pepper, basic cooking oil, water, or simple pantry spices) if necessary. Do NOT require exotic or expensive new grocery items.
3. ALLERGIES & DIET: Strictly respect user allergies: ${allergies.length > 0 ? allergies.join(", ") : "None reported"}. Flag any potential allergen or substitute.
4. CALCULATION: For each recipe, accurately determine "leftoverIngredientsUsed" (matching the user's provided list) and calculate "leftoverUtilizationScore" as percentage of total leftovers used (e.g. 5 out of 6 is 83%).
5. OUTPUT: Output 3 distinct, delicious recipe options formatted strictly as JSON matching the schema.`;

    const userContentPrompt = `Here is the user's inventory of leftover kitchen ingredients:
${sanitizedIngredients.map((ing, idx) => `${idx + 1}. ${ing.name} (Quantity: ${ing.quantity} ${ing.unit}${ing.priority === "use_first" ? " - PRIORITY: USE FIRST (urgent)" : ""})`).join("\n")}

User Preferences:
- Cuisine: ${cuisine}
- Dietary Preference: ${diet}
- Target Cooking Time: ${cookingTime}
- Desired Difficulty: ${difficulty}
- Health / Nutritional Goal: ${healthGoal}
- Allergies to Avoid: ${allergies.length > 0 ? allergies.join(", ") : "None"}

Please generate 3 to 4 practical, flavorful recipes that prioritize rescuing these leftovers.
Return strictly valid JSON without markdown wrapping or code fences. Format as a JSON array of recipe objects.

JSON schema per recipe:
{
  "id": "unique-recipe-string",
  "title": "Recipe Title",
  "description": "Appetizing 1-2 sentence description explaining how it rescues the food",
  "cuisine": "Cuisine type",
  "difficulty": "Easy" | "Medium" | "Advanced",
  "prepTime": "e.g. 10 mins",
  "cookTime": "e.g. 15 mins",
  "servings": 2,
  "leftoverIngredientsUsed": ["Name of leftover 1", "Name of leftover 2"],
  "additionalIngredients": ["Pantry salt", "1 tbsp olive oil", "1/2 tsp cumin"],
  "instructions": [
    "Step 1 instruction...",
    "Step 2 instruction..."
  ],
  "calories": 420,
  "protein": "18g",
  "carbohydrates": "54g",
  "fat": "14g",
  "fiber": "6g",
  "allergyWarnings": ["None" or warning string],
  "dietaryCompatibility": ["Vegetarian", "Gluten-Free"],
  "leftoverUtilizationScore": 85,
  "wasteReductionExplanation": "Rescues cooked rice and ripe tomatoes before spoilage, repurposing them into a savory skillet."
}`;

    const rawResponse = await generateWithModelFallback(async (ai, model) => {
      const response = await ai.models.generateContent({
        model,
        contents: [
          { role: "user", parts: [{ text: systemPrompt + "\n\n" + userContentPrompt }] }
        ],
        config: {
          temperature: 0.7,
          responseMimeType: "application/json",
        }
      });
      return response.text;
    });

    if (!rawResponse) {
      throw new Error("Empty response returned by AI model.");
    }

    // Clean any accidental markdown backticks
    let cleanedText = rawResponse.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(cleanedText);
    const recipes = Array.isArray(parsed) ? parsed : (parsed.recipes || [parsed]);

    // Ensure IDs and calculated properties
    const formattedRecipes = recipes.map((r: any, idx: number) => {
      const leftoversUsed = Array.isArray(r.leftoverIngredientsUsed) ? r.leftoverIngredientsUsed : [];
      const totalLeftovers = sanitizedIngredients.length;
      const computedScore = totalLeftovers > 0
        ? Math.min(100, Math.max(10, Math.round((leftoversUsed.length / totalLeftovers) * 100)))
        : (r.leftoverUtilizationScore || 75);

      return {
        id: r.id || `recipe-${Date.now()}-${idx + 1}`,
        title: r.title || `Leftover Creation #${idx + 1}`,
        description: r.description || "A quick, nourishing recipe using your kitchen leftovers.",
        cuisine: r.cuisine || cuisine || "Homestyle",
        difficulty: (["Easy", "Medium", "Advanced"].includes(r.difficulty)) ? r.difficulty : "Easy",
        prepTime: r.prepTime || "10 mins",
        cookTime: r.cookTime || "15 mins",
        servings: Number(r.servings) || 2,
        leftoverIngredientsUsed: leftoversUsed,
        additionalIngredients: Array.isArray(r.additionalIngredients) ? r.additionalIngredients : ["Salt", "Oil", "Spices"],
        instructions: Array.isArray(r.instructions) && r.instructions.length > 0 ? r.instructions : ["Combine leftovers in a heated pan and season to taste."],
        calories: Number(r.calories) || 380,
        protein: String(r.protein || "15g"),
        carbohydrates: String(r.carbohydrates || "45g"),
        fat: String(r.fat || "12g"),
        fiber: String(r.fiber || "5g"),
        allergyWarnings: Array.isArray(r.allergyWarnings) ? r.allergyWarnings : [],
        dietaryCompatibility: Array.isArray(r.dietaryCompatibility) ? r.dietaryCompatibility : [diet !== "Any" ? diet : "General"],
        leftoverUtilizationScore: r.leftoverUtilizationScore || computedScore,
        wasteReductionExplanation: r.wasteReductionExplanation || `Successfully integrates ${leftoversUsed.length} leftover items, preventing premature kitchen waste.`
      };
    });

    return res.json({
      recipes: formattedRecipes,
      totalLeftoversCount: sanitizedIngredients.length
    });
  } catch (error: any) {
    console.error("[Generate Recipes Error]:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate recipes with AI. Please check your ingredients and try again."
    });
  }
});

// Multimodal Food / Ingredient Scanner Endpoint
app.post("/api/ingredients/scan", async (req, res) => {
  try {
    const body = (req.body && typeof req.body === "object") ? req.body : {};
    let imageBase64 = String(body.imageBase64 || "").trim();
    let mimeType = String(body.mimeType || "image/jpeg").trim();

    if (!imageBase64) {
      return res.status(400).json({ error: "No image data provided for scanning." });
    }

    // If data URL prefix is present, strip it
    if (imageBase64.includes(";base64,")) {
      const parts = imageBase64.split(";base64,");
      const mimeMatch = parts[0].match(/data:(.*?)$/);
      if (mimeMatch && mimeMatch[1]) {
        mimeType = mimeMatch[1];
      }
      imageBase64 = parts[1];
    }

    const scanPrompt = `You are a culinary vision expert for Leftover Chef.
Analyze this food/kitchen image carefully. Identify all visible food items, produce, leftovers, vegetables, fruits, dairy, grains, proteins, or packaged ingredients that a user can cook with.

For each item detected:
- "name": Clean common ingredient name (e.g., "Tomato", "Carrot", "Cooked Rice", "Bell Pepper", "Paneer", "Eggs", "Broccoli")
- "quantity": Estimated visible amount or sensible count (e.g., "3", "1 cup", "200 g", "1 bunch")
- "unit": Appropriate unit (e.g., "pieces", "cups", "g", "kg", "bunch", "cloves")
- "priority": Suggest "use_first" if it appears ripe, wilting, cooked, or perishable; "soon" if moderately perishable; "normal" if sturdy/shelf-stable
- "category": e.g. "Vegetable", "Dairy", "Grain", "Protein", "Condiment", "Fruit"
- "confidence": confidence score between 0.70 and 0.99

Return strictly a JSON array of detected ingredients without markdown backticks.`;

    const rawResponse = await generateWithModelFallback(async (ai, model) => {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              { text: scanPrompt },
              {
                inlineData: {
                  mimeType: mimeType || "image/jpeg",
                  data: imageBase64
                }
              }
            ]
          }
        ],
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
        }
      });
      return response.text;
    });

    if (!rawResponse) {
      throw new Error("No response from AI vision analysis.");
    }

    let cleanedText = rawResponse.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(cleanedText);
    const items = Array.isArray(parsed) ? parsed : (parsed.ingredients || [parsed]);

    const sanitizedItems = items.map((item: any, idx: number) => ({
      id: `detected-${Date.now()}-${idx + 1}`,
      name: String(item.name || "Ingredient").trim().slice(0, 50),
      quantity: String(item.quantity || "1").trim().slice(0, 20),
      unit: String(item.unit || "item").trim().slice(0, 20),
      priority: ["use_first", "soon", "normal"].includes(item.priority) ? item.priority : "normal",
      category: String(item.category || "Produce").trim().slice(0, 30),
      confidence: typeof item.confidence === "number" ? Math.round(item.confidence * 100) : 90
    })).filter((item: any) => item.name.length > 0);

    return res.json({
      detectedIngredients: sanitizedItems,
      detectedCount: sanitizedItems.length
    });
  } catch (error: any) {
    console.error("[Food Scan Error]:", error);
    return res.status(500).json({
      error: error?.message || "Failed to scan ingredients from image. Please enter ingredients manually or try another image."
    });
  }
});

// Vite middleware & SPA serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Leftover Chef] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
