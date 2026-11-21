"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AuthActions } from "@/components/navbar/auth-actions";
import { Brand } from "@/components/navbar/brand";
import { NAV_LINKS, isActivePath } from "@/lib/nav";
import { cn } from "@/lib/utils";

// Hamburger + slide-in panel for screens below the lg breakpoint.
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className="inline-flex size-10 items-center justify-center rounded-full text-ink outline-none transition-colors hover:bg-crust/60 focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-cream lg:hidden"
      >
        <MenuIcon aria-hidden="true" className="size-6" />
      </SheetTrigger>

      <SheetContent side="right" className="w-[85%] max-w-sm gap-0 bg-cream text-ink">
        <SheetHeader className="border-b border-crust p-4">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Site navigation and account</SheetDescription>
          <Brand onNavigate={close} />
        </SheetHeader>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-4">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-12 items-center rounded-xl px-3 font-display text-xl font-bold tracking-tight outline-none transition-colors focus-visible:ring-2 focus-visible:ring-tomato",
                      active ? "bg-tomato/10 text-tomato-deep" : "text-ink hover:bg-crust/60"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <SheetFooter className="border-t border-crust">
          <AuthActions layout="stacked" onNavigate={close} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
