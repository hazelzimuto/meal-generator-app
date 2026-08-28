# Weekly Meal Generator

A simple, browser-only app that turns your dietary preferences into a week of healthy, budget-friendly dinners — with a combined shopping list you can tick off as you go. No accounts, no logins, no online ordering.

## Problem

Planning a week of dinners is boring and repetitive: deciding what to cook, keeping it varied, staying within a budget, and remembering what goes on the shopping list. Most meal-planning tools demand accounts, subscriptions, or pull in online ordering and advertising.

This app fixes that with a single, offline-friendly page: pick your filters, generate a week, and get a shopping list in one click.

## Audience

- Home cooks who want a quick, no-fuss week plan
- Budget-conscious households
- Anyone on a specific diet (vegetarian, vegan, gluten-free, dairy-free)
- People who dislike creating accounts for small utilities

## Features

- **Weekly plan generation** – 7 dinners (Sun–Sat) picked from 35 curated recipes
- **Dietary filters** – vegetarian, vegan, gluten-free, dairy-free (combinable)
- **Shopping list** – ingredients auto-aggregated by category with unit normalisation (g/kg, ml/l, tsp/tbsp, etc.)
- **Pantry tracking** – tick items you already own; optionally hide them from the list
- **Meal swapping** – swap any single day for a different, non-duplicate recipe respecting your filters
- **Recipe details** – full ingredients and instructions in a modal
- **Cost & nutrition summary** – week total, average per dinner, prep time, and calories
- **Persistence** – the plan, filters, and pantry state survive reloads via localStorage

## Tech & Tools

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Node.js** with `tsx` for a lightweight test runner

## Key Decisions

- **No server / no backend.** Everything runs client-side. Recipes are bundled as static data, and the plan + shopping list are computed in the browser. This keeps hosting trivial and removes the need for a database or API.
- **Static recipe data.** Recipes live in `lib/data/recipes.ts` as typed objects, keeping the model explicit and testable rather than abstracting behind a database. Dietary flags (`vegetarian`, `vegan`, etc.) are *derived* from ingredients rather than hand-maintained, so the data stays consistent.
- **Keyword-based diet detection.** `lib/diet.ts` infers a recipe's diet status from its ingredient keywords (e.g. `chicken`, `cheese`, `pasta`). This is simple and transparent, though it requires curated ingredient naming.
- **localStorage as the store.** The plan, preferences, and pantry are persisted locally — no auth, no sync conflicts to manage.
- **A thin, scriptable test layer.** `test.ts` runs with `tsx` and asserts the core invariants (7 unique meals, shopping total matches plan total, swaps respect filters, etc.) without the overhead of a full test framework.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run test     # run the automated checks
```

## Challenges

- **Dietary accuracy.** Deriving vegan/gluten-free/dairy-free from ingredient names is fuzzy — e.g. coconut milk is dairy *by name* but fine for vegans. Handled with an explicit exception and a curated ingredient vocabulary.
- **Aggregating a combined shopping list.** Multiple recipes share ingredients, and they arrive with mismatched units (cups vs ml, tsp vs tbsp). A normalisation layer (`lib/shopping.ts`) converts everything to a common base unit before summing.
- **Balancing enough recipes per diet.** With only 35 recipes, very strict combined filters (vegan + gluten-free + dairy-free) leave a thin pool. The generator relaxes the "balanced" constraint when needed to fill the week.
- **Persistent state on a no-backend app.** All UI state had to survive reloads without a server, which drove the localStorage approach.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Create a production build |
| `npm run start` | Serve a production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the automated logic checks |

## Project Structure

```
app/            Next.js App Router entry (page, layout, globals)
components/     React UI (PlanView, ShoppingListView, PreferencesPanel, RecipeModal)
lib/            Pure logic (plan, shopping, diet, recipes) + typed recipe data
test.ts         Standalone automated checks
```
