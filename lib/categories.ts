/**
 * The six menu categories PizzaHub offers. Vendors pick one of these when they
 * add or edit an item, and the home page shows all of them. Names are the exact
 * values stored on menu items, so category filters (/menu?category=...) match.
 */
export const MENU_CATEGORIES = [
  "Classic Pizzas",
  "Vegetarian Pizzas",
  "Meat Lovers",
  "Specialty / Gourmet Pizzas",
  "Sides & Appetizers",
  "Beverages & Desserts",
] as const;

export type MenuCategoryName = (typeof MENU_CATEGORIES)[number];
