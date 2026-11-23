"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardListIcon,
  CrownIcon,
  LayoutDashboardIcon,
  PizzaIcon,
  PlusIcon,
  UserRoundIcon,
} from "lucide-react";
import { isActivePath } from "@/lib/nav";

const LINKS: { href: string; label: string; Icon: typeof PizzaIcon; active: (pathname: string) => boolean }[] = [
  { href: "/vendor/dashboard", label: "Overview", Icon: LayoutDashboardIcon, active: (p) => isActivePath(p, "/vendor/dashboard") },
  // "Add menu item" has its own link, so the list link is not lit for it.
  { href: "/vendor/menu", label: "My menu items", Icon: PizzaIcon, active: (p) => p === "/vendor/menu" || isActivePath(p, "/vendor/menu/edit") },
  { href: "/vendor/menu/add", label: "Add menu item", Icon: PlusIcon, active: (p) => isActivePath(p, "/vendor/menu/add") },
  { href: "/vendor/orders", label: "Customer orders", Icon: ClipboardListIcon, active: (p) => isActivePath(p, "/vendor/orders") },
  { href: "/vendor/subscription", label: "Subscription", Icon: CrownIcon, active: (p) => isActivePath(p, "/vendor/subscription") },
  { href: "/vendor/profile", label: "Profile", Icon: UserRoundIcon, active: (p) => isActivePath(p, "/vendor/profile") },
];

export function VendorNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Vendor" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {LINKS.map(({ href, label, Icon, active: isActive }) => {
        const active = isActive(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-tomato md:rounded-xl ${
              active ? "bg-tomato text-white" : "text-ink/70 hover:bg-crust/60 hover:text-ink"
            }`}
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
