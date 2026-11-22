"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, LogOutIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type Props = {
  /** "inline" = desktop row, "stacked" = full-width column inside the mobile menu */
  layout: "inline" | "stacked";
  /** Called after a link is followed or the user signs out (used to close the mobile menu) */
  onNavigate?: () => void;
};

const pill = "h-9 rounded-full px-4 text-sm font-medium";
const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function AuthActions({ layout, onNavigate }: Props) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);
  const stacked = layout === "stacked";

  async function handleSignOut() {
    setSigningOut(true);
    let message: string | null = null;
    try {
      const { error } = await authClient.signOut();
      if (error) message = error.message || "Please try again.";
    } catch {
      message = "Can't reach the server. Please try again in a moment.";
    }
    setSigningOut(false);

    if (message) {
      toast.add({ type: "error", title: "Could not sign out", description: message });
      return;
    }

    toast.add({ type: "success", title: "Signed out", description: "See you soon!" });
    onNavigate?.();
    router.push("/");
    router.refresh();
  }

  // Reserve space while the session loads so the bar doesn't jump.
  if (isPending) {
    return (
      <div
        aria-hidden="true"
        className={cn("h-9 animate-pulse rounded-full bg-crust/70", stacked ? "w-full" : "w-44")}
      />
    );
  }

  if (!session?.user) {
    return (
      <div className={cn("flex gap-2", stacked ? "flex-col" : "items-center")}>
        <Link
          href="/sign-in"
          onClick={onNavigate}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pill,
            "text-ink hover:bg-crust/60",
            stacked && "h-11 w-full border border-crust text-base",
            focusRing
          )}
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          onClick={onNavigate}
          className={cn(
            buttonVariants(),
            pill,
            "bg-tomato text-white hover:bg-tomato-deep",
            stacked && "h-11 w-full text-base",
            focusRing
          )}
        >
          Sign up
        </Link>
      </div>
    );
  }

  const { user } = session;

  const avatar = (
    <Avatar size="lg">
      {user.image ? <AvatarImage src={user.image} alt="" /> : null}
      <AvatarFallback className="bg-crust text-sm font-semibold text-ink">
        {initials(user.name)}
      </AvatarFallback>
    </Avatar>
  );

  // Mobile menu: name, then a full-width Sign out button (Dashboard is in the link list above).
  if (stacked) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          {avatar}
          <span className="truncate text-base font-medium text-ink">{user.name}</span>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pill,
            "h-11 w-full gap-1.5 border border-crust text-base text-ink hover:bg-crust/60",
            focusRing
          )}
        >
          <LogOutIcon aria-hidden="true" />
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    );
  }

  // Desktop: avatar + name + chevron opening an account menu.
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full py-1 pr-2 pl-1 text-sm font-medium text-ink transition-colors hover:bg-crust/60 data-popup-open:bg-crust/60",
          focusRing
        )}
      >
        {avatar}
        <span className="hidden max-w-32 truncate xl:inline">{user.name}</span>
        <ChevronDownIcon aria-hidden="true" className="size-4 text-ink/65" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="truncate">{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={signingOut}>
          <LogOutIcon aria-hidden="true" />
          {signingOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
