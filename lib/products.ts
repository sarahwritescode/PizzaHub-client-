export type Product = {
  /** URL-safe id, also the `[id]` segment of /menu/[id]. */
  id: string;
  name: string;
  description: string;
  /** Price in `currency` units, e.g. 12.5 for $12.50. */
  price: number;
  currency: "USD";
  /** Matches a `slug` in lib/categories.ts. */
  categorySlug: string;
  /** Short facts about the pizza, shown as chips on the card. */
  tags: string[];
  image: {
    src: string;
    alt: string;
    /** CSS object-position, to keep the pizza framed inside the card image. */
    position?: string;
  };
};

/**
 * Demo data: names, descriptions and prices are placeholders until the
 * backend provides real products. There are no ratings on purpose, since
 * there are no real customer reviews yet.
 */
const FEATURED_PRODUCTS: Product[] = [
  {
    id: "margherita-fresca",
    name: "Margherita Fresca",
    description: "Tomato sauce, fresh mozzarella and basil on a thin, crisp crust.",
    price: 11.5,
    currency: "USD",
    categorySlug: "classic-pizza",
    tags: ["Vegetarian"],
    image: {
      src: "/images/products/margherita-fresca.jpg",
      alt: "Slice of Margherita pizza with cherry tomatoes and basil being lifted from the pie",
      position: "50% 45%",
    },
  },
  {
    id: "smoky-pepperoni",
    name: "Smoky Pepperoni",
    description: "Pepperoni, mozzarella and a scatter of herbs on a charred crust.",
    price: 13.9,
    currency: "USD",
    categorySlug: "pepperoni",
    tags: ["Best seller"],
    image: {
      src: "/images/products/smoky-pepperoni.jpg",
      alt: "Pepperoni pizza with herbs on a rustic wooden table",
    },
  },
  {
    id: "rocket-ricotta",
    name: "Rocket & Ricotta",
    description: "Tomato base topped with fresh rocket and creamy ricotta.",
    price: 12.9,
    currency: "USD",
    categorySlug: "vegetarian",
    tags: ["Vegetarian"],
    image: {
      src: "/images/products/rocket-ricotta.jpg",
      alt: "Charred pizza slices topped with fresh rocket and ricotta",
    },
  },
  {
    id: "garden-mushroom",
    name: "Garden Mushroom",
    description: "Roasted mushrooms, ripe tomatoes and rocket over melted cheese.",
    price: 12.5,
    currency: "USD",
    categorySlug: "vegetarian",
    tags: ["Vegetarian"],
    image: {
      src: "/images/products/garden-mushroom.jpg",
      alt: "Pizza with mushrooms, cherry tomatoes and rocket on a dark wooden board",
    },
  },
  {
    id: "tomato-bianca",
    name: "Tomato Bianca",
    description: "White base with melted mozzarella, diced tomato and basil.",
    price: 11.9,
    currency: "USD",
    categorySlug: "cheese-lovers",
    tags: ["Cheesy"],
    image: {
      src: "/images/products/tomato-bianca.jpg",
      alt: "Whole white pizza topped with diced tomato on a wooden board",
      position: "50% 80%",
    },
  },
  {
    id: "olive-egg",
    name: "Olive & Egg",
    description: "Spicy sausage, black olives and a baked egg under oregano.",
    price: 14.5,
    currency: "USD",
    categorySlug: "spicy-pizza",
    tags: ["Spicy"],
    image: {
      src: "/images/products/olive-egg.jpg",
      alt: "Pizza with black olives, spicy sausage and a baked egg on a wooden board",
      position: "50% 60%",
    },
  },
];

/**
 * Static for now. Swap the body for a backend call later; callers already
 * await it, so nothing else needs to change.
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  return FEATURED_PRODUCTS;
}

/** Link target for a product's details page, e.g. `/menu/olive-egg`. */
export function getProductHref(id: string): string {
  return `/menu/${encodeURIComponent(id)}`;
}

export function formatPrice(price: number, currency: Product["currency"]): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);
}
