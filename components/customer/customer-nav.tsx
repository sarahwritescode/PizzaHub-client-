"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardListIcon, LayoutDashboardIcon, PizzaIcon, UserRoundIcon } from "lucide-react";
import { isActivePath } from "@/lib/nav";

const LINKS = [
  { href: "/customer/dashboard", label: "Dashboard", Icon: LayoutDashboardIcon },
  { href: "/customer/orders", label: "My orders", Icon: ClipboardListIcon },
  { href: "/customer/profile", label: "Profile", Icon: UserRoundIcon },
  { href: "/menu", label: "Browse menu", Icon: PizzaIcon },
] as const;

export function CustomerNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Customer" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {LINKS.map(({ href, label, Icon }) => {
        // "Browse menu" leaves the area, so it is never shown as the current page.
        const active = href !== "/menu" && isActivePath(pathname, href);
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
