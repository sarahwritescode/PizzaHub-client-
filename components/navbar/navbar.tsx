import { Suspense } from "react";
import { AuthActions } from "@/components/navbar/auth-actions";
import { Brand } from "@/components/navbar/brand";
import { CartButton } from "@/components/navbar/cart-button";
import { MobileMenu } from "@/components/navbar/mobile-menu";
import { ThemeToggle } from "@/components/navbar/theme-toggle";
import { DesktopNav } from "@/components/navbar/nav-links";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-crust bg-page/90 backdrop-blur supports-[backdrop-filter]:bg-page/75">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <div className="flex flex-1 items-center">
          <Brand />
        </div>

        {/* usePathname() is request data on dynamic routes such as /menu/[id], so these sit behind Suspense. */}
        <Suspense fallback={<div className="hidden h-9 w-72 lg:block" aria-hidden="true" />}>
          <DesktopNav />
        </Suspense>

        <div className="flex flex-1 items-center justify-end gap-1 lg:gap-3">
          <ThemeToggle />
          <CartButton />
          <div className="hidden lg:block">
            <AuthActions layout="inline" />
          </div>
          <Suspense fallback={<div className="size-10 lg:hidden" aria-hidden="true" />}>
            <MobileMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
