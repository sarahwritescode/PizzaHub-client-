import { LoaderCircleIcon } from "lucide-react";

/** Full-area loading indicator for route transitions and dashboard shells. */
export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div role="status" className="flex flex-1 items-center justify-center gap-3 px-4 py-24 text-ink/70">
      <LoaderCircleIcon aria-hidden="true" className="size-5 animate-spin text-tomato" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
