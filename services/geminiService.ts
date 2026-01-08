import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Recipe } from "../types";

// Initialize Gemini Client
// In a real production app, this key should be handled via a proxy or backend.
// Here we assume it's injected via build process or environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestRecipes = async (
  profile: UserProfile, 
  context: string = ''
): Promise<Recipe[]> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key provided for Gemini.");
    return [];
  }

  const model = 'gemini-3-flash-preview';

  const prompt = `
    You are an expert meal planner. Based on the following user profile, suggest 3 distinct recipes.
    
    User Profile:
    - Diet: ${profile.dietType}
    - Household Size: ${profile.householdSize}
    - Allergies: ${profile.allergies.join(', ')}
    - Goals: ${profile.goals.join(', ')}
    - Cooking Time Preference: ${profile.cookingTime}
    
    Context: ${context}
    
    Return a list of 3 recipes.
    For the image URL, use a placeholder like "https://picsum.photos/400/300?random=1".
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              image: { type: Type.STRING },
              prepTime: { type: Type.NUMBER },
              calories: { type: Type.NUMBER },
              category: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    unit: { type: Type.STRING },
                    category: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const recipes = JSON.parse(text) as Recipe[];
    // Add unique IDs if missing or random ones
    return recipes.map((r, idx) => ({
      ...r,
      id: r.id || `ai-${Date.now()}-${idx}`,
      image: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`
    }));

  } catch (error) {
    console.error("Error generating recipes:", error);
    return [];
  }
};