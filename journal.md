# Dev Journal

A working log of decisions, blockers, and lessons learned as the project developed.

---

## Day 1 — MVP greenfield

**What we're building.** A "Weekly Meal Generator": a single-page app that picks 7 healthy, budget-friendly dinners for the week, respecting dietary preferences, and produces a combined shopping list. Deliberate constraints from the start: no accounts, no payments, no online ordering infrastructure. Just solve the planning chore.

**Foundation decisions.**
- Next.js 15 + React 19 + TypeScript. The App Router gives us a clean client component tree, and Next is what I know best for a self-contained UI.
- Tailwind CSS v4 for styling — fast iteration, no separate CSS files to maintain.
- **No backend.** This was the defining call. A meal planner has no user-generated data worth a database, so I decided everything computes in the browser from static recipe data. That makes hosting a non-issue and keeps the app instant and offline-friendly.

**Data model.** Started with a typed `Recipe` and `Ingredient` in `lib/types.ts`. Key choices:
- `costPerServing` stored as a number, not money — avoids float formatting headaches at the source.
- A `Category` enum drives shopping-list grouping.
- A `balanced` flag marks recipes nutritionally complete enough for a "healthy week" — the generator prefers these.

---

## Day 2 — Recipe catalog & diet detection

**The recipe pool.** Wrote ~35 vegetarian and meat/fish recipes by hand into `lib/data/recipes.ts`. Every recipe has ingredients, per-serving cost, prep time, calories, protein, servings, and instructions.

**Diet detection — the subtle part.** Rather than hand-tagging every recipe's dietary status (fragile, easy to get inconsistent), I made `lib/diet.ts` *derive* `vegetarian` / `vegan` / `glutenFree` / `dairyFree` from ingredient keywords. Pros: consistent by construction. Cons: it's fuzzy.

**Lesson learned — the fuzzy edge cases:**
- **Coconut milk** contains the substring of "milk" / "cream" but is vegan and dairy-free. Needed an explicit exception in `isDairyIngredient`.
- **Tuna tinned** "should" count as protein but the keyword list just looks for names. Works, but it means recipe data must be curated carefully (e.g. naming "Chicken breast (cooked)" consistently so the detection stays reliable).
- Gluten detection relies on ingredient names containing pasta/wrap/noodles/flour — so "burger buns" and "tortilla wraps" correctly flag non-gluten-free.

This is the price of not hand-maintaining flags, and it's acceptable given we control the recipe data.

---

## Day 3 — Plan generation & the shopping list

**Generating a week.** `lib/plan.ts` shuffles the matching pool, picks 7 unique dinners, dates them from the current week's Sunday, and computes totals (total cost, avg/dinner, avg prep, calories). Swap logic re-picks from the same pool excluding already-used recipes so a swap never creates duplicates.

**Edge case that bit me — thin pools.** With strict combined filters (vegan + gluten-free + dairy-free) there can be fewer than 7 *balanced* recipes. I added a fallback: if the balanced pool is too small, relax the `balanced` constraint and use the full filtered pool. Without this, generation could crash or repeat dinners.

**Shopping list aggregation.** `lib/shopping.ts` was the trickiest pure-logic piece:
- Merge identical ingredients across meals (a `Map` keyed on lowercase name, summing quantities).
- **Unit normalisation** — recipes arrive with mixed units (cups vs ml, tsp vs tbsp, g vs kg). A conversion table reduces them to base units (`tbsp`, `g`, `ml`, etc.) before summing so "2 tsp + 1 tbsp" becomes a correct total.
- Group by category in a fixed display order.

**Verification.** Before wiring the full `test.ts` suite, I eyeballed sample plans and shopping lists via a quick `tsx` script to sanity-check that totals actually matched between the plan and the shopping list.

---

## Day 4 — UI wiring & persistence

**Components.** Split the UI into small pieces: `PlanView` (week grid + summary cards + swap), `ShoppingListView` (grouped, pantry-checkable), `PreferencesPanel` (filter pills), `RecipeModal` (detail view). Kept them presentational, with state lifted up into `app/page.tsx`.

**State handled in the page:**
- `filters` (dietary preferences)
- `pantry` (a `Set` of items you already have)
- plan + active tab + which recipe modal is open

**Persistence.** Every piece of meaningful state lives in localStorage: the plan, the last active tab, preferences, the pantry set, and a "hide pantry" flag. On mount, the page restores them. This gives a genuinely persistent experience with zero backend.

**Small UX call:** when the app restores a saved plan, it also restores which tab you were on (plan vs shopping) — a tiny detail, but it avoids the jarring jump back to the plan view.

---

## Day 5 — Tests & hardening

**Test approach.** Rather than pulling in Jest/Vitest, I wrote `test.ts` and run it with `tsx`. It asserts the core invariants across randomized runs:
- 7 unique, resolvable meals per generated week
- positive computed costs
- shopping list has items and its total matches the plan total
- swaps change the day and never duplicate
- **each dietary filter, and the strictest combined filter, produce a full week where every dinner satisfies the constraint** — including that *swaps* under a filter keep the constraint

That last point caught real bugs: an early swap implementation ignored filters, substituting non-compliant meals. The test forced the fixed version.

---

## Day 6 — Wrap-up

**Final state.** The app is a complete, self-contained MVP:
- 35 recipes, diet detection, plan generation, swap, aggregated shopping list, pantry tracking, recipe modal
- Fully persisted via localStorage
- Automated checks passing for generation, shopping, swapping, and dietary constraints

**Open items / future ideas:**
- More recipes (and a few more vegan + GF + DF ones to thicken the strict-pool)
- A "favourites / always include" feature
- Ingredient alias mapping (e.g. "baking potatoes" == "potatoes") to tighten list merging
- Export the shopping list / plan (PDF or copy-to-clipboard)

**Reflections.** The biggest architectural win was keeping all logic pure and data-driven (typed recipes + keyword-derived diet flags + unit-normalised aggregation). That made the logic easy to test in isolation and the UI thin. The database-to-nowhere decision kept scope tiny, and localStorage was more than enough for persistence. If this ever grows multi-user or needs real data updates, the clean separation means a backend could slot in without touching the UI.
