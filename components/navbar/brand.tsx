import Link from "next/link";
import { PizzaIcon } from "lucide-react";

export function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      aria-label="PizzaHub home"
      className="group inline-flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
    >
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-full bg-tomato text-cream shadow-[inset_0_-2px_0_rgb(0_0_0/0.18)] transition-transform duration-300 ease-out motion-safe:group-hover:rotate-[24deg]"
      >
        <PizzaIcon className="size-5" strokeWidth={2.25} />
      </span>
      <span className="font-display text-[1.375rem] leading-none font-extrabold tracking-tight text-ink">
        PizzaHub
      </span>
    </Link>
  );
}
