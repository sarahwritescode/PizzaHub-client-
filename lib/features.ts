import { CalendarCheck, ChefHat, Heart, Leaf, PackageCheck, Search, Store, Truck, type LucideIcon } from "lucide-react";

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

export type Step = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

// How ordering really works on PizzaHub (no step promises more than the app does).
export const HOW_IT_WORKS_STEPS: Step[] = [
  {
    id: "browse",
    title: "Browse the menu",
    description: "Explore pizzas from local pizzerias. Search by name, filter by category or location.",
    icon: Search,
  },
  {
    id: "order",
    title: "Place your order",
    description: "Pick a delivery date, add your address and any special instructions.",
    icon: CalendarCheck,
  },
  {
    id: "accept",
    title: "The pizzeria accepts",
    description: "The vendor reviews your order and accepts it. You can cancel while it is pending.",
    icon: Store,
  },
  {
    id: "enjoy",
    title: "Track and enjoy",
    description: "Follow the status from your dashboard and enjoy a fresh pizza at your door.",
    icon: PackageCheck,
  },
];
