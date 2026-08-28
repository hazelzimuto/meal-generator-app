import type { Category } from "./types";

export const categoryLabels: Record<Category, string> = {
  veg: "Vegetables",
  fruit: "Fruit",
  protein: "Protein",
  dairy: "Dairy",
  grains: "Grains & Carbs",
  pantry: "Pantry",
  "herbs-spices": "Herbs & Spices",
  other: "Other",
};

export const categoryOrder: Category[] = [
  "veg",
  "fruit",
  "protein",
  "dairy",
  "grains",
  "pantry",
  "herbs-spices",
  "other",
];
