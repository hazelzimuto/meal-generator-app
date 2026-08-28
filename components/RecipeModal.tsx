"use client";

import { getRecipe } from "@/lib/recipes";
import type { Recipe } from "@/lib/types";

const TAG_STYLES: Record<string, string> = {
  healthy: "bg-emerald-100 text-emerald-800",
  vegetarian: "bg-green-100 text-green-800",
  vegan: "bg-lime-100 text-lime-800",
  "high-protein": "bg-orange-100 text-orange-800",
  quick: "bg-sky-100 text-sky-800",
  budget: "bg-amber-100 text-amber-800",
  pantry: "bg-stone-200 text-stone-800",
  family: "bg-indigo-100 text-indigo-800",
  "one-pan": "bg-teal-100 text-teal-800",
};

export function RecipeModal({
  recipeId,
  onClose,
}: {
  recipeId: string | null;
  onClose: () => void;
}) {
  if (!recipeId) return null;
  const recipe: Recipe = getRecipe(recipeId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-start justify-between">
          <h2 className="text-2xl font-bold">{recipe.name}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-stone-400 hover:bg-stone-100"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-stone-100 px-3 py-1">£{recipe.costPerServing}/serving</span>
          <span className="rounded-full bg-stone-100 px-3 py-1">{recipe.prepTimeMinutes} min</span>
          <span className="rounded-full bg-stone-100 px-3 py-1">{recipe.calories} kcal</span>
          <span className="rounded-full bg-stone-100 px-3 py-1">{recipe.proteinGrams}g protein</span>
          <span className="rounded-full bg-stone-100 px-3 py-1">Serves {recipe.servings}</span>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                TAG_STYLES[tag] ?? "bg-stone-100 text-stone-700"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="mb-2 text-lg font-semibold">Ingredients</h3>
        <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-stone-700">
          {recipe.ingredients.map((ing) => (
            <li key={ing.name}>
              {ing.quantity} {ing.unit} {ing.name}
            </li>
          ))}
        </ul>

        <h3 className="mb-2 text-lg font-semibold">Instructions</h3>
        <ol className="list-inside list-decimal space-y-2 text-sm text-stone-700">
          {recipe.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
