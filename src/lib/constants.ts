export const CATEGORIES = ["beauty", "fashion", "fitness", "food", "lifestyle", "tech"] as const;
export const CITIES = ["Almaty", "Astana", "Shymkent", "Aktau"] as const;
export const FOLLOWER_RANGES = ["1K-10K", "10K-50K", "50K-200K", "200K+"] as const;
export const BUDGET_RANGES = ["< 100K KZT", "100K-500K KZT", "500K-1M KZT", "1M+ KZT"] as const;

export type Category = typeof CATEGORIES[number];
export type City = typeof CITIES[number];
export type FollowerRange = typeof FOLLOWER_RANGES[number];
export type BudgetRange = typeof BUDGET_RANGES[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  beauty: "Beauty",
  fashion: "Fashion",
  fitness: "Fitness",
  food: "Food",
  lifestyle: "Lifestyle",
  tech: "Tech",
};