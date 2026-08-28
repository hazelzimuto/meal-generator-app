"use client";

import type { DietFilters } from "@/lib/diet";

const OPTIONS: { key: keyof DietFilters; label: string; hint: string }[] = [
  { key: "vegetarian", label: "Vegetarian", hint: "No meat or fish" },
  { key: "vegan", label: "Vegan", hint: "No animal products" },
  { key: "glutenFree", label: "Gluten-free", hint: "No wheat-based carbs" },
  { key: "dairyFree", label: "Dairy-free", hint: "No milk, cheese or cream" },
];

export function PreferencesPanel({
  filters,
  onChange,
}: {
  filters: DietFilters;
  onChange: (f: DietFilters) => void;
}) {
  const activeCount = Object.values(filters).filter(Boolean).length;

  const toggle = (key: keyof DietFilters) => {
    onChange({ ...filters, [key]: !filters[key] });
  };

  const clear = () => onChange({ vegetarian: false, vegan: false, glutenFree: false, dairyFree: false });

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-700">Dietary preferences</h3>
        {activeCount > 0 && (
          <button
            onClick={clear}
            className="text-xs font-medium text-emerald-700 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => {
          const active = filters[opt.key];
          return (
            <button
              key={opt.key}
              onClick={() => toggle(opt.key)}
              title={opt.hint}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                active
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-stone-300 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
