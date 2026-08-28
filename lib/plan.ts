import { recipes as allRecipes } from "./data/recipes";
import { matchesFilters, type DietFilters } from "./diet";
import type { Recipe, WeekMeal, WeekPlan } from "./types";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function getWeekStartDate(base: Date = new Date()): Date {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDinners(pool: Recipe[], count: number): Recipe[] {
  const chosen: Recipe[] = [];
  const remaining = shuffle(pool);
  for (const rec of remaining) {
    if (chosen.length >= count) break;
    if (!chosen.some((c) => c.id === rec.id)) chosen.push(rec);
  }
  return chosen;
}

function computeTotals(meals: WeekMeal[]): Pick<
  WeekPlan,
  "totalEstimatedCost" | "averageDailyCost" | "averagePrepTime" | "totalCalories"
> {
  const resolved = meals.map((m) => allRecipes.find((r) => r.id === m.recipeId)!);
  const totalEstimatedCost = resolved.reduce((s, r) => s + r.costPerServing * r.servings, 0);
  const averageDailyCost = resolved.reduce((s, r) => s + r.costPerServing, 0) / meals.length;
  const averagePrepTime = resolved.reduce((s, r) => s + r.prepTimeMinutes, 0) / meals.length;
  const totalCalories = resolved.reduce((s, r) => s + r.calories * r.servings, 0);
  return {
    totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
    averageDailyCost: Math.round(averageDailyCost * 100) / 100,
    averagePrepTime: Math.round(averagePrepTime),
    totalCalories,
  };
}

function hasActiveFilters(filters?: DietFilters): boolean {
  return !!filters && (filters.vegetarian || filters.vegan || filters.glutenFree || filters.dairyFree);
}

function matchingPool(filters?: DietFilters): Recipe[] {
  if (!hasActiveFilters(filters)) return allRecipes;
  return allRecipes.filter((r) => matchesFilters(r, filters!));
}

export function generatePlan(
  days = 7,
  base: Date = new Date(),
  filters?: DietFilters
): WeekPlan {
  const start = getWeekStartDate(base);

  let pool = matchingPool(filters).filter((r) => r.balanced || days < 7);

  if (pool.length < days) {
    pool = matchingPool(filters);
  }

  const dinners = pickDinners(pool, days);

  const meals: WeekMeal[] = dinners.map((recipe, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return {
      day: DAY_LABELS[i],
      date: formatDate(date),
      recipeId: recipe.id,
    };
  });

  const totals = computeTotals(meals);
  return {
    weekStartDate: formatDate(start),
    meals,
    ...totals,
  };
}

export function swapMeal(
  plan: WeekPlan,
  dayIndex: number,
  filters?: DietFilters
): WeekPlan {
  const meals = plan.meals;
  const current = meals[dayIndex];
  const currentRecipe = allRecipes.find((r) => r.id === current.recipeId)!;

  const pool = matchingPool(filters);

  const usedIds = new Set(meals.filter((_, i) => i !== dayIndex).map((m) => m.recipeId));
  const candidates = pool.filter((r) => !usedIds.has(r.id) && r.id !== currentRecipe.id);

  if (candidates.length === 0) return plan;

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  const updatedMeals: WeekMeal[] = meals.map((m, i) =>
    i === dayIndex ? { ...m, recipeId: chosen.id } : m
  );

  const totals = computeTotals(updatedMeals);
  return { ...plan, meals: updatedMeals, ...totals };
}
