import { recipes } from "./data/recipes";
import type { Recipe } from "./types";

const byId = new Map(recipes.map((r) => [r.id, r]));

export function getRecipe(id: string): Recipe {
  const recipe = byId.get(id);
  if (!recipe) throw new Error(`Unknown recipe id: ${id}`);
  return recipe;
}

export function allRecipes(): Recipe[] {
  return recipes;
}
