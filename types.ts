export type DietType = 'omnivorous' | 'vegetarian' | 'vegan' | 'pescatarian' | 'flexitarian';

export interface UserProfile {
  name: string;
  householdSize: number;
  hasChildren: boolean;
  dietType: DietType;
  goals: string[];
  allergies: string[];
  cookingTime: 'low' | 'medium' | 'high';
  budget: 'budget' | 'standard' | 'premium';
  isOnboarded: boolean;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: string;
  checked?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  image: string;
  prepTime: number; // minutes
  calories?: number;
  tags: string[];
  ingredients: Ingredient[];
  category: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface MealSlot {
  date: string; // ISO date string YYYY-MM-DD
  type: MealType;
  recipeId?: string;
  notes?: string;
}

export interface WeeklyPlan {
  id: string;
  weekStartDate: string;
  slots: MealSlot[];
}

export interface ShoppingList {
  id: string;
  items: Ingredient[];
}
