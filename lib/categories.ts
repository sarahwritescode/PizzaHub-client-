export type PizzaCategory = {
  id: string;
  /** URL-safe, lowercase, hyphenated. Used as the `category` query value on /menu. */
  slug: string;
  name: string;
  description: string;
  image: {
    src: string;
    alt: string;
    /** CSS object-position, to keep the pizza centred inside the round crop. */
    position?: string;
  };
};

const CATEGORIES: PizzaCategory[] = [
  {
    id: "classic-pizza",
    slug: "classic-pizza",
    name: "Classic Pizza",
    description: "Tomato, mozzarella and fresh basil on a thin, blistered crust.",
    image: {
      src: "/images/categories/classic-pizza.jpg",
      alt: "Margherita pizza topped with fresh basil and sliced tomatoes",
      position: "35% 50%",
    },
  },
  {
    id: "pepperoni",
    slug: "pepperoni",
    name: "Pepperoni",
    description: "Crisp-edged pepperoni layered over bubbling cheese.",
    image: {
      src: "/images/categories/pepperoni.jpg",
      alt: "Pepperoni and sausage pizza on a wooden table",
    },
  },
  {
    id: "cheese-lovers",
    slug: "cheese-lovers",
    name: "Cheese Lovers",
    description: "Golden, melty and stretchy, with a blend of three cheeses.",
    image: {
      src: "/images/categories/cheese-lovers.jpg",
      alt: "Baked cheese pizza with golden, melted mozzarella",
      position: "75% 50%",
    },
  },
  {
    id: "vegetarian",
    slug: "vegetarian",
    name: "Vegetarian",
    description: "Fresh greens, ricotta and vegetables, no meat needed.",
    image: {
      src: "/images/categories/vegetarian.jpg",
      alt: "Vegetarian pizza with spinach leaves and spoonfuls of ricotta",
    },
  },
  {
    id: "chicken-pizza",
    slug: "chicken-pizza",
    name: "Chicken Pizza",
    description: "Tender chicken, red onion and a smoky barbecue drizzle.",
    image: {
      src: "/images/categories/chicken-pizza.jpg",
      alt: "Sliced chicken pizza with pineapple, red onion and coriander",
    },
  },
  {
    id: "spicy-pizza",
    slug: "spicy-pizza",
    name: "Spicy Pizza",
    description: "Hot sausage, peppers and olives for those who like a kick.",
    image: {
      src: "/images/categories/spicy-pizza.jpg",
      alt: "Pizza with spicy sausage, peppers and black olives",
    },
  },
];

/**
 * Static for now. Swap the body for a backend call later; callers already
 * await it, so nothing else needs to change.
 */
export async function getCategories(): Promise<PizzaCategory[]> {
  return CATEGORIES;
}

/** Link target for a category, e.g. `/menu?category=cheese-lovers`. */
export function getCategoryHref(slug: string): string {
  return `/menu?category=${encodeURIComponent(slug)}`;
}
