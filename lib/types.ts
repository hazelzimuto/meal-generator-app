export type Category =
  | "veg"
  | "fruit"
  | "protein"
  | "dairy"
  | "pantry"
  | "herbs-spices"
  | "grains"
  | "other";

export type Unit = "g" | "kg" | "ml" | "l" | "tbsp" | "tsp" | "cup" | "clove" | "can" | "slice" | "unit" | "pinch";

export interface Ingredient {
  name: string;
  quantity: number;
  unit: Unit;
  category: Category;
}

export interface Recipe {
  id: string;
  name: string;
  costPerServing: number;
  prepTimeMinutes: number;
  calories: number;
  proteinGrams: number;
  servings: number;
  balanced: boolean;
  tags: string[];
  ingredients: Ingredient[];
  instructions: string[];
}

export interface WeekMeal {
  day: string;
  date: string;
  recipeId: string;
}

export interface ShoppingListItem {
  name: string;
  category: Category;
  quantity: number;
  unit: Unit;
  recipes: string[];
  display: string;
}

export interface ShoppingList {
  items: ShoppingListItem[];
  totalEstimatedCost: number;
}

export interface WeekPlan {
  weekStartDate: string;
  meals: WeekMeal[];
  totalEstimatedCost: number;
  averageDailyCost: number;
  averagePrepTime: number;
  totalCalories: number;
}
