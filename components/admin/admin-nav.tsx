"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCardIcon, LayoutDashboardIcon, PizzaIcon, UsersIcon } from "lucide-react";
import { isActivePath } from "@/lib/nav";

const LINKS = [
  { href: "/admin/dashboard", label: "Overview", Icon: LayoutDashboardIcon },
  { href: "/admin/menu-items", label: "Manage menu items", Icon: PizzaIcon },
  { href: "/admin/users", label: "Manage users", Icon: UsersIcon },
  { href: "/admin/transactions", label: "Transactions", Icon: CreditCardIcon },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {LINKS.map((link) => {
        const { href, label, Icon } = link;
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
