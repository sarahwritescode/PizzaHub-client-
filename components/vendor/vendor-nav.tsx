"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardListIcon,
  CrownIcon,
  LayoutDashboardIcon,
  PizzaIcon,
  UserRoundIcon,
} from "lucide-react";
import { isActivePath } from "@/lib/nav";

const LINKS = [
  { href: "/vendor/dashboard", label: "Dashboard", Icon: LayoutDashboardIcon },
  { href: "/vendor/menu", label: "Menu", Icon: PizzaIcon },
  { href: "/vendor/orders", label: "Orders", Icon: ClipboardListIcon },
  { href: "/vendor/subscription", label: "Subscription", Icon: CrownIcon },
  { href: "/vendor/profile", label: "Profile", Icon: UserRoundIcon },
] as const;

export function VendorNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Vendor" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {LINKS.map(({ href, label, Icon }) => {
        const active = isActivePath(pathname, href);
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
