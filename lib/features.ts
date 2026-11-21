import { ChefHat, Heart, Leaf, Truck, type LucideIcon } from "lucide-react";

export type Feature = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const WHY_CHOOSE_FEATURES: Feature[] = [
  {
    id: "fresh-ingredients",
    title: "Fresh Ingredients",
    description:
      "We use carefully selected fresh ingredients to make every pizza delicious.",
    icon: Leaf,
  },
  {
    id: "fast-delivery",
    title: "Fast Delivery",
    description: "Enjoy your favorite pizza delivered fresh and on time.",
    icon: Truck,
  },
  {
    id: "expert-chefs",
    title: "Expert Chefs",
    description: "Our skilled chefs prepare every pizza with care and passion.",
    icon: ChefHat,
  },
  {
    id: "made-with-love",
    title: "Made with Love",
    description: "Every slice is crafted with quality, flavor and love.",
    icon: Heart,
  },
];
