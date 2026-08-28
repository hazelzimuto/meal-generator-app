import type { Recipe, ShoppingList, ShoppingListItem, Unit, WeekPlan } from "./types";
import { getRecipe } from "./recipes";

export function shoppingListForPlan(plan: WeekPlan): ShoppingList {
  return buildShoppingList(
    plan.meals.map((meal) => ({ recipe: getRecipe(meal.recipeId) }))
  );
}

const unitConversions: Partial<Record<Unit, { base: Unit; factor: number }>> = {
  g: { base: "g", factor: 1 },
  kg: { base: "g", factor: 1000 },
  ml: { base: "ml", factor: 1 },
  l: { base: "ml", factor: 1000 },
  tbsp: { base: "tbsp", factor: 1 },
  tsp: { base: "tbsp", factor: 1 / 3 },
  cup: { base: "ml", factor: 250 },
  clove: { base: "clove", factor: 1 },
  can: { base: "can", factor: 1 },
  slice: { base: "slice", factor: 1 },
  unit: { base: "unit", factor: 1 },
  pinch: { base: "pinch", factor: 1 },
};

function normalizeQuantity(quantity: number, unit: Unit): { value: number; unit: Unit } {
  const conv = unitConversions[unit];
  if (!conv) return { value: quantity, unit };
  return { value: quantity * conv.factor, unit: conv.base };
}

function formatQuantity(value: number, unit: Unit): string {
  const wholeUnits = ["can", "clove", "unit", "slice", "pinch"];
  const rounded = wholeUnits.includes(unit) ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${unit}`;
}

function sortByCategory(items: ShoppingListItem[]): ShoppingListItem[] {
  const order: Record<string, number> = {
    veg: 0,
    fruit: 1,
    protein: 2,
    dairy: 3,
    grains: 4,
    pantry: 5,
    "herbs-spices": 6,
    other: 7,
  };
  return items.sort((a, b) => order[a.category] - order[b.category]);
}

export function buildShoppingList(meals: { recipe: Recipe }[]): ShoppingList {
  const bucket = new Map<string, Omit<ShoppingListItem, "display">>();
  let totalEstimatedCost = 0;

  for (const { recipe } of meals) {
    totalEstimatedCost += recipe.costPerServing * recipe.servings;
    for (const ing of recipe.ingredients) {
      const key = ing.name.toLowerCase();
      const existing = bucket.get(key);
      if (existing) {
        existing.quantity += ing.quantity;
        existing.recipes = [...new Set([...existing.recipes, recipe.name])];
      } else {
        bucket.set(key, {
          name: ing.name,
          category: ing.category,
          quantity: ing.quantity,
          unit: ing.unit,
          recipes: [recipe.name],
        });
      }
    }
  }

  const items = sortByCategory(
    [...bucket.values()].map((item) => {
      const normalized = normalizeQuantity(item.quantity, item.unit);
      return {
        name: item.name,
        category: item.category,
        quantity: normalized.value,
        unit: normalized.unit,
        recipes: item.recipes,
        display: formatQuantity(normalized.value, normalized.unit),
      };
    })
  );

  return { items, totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100 };
}
