"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { generatePlan, getWeekStartDate, swapMeal } from "@/lib/plan";
import { shoppingListForPlan } from "@/lib/shopping";
import { allRecipes } from "@/lib/recipes";
import type { DietFilters } from "@/lib/diet";
import { PlanView } from "@/components/PlanView";
import { ShoppingListView } from "@/components/ShoppingListView";
import { PreferencesPanel } from "@/components/PreferencesPanel";
import { RecipeModal } from "@/components/RecipeModal";
import type { WeekPlan } from "@/lib/types";

const STORAGE_KEY = "meal-generator-plan";
const GENERATED_SIGNAL = "meal-generator-signal";
const PREF_KEY = "meal-generator-prefs";
const PANTRY_KEY = "meal-generator-pantry";
const HIDE_PANTRY_KEY = "meal-generator-hide-pantry";

const EMPTY_FILTERS: DietFilters = {
  vegetarian: false,
  vegan: false,
  glutenFree: false,
  dairyFree: false,
};

export default function Home() {
  const [plan, setPlan] = useState<WeekPlan | null>(null);
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);
  const [tab, setTab] = useState<"plan" | "shopping">("plan");
  const [filters, setFilters] = useState<DietFilters>(EMPTY_FILTERS);
  const [pantry, setPantry] = useState<Set<string>>(new Set());
  const [hidePantry, setHidePantry] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPlan(JSON.parse(raw));
      const signal = localStorage.getItem(GENERATED_SIGNAL);
      if (signal === "shopping" || signal === "plan") setTab(signal);

      const prefRaw = localStorage.getItem(PREF_KEY);
      if (prefRaw) setFilters({ ...EMPTY_FILTERS, ...JSON.parse(prefRaw) });

      const pantryRaw = localStorage.getItem(PANTRY_KEY);
      if (pantryRaw) setPantry(new Set(JSON.parse(pantryRaw)));

      setHidePantry(localStorage.getItem(HIDE_PANTRY_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const shoppingList = useMemo(() => (plan ? shoppingListForPlan(plan) : null), [plan]);

  const persist = useCallback(
    (next: WeekPlan, activeTab: "plan" | "shopping") => {
      setPlan(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      localStorage.setItem(GENERATED_SIGNAL, activeTab);
    },
    []
  );

  const handleFiltersChange = useCallback((f: DietFilters) => {
    setFilters(f);
    localStorage.setItem(PREF_KEY, JSON.stringify(f));
  }, []);

  const handleTogglePantry = useCallback((name: string) => {
    const key = name.toLowerCase();
    setPantry((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      localStorage.setItem(PANTRY_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const handleToggleHide = useCallback(() => {
    setHidePantry((prev) => {
      const next = !prev;
      localStorage.setItem(HIDE_PANTRY_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  const handleGenerate = useCallback(() => {
    persist(generatePlan(7, getWeekStartDate(), filters), "plan");
  }, [persist, filters]);

  const handleSwap = useCallback(
    (dayIndex: number) => {
      if (!plan) return;
      persist(swapMeal(plan, dayIndex, filters), "plan");
    },
    [plan, persist, filters]
  );

  const weekLabel = plan?.meals[0]?.date ?? null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">Weekly Meal Generator</h1>
        <p className="mx-auto mt-2 max-w-2xl text-stone-500">
          Seven healthy, budget-friendly dinners for the coming week — no login, no fuss.
        </p>
      </header>

      {!plan ? (
        <section className="mx-auto max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
            🍽️
          </div>
          <h2 className="text-xl font-semibold text-stone-800">Plan your week in one click</h2>
          <p className="mt-2 text-sm text-stone-500">
            We&apos;ll pick 7 dinners from {allRecipes().length} curated recipes, tot up the cost,
            and build a combined shopping list.
          </p>
          <div className="mt-6 text-left">
            <PreferencesPanel filters={filters} onChange={handleFiltersChange} />
          </div>
          <button
            onClick={handleGenerate}
            className="mt-6 w-full rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow hover:bg-emerald-700"
          >
            Generate this week&apos;s meals
          </button>
        </section>
      ) : (
        <>
          <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-center sm:text-left">
              <div className="text-xs font-medium uppercase tracking-wide text-stone-400">
                Week starting
              </div>
              <div className="text-lg font-semibold text-stone-800">{weekLabel}</div>
            </div>

            <div className="flex rounded-xl border border-stone-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setTab("plan")}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  tab === "plan" ? "bg-emerald-600 text-white" : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                Week plan
              </button>
              <button
                onClick={() => setTab("shopping")}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  tab === "shopping"
                    ? "bg-emerald-600 text-white"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                Shopping list
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50"
              >
                Regenerate week
              </button>
            </div>
          </div>

          <div className="mb-6">
            <PreferencesPanel filters={filters} onChange={handleFiltersChange} />
          </div>

          {tab === "plan" ? (
            <PlanView plan={plan} onSwap={handleSwap} onViewRecipe={setActiveRecipeId} />
          ) : shoppingList ? (
            <ShoppingListView
              list={shoppingList}
              pantry={pantry}
              hidePantry={hidePantry}
              onTogglePantry={handleTogglePantry}
              onToggleHide={handleToggleHide}
            />
          ) : null}
        </>
      )}

      <RecipeModal recipeId={activeRecipeId} onClose={() => setActiveRecipeId(null)} />

      <footer className="mt-12 text-center text-xs text-stone-400">
        Just a meal planner — no accounts, no payments, no online ordering.
      </footer>
    </main>
  );
}
