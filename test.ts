import { recipes } from "./lib/data/recipes";
import { generatePlan, getWeekStartDate, swapMeal } from "./lib/plan";
import { shoppingListForPlan } from "./lib/shopping";
import { dietFor, type DietFilters } from "./lib/diet";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("ok:", msg);
  }
}

console.log(`Recipe count: ${recipes.length}`);
const pool = recipes.filter((r) => r.balanced);
assert(pool.length >= 7, "at least 7 balanced recipes available");

// --- Core flow: generate / view / swap / shopping list ---
for (let run = 0; run < 3; run++) {
  const plan = generatePlan(7, getWeekStartDate());
  assert(plan.meals.length === 7, `run ${run}: plan has 7 meals`);
  const ids = plan.meals.map((m) => m.recipeId);
  assert(new Set(ids).size === 7, `run ${run}: no duplicate meals`);
  plan.meals.forEach((m) => assert(Boolean(recipes.find((x) => x.id === m.recipeId)), `run ${run}: ${m.recipeId} resolves`));
  assert(plan.totalEstimatedCost > 0, `run ${run}: total cost computed`);

  const list = shoppingListForPlan(plan);
  assert(list.items.length > 0, `run ${run}: shopping list has items`);
  assert(Math.abs(list.totalEstimatedCost - plan.totalEstimatedCost) < 0.01, "shopping total matches plan total");

  const swapped = swapMeal(plan, 0);
  const swappedIds = swapped.meals.map((m) => m.recipeId);
  assert(swappedIds[0] !== ids[0], "swap changes the first day's meal");
  assert(new Set(swappedIds).size === 7, "swap keeps no duplicates");
}

// --- Dietary filters ---
for (const key of ["vegetarian", "vegan", "glutenFree", "dairyFree"] as const) {
  const f: DietFilters = { vegetarian: false, vegan: false, glutenFree: false, dairyFree: false, [key]: true };
  const plan = generatePlan(7, getWeekStartDate(), f);
  assert(plan.meals.length === 7, `${key}: still generates a full week`);
  const ok = plan.meals.every((m) => {
    const r = recipes.find((x) => x.id === m.recipeId)!;
    return dietFor(r)[key];
  });
  assert(ok, `${key}: every dinner respects the filter`);
}

// strictest combo
{
  const f: DietFilters = { vegetarian: true, vegan: true, glutenFree: true, dairyFree: true };
  const plan = generatePlan(7, getWeekStartDate(), f);
  assert(plan.meals.length === 7, "vegan+gf+df still generates a full week");
  const ok = plan.meals.every((m) => {
    const d = dietFor(recipes.find((x) => x.id === m.recipeId)!);
    return d.vegan && d.glutenFree && d.dairyFree;
  });
  assert(ok, "vegan+gf+df: every dinner satisfied");

  // swap must also respect the filter
  const swapped = swapMeal(plan, 0, f);
  const d0 = dietFor(recipes.find((x) => x.id === swapped.meals[0].recipeId)!);
  assert(d0.vegan && d0.glutenFree && d0.dairyFree, "swap under strict filter keeps constraint");
  assert(new Set(swapped.meals.map((m) => m.recipeId)).size === 7, "swap under filter keeps uniqueness");
}

// --- Sample output for eyeballing ---
const plan = generatePlan(7, getWeekStartDate());
const list = shoppingListForPlan(plan);
console.log("\n--- Sample plan ---");
plan.meals.forEach((m) => {
  const r = recipes.find((x) => x.id === m.recipeId)!;
  console.log(`${m.day} (${m.date}): ${r.name}  £${r.costPerServing}/serv, ${r.prepTimeMinutes}min, ${r.calories}kcal`);
});
console.log(`Total: £${plan.totalEstimatedCost.toFixed(2)}, avg £${plan.averageDailyCost.toFixed(2)}/dinner`);
console.log(`Shopping list: £${list.totalEstimatedCost.toFixed(2)}, ${list.items.length} items`);
