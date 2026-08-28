"use client";

import type { ShoppingList, ShoppingListItem } from "@/lib/types";

const categoryGroupLabels: Record<string, string> = {
  veg: "Vegetables",
  fruit: "Fruit",
  protein: "Protein",
  dairy: "Dairy",
  grains: "Grains & Carbs",
  pantry: "Pantry",
  "herbs-spices": "Herbs & Spices",
  other: "Other",
};

const categoryOrder = [
  "veg",
  "fruit",
  "protein",
  "dairy",
  "grains",
  "pantry",
  "herbs-spices",
  "other",
];

export function ShoppingListView({
  list,
  pantry,
  hidePantry,
  onTogglePantry,
  onToggleHide,
}: {
  list: ShoppingList;
  pantry: Set<string>;
  hidePantry: boolean;
  onTogglePantry: (name: string) => void;
  onToggleHide: () => void;
}) {
  const visibleItems = hidePantry ? list.items.filter((i) => !pantry.has(i.name.toLowerCase())) : list.items;
  const groups = groupByCategory(visibleItems);
  const inPantryCount = list.items.filter((i) => pantry.has(i.name.toLowerCase())).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-emerald-600">
              Estimated weekly total
            </div>
            <div className="text-2xl font-bold text-emerald-800">
              £{list.totalEstimatedCost.toFixed(2)}
            </div>
          </div>
          <div className="ml-6 text-sm font-medium text-emerald-700">
            {visibleItems.length} items on list
          </div>
        </div>

        {inPantryCount > 0 && (
          <button
            onClick={onToggleHide}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
              hidePantry
                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                : "border-stone-300 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {hidePantry ? "Show again" : `Hide ${inPantryCount} I already have`}
          </button>
        )}
      </div>

      {groups.length === 0 ? (
        <p className="rounded-2xl border border-stone-200 bg-white p-6 text-center text-stone-500">
          Nothing to buy — looks like your pantry has it covered.
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map(([category, items]) => (
            <section key={category}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
                {category}
              </h3>
              <ul className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                {items.map((item) => {
                  const key = item.name.toLowerCase();
                  const have = pantry.has(key);
                  return (
                    <li key={item.name} className="flex items-center px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={have}
                        onChange={() => onTogglePantry(item.name)}
                        className="mr-3 h-4 w-4 accent-emerald-600"
                      />
                      <span
                        className={`flex-1 font-medium ${have ? "text-stone-400 line-through" : "text-stone-800"}`}
                      >
                        {item.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${have ? "text-stone-300" : "text-stone-600"}`}>
                          {item.display}
                        </span>
                        <span className="hidden text-xs text-stone-400 sm:inline">
                          {item.recipes.length > 1
                            ? `${item.recipes.length} meals`
                            : item.recipes[0]}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByCategory(items: ShoppingListItem[]): [string, ShoppingListItem[]][] {
  const map = new Map<string, ShoppingListItem[]>();
  for (const item of items) {
    const label = categoryGroupLabels[item.category] ?? "Other";
    const bucket = map.get(label) ?? [];
    bucket.push(item);
    map.set(label, bucket);
  }
  return [...map.entries()].sort(
    (a, b) => categoryOrder.indexOf(labelKey(a[0])) - categoryOrder.indexOf(labelKey(b[0]))
  );
}

function labelKey(label: string): string {
  return categoryOrder.find((k) => categoryGroupLabels[k] === label) ?? label;
}
