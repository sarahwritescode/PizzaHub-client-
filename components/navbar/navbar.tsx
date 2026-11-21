import { AuthActions } from "@/components/navbar/auth-actions";
import { Brand } from "@/components/navbar/brand";
import { MobileMenu } from "@/components/navbar/mobile-menu";
import { DesktopNav } from "@/components/navbar/nav-links";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-crust bg-cream/90 backdrop-blur supports-[backdrop-filter]:bg-cream/75">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <div className="flex flex-1 items-center">
          <Brand />
        </div>

        <DesktopNav />

        <div className="flex flex-1 items-center justify-end">
          <div className="hidden lg:block">
            <AuthActions layout="inline" />
          </div>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
