import type { Recipe } from "./types";

export type DietKey = "vegetarian" | "vegan" | "glutenFree" | "dairyFree";

export type DietFilters = Record<DietKey, boolean>;

export const DIET_KEYS: DietKey[] = ["vegetarian", "vegan", "glutenFree", "dairyFree"];

const MEAT_FISH_KEYWORDS = [
  "chicken",
  "beef",
  "turkey",
  "pork",
  "mince",
  "salmon",
  "tuna",
  "fish",
];

const DAIRY_KEYWORDS = [
  "cheese",
  "cheddar",
  "mozzarella",
  "parmesan",
  "ricotta",
  "feta",
  "yogurt",
  "butter",
  "milk",
  "creme",
  "cream",
];

const GLUTEN_KEYWORDS = [
  "pasta",
  "spaghetti",
  "penne",
  "conchiglie",
  "shells",
  "gnocchi",
  "wraps",
  "wrap",
  "tortilla",
  "noodles",
  "bread",
  "buns",
  "taco shells",
  "couscous",
  "flour",
];

function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k));
}

function isDairyIngredient(name: string, category: string): boolean {
  if (category === "dairy") return true;
  const lower = name.toLowerCase();
  if (lower.includes("coconut")) return false;
  return containsAny(lower, DAIRY_KEYWORDS);
}

export function dietFor(recipe: Recipe): DietFlags {
  const ingredients = recipe.ingredients;

  const hasMeatOrFish = ingredients.some((ing) =>
    containsAny(ing.name.toLowerCase(), MEAT_FISH_KEYWORDS)
  );
  const hasDairy = ingredients.some((ing) =>
    isDairyIngredient(ing.name, ing.category)
  );
  const hasEggs = ingredients.some((ing) => ing.name.toLowerCase().includes("egg"));
  const hasGluten = ingredients.some((ing) =>
    containsAny(ing.name.toLowerCase(), GLUTEN_KEYWORDS)
  );

  const vegetarian = !hasMeatOrFish;
  const vegan = vegetarian && !hasDairy && !hasEggs;
  const glutenFree = !hasGluten;
  const dairyFree = !hasDairy;

  return { vegetarian, vegan, glutenFree, dairyFree };
}

export interface DietFlags {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
}

export function matchesFilters(recipe: Recipe, filters: DietFilters): boolean {
  const diet = dietFor(recipe);
  if (filters.vegetarian && !diet.vegetarian) return false;
  if (filters.vegan && !diet.vegan) return false;
  if (filters.glutenFree && !diet.glutenFree) return false;
  if (filters.dairyFree && !diet.dairyFree) return false;
  return true;
}
