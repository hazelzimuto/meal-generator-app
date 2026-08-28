"use client";

import { getRecipe } from "@/lib/recipes";
import type { WeekPlan } from "@/lib/types";

const DAY_BADGE: Record<string, string> = {
  Sunday: "bg-red-50 text-red-700",
  Monday: "bg-amber-50 text-amber-700",
  Tuesday: "bg-orange-50 text-orange-700",
  Wednesday: "bg-yellow-50 text-yellow-700",
  Thursday: "bg-lime-50 text-lime-700",
  Friday: "bg-teal-50 text-teal-700",
  Saturday: "bg-sky-50 text-sky-700",
};

const TAG_STYLES: Record<string, string> = {
  healthy: "bg-emerald-100 text-emerald-800",
  vegetarian: "bg-green-100 text-green-800",
  vegan: "bg-lime-100 text-lime-800",
  "high-protein": "bg-orange-100 text-orange-800",
  quick: "bg-sky-100 text-sky-800",
};

export function PlanView({
  plan,
  onSwap,
  onViewRecipe,
}: {
  plan: WeekPlan;
  onSwap: (dayIndex: number) => void;
  onViewRecipe: (id: string) => void;
}) {
  const meals = plan.meals.map((meal) => ({ meal, recipe: getRecipe(meal.recipeId) }));

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryItem label="Week total" value={`£${plan.totalEstimatedCost.toFixed(2)}`} />
        <SummaryItem label="Avg / dinner" value={`£${plan.averageDailyCost.toFixed(2)}`} />
        <SummaryItem label="Avg prep time" value={`${plan.averagePrepTime} min`} />
        <SummaryItem label="Week calories" value={`${plan.totalCalories.toLocaleString()}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {meals.map(({ meal, recipe }, i) => (
          <div
            key={meal.day}
            className="flex flex-col rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  DAY_BADGE[meal.day] ?? "bg-stone-100 text-stone-700"
                }`}
              >
                {meal.day}
              </span>
              <span className="text-xs text-stone-400">{meal.date}</span>
            </div>

            <button
              onClick={() => onViewRecipe(recipe.id)}
              className="text-left text-lg font-semibold leading-snug hover:text-emerald-700"
            >
              {recipe.name}
            </button>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {recipe.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    TAG_STYLES[tag] ?? "bg-stone-100 text-stone-600"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-3 text-xs text-stone-500">
              <span>£{recipe.costPerServing}/serv</span>
              <span>{recipe.prepTimeMinutes} min</span>
              <span>{recipe.calories} kcal</span>
            </div>

            <div className="mt-4 flex-1" />

            <button
              onClick={() => onSwap(i)}
              className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Swap meal
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-stone-400">{label}</div>
      <div className="mt-1 text-xl font-bold text-stone-800">{value}</div>
    </div>
  );
}
